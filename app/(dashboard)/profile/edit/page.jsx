"use client"
// app/(dashboard)/profile/edit/page.jsx
import React, {useState, useEffect} from "react"
import {ArrowLeft, Save, User as UserIcon, MapPin, Globe, AlertCircle} from "lucide-react"
import {useRouter} from "next/navigation"
import {useAuth} from "@/src/context/authContext"

export default function EditProfilePage() {
  const {currentUser, loading} = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
  })

  const [initialData, setInitialData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && (!currentUser || currentUser.isAnonymous)) {
      router.push("/login")
    }
  }, [currentUser, loading, router])

  // Fetch current profile data
  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous) return

    fetch(`/api/user?uid=${currentUser.uid}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          const userData = {
            name: data.data.name || "",
            bio: data.data.bio || "",
            location: data.data.location || "",
            website: data.data.website || "",
          }
          setFormData(userData)
          setInitialData(userData)
        }
      })
      .catch(err => console.error("Error fetching profile:", err))
      .finally(() => setLoadingProfile(false))
  }, [currentUser])

  const handleChange = e => {
    const {name, value} = e.target
    setFormData(prev => ({...prev, [name]: value}))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required")
      setSaving(false)
      return
    }

    if (formData.bio.length > 500) {
      setError("Bio cannot exceed 500 characters")
      setSaving(false)
      return
    }

    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          uid: currentUser.uid,
          ...formData,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess("Profile updated successfully!")
        setInitialData(formData)

        // Update Firebase profile name
        if (formData.name !== currentUser.displayName) {
          await fetch("/api/user/sync-firebase", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
              uid: currentUser.uid,
              displayName: formData.name,
            }),
          })
        }

        setTimeout(() => {
          router.push(`/profile/${currentUser.uid}`)
        }, 1500)
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("An error occurred while updating profile")
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = () => {
    if (!initialData) return false
    return JSON.stringify(formData) !== JSON.stringify(initialData)
  }

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!currentUser || currentUser.isAnonymous) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-emerald-600 mb-4 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Profile
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-2">Update your personal information</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            {/* Read-only fields */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" value={currentUser.email || ""} disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed" />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <input type="text" value={currentUser.uid || ""} disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed" />
                <p className="text-xs text-gray-500 mt-1">User ID cannot be changed</p>
              </div>
            </div>

            {/* Editable fields */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Full Name *
                </label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your full name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." rows="4" maxLength="500" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none" />
                <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website
                </label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://yourwebsite.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving || !hasChanges()} className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${saving || !hasChanges() ? "bg-emerald-300 text-white cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
