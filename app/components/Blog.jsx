"use client"
import React, {useState} from "react"
import {Clock, Calendar, Share2, Bookmark, Heart} from "lucide-react"
import Navbar from "./Navbar"

// Navbar Component

// Article Page Component
export default function ArticlePage() {
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const article = {
    title: "Getting Started with React: A Complete Beginner's Guide",
    category: "Technology",
    author: {
      name: "John Doe",
      bio: "Full-stack developer and tech enthusiast. Passionate about teaching coding to beginners.",
      avatar: "JD",
      posts: 24,
    },
    date: "October 3, 2025",
    readTime: "8 min read",
    content: [
      {
        type: "paragraph",
        text: "React has revolutionized the way we build user interfaces. In this comprehensive guide, we'll explore everything you need to know to get started with React development.",
      },
      {
        type: "heading",
        text: "What is React?",
      },
      {
        type: "paragraph",
        text: "React is a JavaScript library for building user interfaces, particularly single-page applications. It was developed by Facebook and has become one of the most popular front-end libraries in the world.",
      },
      {
        type: "paragraph",
        text: "React allows developers to create reusable UI components, making it easier to manage complex applications. The component-based architecture promotes code reusability and maintainability.",
      },
      {
        type: "heading",
        text: "Why Choose React?",
      },
      {
        type: "paragraph",
        text: "There are several compelling reasons to choose React for your next project. First, it has a gentle learning curve for those familiar with JavaScript. Second, the vast ecosystem and community support means you'll find solutions to almost any problem you encounter.",
      },
      {
        type: "paragraph",
        text: "React's virtual DOM ensures optimal performance by minimizing direct manipulation of the actual DOM. This results in faster rendering and a smoother user experience, especially in data-intensive applications.",
      },
      {
        type: "heading",
        text: "Getting Started",
      },
      {
        type: "paragraph",
        text: "To start building with React, you'll need Node.js installed on your computer. Once you have that set up, you can use Create React App, a tool that sets up a new React project with all the necessary configurations.",
      },
      {
        type: "paragraph",
        text: "The beauty of React lies in its simplicity. You can start with functional components and gradually learn about hooks, state management, and more advanced concepts as you grow more comfortable with the basics.",
      },
      {
        type: "heading",
        text: "Conclusion",
      },
      {
        type: "paragraph",
        text: "React is an excellent choice for building modern web applications. Whether you're a beginner or an experienced developer, React's flexibility and powerful features make it a valuable tool in your development arsenal. Start small, practice regularly, and you'll be building amazing applications in no time.",
      },
    ],
    tableOfContents: ["What is React?", "Why Choose React?", "Getting Started", "Conclusion"],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Author Info (Hidden on mobile) */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-emerald-700">{article.author.avatar}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{article.author.name}</h3>
                    <p className="text-sm text-gray-500">{article.author.posts} Posts</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{article.author.bio}</p>
                  <button className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">Follow</button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-6">
              <article className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                {/* Article Header */}
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mb-4">{article.category}</span>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>

                  {/* Mobile Author Info */}
                  <div className="lg:hidden flex items-center mb-4 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-lg font-bold text-emerald-700">{article.author.avatar}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{article.author.name}</p>
                      <p className="text-sm text-gray-500">{article.author.posts} Posts</p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{article.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </div>

                {/* Article Actions */}
                <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-gray-200">
                  <button onClick={() => setLiked(!liked)} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${liked ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                    <span className="text-sm font-medium">Like</span>
                  </button>
                  <button onClick={() => setBookmarked(!bookmarked)} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${bookmarked ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    <Bookmark className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`} />
                    <span className="text-sm font-medium">Save</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  {article.content.map((section, index) => (
                    <div key={index}>
                      {section.type === "heading" && <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{section.text}</h2>}
                      {section.type === "paragraph" && <p className="text-gray-700 leading-relaxed mb-6">{section.text}</p>}
                    </div>
                  ))}
                </div>
              </article>
            </div>

            {/* Right Sidebar - Table of Contents */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Table of Contents</h3>
                  <nav className="space-y-2">
                    {article.tableOfContents.map((item, index) => (
                      <a key={index} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="block text-sm text-gray-600 hover:text-emerald-600 transition-colors py-1">
                        {item}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
