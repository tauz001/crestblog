import { Bookmark, Clock } from "lucide-react"
import React from "react"
const savedBlogs = []
const SavedPost = () => {
  return (
    <div className="space-y-4">
      {savedBlogs.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
          <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No saved blogs yet</p>
        </div>
      ) : (
        savedBlogs.map(blog => (
          <div key={blog.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full mb-2">{blog.category}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-emerald-600 cursor-pointer transition-colors">{blog.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>By {blog.author}</span>
                  <span>•</span>
                  <span>{blog.date}</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>
              </div>
              <button className="text-emerald-600 hover:text-emerald-700 transition-colors">
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
