// src/utils/helpers.js

// Format date from MongoDB
export const formatDateFromMongo = (value, format = "long") => {
  if (!value) return ""

  const d = typeof value === "string" ? new Date(value) : value instanceof Date ? value : new Date(value)

  if (Number.isNaN(d.getTime())) return ""

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  const day = d.getDate()
  const month = d.getMonth()
  const year = d.getFullYear()

  switch (format) {
    case "short":
      return `${months[month]} ${day}, ${year}`
    case "long":
      return `${monthsFull[month]} ${day}, ${year}`
    case "numeric":
      return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`
    case "relative":
      return getRelativeTime(d)
    default:
      return `${months[month]} ${day}, ${year}`
  }
}

// Get relative time (e.g., "2 days ago")
export const getRelativeTime = date => {
  const now = new Date()
  const diff = now - new Date(date)

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return "just now"
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`
  return `${years} year${years > 1 ? "s" : ""} ago`
}

// Get user initials
export const getUserInitials = name => {
  if (!name) return "U"
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Calculate reading time
export const calculateReadTime = (text, wordsPerMinute = 200) => {
  if (!text) return "5 min read"

  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)

  return `${minutes} min read`
}

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

// Validate email
export const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate URL
export const isValidURL = url => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Extract author info from post
export const extractAuthorInfo = post => {
  if (typeof post.author === "object" && post.author) {
    return {
      uid: post.author.uid || post.authorUid || "",
      name: post.author.name || "Anonymous",
      email: post.author.email || "",
      avatar: post.author.avatar || "",
      bio: post.author.bio || "",
      location: post.author.location || "",
    }
  }

  return {
    uid: post.authorUid || (typeof post.author === "string" ? post.author : ""),
    name: "Anonymous",
    email: "",
    avatar: "",
    bio: "Content creator",
    location: "",
  }
}

// Generate unique slug from title
export const generateSlug = title => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Format number with commas
export const formatNumber = num => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Copy to clipboard
export const copyToClipboard = async text => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// Share content
export const shareContent = async (title, text, url) => {
  if (navigator.share) {
    try {
      await navigator.share({title, text, url})
      return true
    } catch (err) {
      if (err.name === "AbortError") return false
      return await copyToClipboard(url)
    }
  } else {
    return await copyToClipboard(url)
  }
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Check if user owns post
export const isPostOwner = (post, currentUser) => {
  if (!currentUser || !post) return false

  const postAuthorUid = post.authorUid || (typeof post.author === "object" ? post.author.uid : post.author)

  return postAuthorUid === currentUser.uid
}

// Get category color
export const getCategoryColor = category => {
  const colors = {
    Technology: "bg-blue-100 text-blue-700",
    Lifestyle: "bg-pink-100 text-pink-700",
    Health: "bg-green-100 text-green-700",
    Travel: "bg-purple-100 text-purple-700",
    Design: "bg-indigo-100 text-indigo-700",
    Business: "bg-yellow-100 text-yellow-700",
  }

  return colors[category] || "bg-emerald-100 text-emerald-700"
}

// Sanitize input
export const sanitizeInput = input => {
  if (!input) return ""
  return input.trim().replace(/[<>]/g, "")
}

// Check password strength
export const checkPasswordStrength = password => {
  const length = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const score = [length, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length

  if (score <= 2) return {strength: "weak", color: "red"}
  if (score <= 3) return {strength: "medium", color: "yellow"}
  if (score <= 4) return {strength: "strong", color: "green"}
  return {strength: "very strong", color: "emerald"}
}
