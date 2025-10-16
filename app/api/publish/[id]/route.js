import dbConnect from "@/src/lib/mongoose"
import Post from "@/src/models/post"

export async function GET(req, {params}) {
  try {
    await dbConnect()
    const {id} = await params
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

export async function PUT(req, {params}) {
  try {
    await dbConnect()
    const {id} = params
    const body = await req.json()

    const updatedPost = await Post.findByIdAndUpdate(id, body, {new: true})

    if (!updatedPost) {
      return Response.json({success: false, error: "Post not found"}, {status: 404})
    }

    return Response.json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    })
  } catch (error) {
    console.error("PUT error:", error)
    return Response.json({success: false, error: error.message}, {status: 500})
  }
}

export async function DELETE(req, {params}) {
  const {id} = await params 

  try {
    await dbConnect()

    const post = await Post.findById(id)

    if (!post) {
      return new Response(JSON.stringify({success: false, error: "Post not found"}), {
        status: 404,
        headers: {"Content-Type": "application/json"},
      })
    }

    await Post.findByIdAndDelete(id)

    return new Response(JSON.stringify({success: true, message: "Post deleted successfully"}), {
      status: 200,
      headers: {"Content-Type": "application/json"},
    })
  } catch (err) {
    console.error("Delete error:", err)
    return new Response(JSON.stringify({success: false, error: err.message}), {
      status: 500,
      headers: {"Content-Type": "application/json"},
    })
  }
}
