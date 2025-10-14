import dbConnect from "@/src/lib/mongoose"
import User from "@/src/models/user"

export async function GET() {
  try {
    await dbConnect()
    const users = await User.find({}).limit(50).lean()
    return new Response(JSON.stringify({success: true, data: users}), {status: 200, headers: {"Content-Type": "application/json"}})
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({success: false, error: "Server Error"}), {status: 500, headers: {"Content-Type": "application/json"}})
  }
}
