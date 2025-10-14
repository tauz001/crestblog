"use client"
import React, {useState} from "react"
import {Menu, X, PenSquare, Mountain, User, Settings, LogOut} from "lucide-react"
import Link from "next/link"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const userId = 10

  return (
    <nav className="fixed top-0 w-full bg-white z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <Link href={"/"} className="text-2xl font-bold text-gray-800">
              CrestBlog
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <Link href="/blogs" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Blogs
            </Link>
            <Link href="/aboutus" className="text-gray-700 hover:text-emerald-600 transition-colors">
              About
            </Link>
            <Link href={"/write"} className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
              <PenSquare className="w-4 h-4" />
              <span>Write</span>
            </Link>

            {/* User Dropdown */}
            <div className="relative" onMouseEnter={() => setShowUserMenu(true)} onMouseLeave={() => setShowUserMenu(false)}>
              <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-200 transition-colors">
                <User className="w-5 h-5 text-emerald-700" />
              </div>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50">
                  <Link href={`/profile/user_id${userId}`} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4 mr-3 text-gray-600" />
                    <span>Profile</span>
                  </Link>

                  <hr className="my-2 border-gray-200" />
                  <button type="button" onClick={() => {}} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4 mr-3" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">
              Home
            </Link>
            <Link href="/blogs" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">
              Blogs
            </Link>
            <Link href="/aboutus" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">
              About
            </Link>
            <button className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white px-5 py-2 rounded-lg">
              <PenSquare className="w-4 h-4" />
              <span>Write</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
