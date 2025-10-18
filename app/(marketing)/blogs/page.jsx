"use client"
import React, {useEffect, useState} from "react"
import {Clock, Calendar, Share2, Bookmark, Heart} from "lucide-react"
import {useParams} from "next/navigation"
import {useAuth} from "@/src/context/authContext"
import Loader from "@/app/components/Loader"

export default function ArticlePage() {
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const {id} = useParams()
  const [article, setArticle] = useState(null)
  const [error, setError] = useState(null)
  const {currentUser} = useAuth()

  function formatDateFromMongo(value, shortMonth = true) {
    if (!value) return ""
    const d = typeof value === "string" ? new Date(value) : value instanceof Date ? value : new Date(value)
    if (Number.isNaN(d.getTime())) return ""
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = d.getFullYear()
    if (!shortMonth) return `${dd}${mm}${yyyy}`
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${dd} ${months[d.getMonth()]} ${yyyy}`
  }

  // Fetch article
  useEffect(() => {
    if (!id) return

    fetch(`/api/publish/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setArticle(data.data)
          setLikeCount(data.data.likes || 0)
        } else {
          setError(data.error)
        }
      })
      .catch(err => setError(err.message))
  }, [id])

  // Check if user has liked/saved this post
  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous || !id) return

    fetch(`/api/user/interactions?uid=${currentUser.uid}`)
      .then(r => r.json())
      .then(data => {
        if (data?.success) {
          const savedIds = data.data.savedPosts?.map(p => p._id) || []
          const likedIds = data.data.likedPosts?.map(p => p._id) || []

          setBookmarked(savedIds.includes(id))
          setLiked(likedIds.includes(id))
        }
      })
      .catch(err => console.error("Error checking interactions:", err))
  }, [currentUser, id])

  const handleLike = async () => {
    if (!currentUser || currentUser.isAnonymous) {
      alert("Please login to like posts")
      return
    }

    const action = liked ? "unlike" : "like"
    const prevLiked = liked
    const prevCount = likeCount

    // Optimistic update
    setLiked(!liked)
    setLikeCount(prev => (liked ? prev - 1 : prev + 1))

    try {
      const res = await fetch("/api/user/interactions", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          uid: currentUser.uid,
          action,
          targetId: id,
        }),
      })

      const data = await res.json()
      if (!data.success) {
        // Revert on error
        setLiked(prevLiked)
        setLikeCount(prevCount)
        alert("Failed to update like")
      }
    } catch (err) {
      console.error("Error liking post:", err)
      setLiked(prevLiked)
      setLikeCount(prevCount)
    }
  }

  const handleBookmark = async () => {
    if (!currentUser || currentUser.isAnonymous) {
      alert("Please login to save posts")
      return
    }

    const action = bookmarked ? "unsave" : "save"
    const prevBookmarked = bookmarked

    // Optimistic update
    setBookmarked(!bookmarked)

    try {
      const res = await fetch("/api/user/interactions", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          uid: currentUser.uid,
          action,
          targetId: id,
        }),
      })

      const data = await res.json()
      if (!data.success) {
        // Revert on error
        setBookmarked(prevBookmarked)
        alert("Failed to update bookmark")
      }
    } catch (err) {
      console.error("Error bookmarking post:", err)
      setBookmarked(prevBookmarked)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article?.title,
          text: article?.summary,
          url: window.location.href,
        })
        .catch(err => console.log("Error sharing:", err))
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  if (error) return <p className="text-center text-red-500 mt-20">{error}</p>
  if (!article) return <Loader />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Author Info */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-emerald-700">{article.author?.avatar || "NA"}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{article.author?.name || "Anonymous"}</h3>
                    <p className="text-sm text-gray-500">{article.author?.posts || 0} Posts</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{article.author?.bio || "Writer and blogger"}</p>
                  <button className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">Follow</button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-6">
              <article className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                {/* Article Header */}
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mb-4">{article.category}</span>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>

                  {/* Mobile Author Info */}
                  <div className="lg:hidden flex items-center mb-4 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-lg font-bold text-emerald-700">{article.author?.avatar || "NA"}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{article.author?.name || "Anonymous"}</p>
                      <p className="text-sm text-gray-500">{article.author?.posts || 0} Posts</p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDateFromMongo(article.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{article.readTime || "5 min read"}</span>
                    </div>
                  </div>
                </div>

                {/* Article Actions */}
                <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-gray-200">
                  <button onClick={handleLike} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${liked ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                    <span className="text-sm font-medium">{likeCount > 0 ? likeCount : "Like"}</span>
                  </button>
                  <button onClick={handleBookmark} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${bookmarked ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    <Bookmark className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`} />
                    <span className="text-sm font-medium">Save</span>
                  </button>
                  <button onClick={handleShare} className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  {article?.sections?.map((section, index) => (
                    <div key={index}>
                      {section.subHeading && <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{section.subHeading}</h2>}
                      {section.content && <p className="text-gray-700 leading-relaxed mb-6">{section.content}</p>}
                    </div>
                  ))}
                </div>
              </article>
            </div>

            {/* Right Sidebar - Table of Contents */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Table of Contents</h3>
                  <div className="space-y-2 pe-5 ps-5">
                    {article.sections.map((section, index) => (
                      <ul key={index} className="list-disc block text-sm text-gray-600 hover:text-emerald-600 transition-colors py-1">
                        <li>{section.subHeading}</li>
                      </ul>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}