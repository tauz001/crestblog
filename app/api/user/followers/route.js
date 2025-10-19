// app/api/user/followers/route.js
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

    const user = await User.findOne({uid}).populate({
      path: "followers",
      select: "uid name email bio avatar",
    })

    if (!user) {
      return Response.json({success: false, error: "User not found"}, {status: 404})
    }

    return Response.json({
      success: true,
      followers: user.followers || [],
    })
  } catch (err) {
    console.error("Followers API error:", err)
    return Response.json({success: false, error: err.message}, {status: 500})
  }
}
