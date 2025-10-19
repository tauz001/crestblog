// app/api/user/following/route.js - FIXED VERSION
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

    // Now populate the following array with full user data
    const populatedUser = await User.findById(user._id)
      .populate({
        path: "following",
        select: "uid name email bio avatar location", // Added location
      })
      .lean()

    console.log("Following found:", populatedUser.following?.length || 0)

    return Response.json({
      success: true,
      following: populatedUser.following || [],
    })
  } catch (err) {
    console.error("Following API error:", err)
    return Response.json({success: false, error: err.message}, {status: 500})
  }
}
