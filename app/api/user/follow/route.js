// app/api/user/follow/route.js
import dbConnect from "@/src/lib/mongoose"
import User from "@/src/models/user"

export async function POST(req) {
  try {
    await dbConnect()

    const body = await req.json()
    const {currentUserUid, targetUserUid, action} = body

    if (!currentUserUid || !targetUserUid || !action) {
      return Response.json({success: false, error: "Missing required fields"}, {status: 400})
    }

    if (currentUserUid === targetUserUid) {
      return Response.json({success: false, error: "Cannot follow yourself"}, {status: 400})
    }

    const currentUser = await User.findOne({uid: currentUserUid})
    const targetUser = await User.findOne({uid: targetUserUid})

    if (!currentUser || !targetUser) {
      return Response.json({success: false, error: "User not found"}, {status: 404})
    }

    if (action === "follow") {
      // Add target to current user's following
      if (!currentUser.following.includes(targetUser._id)) {
        currentUser.following.push(targetUser._id)
        await currentUser.save()
      }

      // Add current user to target's followers
      if (!targetUser.followers.includes(currentUser._id)) {
        targetUser.followers.push(currentUser._id)
        await targetUser.save()
      }

      return Response.json({
        success: true,
        message: "Successfully followed user",
        isFollowing: true,
      })
    } else if (action === "unfollow") {
      // Remove target from current user's following
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUser._id.toString())
      await currentUser.save()

      // Remove current user from target's followers
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUser._id.toString())
      await targetUser.save()

      return Response.json({
        success: true,
        message: "Successfully unfollowed user",
        isFollowing: false,
      })
    }

    return Response.json({success: false, error: "Invalid action"}, {status: 400})
  } catch (err) {
    console.error("Follow API error:", err)
    return Response.json({success: false, error: err.message}, {status: 500})
  }
}
