"use client"
import React from "react"
import {Mountain, Twitter, Github, Linkedin, Mail} from "lucide-react"

function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">CrestBlog</span>
            </div>
            <p className="text-gray-400 text-sm">A platform for writers to share their stories and connect with readers worldwide.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Blogs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 CrestBlog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
