// app/api/user/sync-verification/route.js
import dbConnect from "@/src/lib/mongoose"
import User from "@/src/models/user"

export async function POST(req) {
  try {
    await dbConnect()

    const body = await req.json()
    const {uid, emailVerified} = body

    if (!uid) {
      return Response.json({success: false, error: "UID is required"}, {status: 400})
    }

    // Update isVerified based on Firebase emailVerified status
    const user = await User.findOneAndUpdate({uid}, {isVerified: emailVerified === true}, {new: true})

    if (!user) {
      return Response.json({success: false, error: "User not found"}, {status: 404})
    }

    return Response.json({
      success: true,
      message: "Verification status synced",
      isVerified: user.isVerified,
    })
  } catch (err) {
    console.error("Sync verification error:", err)
    return Response.json({success: false, error: err.message}, {status: 500})
  }
}
