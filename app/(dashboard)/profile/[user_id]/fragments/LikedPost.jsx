import {Clock, Heart, User} from "lucide-react"
import React, {useEffect, useState} from "react"
import Link from "next/link"
import {useAuth} from "@/src/context/authContext"

const LikedPost = () => {
  const [likedBlogs, setLikedBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const {currentUser} = useAuth()

  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous) return

    let mounted = true
    setLoading(true)

    fetch(`/api/user/interactions?uid=${currentUser.uid}&type=liked`)
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        if (data?.success) {
          setLikedBlogs(data.data || [])
        }
      })
      .catch(err => console.error("Error fetching liked posts:", err))
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [currentUser])

  const handleUnlike = async postId => {
    try {
      const res = await fetch("/api/user/interactions", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          uid: currentUser.uid,
          action: "unlike",
          targetId: postId,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setLikedBlogs(prev => prev.filter(blog => blog._id !== postId))
      }
    } catch (err) {
      console.error("Error unliking post:", err)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500">Loading liked posts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {likedBlogs.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No liked blogs yet</p>
          <p className="text-sm text-gray-400 mt-2">Like blogs to support authors</p>
        </div>
      ) : (
        likedBlogs.map(blog => (
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
              <button onClick={() => handleUnlike(blog._id)} className="text-red-500 hover:text-red-600 transition-colors" title="Unlike">
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default LikedPost