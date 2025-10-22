"use client"
import React, {useState, useEffect} from "react"
import {X, Eye, Plus, Edit2, Trash2, Check, ArrowLeft} from "lucide-react"
import {useParams, useRouter} from "next/navigation"
import {useAuth} from "@/src/context/authContext"
import Loader from "@/app/components/Loader"
import ImageUpload from "@/app/components/ImageUpload"

export default function EditPage() {
  const {currentUser, loading: authLoading} = useAuth()
  const router = useRouter()
  const {id} = useParams()

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Technology")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState("")
  const [canAddContent, setCanAddContent] = useState(false)
  const [savedSections, setSavedSections] = useState([])
  const [currentSubHeading, setCurrentSubHeading] = useState("")
  const [currentContent, setCurrentContent] = useState("")
  const [showContentForm, setShowContentForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [article, setArticle] = useState(null)
  const [error, setError] = useState(null)

  // NEW: Image state
  const [featuredImage, setFeaturedImage] = useState("")
  const [imageAlt, setImageAlt] = useState("")

  const categories = ["Technology", "Lifestyle", "Health", "Travel", "Design", "Business"]

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.isAnonymous)) {
      alert("Please login to edit posts")
      router.push("/login")
    }
  }, [currentUser, authLoading, router])

  useEffect(() => {
    if (!id || !currentUser || currentUser.isAnonymous) return

    fetch(`/api/publish/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const postAuthorUid = data.data.authorUid || (typeof data.data.author === "object" ? data.data.author.uid : data.data.author)
          if (postAuthorUid !== currentUser.uid) {
            alert("You don't have permission to edit this post")
            router.push("/")
            return
          }
          setArticle(data.data)
        } else {
          setError(data.error)
        }
      })
      .catch(err => setError(err.message))
  }, [id, currentUser, router])

  useEffect(() => {
    if (!article) return

    setTitle(article.title || "")
    setCategory(article.category || "Technology")
    setSummary(article.summary || "")
    setSavedSections(article.sections || [])
    setFeaturedImage(article.featuredImage?.url || "")
    setImageAlt(article.featuredImage?.alt || "")
    setCanAddContent(true)
    setIsLoading(false)
  }, [article])

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

  const handleUpdate = async () => {
    if (isUpdating) return

    if (!title || savedSections.length === 0) {
      alert("Please add title and at least one content section")
      return
    }

    setIsUpdating(true)

    try {
      const updateData = {
        title,
        category,
        summary,
        sections: savedSections,
        tableOfContents: savedSections.map(s => s.subHeading),
      }

      // Add featured image if present
      if (featuredImage) {
        updateData.featuredImage = {
          url: featuredImage,
          publicId: article?.featuredImage?.publicId || "",
          alt: imageAlt || title,
        }
      } else {
        // Remove image if deleted
        updateData.featuredImage = {url: "", publicId: "", alt: ""}
      }

      const res = await fetch(`/api/publish/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(updateData),
      })

      const data = await res.json()

      if (data.success) {
        alert("Post updated successfully ✅")
        router.push(`/blogs/blog_details/${id}`)
      } else {
        alert("Update failed ❌: " + data.error)
      }
    } catch (err) {
      console.error("Update error", err)
      alert("Failed to update: " + (err.message || "server error"))
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return

    const confirmDelete = confirm("Are you sure you want to delete this post? This action cannot be undone.")
    if (!confirmDelete) return

    setIsDeleting(true)

    try {
      const res = await fetch(`/api/publish/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (data.success) {
        alert("Post deleted successfully ✅")
        router.push(`/profile/${currentUser.uid}`)
      } else {
        alert("Delete failed ❌: " + data.error)
      }
    } catch (err) {
      console.error("Delete error:", err)
      alert("Failed to delete: " + (err.message || "server error"))
    } finally {
      setIsDeleting(false)
    }
  }

  if (authLoading || isLoading) {
    return <Loader />
  }

  if (!currentUser || currentUser.isAnonymous) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Error: {error}</p>
          <button onClick={() => router.back()} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.back()} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={() => router.back()} className="flex items-center space-x-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button type="button" onClick={handleUpdate} disabled={isUpdating} className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${isUpdating ? "bg-emerald-300 text-white cursor-not-allowed opacity-70" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                <Eye className="w-4 h-4" />
                <span>{isUpdating ? "Updating..." : "Update"}</span>
              </button>
              <button type="button" onClick={handleDelete} disabled={isDeleting} className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${isDeleting ? "bg-red-400 text-white cursor-not-allowed opacity-70" : "bg-red-700 text-white hover:bg-red-800"}`}>
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title *</label>
              <input type="text" value={title} onChange={handleTitleChange} placeholder="Enter your blog title..." className="w-full text-2xl font-bold text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Summary (one line)</label>
              <input type="text" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Write a one-line summary of the blog..." className="w-full text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
            </div>

            {/* Featured Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image (Optional)</label>
              <ImageUpload value={featuredImage} onChange={url => setFeaturedImage(url)} onRemove={() => setFeaturedImage("")} />
              {featuredImage && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Alt Text</label>
                  <input type="text" value={imageAlt} onChange={e => setImageAlt(e.target.value)} placeholder="Describe the image for accessibility..." className="w-full text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              )}
            </div>
          </div>

          {canAddContent && (
            <div className="mb-6">
              <button onClick={handleAddContent} disabled={showContentForm} className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${showContentForm ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                <Plus className="w-5 h-5" />
                <span>Add New Content Section</span>
              </button>
            </div>
          )}

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
