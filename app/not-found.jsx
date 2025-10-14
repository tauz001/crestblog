import {PenSquare, Mountain, User, Home, Search, ArrowLeft} from "lucide-react"

// 404 Page Component
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* 404 Number with Animation */}
          <div className="mb-8">
            <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 animate-pulse">404</h1>
          </div>

          {/* Floating Mountain Icons */}
          <div className="relative h-32 mb-8">
            <div className="absolute left-1/4 top-0 animate-bounce">
              <Mountain className="w-12 h-12 text-emerald-300" />
            </div>
            <div className="absolute right-1/4 top-4 animate-bounce" style={{animationDelay: "0.2s"}}>
              <Mountain className="w-16 h-16 text-teal-400" />
            </div>
            <div className="absolute left-1/3 bottom-0 animate-bounce" style={{animationDelay: "0.4s"}}>
              <Mountain className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          {/* Message */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Oops! Page Not Found</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">The page you're looking for seems to have wandered off. Let's get you back on track!</p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors text-lg font-medium shadow-lg">
              <Home className="w-5 h-5" />
              <span>Go to Home</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-white text-emerald-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors text-lg font-medium border-2 border-emerald-600">
              <Search className="w-5 h-5" />
              <span>Search Blogs</span>
            </button>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Pages</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="#" className="flex items-center space-x-3 p-4 rounded-lg hover:bg-emerald-50 transition-colors group">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <Home className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">Homepage</p>
                  <p className="text-sm text-gray-500">Discover latest blogs</p>
                </div>
              </a>
              <a href="#" className="flex items-center space-x-3 p-4 rounded-lg hover:bg-emerald-50 transition-colors group">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <PenSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">Write a Blog</p>
                  <p className="text-sm text-gray-500">Share your story</p>
                </div>
              </a>
              <a href="#" className="flex items-center space-x-3 p-4 rounded-lg hover:bg-emerald-50 transition-colors group">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <Search className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">All Blogs</p>
                  <p className="text-sm text-gray-500">Browse articles</p>
                </div>
              </a>
              <a href="#" className="flex items-center space-x-3 p-4 rounded-lg hover:bg-emerald-50 transition-colors group">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">Profile</p>
                  <p className="text-sm text-gray-500">View your profile</p>
                </div>
              </a>
            </div>
          </div>

          {/* Back Button */}
          <button className="mt-8 flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors mx-auto">
            <ArrowLeft className="w-5 h-5" />
            <span>Go back to previous page</span>
          </button>
        </div>
      </div>
    </div>
  )
}
