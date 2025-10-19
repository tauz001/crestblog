import {Clock, FileText, PenSquare, Settings} from "lucide-react"
import React, {useEffect, useState} from "react"
import Link from "next/link"
import {useAuth} from "@/src/context/authContext"

const MyPost = () => {
  const [myPosts, setMyPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const {currentUser} = useAuth()

  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous) return

    let mounted = true
    setLoading(true)

    fetch("/api/publish")
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        if (data?.success) {
          // Filter posts by current user's UID - handle both old and new structure
          const userPosts = (data.data || []).filter(post => {
            // New structure: author is an object with uid
            if (post.author && typeof post.author === "object" && post.author.uid) {
              return post.author.uid === currentUser.uid
            }
            // Old structure: author is just a UID string (for backward compatibility)
            if (typeof post.author === "string") {
              return post.author === currentUser.uid
            }
            // Check authorUid field
            return post.authorUid === currentUser.uid
          })
          setMyPosts(userPosts)
        } else {
          setError(data?.error || "Failed to load")
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
  }, [currentUser])

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500">Loading your posts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {myPosts.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No posts yet</p>
          <Link href="/write" className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
            <PenSquare className="w-4 h-4" />
            <span>Write Your First Post</span>
          </Link>
        </div>
      ) : (
        myPosts.map(post => (
          <div key={post._id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full mb-2">{post.category}</span>
                <Link href={`/blogs/blog_details/${post._id}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-emerald-600 cursor-pointer transition-colors">{post.title}</h3>
                </Link>
                <p className="text-gray-600 mb-3 text-sm">{post.summary}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{new Date(post.createdAt).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})}</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{post.readTime || "5 min read"}</span>
                  </div>
                  {post.views && (
                    <>
                      <span>•</span>
                      <span>{post.views} views</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Link href={`/update/${post._id}`} className="p-2 text-gray-600 hover:text-emerald-600 transition-colors" title="Edit post">
                  <Settings className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default MyPost
