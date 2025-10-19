"use client"
// app/(dashboard)/profile/[user_id]/page.jsx - FIXED VERSION
import React, {useState, useEffect} from "react"
import {Menu, X, PenSquare, Mountain, User, Settings, LogOut, Clock, Heart, Bookmark, Mail, MapPin, Calendar, FileText, Users, Globe} from "lucide-react"
import Link from "next/link"
import {useParams, useRouter} from "next/navigation"
import {useAuth} from "@/src/context/authContext"
import MyPost from "./fragments/MyPost"
import SavedPost from "./fragments/SavedPost"
import LikedPost from "./fragments/LikedPost"
import FollowersModal from "./fragments/FollowersModal"

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
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

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
          setProfileData(data.data)
          setFollowerCount(data.data.followers?.length || 0)
          setFollowingCount(data.data.following?.length || 0)
          setSavedBlogs(data.data.savedPosts?.length || 0)
          setLikedBlogs(data.data.likedPosts?.length || 0)

          // Check if current user follows this profile
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
        const isFollowingUser = data.data.following?.some(followId => followId.toString() === profileData._id.toString())
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
          action: isFollowing ? "unfollow" : "follow",
        }),
      })

      const data = await res.json()

      if (data.success) {
        setIsFollowing(!isFollowing)
        // Update follower count immediately
        setFollowerCount(prev => (isFollowing ? prev - 1 : prev + 1))

        // Refresh profile data to update follower count
        fetch(`/api/user?uid=${profileUid}`)
          .then(r => r.json())
          .then(data => {
            if (data.success && data.data) {
              setProfileData(data.data)
              setFollowerCount(data.data.followers?.length || 0)
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

  const loadFollowers = async () => {
    if (!profileData) return

    console.log("Loading followers for UID:", profileUid)

    try {
      const res = await fetch(`/api/user/followers?uid=${profileUid}`)
      const data = await res.json()

      console.log("Followers response:", data)

      if (data.success) {
        setFollowers(data.followers || [])
        setShowFollowersModal(true)
      } else {
        console.error("Failed to load followers:", data.error)
        alert("Failed to load followers")
      }
    } catch (err) {
      console.error("Error loading followers:", err)
      alert("Error loading followers")
    }
  }

  const loadFollowing = async () => {
    if (!profileData) return

    console.log("Loading following for UID:", profileUid)

    try {
      const res = await fetch(`/api/user/following?uid=${profileUid}`)
      const data = await res.json()

      console.log("Following response:", data)

      if (data.success) {
        setFollowing(data.following || [])
        setShowFollowingModal(true)
      } else {
        console.error("Failed to load following:", data.error)
        alert("Failed to load following")
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

  // If not authenticated, show nothing (will redirect via useEffect)
  if (!currentUser || currentUser.isAnonymous) {
    return null
  }

  // Get user initials for avatar
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
                      <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Joined {new Date(profileData.createdAt).toLocaleDateString("en-US", {month: "long", year: "numeric"})}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-center md:justify-start gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{myPosts.length}</p>
                    <p className="text-sm text-gray-600">Posts</p>
                  </div>
                  <button onClick={loadFollowers} className="hover:bg-gray-50 px-3 py-1 rounded transition-colors">
                    <p className="text-2xl font-bold text-gray-900">{followerCount}</p>
                    <p className="text-sm text-gray-600">Followers</p>
                  </button>
                  <button onClick={loadFollowing} className="hover:bg-gray-50 px-3 py-1 rounded transition-colors">
                    <p className="text-2xl font-bold text-gray-900">{followingCount}</p>
                    <p className="text-sm text-gray-600">Following</p>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {isOwnProfile ? (
                  <Link href="/profile/edit" className="flex items-center justify-center space-x-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Link>
                ) : (
                  <button onClick={handleFollow} disabled={followLoading} className={`flex items-center justify-center space-x-2 px-5 py-2 rounded-lg transition-colors ${isFollowing ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-emerald-600 text-white hover:bg-emerald-700"} ${followLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
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
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{savedBlogs}</span>
                  </button>
                  <button onClick={() => setActiveTab("liked")} className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium transition-colors ${activeTab === "liked" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-600 hover:text-gray-900"}`}>
                    <Heart className="w-5 h-5" />
                    <span>Liked</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{likedBlogs}</span>
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div>
                {activeTab === "posts" && <MyPost />}
                {activeTab === "saved" && <SavedPost />}
                {activeTab === "liked" && <LikedPost />}
              </div>
            </>
          )}

          {/* For other users, just show their posts */}
          {!isOwnProfile && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts by {profileData.name}</h2>
              <MyPost authorUid={profileUid} />
            </div>
          )}
        </div>
      </div>

      {/* Followers Modal */}
      <FollowersModal isOpen={showFollowersModal} onClose={() => setShowFollowersModal(false)} users={followers} title="Followers" />

      {/* Following Modal */}
      <FollowersModal isOpen={showFollowingModal} onClose={() => setShowFollowingModal(false)} users={following} title="Following" />
    </div>
  )
}
