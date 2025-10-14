import mongoose from "mongoose"

const sectionSchema = new mongoose.Schema(
  {
    subHeading: {type: String, required: true},
    content: {type: String, required: true},
  },
  {_id: false}
)

const postSchema = new mongoose.Schema(
  {
    title: {type: String, required: true, trim: true},
    category: {type: String, required: true, trim: true},
    // short one-line summary provided by the author
    summary: {type: String, trim: true, maxlength: 300},
    sections: {type: [sectionSchema], required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    tableOfContents: [String],
    published: {type: Boolean, default: true},
  },
  {timestamps: true}
)

// If the Post model was already compiled earlier (hot-reload), it may not
// include recently added schema paths like `summary`. Detect that and
// delete the cached model so we compile the schema fresh.
if (mongoose.models && mongoose.models.Post) {
  const existing = mongoose.models.Post
  // If the existing compiled model doesn't have `summary`, remove it.
  if (!existing.schema.path("summary")) {
    delete mongoose.models.Post
  }
}

const Post = mongoose.models.Post || mongoose.model("Post", postSchema)

export default Post
