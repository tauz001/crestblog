"use client"
import React, {useState} from "react"
import {Menu, X, PenSquare, Mountain, User, Settings, LogOut, Clock, Heart, Bookmark, Mail, MapPin, Calendar, FileText} from "lucide-react"
import Link from "next/link"
import MyPost from "./fragments/MyPost"
import SavedPost from "./fragments/SavedPost"
import LikedPost from "./fragments/LikedPost"

// Profile Page Component
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("posts")

  const userProfile = {
    name: "John Doe",
    email: "johndoe@example.com",
    bio: "Passionate writer and tech enthusiast. Love sharing knowledge about web development and programming.",
    location: "San Francisco, CA",
    joinedDate: "January 2024",
    postsCount: 12,
  }

  const myPosts = [
    {
      id: 1,
      title: "Getting Started with React",
      excerpt: "Learn the basics of React and start building modern web applications.",
      date: "Oct 3, 2025",
      readTime: "5 min read",
      category: "Technology",
      views: "1.2k",
    },
    {
      id: 2,
      title: "Understanding JavaScript Async",
      excerpt: "Master asynchronous programming in JavaScript with promises and async/await.",
      date: "Oct 2, 2025",
      readTime: "7 min read",
      category: "Technology",
      views: "856",
    },
    {
      id: 3,
      title: "Introduction to Node.js",
      excerpt: "Build server-side applications with Node.js and Express framework.",
      date: "Sep 30, 2025",
      readTime: "8 min read",
      category: "Technology",
      views: "643",
    },
  ]

  const savedBlogs = [
    {
      id: 1,
      title: "Getting Started with React",
      author: "Jane Smith",
      date: "Oct 3, 2025",
      readTime: "5 min read",
      category: "Technology",
    },
    {
      id: 2,
      title: "Web Design Principles",
      author: "David Lee",
      date: "Sep 27, 2025",
      readTime: "7 min read",
      category: "Design",
    },
    {
      id: 3,
      title: "Healthy Living Tips",
      author: "Tom Brown",
      date: "Sep 29, 2025",
      readTime: "5 min read",
      category: "Health",
    },
  ]

  const likedBlogs = [
    {
      id: 1,
      title: "Understanding JavaScript Async",
      author: "Mike Johnson",
      date: "Oct 2, 2025",
      readTime: "7 min read",
      category: "Technology",
    },
    {
      id: 2,
      title: "Travel Guide to Europe",
      author: "Lisa Anderson",
      date: "Sep 28, 2025",
      readTime: "6 min read",
      category: "Travel",
    },
    {
      id: 3,
      title: "Photography Basics",
      author: "Alex Turner",
      date: "Sep 25, 2025",
      readTime: "6 min read",
      category: "Lifestyle",
    },
    {
      id: 4,
      title: "The Art of Storytelling",
      author: "Emma Davis",
      date: "Oct 1, 2025",
      readTime: "6 min read",
      category: "Lifestyle",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-4xl font-bold text-emerald-700">
                  {userProfile.name
                    .split(" ")
                    .map(n => n[0])
                    .join("")}
                </span>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{userProfile.name}</h1>
                <p className="text-gray-600 mb-4">{userProfile.bio}</p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{userProfile.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Joined {userProfile.joinedDate}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-center md:justify-start gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{userProfile.postsCount}</p>
                    <p className="text-sm text-gray-600">Posts</p>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button className="flex items-center space-x-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
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

          {/* Content Area */}
          <div>
            {/* My Posts */}
            {activeTab === "posts" && <MyPost />}

            {/* Saved Blogs */}
            {activeTab === "saved" && <SavedPost />}

            {/* Liked Blogs */}
            {activeTab === "liked" && <LikedPost />}
          </div>
        </div>
      </div>
    </div>
  )
}
