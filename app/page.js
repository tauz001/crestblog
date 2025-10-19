"use client"
import React, {useEffect, useState} from "react"
import {PenSquare, Clock, User} from "lucide-react"
import FeaturedCarousal from "./components/Homepage/FeaturedCarousal"
import Link from "next/link"

// Format date helper
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

// Get author name - support both old and new formats
const getAuthorName = post => {
  if (typeof post.author === "object" && post.author?.name) {
    return post.author.name
  }
  return "Anonymous"
}

// Homepage Component
export default function Homepage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [blog, setBlog] = useState([])
  const [loading, setLoading] = useState(true)

  const categories = ["All", "Technology", "Lifestyle", "Health", "Travel", "Design"]

  const filteredPosts = selectedCategory === "All" ? blog : blog.filter(post => post.category === selectedCategory)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetch("/api/publish")
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        if (data?.success) {
          setBlog(data.data || [])
        }
      })
      .catch(err => {
        if (mounted) console.error("Fetch error:", err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Discover Stories That <span className="text-emerald-600">Inspire</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">Join our community of writers and readers sharing knowledge, experiences, and ideas</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/write" className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-lg font-medium shadow-lg cursor-pointer">
                <PenSquare className="w-5 h-5" />
                <span>Start Writing</span>
              </Link>
              <Link href="/blogs" className="bg-white text-emerald-600 px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors text-lg font-medium border-2 border-emerald-600 cursor-pointer hover:text-white text-center">
                Explore Blogs
              </Link>
            </div>
          </div>

          {/* Featured Carousel */}
          <FeaturedCarousal />
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Our Blogs</h2>
            <p className="text-gray-600">Browse through our collection of articles</p>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Filter by Category:</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <button key={category} onClick={() => setSelectedCategory(category)} className={`px-5 py-2 rounded-lg transition-colors ${selectedCategory === category ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200"}`}>
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading blogs...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <Link key={post._id} href={`/blogs/blog_details/${post._id}`}>
                  <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">{post.category}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-emerald-600 transition-colors">{post.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{post.summary}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <User className="w-4 h-4 mr-1" />
                      <span>{getAuthorName(post)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDateFromMongo(post.createdAt, true)}</span>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{post.readTime || "5 min read"}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* No Results */}
          {filteredPosts.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No blogs found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
