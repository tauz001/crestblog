// app/api/user/interactions/route.js
import dbConnect from "@/src/lib/mongoose"
import User from "@/src/models/user"
import Post from "@/src/models/post"

// POST - Handle user interactions (save, like, follow)
export async function POST(req) {
  try {
    await dbConnect()

    const body = await req.json()
    const {uid, action, targetId, targetType} = body

    // Validate required fields
    if (!uid || !action || !targetId) {
      return new Response(JSON.stringify({success: false, error: "Missing required fields"}), {
        status: 400,
        headers: {"Content-Type": "application/json"},
      })
    }

    const user = await User.findOne({uid})

    if (!user) {
      return new Response(JSON.stringify({success: false, error: "User not found"}), {
        status: 404,
        headers: {"Content-Type": "application/json"},
      })
    }

    let result

    switch (action) {
      case "save":
        // Save a post
        result = await user.savePost(targetId)
        return new Response(
          JSON.stringify({
            success: true,
            message: "Post saved successfully",
            data: result,
          }),
          {status: 200, headers: {"Content-Type": "application/json"}}
        )

      case "unsave":
        // Unsave a post
        result = await user.unsavePost(targetId)
        return new Response(
          JSON.stringify({
            success: true,
            message: "Post unsaved successfully",
            data: result,
          }),
          {status: 200, headers: {"Content-Type": "application/json"}}
        )

      case "like":
        // Like a post
        result = await user.likePost(targetId)
        // Optionally increment post like count
        await Post.findByIdAndUpdate(targetId, {$inc: {likes: 1}})
        return new Response(
          JSON.stringify({
            success: true,
            message: "Post liked successfully",
            data: result,
          }),
          {status: 200, headers: {"Content-Type": "application/json"}}
        )

      case "unlike":
        // Unlike a post
        result = await user.unlikePost(targetId)
        // Optionally decrement post like count
        await Post.findByIdAndUpdate(targetId, {$inc: {likes: -1}})
        return new Response(
          JSON.stringify({
            success: true,
            message: "Post unliked successfully",
            data: result,
          }),
          {status: 200, headers: {"Content-Type": "application/json"}}
        )

      case "follow":
        // Follow a user
        result = await user.followUser(targetId)
        // Add to target user's followers
        await User.findByIdAndUpdate(targetId, {$addToSet: {followers: user._id}})
        return new Response(
          JSON.stringify({
            success: true,
            message: "User followed successfully",
            data: result,
          }),
          {status: 200, headers: {"Content-Type": "application/json"}}
        )

      case "unfollow":
        // Unfollow a user
        result = await user.unfollowUser(targetId)
        // Remove from target user's followers
        await User.findByIdAndUpdate(targetId, {$pull: {followers: user._id}})
        return new Response(
          JSON.stringify({
            success: true,
            message: "User unfollowed successfully",
            data: result,
          }),
          {status: 200, headers: {"Content-Type": "application/json"}}
        )

      default:
        return new Response(JSON.stringify({success: false, error: "Invalid action"}), {
          status: 400,
          headers: {"Content-Type": "application/json"},
        })
    }
  } catch (err) {
    console.error("POST /api/user/interactions error:", err)
    return new Response(JSON.stringify({success: false, error: "Server Error", details: err.message}), {
      status: 500,
      headers: {"Content-Type": "application/json"},
    })
  }
}

// GET - Get user interactions (saved/liked posts)
export async function GET(req) {
  try {
    await dbConnect()

    const {searchParams} = new URL(req.url)
    const uid = searchParams.get("uid")
    const type = searchParams.get("type") // 'saved' or 'liked'

    if (!uid) {
      return new Response(JSON.stringify({success: false, error: "UID is required"}), {
        status: 400,
        headers: {"Content-Type": "application/json"},
      })
    }

    const user = await User.findOne({uid})

    if (!user) {
      return new Response(JSON.stringify({success: false, error: "User not found"}), {
        status: 404,
        headers: {"Content-Type": "application/json"},
      })
    }

    let data

    if (type === "saved") {
      // Get saved posts with full details
      const populatedUser = await User.findOne({uid}).populate({
        path: "savedPosts",
        select: "title summary category createdAt author",
        options: {sort: {createdAt: -1}},
      })
      data = populatedUser.savedPosts
    } else if (type === "liked") {
      // Get liked posts with full details
      const populatedUser = await User.findOne({uid}).populate({
        path: "likedPosts",
        select: "title summary category createdAt author",
        options: {sort: {createdAt: -1}},
      })
      data = populatedUser.likedPosts
    } else {
      // Return both
      const populatedUser = await User.findOne({uid})
        .populate({
          path: "savedPosts",
          select: "title summary category createdAt author",
        })
        .populate({
          path: "likedPosts",
          select: "title summary category createdAt author",
        })

      data = {
        savedPosts: populatedUser.savedPosts,
        likedPosts: populatedUser.likedPosts,
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        status: 200,
        headers: {"Content-Type": "application/json"},
      }
    )
  } catch (err) {
    console.error("GET /api/user/interactions error:", err)
    return new Response(JSON.stringify({success: false, error: "Server Error", details: err.message}), {
      status: 500,
      headers: {"Content-Type": "application/json"},
    })
  }
}
