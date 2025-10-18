"use client"
import React, {useEffect, useState} from "react"
import {Clock, Calendar, User, ArrowUpDown} from "lucide-react"
import Link from "next/link"
import Loader from "@/app/components/Loader"

export default function BlogsListingPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("recent")
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const categories = ["All", "Technology", "Lifestyle", "Health", "Travel", "Design", "Business"]

  // Format date helper
  function formatDateFromMongo(value) {
    if (!value) return ""
    const d = typeof value === "string" ? new Date(value) : value instanceof Date ? value : new Date(value)
    if (isNaN(d.getTime())) return ""
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }

  // Fetch blogs
  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetch("/api/publish")
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        if (data?.success) {
          setBlogs(data.data || [])
        } else {
          setError(data?.error || "Failed to load blogs")
        }
      })
      .catch(err => {
        if (mounted) setError(err.message || "Fetch error")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  // Filter by category
  let filteredPosts = selectedCategory === "All" ? blogs : blogs.filter(post => post.category === selectedCategory)

  // Sort posts
  if (sortBy === "recent") {
    filteredPosts = [...filteredPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (sortBy === "oldest") {
    filteredPosts = [...filteredPosts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } else if (sortBy === "title") {
    filteredPosts = [...filteredPosts].sort((a, b) => a.title.localeCompare(b.title))
  }

  if (loading) {
    return <Loader />
  }

  if (error) {
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
          </div>

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
            {filteredPosts.map(post => (
              <Link key={post._id} href={`/blogs/blog_details/${post._id}`}>
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden cursor-pointer">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full mb-3">{post.category}</span>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-emerald-600 transition-colors">{post.title}</h2>
                        <p className="text-gray-600 mb-4">{post.summary || "Read more to discover..."}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>{post.author || "Anonymous"}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDateFromMongo(post.createdAt)}</span>
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
            ))}
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
