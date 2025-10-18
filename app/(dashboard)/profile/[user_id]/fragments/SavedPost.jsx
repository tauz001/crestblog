import {Bookmark, Clock, User} from "lucide-react"
import React, {useEffect, useState} from "react"
import Link from "next/link"
import {useAuth} from "@/src/context/authContext"

const SavedPost = () => {
  const [savedBlogs, setSavedBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const {currentUser} = useAuth()

  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous) return

    let mounted = true
    setLoading(true)

    fetch(`/api/user/interactions?uid=${currentUser.uid}&type=saved`)
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        if (data?.success) {
          setSavedBlogs(data.data || [])
        }
      })
      .catch(err => console.error("Error fetching saved posts:", err))
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [currentUser])

  const handleUnsave = async postId => {
    try {
      const res = await fetch("/api/user/interactions", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          uid: currentUser.uid,
          action: "unsave",
          targetId: postId,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSavedBlogs(prev => prev.filter(blog => blog._id !== postId))
      }
    } catch (err) {
      console.error("Error unsaving post:", err)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500">Loading saved posts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {savedBlogs.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
          <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No saved blogs yet</p>
          <p className="text-sm text-gray-400 mt-2">Save blogs to read them later</p>
        </div>
      ) : (
        savedBlogs.map(blog => (
          <div key={blog._id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full mb-2">{blog.category}</span>
                <Link href={`/blogs/blog_details/${blog._id}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-emerald-600 cursor-pointer transition-colors">{blog.title}</h3>
                </Link>
                <p className="text-gray-600 mb-3 text-sm">{blog.summary}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{new Date(blog.createdAt).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})}</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{blog.readTime || "5 min read"}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleUnsave(blog._id)} className="text-emerald-600 hover:text-emerald-700 transition-colors" title="Remove from saved">
                <Bookmark className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default SavedPost
