import dbConnect from "@/src/lib/mongoose"
import Post from "@/src/models/post"

export async function GET(req, {params}) {
  try {
    await dbConnect()
    const {id} = params
    const post = await Post.findById(id)

    if (!post) {
      return new Response(JSON.stringify({success: false, error: "Post not found"}), {status: 404, headers: {"Content-Type": "application/json"}})
    }

    return new Response(JSON.stringify({success: true, data: post}), {status: 200, headers: {"Content-Type": "application/json"}})
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({success: false, error: "Server Error"}), {status: 500, headers: {"Content-Type": "application/json"}})
  }
}
