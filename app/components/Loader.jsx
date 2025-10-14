import React from "react"
import {Mountain} from "lucide-react"

export default function loading() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Elegant Rotating Ring with Logo */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-600 animate-spin"></div>

          {/* Middle rotating ring - opposite direction */}
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-teal-500 animate-spin-reverse"></div>

          {/* Inner glow effect */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 animate-pulse"></div>

          {/* Center logo */}
          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Mountain className="w-6 h-6 text-white animate-float" />
          </div>
        </div>

        {/* Brand name with fade effect */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-fade">CrestBlog</h2>

        <style>{`
          @keyframes spin-reverse {
            from {
              transform: rotate(360deg);
            }
            to {
              transform: rotate(0deg);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-3px);
            }
          }

          @keyframes fade {
            0%, 100% {
              opacity: 0.5;
            }
            50% {
              opacity: 1;
            }
          }

          .animate-spin-reverse {
            animation: spin-reverse 1.5s linear infinite;
          }

          .animate-float {
            animation: float 2s ease-in-out infinite;
          }

          .animate-fade {
            animation: fade 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  )
}

// Alternative: Minimal Bouncing Dots
export function MinimalDotsLoader() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Three elegant dots */}
        <div className="flex space-x-3 mb-8">
          <div className="w-3 h-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full animate-bounce-elegant"></div>
          <div className="w-3 h-3 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full animate-bounce-elegant" style={{animationDelay: "0.15s"}}></div>
          <div className="w-3 h-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full animate-bounce-elegant" style={{animationDelay: "0.3s"}}></div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">CrestBlog</h2>

        <style>{`
          @keyframes bounce-elegant {
            0%, 100% {
              transform: translateY(0);
              opacity: 0.7;
            }
            50% {
              transform: translateY(-16px);
              opacity: 1;
            }
          }

          .animate-bounce-elegant {
            animation: bounce-elegant 1.4s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  )
}

// Alternative: Breathing Circle
export function BreathingLoader() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Breathing circles */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-emerald-200 animate-breathe opacity-40"></div>
          <div className="absolute inset-3 rounded-full bg-emerald-300 animate-breathe opacity-60" style={{animationDelay: "0.5s"}}></div>
          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Mountain className="w-6 h-6 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">CrestBlog</h2>

        <style>{`
          @keyframes breathe {
            0%, 100% {
              transform: scale(1);
              opacity: 0.2;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.6;
            }
          }

          .animate-breathe {
            animation: breathe 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  )
}

// Alternative: Smooth Arc Loader
export function ArcLoader() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Smooth rotating arc */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray="70 200" />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: "#10b981", stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: "#0d9488", stopOpacity: 1}} />
              </linearGradient>
            </defs>
          </svg>

          {/* Center logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Mountain className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">CrestBlog</h2>
      </div>
    </div>
  )
}

// Alternative: Infinity Loop
export function InfinityLoader() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Infinity symbol animation */}
        <div className="relative w-32 h-20 mx-auto mb-8">
          <div className="absolute top-1/2 left-0 w-5 h-5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full animate-infinity-left"></div>
          <div className="absolute top-1/2 right-0 w-5 h-5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full animate-infinity-right"></div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">CrestBlog</h2>

        <style>{`
          @keyframes infinity-left {
            0%, 100% {
              transform: translate(0, -50%);
            }
            25% {
              transform: translate(40px, -70%);
            }
            50% {
              transform: translate(80px, -50%);
            }
            75% {
              transform: translate(40px, -30%);
            }
          }

          @keyframes infinity-right {
            0%, 100% {
              transform: translate(0, -50%);
            }
            25% {
              transform: translate(-40px, -30%);
            }
            50% {
              transform: translate(-80px, -50%);
            }
            75% {
              transform: translate(-40px, -70%);
            }
          }

          .animate-infinity-left {
            animation: infinity-left 2s ease-in-out infinite;
          }

          .animate-infinity-right {
            animation: infinity-right 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  )
}
