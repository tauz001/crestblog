// app/api/user/followers/route.js - FIXED VERSION
import dbConnect from "@/src/lib/mongoose"
import User from "@/src/models/user"

export async function GET(req) {
  try {
    await dbConnect()

    const {searchParams} = new URL(req.url)
    const uid = searchParams.get("uid")

    if (!uid) {
      return Response.json({success: false, error: "UID is required"}, {status: 400})
    }

    // First find the user by their Firebase UID
    const user = await User.findOne({uid}).lean()

    if (!user) {
      return Response.json({success: false, error: "User not found"}, {status: 404})
    }

    // Now populate the followers array with full user data
    const populatedUser = await User.findById(user._id)
      .populate({
        path: "followers",
        select: "uid name email bio avatar location", // Added location
      })
      .lean()

    console.log("Followers found:", populatedUser.followers?.length || 0)

    return Response.json({
      success: true,
      followers: populatedUser.followers || [],
    })
  } catch (err) {
    console.error("Followers API error:", err)
    return Response.json({success: false, error: err.message}, {status: 500})
  }
}
