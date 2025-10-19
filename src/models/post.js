// src/models/post.js
import mongoose from "mongoose"

const sectionSchema = new mongoose.Schema(
  {
    subHeading: {type: String, required: true},
    content: {type: String, required: true},
  },
  {_id: false}
)

// Embedded author schema
const authorSchema = new mongoose.Schema(
  {
    uid: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true},
    avatar: {type: String, default: ""},
    bio: {type: String, default: ""},
  },
  {_id: false}
)

const postSchema = new mongoose.Schema(
  {
    title: {type: String, required: true, trim: true},
    category: {type: String, required: true, trim: true},
    summary: {type: String, trim: true, maxlength: 300},
    sections: {type: [sectionSchema], required: true},

    // Embedded author information (for fast reads)
    author: {
      type: authorSchema,
      required: true,
    },

    // Keep author UID for filtering/indexing
    authorUid: {
      type: String,
      required: true,
      index: true,
    },

    tableOfContents: [String],
    published: {type: Boolean, default: true},

    // Engagement metrics
    likes: {type: Number, default: 0},
    views: {type: Number, default: 0},

    // Read time (auto-calculated or provided)
    readTime: {type: String, default: "5 min read"},

    // Featured post
    featured: {type: Boolean, default: false},

    // Tags for better categorization
    tags: [{type: String, trim: true}],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
)

// Indexes for better query performance
postSchema.index({authorUid: 1, createdAt: -1})
postSchema.index({category: 1, createdAt: -1})
postSchema.index({published: 1, createdAt: -1})
postSchema.index({featured: 1, createdAt: -1})
postSchema.index({likes: -1})
postSchema.index({views: -1})

// Method to increment views
postSchema.methods.incrementViews = function () {
  this.views += 1
  return this.save()
}

// Static method to get trending posts
postSchema.statics.getTrending = function (limit = 10) {
  return this.find({published: true}).sort({likes: -1, views: -1}).limit(limit).lean()
}

// Static method to get posts by category
postSchema.statics.getByCategory = function (category, limit = 20) {
  return this.find({category, published: true}).sort({createdAt: -1}).limit(limit).lean()
}

// Ensure virtuals are included in JSON
postSchema.set("toJSON", {virtuals: true})
postSchema.set("toObject", {virtuals: true})

const Post = mongoose.models.Post || mongoose.model("Post", postSchema)

export default Post
