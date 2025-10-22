// app/api/publish/[id]/route.js - COMPLETE UPDATE WITH IMAGE SUPPORT
import dbConnect from "@/src/lib/mongoose"
import Post from "@/src/models/post"
import User from "@/src/models/user"

export async function GET(req, {params}) {
  try {
    await dbConnect()
    const {id} = await params
    const post = await Post.findById(id).lean()

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

    // If updating, refresh author data from User collection
    if (body.authorUid) {
      const user = await User.findOne({uid: body.authorUid}).lean()

      if (user) {
        body.author = {
          uid: user.uid,
          name: user.name,
          email: user.email,
          avatar: user.avatar || "",
          bio: user.bio || "",
        }
      }
    }

    // Handle featured image update
    if (body.featuredImage) {
      // If image URL is empty, remove the image
      if (!body.featuredImage.url) {
        body.featuredImage = {url: "", publicId: "", alt: ""}
      }
    }

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

    // Optional: Delete image from Cloudinary if you want
    // if (post.featuredImage?.publicId) {
    //   await cloudinary.uploader.destroy(post.featuredImage.publicId)
    // }

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
