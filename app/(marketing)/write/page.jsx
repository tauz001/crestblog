"use client"
import React, {useState, useEffect} from "react"
import {X, Eye, Plus, Edit2, Trash2, Check, AlertCircle} from "lucide-react"
import {useRouter} from "next/navigation"
import {useAuth} from "@/src/context/authContext"

export default function WritePage() {
  const {currentUser, loading} = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Technology")
  const [isPublishing, setIsPublishing] = useState(false)
  const [summary, setSummary] = useState("")
  const [canAddContent, setCanAddContent] = useState(false)
  const [savedSections, setSavedSections] = useState([])
  const [currentSubHeading, setCurrentSubHeading] = useState("")
  const [currentContent, setCurrentContent] = useState("")
  const [showContentForm, setShowContentForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)

  const categories = ["Technology", "Lifestyle", "Health", "Travel", "Design", "Business"]

  // Redirect if not authenticated or email not verified
  useEffect(() => {
    if (!loading) {
      if (!currentUser || currentUser.isAnonymous) {
        alert("Please login to write a blog post")
        router.push("/login")
      } else if (!currentUser.emailVerified) {
        alert("Please verify your email before writing. Check your inbox for verification link.")
        router.push("/")
      }
    }
  }, [currentUser, loading, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated or not verified, show nothing (will redirect)
  if (!currentUser || currentUser.isAnonymous || !currentUser.emailVerified) {
    return null
  }

  const handleTitleChange = e => {
    setTitle(e.target.value)
    setCanAddContent(!!e.target.value.trim())
  }

  const handleAddContent = () => {
    setShowContentForm(true)
    setCurrentSubHeading("")
    setCurrentContent("")
    setEditingIndex(null)
  }

  const handleSaveSection = () => {
    if (!currentSubHeading.trim() || !currentContent.trim()) {
      alert("Please fill in both subheading and content")
      return
    }

    if (editingIndex !== null) {
      const updatedSections = [...savedSections]
      updatedSections[editingIndex] = {
        subHeading: currentSubHeading,
        content: currentContent,
      }
      setSavedSections(updatedSections)
      setEditingIndex(null)
    } else {
      setSavedSections([
        ...savedSections,
        {
          subHeading: currentSubHeading,
          content: currentContent,
        },
      ])
    }

    setCurrentSubHeading("")
    setCurrentContent("")
    setShowContentForm(false)
  }

  const handleEditSection = index => {
    setCurrentSubHeading(savedSections[index].subHeading)
    setCurrentContent(savedSections[index].content)
    setEditingIndex(index)
    setShowContentForm(true)
  }

  const handleDeleteSection = index => {
    const updatedSections = savedSections.filter((_, i) => i !== index)
    setSavedSections(updatedSections)
  }

  const handlePublish = async () => {
    if (isPublishing) return

    if (!title || savedSections.length === 0) {
      alert("Please add title and at least one content section")
      return
    }

    setIsPublishing(true)
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          title,
          category,
          summary,
          sections: savedSections,
          tableOfContents: savedSections.map(s => s.subHeading),
          author: currentUser.uid,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Publish failed")

      alert("Blog published successfully!")
      router.push(`/profile/${currentUser.uid}`)
    } catch (err) {
      console.error("Publish error", err)
      alert("Failed to publish: " + (err.message || "server error"))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Email Verification Notice */}
          {currentUser && !currentUser.emailVerified && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Email verification required</p>
                <p className="text-sm text-yellow-700 mt-1">Please verify your email to publish posts.</p>
              </div>
            </div>
          )}

          {/* Header Actions */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Write Your Blog</h1>
            <div className="flex space-x-3">
              <button type="button" onClick={handlePublish} disabled={isPublishing} className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${isPublishing ? "bg-emerald-300 text-white cursor-not-allowed opacity-70" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                <Eye className="w-4 h-4" />
                <span>{isPublishing ? "Publishing..." : "Publish"}</span>
              </button>
            </div>
          </div>

          {/* Title and Category Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title *</label>
              <input type="text" value={title} onChange={handleTitleChange} placeholder="Enter your blog title..." className="w-full text-2xl font-bold text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Summary (one line)</label>
              <input type="text" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Write a one-line summary of the blog..." className="w-full text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>
          </div>

          {/* Add Content Button */}
          {canAddContent && (
            <div className="mb-6">
              <button onClick={handleAddContent} disabled={showContentForm} className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${showContentForm ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                <Plus className="w-5 h-5" />
                <span>Add New Content Section</span>
              </button>
            </div>
          )}

          {/* Content Form */}
          {showContentForm && (
            <div className="bg-white rounded-lg shadow-lg border-2 border-emerald-500 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">{editingIndex !== null ? "Edit Content Section" : "Add Content Section"}</h3>
                <button
                  onClick={() => {
                    setShowContentForm(false)
                    setEditingIndex(null)
                    setCurrentSubHeading("")
                    setCurrentContent("")
                  }}
                  className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sub Heading *</label>
                  <input type="text" value={currentSubHeading} onChange={e => setCurrentSubHeading(e.target.value)} placeholder="Enter sub heading..." className="w-full text-xl font-semibold text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                  <textarea value={currentContent} onChange={e => setCurrentContent(e.target.value)} placeholder="Write your content here..." rows="10" className="w-full text-gray-700 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none" />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowContentForm(false)
                      setEditingIndex(null)
                      setCurrentSubHeading("")
                      setCurrentContent("")
                    }}
                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSaveSection} className="flex items-center space-x-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                    <Check className="w-4 h-4" />
                    <span>Save Section</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Saved Sections Display */}
          {savedSections.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Sections ({savedSections.length})</h2>
              {savedSections.map((section, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{section.subHeading}</h3>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditSection(index)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteSection(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{section.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}