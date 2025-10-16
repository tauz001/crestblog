import {Clock, FileText, PenSquare, Settings} from "lucide-react"
import React, {useEffect, useState} from "react"
import Link from "next/link"

const MyPost = () => {
  const [myPosts, setMyPosts] = useState([])
  useEffect(() => {
    let mounted = true
    fetch("/api/publish")
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        if (data?.success) setMyPosts(data.data || [])
        // else setError(data?.error || "Failed to load")
      })
      .then(console.log())
    // .catch(err => mounted && setError(err.message || "Fetch error"))
    // .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])
  return (
    <div className="space-y-4">
      {myPosts.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No posts yet</p>
          <button className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors mx-auto">
            <PenSquare className="w-4 h-4" />
            <span>Write Your First Post</span>
          </button>
        </div>
      ) : (
        myPosts.map(post => (
          <div key={post._id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full mb-2">{post.category}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-emerald-600 cursor-pointer transition-colors">{post.title}</h3>
                <p className="text-gray-600 mb-3 text-sm">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{post.date}</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                  <span>•</span>
                  <span>{post.views} views</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Link href={`/update/${post._id}`} className="p-2 text-gray-600 hover:text-emerald-600 transition-colors">
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
