"use client"
import React, {useState} from "react"
import {Menu, X, PenSquare, Mountain, User, Settings, LogOut, Clock, Heart, Bookmark, Mail, MapPin, Calendar, FileText} from "lucide-react"

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
    followersCount: 248,
    followingCount: 156,
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
            {activeTab === "posts" && (
              <div className="space-y-4">
                {myPosts.length === 0 ? (
                  <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No posts yet</p>
                    <button className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors mx-auto">
                      <PenSquare className="w-4 h-4" />
                      <span>Write Your First Post</span>
                    </button>
                  </div>
                ) : (
                  myPosts.map(post => (
                    <div key={post.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full mb-2">{post.category}</span>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-emerald-600 cursor-pointer transition-colors">{post.title}</h3>
                          <p className="text-gray-600 mb-3 text-sm">{post.excerpt}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{post.date}</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{post.readTime}</span>
                            </div>
                            <span>•</span>
                            <span>{post.views} views</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <button className="p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                            <Settings className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Saved Blogs */}
            {activeTab === "saved" && (
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
            )}

            {/* Liked Blogs */}
            {activeTab === "liked" && (
              <div className="space-y-4">
                {likedBlogs.length === 0 ? (
                  <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No liked blogs yet</p>
                  </div>
                ) : (
                  likedBlogs.map(blog => (
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
                        <button className="text-red-500 hover:text-red-600 transition-colors">
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
