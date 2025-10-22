"use client"
import React, {useEffect, useState} from "react"
import {Clock, Calendar, Share2, Bookmark, Heart, Globe, Tag, ExternalLink, TrendingUp, MapPin} from "lucide-react"
import {useParams} from "next/navigation"
import Loader from "@/app/components/Loader"
import {useAuth} from "@/src/context/authContext"
import BlogAuthorCard from "@/app/components/BlogAuthorCard"

export default function ArticlePage() {
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const {id} = useParams()
  const {currentUser} = useAuth()
  const [article, setArticle] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

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

  function getTimeSince(dateString) {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    }

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit)
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`
      }
    }
    return "Just now"
  }

  useEffect(() => {
    console.log("Current ID:", id)
    if (!id) return
    setLoading(true)
    setError(null)

    fetch(`https://newsdata.io/api/1/latest?apikey=pub_58e0cfe913d04cf7a7d5c77b57b2ecef&id=${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok")
        return res.json()
      })
      .then(data => {
        if (data.status === "success" && data.results && data.results.length > 0) {
          const fetchedArticle = data.results[0]
          setArticle(fetchedArticle)

          if (currentUser && !currentUser.isAnonymous) {
            checkUserInteractions(fetchedArticle.article_id.toString())
          }
        } else {
          setError(data.message || "Article not found or API failed to return data.")
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
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
          text: article.description,
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

  // Extract author/source info
  const authorInfo = {
    uid: article.source_id || "",
    name: article.creator?.[0] || article.source_name || article.source_id || "Anonymous",
    email: "",
    avatar: (article.source_name || article.source_id || "NA").substring(0, 2).toUpperCase(),
    bio: `News source from ${article.country?.[0] || "Unknown"}`,
    location: article.country?.[0] || "",
  }

  // Get country flag emoji
  const getCountryFlag = countryCode => {
    if (!countryCode) return ""
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Source Info */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                <BlogAuthorCard authorInfo={authorInfo} postId={article.article_id} />

                {/* Article Meta Info */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Article Info</h3>
                  <div className="space-y-3 text-sm">
                    {article.country && article.country.length > 0 && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Country</p>
                          <p className="text-gray-900 font-medium">
                            {getCountryFlag(article.country[0])} {article.country[0].toUpperCase()}
                          </p>
                        </div>
                      </div>
                    )}

                    {article.language && (
                      <div className="flex items-start gap-2">
                        <Globe className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Language</p>
                          <p className="text-gray-900 font-medium">{article.language.toUpperCase()}</p>
                        </div>
                      </div>
                    )}

                    {article.pubDate && (
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Published</p>
                          <p className="text-gray-900 font-medium">{getTimeSince(article.pubDate)}</p>
                        </div>
                      </div>
                    )}

                    {article.sentiment && (
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Sentiment</p>
                          <p className="text-gray-900 font-medium capitalize">{article.sentiment}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-6">
              <article className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                {/* Article Header */}
                <div className="mb-6">
                  {/* Categories */}
                  {article.category && article.category.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.category.map((cat, idx) => (
                        <span key={idx} className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>

                  {/* Mobile Source Info */}
                  <div className="lg:hidden mb-6">
                    <BlogAuthorCard authorInfo={authorInfo} postId={article.article_id} />
                  </div>

                  <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDateFromMongo(article.pubDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{getTimeSince(article.pubDate)}</span>
                    </div>
                    {article.country && article.country.length > 0 && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>
                          {getCountryFlag(article.country[0])} {article.country[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Article Actions */}
                <div className="flex flex-wrap items-center gap-3 mb-8 pb-8 border-b border-gray-200">
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
                  {article.link && (
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors">
                      <ExternalLink className="w-5 h-5" />
                      <span className="text-sm font-medium">Read Original</span>
                    </a>
                  )}
                </div>

                {/* Article Image */}
                {article.image_url && String(article.image_url).trim() !== "" && (
                  <div className="mb-8 overflow-hidden rounded-lg" style={{height: "400px"}}>
                    <img
                      src={String(article.image_url)}
                      alt={article.title || "Article Image"}
                      style={{width: "100%", height: "100%", objectFit: "cover"}}
                      onError={e => {
                        e.target.style.display = "none"
                      }}
                    />
                  </div>
                )}

                {/* Article Description */}
                {article.description && (
                  <div className="mb-6">
                    <div className="prose max-w-none">
                      <p className="text-lg text-gray-700 leading-relaxed">{article.description}</p>
                    </div>
                  </div>
                )}

                {/* Article Content */}
                {article.content && (
                  <div className="mb-8">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{article.content}</p>
                    </div>
                  </div>
                )}

                {/* Keywords/Tags */}
                {article.keywords && article.keywords.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-5 h-5 text-gray-500" />
                      <h3 className="font-semibold text-gray-900">Related Topics</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {article.keywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Source Attribution */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">Source:</span> {article.source_name || article.source_id}
                    </p>
                    {article.source_url && (
                      <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                        Visit source website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            </div>

            {/* Right Sidebar - Additional Info */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                {/* Keywords */}
                {article.keywords && article.keywords.length > 0 && (
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="w-5 h-5 text-gray-500" />
                      <h3 className="font-bold text-gray-900">Topics</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {article.keywords.slice(0, 10).map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Tags */}
                {article.ai_tag && (
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3">AI Classification</h3>
                    <p className="text-sm text-gray-700 capitalize bg-purple-50 px-3 py-2 rounded">{article.ai_tag}</p>
                  </div>
                )}

                {/* Duplicate Detection */}
                {article.duplicate === false && (
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <p className="text-sm font-medium">Original Content</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
