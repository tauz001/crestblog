// app/api/user/route.js
import dbConnect from "@/src/lib/mongoose"
import User from "@/src/models/user"

// GET - Fetch all users or specific user by UID
export async function GET(req) {
  try {
    await dbConnect()

    const {searchParams} = new URL(req.url)
    const uid = searchParams.get("uid")

    if (uid) {
      // Fetch specific user by Firebase UID
      const user = await User.findOne({uid}).populate("savedPosts").populate("likedPosts").lean()

      if (!user) {
        return new Response(JSON.stringify({success: false, error: "User not found"}), {
          status: 404,
          headers: {"Content-Type": "application/json"},
        })
      }

      return new Response(JSON.stringify({success: true, data: user}), {
        status: 200,
        headers: {"Content-Type": "application/json"},
      })
    }

    // Fetch all users (paginated)
    const limit = parseInt(searchParams.get("limit")) || 50
    const page = parseInt(searchParams.get("page")) || 1
    const skip = (page - 1) * limit

    const users = await User.find({}).select("-savedPosts -likedPosts").limit(limit).skip(skip).sort({createdAt: -1}).lean()

    const total = await User.countDocuments()

    return new Response(
      JSON.stringify({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }),
      {
        status: 200,
        headers: {"Content-Type": "application/json"},
      }
    )
  } catch (err) {
    console.error("GET /api/user error:", err)
    return new Response(JSON.stringify({success: false, error: "Server Error", details: err.message}), {
      status: 500,
      headers: {"Content-Type": "application/json"},
    })
  }
}

// POST - Create new user (synced with Firebase)
export async function POST(req) {
  try {
    await dbConnect()

    const body = await req.json()
    const {uid, name, email, bio, location, avatar} = body

    // Validate required fields
    if (!uid || !email || !name) {
      return new Response(JSON.stringify({success: false, error: "UID, email, and name are required"}), {
        status: 400,
        headers: {"Content-Type": "application/json"},
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({$or: [{uid}, {email}]})

    if (existingUser) {
      return new Response(JSON.stringify({success: false, error: "User already exists"}), {
        status: 409,
        headers: {"Content-Type": "application/json"},
      })
    }

    // Create new user
    const user = await User.create({
      uid,
      name,
      email,
      bio: bio || "",
      location: location || "",
      avatar: avatar || "",
      lastLoginAt: new Date(),
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: "User created successfully",
        data: user,
      }),
      {
        status: 201,
        headers: {"Content-Type": "application/json"},
      }
    )
  } catch (err) {
    console.error("POST /api/user error:", err)
    return new Response(JSON.stringify({success: false, error: "Server Error", details: err.message}), {
      status: 500,
      headers: {"Content-Type": "application/json"},
    })
  }
}

// PUT - Update user profile
export async function PUT(req) {
  try {
    await dbConnect()

    const body = await req.json()
    const {uid, name, bio, location, avatar, website, socialLinks, preferences} = body

    if (!uid) {
      return new Response(JSON.stringify({success: false, error: "UID is required"}), {
        status: 400,
        headers: {"Content-Type": "application/json"},
      })
    }

    // Build update object
    const updateData = {}
    if (name) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (location !== undefined) updateData.location = location
    if (avatar !== undefined) updateData.avatar = avatar
    if (website !== undefined) updateData.website = website
    if (socialLinks) updateData.socialLinks = socialLinks
    if (preferences) updateData.preferences = preferences

    const user = await User.findOneAndUpdate({uid}, updateData, {
      new: true,
      runValidators: true,
    })

    if (!user) {
      return new Response(JSON.stringify({success: false, error: "User not found"}), {
        status: 404,
        headers: {"Content-Type": "application/json"},
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User updated successfully",
        data: user,
      }),
      {
        status: 200,
        headers: {"Content-Type": "application/json"},
      }
    )
  } catch (err) {
    console.error("PUT /api/user error:", err)
    return new Response(JSON.stringify({success: false, error: "Server Error", details: err.message}), {
      status: 500,
      headers: {"Content-Type": "application/json"},
    })
  }
}

// DELETE - Delete user account
export async function DELETE(req) {
  try {
    await dbConnect()

    const {searchParams} = new URL(req.url)
    const uid = searchParams.get("uid")

    if (!uid) {
      return new Response(JSON.stringify({success: false, error: "UID is required"}), {
        status: 400,
        headers: {"Content-Type": "application/json"},
      })
    }

    const user = await User.findOneAndDelete({uid})

    if (!user) {
      return new Response(JSON.stringify({success: false, error: "User not found"}), {
        status: 404,
        headers: {"Content-Type": "application/json"},
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User deleted successfully",
      }),
      {
        status: 200,
        headers: {"Content-Type": "application/json"},
      }
    )
  } catch (err) {
    console.error("DELETE /api/user error:", err)
    return new Response(JSON.stringify({success: false, error: "Server Error", details: err.message}), {
      status: 500,
      headers: {"Content-Type": "application/json"},
    })
  }
}
