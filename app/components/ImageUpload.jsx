// app/components/ImageUpload.jsx
"use client"
import React, {useState, useRef} from "react"
import {Upload, Link as LinkIcon, X, Image as ImageIcon, Loader} from "lucide-react"

export default function ImageUpload({value, onChange, onRemove}) {
  const [uploadMethod, setUploadMethod] = useState("file") // 'file' or 'url'
  const [imageUrl, setImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleDrag = e => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async e => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      await handleFileUpload(files[0])
    }
  }

  const handleFileChange = async e => {
    const files = e.target.files
    if (files && files[0]) {
      await handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async file => {
    setError("")
    setUploading(true)

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      setUploading(false)
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB")
      setUploading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        onChange(data.url)
        setError("")
      } else {
        setError(data.error || "Upload failed")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleUrlSubmit = async e => {
    e.preventDefault()
    setError("")
    setUploading(true)

    try {
      const response = await fetch("/api/upload/image", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url: imageUrl}),
      })

      const data = await response.json()

      if (data.success) {
        onChange(data.url)
        setImageUrl("")
        setError("")
      } else {
        setError(data.error || "Invalid URL")
      }
    } catch (err) {
      console.error("URL validation error:", err)
      setError("Failed to validate image URL")
    } finally {
      setUploading(false)
    }
  }

  if (value) {
    return (
      <div className="relative">
        <img src={value} alt="Blog cover" className="w-full h-64 object-cover rounded-lg" />
        <button type="button" onClick={onRemove} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg">
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Method Selector */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setUploadMethod("file")} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${uploadMethod === "file" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
          <Upload className="w-4 h-4 inline mr-2" />
          Upload File
        </button>
        <button type="button" onClick={() => setUploadMethod("url")} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${uploadMethod === "url" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
          <LinkIcon className="w-4 h-4 inline mr-2" />
          Image URL
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {/* File Upload */}
      {uploadMethod === "file" && (
        <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-400"}`}>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader className="w-12 h-12 text-emerald-600 animate-spin mb-3" />
              <p className="text-gray-600">Uploading image...</p>
            </div>
          ) : (
            <>
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium mb-2">Drag & drop your image here</p>
              <p className="text-gray-500 text-sm mb-4">or click to browse (Max 2MB)</p>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                Select Image
              </button>
              <p className="text-xs text-gray-400 mt-3">Supported formats: JPG, PNG, GIF, WebP</p>
            </>
          )}
        </div>
      )}

      {/* URL Input */}
      {uploadMethod === "url" && (
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" required />
          </div>
          <button type="submit" disabled={uploading || !imageUrl} className={`w-full py-2 rounded-lg font-medium transition-colors ${uploading || !imageUrl ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
            {uploading ? (
              <span className="flex items-center justify-center">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Validating...
              </span>
            ) : (
              "Use This URL"
            )}
          </button>
        </form>
      )}
    </div>
  )
}
