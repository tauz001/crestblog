"use client"
import React, {useEffect, useState} from "react"
import {Clock, Calendar, Share2, Bookmark, Heart, User} from "lucide-react"
import {useParams} from "next/navigation"
import Loader from "@/app/components/Loader"
import {useAuth} from "@/src/context/authContext"

export default function ArticlePage() {
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const {id} = useParams()
  const {currentUser} = useAuth()
  const [article, setArticle] = useState(null)
  const [error, setError] = useState(null)

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

  useEffect(() => {
    if (!id) return

    fetch(`/api/publish/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setArticle(data.data)

          // Check if current user has liked/saved this post
          if (currentUser && !currentUser.isAnonymous) {
            checkUserInteractions(data.data._id.toString()) // Add .toString()
          }
        } else setError(data.error)
      })
      .catch(err => setError(err.message))
  }, [id, currentUser])

  const checkUserInteractions = async postId => {
    try {
      const res = await fetch(`/api/user?uid=${currentUser.uid}`)
      const data = await res.json()

      if (data.success && data.data) {
        // Convert ObjectIds to strings for comparison
        const likedIds = data.data.likedPosts?.map(id => (typeof id === "object" ? id.toString() : id)) || []
        const savedIds = data.data.savedPosts?.map(id => (typeof id === "object" ? id.toString() : id)) || []

        setLiked(likedIds.includes(postId.toString()))
        setBookmarked(savedIds.includes(postId.toString()))
      }
    } catch (err) {
      console.error("Error checking interactions:", err)
    }
  }

  const handleLike = async () => {
    if (!currentUser || currentUser.isAnonymous) {
      alert("Please login to like posts")
      return
    }

    try {
      const res = await fetch("/api/user/interactions", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          uid: currentUser.uid,
          action: liked ? "unlike" : "like",
          targetId: article._id,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setLiked(!liked)
      } else {
        alert("Failed to update like status") // Add this
      }
    } catch (err) {
      console.error("Error liking post:", err)
      alert("Failed to update like status") // Add this
    }
  }

  const handleBookmark = async () => {
    if (!currentUser || currentUser.isAnonymous) {
      alert("Please login to save posts")
      return
    }

    try {
      const res = await fetch("/api/user/interactions", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          uid: currentUser.uid,
          action: bookmarked ? "unsave" : "save",
          targetId: article._id,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setBookmarked(!bookmarked)
      }
    } catch (err) {
      console.error("Error bookmarking post:", err)
    }
  }

  if (error) return <p className="text-center text-red-500 mt-20">{error}</p>
  if (!article) return <Loader />

  // Extract author info - handle both old and new structure
  const authorInfo =
    typeof article.author === "object"
      ? {
          name: article.author.name || "Anonymous",
          avatar: article.author.avatar || article.author.name?.substring(0, 2).toUpperCase() || "NA",
          bio: article.author.bio || "Content creator",
          posts: 0, // You can add this to the author object if needed
        }
      : {
          name: "Anonymous",
          avatar: "NA",
          bio: "Content creator",
          posts: 0,
        }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Author Info (Hidden on mobile) */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-emerald-700">{authorInfo.avatar}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{authorInfo.name}</h3>
                    <p className="text-sm text-gray-500">{authorInfo.posts} Posts</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{authorInfo.bio}</p>
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
                      <span className="text-lg font-bold text-emerald-700">{authorInfo.avatar}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{authorInfo.name}</p>
                      <p className="text-sm text-gray-500">{authorInfo.posts} Posts</p>
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
                    <span className="text-sm font-medium">Like</span>
                  </button>
                  <button onClick={handleBookmark} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${bookmarked ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    <Bookmark className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`} />
                    <span className="text-sm font-medium">Save</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>

                {/* Article Summary */}
                {article.summary && (
                  <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded">
                    <p className="text-gray-700 italic">{article.summary}</p>
                  </div>
                )}

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  {article?.sections?.map((section, index) => (
                    <div key={index}>
                      {section.subHeading && <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{section.subHeading}</h2>}
                      {section.content && <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">{section.content}</p>}
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
                    {article.sections?.map((section, index) => (
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
