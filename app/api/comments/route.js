// app/api/comments/route.js
import dbConnect from "@/src/lib/mongoose"
import Comment from "@/src/models/comment"
import User from "@/src/models/user"

// GET - Fetch comments for a post
export async function GET(req) {
  try {
    await dbConnect()

    const {searchParams} = new URL(req.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return Response.json({success: false, error: "Post ID is required"}, {status: 400})
    }

    // Fetch all comments (both parent and replies)
    const comments = await Comment.find({
      postId,
      isDeleted: false,
    })
      .sort({createdAt: -1})
      .lean()

    // Organize into threads (parent comments with their replies)
    const parentComments = comments.filter(c => !c.parentId)
    const replies = comments.filter(c => c.parentId)

    // Add replies to their parent comments
    const threaded = parentComments.map(parent => ({
      ...parent,
      replies: replies.filter(r => r.parentId.toString() === parent._id.toString()).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    }))

    return Response.json({
      success: true,
      comments: threaded,
      total: comments.length,
    })
  } catch (err) {
    console.error("GET /api/comments error:", err)
    return Response.json({success: false, error: err.message}, {status: 500})
  }
}

// POST - Create a new comment or reply
export async function POST(req) {
  try {
    await dbConnect()

    const body = await req.json()
    const {postId, content, parentId, authorUid} = body

    // Validation
    if (!postId || !content || !authorUid) {
      return Response.json({success: false, error: "Missing required fields"}, {status: 400})
    }

    if (content.trim().length === 0) {
      return Response.json({success: false, error: "Comment cannot be empty"}, {status: 400})
    }

    if (content.length > 1000) {
      return Response.json({success: false, error: "Comment too long (max 1000 characters)"}, {status: 400})
    }

    // Get user info
    const user = await User.findOne({uid: authorUid}).lean()
    if (!user) {
      return Response.json({success: false, error: "User not found"}, {status: 404})
    }

    // Create comment
    const comment = await Comment.create({
      postId,
      content: content.trim(),
      parentId: parentId || null,
      author: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      },
    })

    return Response.json(
      {
        success: true,
        comment,
        message: parentId ? "Reply posted successfully" : "Comment posted successfully",
      },
      {status: 201}
    )
  } catch (err) {
    console.error("POST /api/comments error:", err)
    return Response.json({success: false, error: err.message}, {status: 500})
  }
}

// PUT - Update a comment
export async function PUT(req) {
  try {
    await dbConnect()

    const body = await req.json()
    const {commentId, content, authorUid} = body

    if (!commentId || !content || !authorUid) {
      return Response.json({success: false, error: "Missing required fields"}, {status: 400})
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return Response.json({success: false, error: "Comment not found"}, {status: 404})
    }

    // Check ownership
    if (comment.author.uid !== authorUid) {
      return Response.json({success: false, error: "Unauthorized"}, {status: 403})
    }

    comment.content = content.trim()
    comment.isEdited = true
    await comment.save()

    return Response.json({
      success: true,
      comment,
      message: "Comment updated successfully",
    })
  } catch (err) {
    console.error("PUT /api/comments error:", err)
    return Response.json({success: false, error: err.message}, {status: 500})
  }
}

// DELETE - Delete a comment
export async function DELETE(req) {
  try {
    await dbConnect()

    const {searchParams} = new URL(req.url)
    const commentId = searchParams.get("commentId")
    const authorUid = searchParams.get("authorUid")

    if (!commentId || !authorUid) {
      return Response.json({success: false, error: "Missing required parameters"}, {status: 400})
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return Response.json({success: false, error: "Comment not found"}, {status: 404})
    }

    // Check ownership
    if (comment.author.uid !== authorUid) {
      return Response.json({success: false, error: "Unauthorized"}, {status: 403})
    }

    // Soft delete
    comment.isDeleted = true
    comment.content = "[deleted]"
    await comment.save()

    return Response.json({
      success: true,
      message: "Comment deleted successfully",
    })
  } catch (err) {
    console.error("DELETE /api/comments error:", err)
    return Response.json({success: false, error: err.message}, {status: 500})
  }
}
