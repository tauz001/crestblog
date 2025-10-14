"use client"
import React, {useState, useEffect} from "react"
import {PenSquare, Clock, User, ChevronLeft, ChevronRight, TrendingUp} from "lucide-react"

// Navbar Component

// Footer Component

// Homepage Component
export default function Homepage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentSlide, setCurrentSlide] = useState(0)

  const featuredPosts = [
    {
      id: 1,
      title: "Mastering Modern Web Development in 2025",
      excerpt: "Explore the latest trends and technologies shaping the future of web development.",
      author: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=600&fit=crop",
      category: "Technology",
    },
    {
      id: 2,
      title: "The Ultimate Guide to Healthy Living",
      excerpt: "Transform your lifestyle with these proven health and wellness strategies.",
      author: "Mike Chen",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=600&fit=crop",
      category: "Health",
    },
    {
      id: 3,
      title: "Design Thinking: A Creative Approach",
      excerpt: "Learn how design thinking can revolutionize your problem-solving process.",
      author: "Emma Wilson",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=600&fit=crop",
      category: "Design",
    },
  ]

  const blogPosts = [
    {
      id: 1,
      title: "Getting Started with React",
      excerpt: "Learn the basics of React and start building modern web applications.",
      author: "John Doe",
      date: "Oct 3, 2025",
      readTime: "5 min read",
      category: "Technology",
    },
    {
      id: 2,
      title: "Understanding JavaScript Async",
      excerpt: "Master asynchronous programming in JavaScript with promises and async/await.",
      author: "Jane Smith",
      date: "Oct 2, 2025",
      readTime: "7 min read",
      category: "Technology",
    },
    {
      id: 3,
      title: "The Art of Storytelling",
      excerpt: "Discover techniques to craft compelling narratives that engage readers.",
      author: "Mike Johnson",
      date: "Oct 1, 2025",
      readTime: "6 min read",
      category: "Lifestyle",
    },
    {
      id: 4,
      title: "Introduction to Node.js",
      excerpt: "Build server-side applications with Node.js and Express framework.",
      author: "Sarah Wilson",
      date: "Sep 30, 2025",
      readTime: "8 min read",
      category: "Technology",
    },
    {
      id: 5,
      title: "Healthy Living Tips",
      excerpt: "Essential tips for maintaining a balanced and healthy lifestyle.",
      author: "Tom Brown",
      date: "Sep 29, 2025",
      readTime: "5 min read",
      category: "Health",
    },
    {
      id: 6,
      title: "Travel Guide to Europe",
      excerpt: "Plan your perfect European adventure with this comprehensive guide.",
      author: "Lisa Anderson",
      date: "Sep 28, 2025",
      readTime: "6 min read",
      category: "Travel",
    },
    {
      id: 7,
      title: "Web Design Principles",
      excerpt: "Essential design principles every web developer should know.",
      author: "David Lee",
      date: "Sep 27, 2025",
      readTime: "7 min read",
      category: "Design",
    },
    {
      id: 8,
      title: "Mindfulness and Meditation",
      excerpt: "Learn how meditation can improve your mental health and wellbeing.",
      author: "Emma Davis",
      date: "Sep 26, 2025",
      readTime: "5 min read",
      category: "Health",
    },
    {
      id: 9,
      title: "Photography Basics",
      excerpt: "Master the fundamentals of photography and capture stunning images.",
      author: "Alex Turner",
      date: "Sep 25, 2025",
      readTime: "6 min read",
      category: "Lifestyle",
    },
  ]

  const categories = ["All", "Technology", "Lifestyle", "Health", "Travel", "Design"]

  const filteredPosts = selectedCategory === "All" ? blogPosts : blogPosts.filter(post => post.category === selectedCategory)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredPosts.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % featuredPosts.length)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + featuredPosts.length) % featuredPosts.length)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Discover Stories That <span className="text-emerald-600">Inspire</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">Join our community of writers and readers sharing knowledge, experiences, and ideas</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-lg font-medium shadow-lg cursor-pointer">
                <PenSquare className="w-5 h-5" />
                <span>Start Writing</span>
              </button>
              <button className="bg-white text-emerald-600 px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors text-lg font-medium border-2 border-emerald-600 cursor-pointer hover:text-white">Explore Blogs</button>
            </div>
          </div>

          {/* Featured Carousel */}
          <div className="relative mb-8">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-emerald-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Featured Stories</h2>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative h-96">
                {featuredPosts.map((post, index) => (
                  <div key={post.id} className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}>
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <span className="inline-block px-3 py-1 bg-emerald-600 rounded-full text-sm font-medium mb-3">{post.category}</span>
                      <h3 className="text-3xl font-bold mb-2">{post.title}</h3>
                      <p className="text-gray-200 mb-3 text-lg">{post.excerpt}</p>
                      <p className="text-sm">By {post.author}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm hover:bg-white/50 text-white p-2 rounded-full transition-all">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm hover:bg-white/50 text-white p-2 rounded-full transition-all">
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {featuredPosts.map((_, index) => (
                  <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "bg-white w-8" : "bg-white/50"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Our Blogs</h2>
            <p className="text-gray-600">Browse through our collection of articles</p>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Filter by Category:</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <button key={category} onClick={() => setSelectedCategory(category)} className={`px-5 py-2 rounded-lg transition-colors ${selectedCategory === category ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200"}`}>
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <div key={post.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">{post.category}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-emerald-600 transition-colors">{post.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{post.excerpt}</p>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <User className="w-4 h-4 mr-1" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{post.date}</span>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No blogs found in this category.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
