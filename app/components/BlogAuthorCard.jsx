// app/components/BlogAuthorCard.jsx
"use client"
import React, {useState, useEffect} from "react"
import {User, Users, MapPin} from "lucide-react"
import Link from "next/link"
import {useAuth} from "@/src/context/authContext"

export default function BlogAuthorCard({authorInfo, postId}) {
  const {currentUser} = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)

  // Check if current user follows this author
  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous || !authorInfo?.uid) return

    // Don't check if viewing own profile
    if (currentUser.uid === authorInfo.uid) return

    checkFollowStatus()
  }, [currentUser, authorInfo])

  const checkFollowStatus = async () => {
    try {
      const res = await fetch(`/api/user?uid=${currentUser.uid}`)
      const data = await res.json()

      if (data.success && data.data) {
        // Get author's MongoDB _id
        const authorRes = await fetch(`/api/user?uid=${authorInfo.uid}`)
        const authorData = await authorRes.json()

        if (authorData.success && authorData.data) {
          const isFollowingAuthor = data.data.following?.some(followId => followId.toString() === authorData.data._id.toString())
          setIsFollowing(isFollowingAuthor || false)
          setFollowerCount(authorData.data.followers?.length || 0)
        }
      }
    } catch (err) {
      console.error("Error checking follow status:", err)
    }
  }

  const handleFollow = async () => {
    if (!currentUser || currentUser.isAnonymous) {
      alert("Please login to follow authors")
      return
    }

    if (currentUser.uid === authorInfo.uid) return

    setFollowLoading(true)

    try {
      const res = await fetch("/api/user/follow", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          currentUserUid: currentUser.uid,
          targetUserUid: authorInfo.uid,
          action: isFollowing ? "unfollow" : "follow",
        }),
      })

      const data = await res.json()

      if (data.success) {
        setIsFollowing(!isFollowing)
        setFollowerCount(prev => (isFollowing ? prev - 1 : prev + 1))
      } else {
        alert(data.error || "Failed to update follow status")
      }
    } catch (err) {
      console.error("Error following author:", err)
    } finally {
      setFollowLoading(false)
    }
  }

  const getUserInitials = () => {
    if (authorInfo.name) {
      return authorInfo.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return "NA"
  }

  if (!authorInfo) return null

  const isOwnProfile = currentUser && currentUser.uid === authorInfo.uid

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="text-center mb-4">
        <Link href={`/profile/${authorInfo.uid}`}>
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-emerald-200 transition-colors">
            <span className="text-2xl font-bold text-emerald-700">{getUserInitials()}</span>
          </div>
        </Link>
        <Link href={`/profile/${authorInfo.uid}`}>
          <h3 className="font-bold text-gray-900 text-lg hover:text-emerald-600 transition-colors cursor-pointer">{authorInfo.name}</h3>
        </Link>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-1">
          <Users className="w-4 h-4" />
          <span>
            {followerCount} follower{followerCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {authorInfo.bio && <p className="text-sm text-gray-600 mb-4 text-center">{authorInfo.bio}</p>}

      {authorInfo.location && (
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-4">
          <MapPin className="w-3 h-3" />
          <span>{authorInfo.location}</span>
        </div>
      )}

      {!isOwnProfile && (
        <button onClick={handleFollow} disabled={followLoading} className={`w-full py-2 rounded-lg transition-colors text-sm font-medium ${isFollowing ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-emerald-600 text-white hover:bg-emerald-700"} ${followLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
          {followLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}
        </button>
      )}

      {isOwnProfile && (
        <Link href="/profile/edit" className="block w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium text-center">
          Edit Profile
        </Link>
      )}
    </div>
  )
}
