"use client"
// app/(dashboard)/profile/[user_id]/page.jsx - COMPLETE WORKING VERSION
import React, {useState, useEffect} from "react"
import {Settings, Clock, Heart, Bookmark, Mail, MapPin, Calendar, FileText, Users, Globe, X, User as UserIcon} from "lucide-react"
import Link from "next/link"
import {useParams, useRouter} from "next/navigation"
import {useAuth} from "@/src/context/authContext"
import MyPost from "./fragments/MyPost"
import SavedPost from "./fragments/SavedPost"
import LikedPost from "./fragments/LikedPost"

// INLINE MODAL COMPONENT - This guarantees it works
function FollowersModal({isOpen, onClose, users, title}) {
  console.log("Modal render:", {isOpen, usersCount: users.length, title}) // DEBUG
  
  if (!isOpen) return null

  const getUserInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{zIndex: 9999}} // Ensure it's on top
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[70vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No {title.toLowerCase()} yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <Link
                  key={user._id || user.uid}
                  href={`/profile/${user.uid}`}
                  onClick={onClose}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors block"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-emerald-700">
                      {getUserInitials(user.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email || "No email"}
                    </p>
                    {user.bio && (
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("posts")
  const {currentUser, loading} = useAuth()
  const params = useParams()
  const router = useRouter()
  const profileUid = params.user_id

  const [profileData, setProfileData] = useState(null)
  const [myPosts, setMyPosts] = useState([])
  const [savedBlogs, setSavedBlogs] = useState([])
  const [likedBlogs, setLikedBlogs] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  
  // Modal states
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])

  const isOwnProfile = currentUser && currentUser.uid === profileUid

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && (!currentUser || currentUser.isAnonymous)) {
      router.push("/login")
    }
  }, [currentUser, loading, router])

  // Fetch profile data
  useEffect(() => {
    if (!profileUid) return

    fetch(`/api/user?uid=${profileUid}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          console.log("Profile loaded:", data.data) // DEBUG
          setProfileData(data.data)
          
          if (currentUser && !isOwnProfile) {
            checkFollowStatus()
          }
        }
      })
      .catch(err => console.error("Error fetching profile:", err))
  }, [profileUid, currentUser])

  // Fetch user's posts count
  useEffect(() => {
    if (!profileUid) return

    fetch("/api/publish")
      .then(r => r.json())
      .then(data => {
        if (data?.success) {
          const userPosts = (data.data || []).filter(post => {
            if (post.author && typeof post.author === "object" && post.author.uid) {
              return post.author.uid === profileUid
            }
            if (typeof post.author === "string") {
              return post.author === profileUid
            }
            return post.authorUid === profileUid
          })
          setMyPosts(userPosts)
        }
      })
      .catch(err => console.error("Fetch error:", err))
  }, [profileUid])

  const checkFollowStatus = async () => {
    if (!currentUser || !profileData) return

    try {
      const res = await fetch(`/api/user?uid=${currentUser.uid}`)
      const data = await res.json()

      if (data.success && data.data) {
        const isFollowingUser = data.data.following?.some(
          followId => followId.toString() === profileData._id.toString()
        )
        setIsFollowing(isFollowingUser || false)
      }
    } catch (err) {
      console.error("Error checking follow status:", err)
    }
  }

  const handleFollow = async () => {
    if (!currentUser || currentUser.isAnonymous) {
      alert("Please login to follow users")
      return
    }

    if (isOwnProfile) return

    setFollowLoading(true)

    try {
      const res = await fetch("/api/user/follow", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          currentUserUid: currentUser.uid,
          targetUserUid: profileUid,
          action: isFollowing ? "unfollow" : "follow"
        })
      })

      const data = await res.json()

      if (data.success) {
        setIsFollowing(!isFollowing)
        fetch(`/api/user?uid=${profileUid}`)
          .then(r => r.json())
          .then(data => {
            if (data.success && data.data) {
              setProfileData(data.data)
            }
          })
      } else {
        alert(data.error || "Failed to update follow status")
      }
    } catch (err) {
      console.error("Error following user:", err)
      alert("An error occurred")
    } finally {
      setFollowLoading(false)
    }
  }

  // THIS IS THE KEY FUNCTION - Load followers
  const loadFollowers = async () => {
    console.log("🔍 loadFollowers called") // DEBUG
    console.log("profileUid:", profileUid) // DEBUG
    
    if (!profileData) {
      console.log("No profile data yet")
      return
    }

    try {
      console.log("Fetching followers from API...") // DEBUG
      const res = await fetch(`/api/user/followers?uid=${profileUid}`)
      console.log("Response status:", res.status) // DEBUG
      
      const data = await res.json()
      console.log("Followers data:", data) // DEBUG

      if (data.success) {
        console.log("✅ Setting followers:", data.followers.length) // DEBUG
        setFollowers(data.followers || [])
        console.log("✅ Opening modal") // DEBUG
        setShowFollowersModal(true)
      } else {
        console.error("❌ API returned error:", data.error)
        alert("Failed to load followers: " + data.error)
      }
    } catch (err) {
      console.error("❌ Error loading followers:", err)
      alert("Error loading followers: " + err.message)
    }
  }

  // THIS IS THE KEY FUNCTION - Load following
  const loadFollowing = async () => {
    console.log("🔍 loadFollowing called") // DEBUG
    
    if (!profileData) return

    try {
      const res = await fetch(`/api/user/following?uid=${profileUid}`)
      const data = await res.json()
      
      console.log("Following data:", data) // DEBUG

      if (data.success) {
        setFollowing(data.following || [])
        setShowFollowingModal(true)
      } else {
        alert("Failed to load following: " + data.error)
      }
    } catch (err) {
      console.error("Error loading following:", err)
      alert("Error loading following")
    }
  }

  // Show loading state
  if (loading || !profileData) {
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

  const getUserInitials = () => {
    if (profileData.name) {
      return profileData.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return "U"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-4xl font-bold text-emerald-700">{getUserInitials()}</span>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileData.name}</h1>
                <p className="text-gray-600 mb-4">{profileData.bio || "No bio yet"}</p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    <span>{profileData.email}</span>
                  </div>
                  {profileData.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                  {profileData.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      <a 
                        href={profileData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Joined {new Date(profileData.createdAt).toLocaleDateString("en-US", {month: "long", year: "numeric"})}</span>
                  </div>
                </div>

                {/* Stats - THESE ARE THE IMPORTANT BUTTONS */}
                <div className="flex justify-center md:justify-start gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{myPosts.length}</p>
                    <p className="text-sm text-gray-600">Posts</p>
                  </div>
                  
                  {/* FOLLOWERS BUTTON - CLICKABLE */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      console.log("👆 Followers button clicked!") // DEBUG
                      loadFollowers()
                    }}
                    className="hover:bg-gray-100 px-3 py-1 rounded transition-colors cursor-pointer"
                  >
                    <p className="text-2xl font-bold text-gray-900">{profileData.followers?.length || 0}</p>
                    <p className="text-sm text-gray-600">Followers</p>
                  </button>
                  
                  {/* FOLLOWING BUTTON - CLICKABLE */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      console.log("👆 Following button clicked!") // DEBUG
                      loadFollowing()
                    }}
                    className="hover:bg-gray-100 px-3 py-1 rounded transition-colors cursor-pointer"
                  >
                    <p className="text-2xl font-bold text-gray-900">{profileData.following?.length || 0}</p>
                    <p className="text-sm text-gray-600">Following</p>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {isOwnProfile ? (
                  <Link 
                    href="/profile/edit"
                    className="flex items-center justify-center space-x-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Link>
                ) : (
                  <button 
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex items-center justify-center space-x-2 px-5 py-2 rounded-lg transition-colors ${
                      isFollowing 
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    } ${followLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    <Users className="w-4 h-4" />
                    <span>{followLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs - Only show for own profile */}
          {isOwnProfile && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
                <div className="flex border-b border-gray-200">
                  <button onClick={() => setActiveTab("posts")} className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium transition-colors ${activeTab === "posts" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-600 hover:text-gray-900"}`}>
                    <FileText className="w-5 h-5" />
                    <span>My Posts</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{myPosts.length}</span>
                  </button>
                  <button onClick={() => setActiveTab("saved")} className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium transition-colors ${activeTab === "saved" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-600 hover:text-gray-900"}`}>
                    <Bookmark className="w-5 h-5" />
                    <span>Saved</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{savedBlogs.length}</span>
                  </button>
                  <button onClick={() => setActiveTab("liked")} className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium transition-colors ${activeTab === "liked" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-600 hover:text-gray-900"}`}>
                    <Heart className="w-5 h-5" />
                    <span>Liked</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{likedBlogs.length}</span>
                  </button>
                </div>
              </div>

              <div>
                {activeTab === "posts" && <MyPost />}
                {activeTab === "saved" && <SavedPost />}
                {activeTab === "liked" && <LikedPost />}
              </div>
            </>
          )}

          {!isOwnProfile && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts by {profileData.name}</h2>
              <MyPost authorUid={profileUid} />
            </div>
          )}
        </div>
      </div>

      {/* MODALS - RENDER AT END */}
      <FollowersModal
        isOpen={showFollowersModal}
        onClose={() => {
          console.log("Closing followers modal") // DEBUG
          setShowFollowersModal(false)
        }}
        users={followers}
        title="Followers"
      />

      <FollowersModal
        isOpen={showFollowingModal}
        onClose={() => {
          console.log("Closing following modal") // DEBUG
          setShowFollowingModal(false)
        }}
        users={following}
        title="Following"
      />
    </div>
  )
}