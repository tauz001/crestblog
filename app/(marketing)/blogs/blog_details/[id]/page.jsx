"use client"
// app/(marketing)/blogs/blog_details/[id]/page.jsx - UPDATED WITH AUTHOR CARD
import React, {useEffect, useState} from "react"
import {Clock, Calendar, Share2, Bookmark, Heart} from "lucide-react"
import {useParams} from "next/navigation"
import Loader from "@/app/components/Loader"
import {useAuth} from "@/src/context/authContext"
import BlogAuthorCard from "@/app/components/BlogAuthorCard"
import Comments from "@/app/components/Comments"

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
            checkUserInteractions(data.data._id.toString())
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
        alert("Failed to update like status")
      }
    } catch (err) {
      console.error("Error liking post:", err)
      alert("Failed to update like status")
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

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: url,
        })
      } catch (err) {
        if (err.name !== "AbortError") {
          copyToClipboard(url)
        }
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = text => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Link copied to clipboard!")
      })
      .catch(() => {
        alert("Failed to copy link")
      })
  }

  if (error) return <p className="text-center text-red-500 mt-20">{error}</p>
  if (!article) return <Loader />

  // Extract author info
  const authorInfo =
    typeof article.author === "object"
      ? {
          uid: article.author.uid,
          name: article.author.name || "Anonymous",
          email: article.author.email || "",
          avatar: article.author.avatar || article.author.name?.substring(0, 2).toUpperCase() || "NA",
          bio: article.author.bio || "Content creator",
          location: article.author.location || "",
        }
      : {
          uid: article.authorUid || "",
          name: "Anonymous",
          email: "",
          avatar: "NA",
          bio: "Content creator",
          location: "",
        }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Author Info (Hidden on mobile) */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                <BlogAuthorCard authorInfo={authorInfo} postId={article._id} />
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
                  <div className="lg:hidden mb-6">
                    <BlogAuthorCard authorInfo={authorInfo} postId={article._id} />
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
                    {article.views && (
                      <div className="flex items-center">
                        <span>{article.views} views</span>
                      </div>
                    )}
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
                  <button onClick={handleShare} className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
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
                <Comments postId={article._id} />
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
