// src/models/user.js
import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    // Firebase UID - same as Firebase Auth
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Basic Info
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Profile Info
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    // Social Links
    socialLinks: {
      twitter: {type: String, default: ""},
      linkedin: {type: String, default: ""},
      github: {type: String, default: ""},
    },

    // User Interactions
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    // User Stats
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Account Status
    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Preferences
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "light",
      },
    },

    // Last Activity
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
)

// Indexes for better query performance
userSchema.index({email: 1})
userSchema.index({uid: 1})
userSchema.index({createdAt: -1})

// Virtual for follower count
userSchema.virtual("followerCount").get(function () {
  return this.followers.length
})

// Virtual for following count
userSchema.virtual("followingCount").get(function () {
  return this.following.length
})

// Virtual for post count (needs separate query)
userSchema.virtual("postCount", {
  ref: "Post",
  localField: "uid",
  foreignField: "author",
  count: true,
})

// Ensure virtuals are included in JSON
userSchema.set("toJSON", {virtuals: true})
userSchema.set("toObject", {virtuals: true})

// Methods
userSchema.methods.savePost = function (postId) {
  if (!this.savedPosts.includes(postId)) {
    this.savedPosts.push(postId)
    return this.save()
  }
  return this
}

userSchema.methods.unsavePost = function (postId) {
  this.savedPosts = this.savedPosts.filter(id => id.toString() !== postId.toString())
  return this.save()
}

userSchema.methods.likePost = function (postId) {
  if (!this.likedPosts.includes(postId)) {
    this.likedPosts.push(postId)
    return this.save()
  }
  return this
}

userSchema.methods.unlikePost = function (postId) {
  this.likedPosts = this.likedPosts.filter(id => id.toString() !== postId.toString())
  return this.save()
}

userSchema.methods.followUser = function (userId) {
  if (!this.following.includes(userId)) {
    this.following.push(userId)
    return this.save()
  }
  return this
}

userSchema.methods.unfollowUser = function (userId) {
  this.following = this.following.filter(id => id.toString() !== userId.toString())
  return this.save()
}

// Check if model already exists to prevent recompilation
const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User
