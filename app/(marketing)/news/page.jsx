"use client"
import React, {useEffect, useState} from "react"
import {Clock, Calendar, User, ArrowUpDown} from "lucide-react"
import Link from "next/link"
import Loader from "@/app/components/Loader"

export default function BlogsListingPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("recent")
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState(["All"])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  // Cache keys
  const CACHE_KEY = "blogs_cache_data"
  const CACHE_TIME_KEY = "blogs_cache_time"

  // Format date helper
  function formatDateFromMongo(value) {
    if (!value) return ""
    const d = typeof value === "string" ? new Date(value) : value instanceof Date ? value : new Date(value)
    if (isNaN(d.getTime())) return ""
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }

  // Check if we need to fetch new data
  function shouldFetchNewData() {
    const cachedTime = window.fs?.readFile ? null : localStorage.getItem(CACHE_TIME_KEY)

    if (!cachedTime) return true

    const lastFetchDate = new Date(parseInt(cachedTime))
    const now = new Date()

    // Get the next scheduled fetch time (either 12 AM or 12 PM)
    const nextMidnight = new Date(now)
    nextMidnight.setHours(0, 0, 0, 0)

    const nextNoon = new Date(now)
    nextNoon.setHours(12, 0, 0, 0)

    // Find the most recent scheduled time that has passed
    let lastScheduledTime
    if (now.getHours() >= 12) {
      lastScheduledTime = nextNoon
    } else {
      lastScheduledTime = new Date(nextMidnight)
      lastScheduledTime.setDate(lastScheduledTime.getDate() - 1)
      lastScheduledTime.setHours(12, 0, 0, 0)
    }

    // If last fetch was before the most recent scheduled time, we need new data
    return lastFetchDate < lastScheduledTime
  }

  // Load cached data
  function loadCachedData() {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY)
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY)

      if (cachedData && cachedTime) {
        const data = JSON.parse(cachedData)
        setBlogs(data.blogs || [])
        setCategories(data.categories || ["All"])
        setLastFetch(new Date(parseInt(cachedTime)))
        return true
      }
    } catch (err) {
      console.error("Error loading cached data:", err)
    }
    return false
  }

  // Save data to cache
  function saveCacheData(blogs, categories) {
    try {
      const cacheData = {blogs, categories}
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString())
      setLastFetch(new Date())
    } catch (err) {
      console.error("Error saving cache:", err)
    }
  }

  // Fetch blogs
  useEffect(() => {
    let mounted = true

    // Try to load cached data first
    const hasCachedData = loadCachedData()

    // Check if we need to fetch new data
    if (!shouldFetchNewData() && hasCachedData) {
      setLoading(false)
      return
    }

    // Fetch new data
    setLoading(true)

    fetch("https://newsdata.io/api/1/latest?apikey=pub_58e0cfe913d04cf7a7d5c77b57b2ecef&q=politics&language=en")
      .then(r => r.json())
      .then(data => {
        if (!mounted) return

        if (data?.status === "success") {
          const articles = data.results || []
          setBlogs(articles)

          // Extract unique categories from articles
          const uniqueCategories = new Set()
          articles.forEach(article => {
            if (article.category && Array.isArray(article.category)) {
              article.category.forEach(cat => {
                if (cat) uniqueCategories.add(cat)
              })
            } else if (article.category) {
              uniqueCategories.add(article.category)
            }
          })

          const sortedCategories = Array.from(uniqueCategories).sort()
          const finalCategories = ["All", ...sortedCategories]
          setCategories(finalCategories)

          // Save to cache
          saveCacheData(articles, finalCategories)
        } else {
          console.error("API Error Response:", data)
          setError(data?.message || data?.results?.[0]?.message || "Failed to load blogs (Check API Key/Rate Limit)")
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err.message || "Fetch error")
          // Try to use cached data even if fetch fails
          loadCachedData()
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  // Auto-refresh at scheduled times
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (shouldFetchNewData()) {
        window.location.reload()
      }
    }, 60000) // Check every minute

    return () => clearInterval(checkInterval)
  }, [])

  // Filter by category
  let filteredPosts =
    selectedCategory === "All"
      ? blogs
      : blogs.filter(post => {
          if (Array.isArray(post.category)) {
            return post.category.includes(selectedCategory)
          }
          return post.category === selectedCategory
        })

  // Sort posts
  if (sortBy === "recent") {
    filteredPosts = [...filteredPosts].sort((a, b) => new Date(b.pubDate || b.createdAt) - new Date(a.pubDate || a.createdAt))
  } else if (sortBy === "oldest") {
    filteredPosts = [...filteredPosts].sort((a, b) => new Date(a.pubDate || a.createdAt) - new Date(b.pubDate || b.createdAt))
  } else if (sortBy === "title") {
    filteredPosts = [...filteredPosts].sort((a, b) => (a.title || "").localeCompare(b.title || ""))
  }

  if (loading) {
    return <Loader />
  }

  if (error && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Error: {error}</p>
          <Link href="/" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">All Blogs</h1>
            <p className="text-gray-600">Explore our collection of {filteredPosts.length} articles</p>
            {lastFetch && (
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {formatDateFromMongo(lastFetch)} at {lastFetch.toLocaleTimeString("en-US", {hour: "2-digit", minute: "2-digit"})}
              </p>
            )}
          </div>

          {/* Error Banner */}
          {error && blogs.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">⚠️ Unable to fetch latest data. Showing cached content.</p>
            </div>
          )}

          {/* Filters and Sorting */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"}`}>
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <ArrowUpDown className="w-4 h-4 inline mr-1" />
                  Sort By
                </label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Blog Posts List */}
          <div className="space-y-6">
            {filteredPosts.map(post => {
              const authorName = post.creator?.[0] || post.source_id || "Anonymous"
              const displayCategory = Array.isArray(post.category) ? post.category[0] || "Uncategorized" : post.category || "Uncategorized"

              return (
                <Link key={post.article_id} href={`/news/${post.article_id}`}>
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden cursor-pointer">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                        <div className="flex-1">
                          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full mb-3">{displayCategory}</span>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-emerald-600 transition-colors">{post.title}</h2>
                          <p className="text-gray-600 mb-4">{post.description || post.summary || "Read more to discover..."}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          <span>{authorName}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDateFromMongo(post.pubDate || post.createdAt)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{post.readTime || "5 min read"}</span>
                        </div>
                        {post.views && (
                          <div className="flex items-center">
                            <span>{post.views} views</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No blogs found in this category.</p>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-8 text-center text-gray-500">
            Showing {filteredPosts.length} {filteredPosts.length === 1 ? "blog" : "blogs"}
          </div>
        </div>
      </div>
    </div>
  )
}
