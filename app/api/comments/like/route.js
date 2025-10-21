// app/api/comments/like/route.js
import dbConnect from "@/src/lib/mongoose"
import Comment from "@/src/models/comment"

export async function POST(req) {
  try {
    await dbConnect()

    const body = await req.json()
    const {commentId, uid, action} = body

    if (!commentId || !uid || !action) {
      return Response.json({success: false, error: "Missing required fields"}, {status: 400})
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return Response.json({success: false, error: "Comment not found"}, {status: 404})
    }

    if (action === "like") {
      await comment.like(uid)
      return Response.json({
        success: true,
        message: "Comment liked",
        likes: comment.likes,
      })
    } else if (action === "unlike") {
      await comment.unlike(uid)
      return Response.json({
        success: true,
        message: "Comment unliked",
        likes: comment.likes,
      })
    }

    return Response.json({success: false, error: "Invalid action"}, {status: 400})
  } catch (err) {
    console.error("POST /api/comments/like error:", err)
    return Response.json({success: false, error: err.message}, {status: 500})
  }
}
