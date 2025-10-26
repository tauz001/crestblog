"use client"
import React, {useEffect, useState} from "react"
import {Clock, Calendar, User, ArrowUpDown, RefreshCw, Globe, MapPin} from "lucide-react"
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [region, setRegion] = useState("world") // "world" or "india"

  const CACHE_KEY = "blogs_cache_data"
  const CACHE_TIME_KEY = "blogs_cache_time"
  const CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 hours

  // Multiple diverse topics to fetch
  const DIVERSE_QUERIES = ["technology", "science", "business", "health", "environment", "entertainment", "sports", "world"]

  function formatDateFromMongo(value) {
    if (!value) return ""
    const d = typeof value === "string" ? new Date(value) : value instanceof Date ? value : new Date(value)
    if (isNaN(d.getTime())) return ""
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }

  function shouldFetchNewData() {
    const cachedTime = localStorage.getItem(`${CACHE_TIME_KEY}_${region}`)
    if (!cachedTime) return true

    const timeSinceLastFetch = Date.now() - parseInt(cachedTime)
    return timeSinceLastFetch > CACHE_DURATION
  }

  function loadCachedData() {
    try {
      const cachedData = localStorage.getItem(`${CACHE_KEY}_${region}`)
      const cachedTime = localStorage.getItem(`${CACHE_TIME_KEY}_${region}`)

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

  function saveCacheData(blogs, categories) {
    try {
      const cacheData = {blogs, categories}
      localStorage.setItem(`${CACHE_KEY}_${region}`, JSON.stringify(cacheData))
      localStorage.setItem(`${CACHE_TIME_KEY}_${region}`, Date.now().toString())
      setLastFetch(new Date())
    } catch (err) {
      console.error("Error saving cache:", err)
    }
  }

  // Remove duplicate articles by article_id and title
  function deduplicateArticles(articles) {
    const seen = new Set()
    const uniqueArticles = []

    for (const article of articles) {
      // Create unique key from article_id and normalized title
      const normalizedTitle = article.title?.toLowerCase().trim()
      const key = `${article.article_id}-${normalizedTitle}`

      if (!seen.has(key) && normalizedTitle) {
        seen.add(key)
        uniqueArticles.push(article)
      }
    }

    return uniqueArticles
  }

  // Fetch articles from multiple diverse categories
  async function fetchDiverseNews(forceRefresh = false) {
    setLoading(true)
    setError(null)

    try {
      const apiKey = "pub_58e0cfe913d04cf7a7d5c77b57b2ecef"

      // Determine country parameter based on region
      const countryParam = region === "india" ? "&country=in" : ""

      // Fetch articles from multiple topics in parallel
      const fetchPromises = DIVERSE_QUERIES.slice(0, 5).map(query =>
        fetch(`https://newsdata.io/api/1/latest?apikey=${apiKey}&q=${query}&language=en${countryParam}`)
          .then(r => r.json())
          .then(data => {
            if (data?.status === "success") {
              return data.results || []
            }
            return []
          })
          .catch(err => {
            console.error(`Error fetching ${query}:`, err)
            return []
          })
      )

      // Wait for all requests
      const resultsArrays = await Promise.all(fetchPromises)

      // Flatten and combine all articles
      const allArticles = resultsArrays.flat()

      // Remove duplicates
      const uniqueArticles = deduplicateArticles(allArticles)

      // Shuffle for variety
      const shuffledArticles = uniqueArticles.sort(() => Math.random() - 0.5)

      setBlogs(shuffledArticles)

      // Extract unique categories
      const uniqueCategories = new Set()
      shuffledArticles.forEach(article => {
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
      saveCacheData(shuffledArticles, finalCategories)

      console.log(`✅ Fetched ${uniqueArticles.length} unique ${region} articles from ${DIVERSE_QUERIES.length} topics`)
    } catch (err) {
      console.error("Fetch error:", err)
      setError(err.message || "Failed to load news")
      // Try to use cached data as fallback
      loadCachedData()
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial load
  useEffect(() => {
    let mounted = true

    // Try cached data first
    const hasCachedData = loadCachedData()

    if (!shouldFetchNewData() && hasCachedData) {
      setLoading(false)
      return
    }

    // Fetch fresh data
    if (mounted) {
      fetchDiverseNews()
    }

    return () => {
      mounted = false
    }
  }, [region]) // Re-fetch when region changes

  // Manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    // Clear cache to force fresh fetch
    localStorage.removeItem(`${CACHE_KEY}_${region}`)
    localStorage.removeItem(`${CACHE_TIME_KEY}_${region}`)
    fetchDiverseNews(true)
  }

  // Handle region change
  const handleRegionChange = newRegion => {
    if (newRegion === region) return
    setRegion(newRegion)
    setSelectedCategory("All") // Reset category filter
  }

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
          <button onClick={handleRefresh} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 mr-3">
            Try Again
          </button>
          <Link href="/" className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
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
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{region === "india" ? "🇮🇳 India News" : "🌍 World News"}</h1>
                <p className="text-gray-600">Explore {filteredPosts.length} diverse articles from multiple sources</p>
                {lastFetch && (
                  <p className="text-sm text-gray-500 mt-2">
                    Last updated: {formatDateFromMongo(lastFetch)} at{" "}
                    {lastFetch.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>

              {/* Refresh Button */}
              <button onClick={handleRefresh} disabled={isRefreshing} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isRefreshing ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>

            {/* Region Toggle */}
            <div className="flex items-center gap-3 bg-white rounded-lg p-2 shadow-sm border border-gray-100 w-fit">
              <button onClick={() => handleRegionChange("world")} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${region === "world" ? "bg-emerald-600 text-white shadow-md" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}>
                <Globe className="w-4 h-4" />
                <span>World News</span>
              </button>
              <button onClick={() => handleRegionChange("india")} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${region === "india" ? "bg-emerald-600 text-white shadow-md" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}>
                <MapPin className="w-4 h-4" />
                <span>India News</span>
              </button>
            </div>
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
                <Link key={`${post.article_id}-${post.title}`} href={`/news/${post.article_id}`}>
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
              <p className="text-gray-500 text-lg">No articles found in this category.</p>
              <button onClick={handleRefresh} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Refresh News
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-8 text-center text-gray-500">
            Showing {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
          </div>
        </div>
      </div>
    </div>
  )
}
