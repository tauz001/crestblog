"use client"
import React, {useState} from "react"
import {Save, Eye} from "lucide-react"

// Write Page Component
export default function WritePage() {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Technology")
  const [content, setContent] = useState("")

  const categories = ["Technology", "Lifestyle", "Health", "Travel", "Design", "Business"]

  const handleSave = () => {
    console.log({title, category, content})
    alert("Blog saved successfully!")
  }

  const handlePublish = () => {
    if (!title || !content) {
      alert("Please fill in title and content")
      return
    }
    console.log({title, category, content})
    alert("Blog published successfully!")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mb-6">
            <button onClick={handleSave} className="flex items-center space-x-2 px-5 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button onClick={handlePublish} className="flex items-center space-x-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <Eye className="w-4 h-4" />
              <span>Publish</span>
            </button>
          </div>

          {/* Write Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            {/* Title Input */}
            <div className="mb-6">
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Blog Title..." className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none focus:ring-0" />
            </div>

            {/* Category Select */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Textarea */}
            <div>
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your blog content here..." rows="20" className="w-full text-lg text-gray-700 placeholder-gray-400 border-none outline-none focus:ring-0 resize-none" />
            </div>
          </div>

          {/* Character Count */}
          <div className="mt-4 text-sm text-gray-500 text-right">{content.length} characters</div>
        </div>
      </div>
    </div>
  )
}
