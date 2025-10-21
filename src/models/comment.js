// src/models/comment.js
import mongoose from "mongoose"

const commentSchema = new mongoose.Schema(
  {
    // Post reference
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    // Author info (embedded for fast reads)
    author: {
      uid: {type: String, required: true},
      name: {type: String, required: true},
      email: {type: String, required: true},
      avatar: {type: String, default: ""},
    },

    // Comment content
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // Thread support (for replies)
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },

    // Engagement
    likes: {
      type: Number,
      default: 0,
    },

    likedBy: [
      {
        type: String, // Store UIDs of users who liked
      },
    ],

    // Status
    isEdited: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
commentSchema.index({postId: 1, createdAt: -1})
commentSchema.index({postId: 1, parentId: 1})

// Methods
commentSchema.methods.like = function (uid) {
  if (!this.likedBy.includes(uid)) {
    this.likedBy.push(uid)
    this.likes += 1
    return this.save()
  }
  return this
}

commentSchema.methods.unlike = function (uid) {
  const index = this.likedBy.indexOf(uid)
  if (index > -1) {
    this.likedBy.splice(index, 1)
    this.likes -= 1
    return this.save()
  }
  return this
}

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema)

export default Comment
