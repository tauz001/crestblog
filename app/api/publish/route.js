// app/api/publish/route.js
import dbConnect from "@/src/lib/mongoose"
import Post from "@/src/models/post"
import User from "@/src/models/user"

export async function POST(req) {
  try {
    const body = await req.json()
    const {title, category, summary, sections, authorUid} = body || {}

    if (!title || !Array.isArray(sections) || sections.length === 0) {
      return new Response(JSON.stringify({error: "Invalid payload: title and at least one section required"}), {status: 400})
    }

    if (!authorUid) {
      return new Response(JSON.stringify({error: "Author UID is required"}), {status: 400})
    }

    await dbConnect()

    // Fetch full user data from MongoDB
    const user = await User.findOne({uid: authorUid}).lean()

    if (!user) {
      return new Response(JSON.stringify({error: "User not found. Please ensure you're logged in."}), {status: 404})
    }

    // Create embedded author object with essential user data
    const authorData = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      avatar: user.avatar || "",
      bio: user.bio || "",
    }

    console.log("/api/publish received:", {title, category, summary, sectionsLength: sections.length, author: authorData.name})

    // Check for duplicate posts (optional)
    const now = new Date()
    const windowStart = new Date(now.getTime() - 30 * 1000)
    const firstSectionContent = sections.length ? sections[0].content : ""

    const duplicate = await Post.findOne({
      title: title,
      summary: summary || "",
      "sections.0.content": firstSectionContent,
      createdAt: {$gte: windowStart},
    }).lean()

    if (duplicate) {
      console.log("/api/publish duplicate detected, returning existing post id:", duplicate._id)
      return new Response(JSON.stringify({ok: true, duplicate: true, postId: duplicate._id}), {status: 200})
    }

    // Create post with embedded author data
    const post = await Post.create({
      title,
      category: category || "Uncategorized",
      summary: summary || "",
      sections,
      author: authorData, // Embedded author object
      authorUid: user.uid, // Keep UID for filtering
      tableOfContents: sections.map(s => s.subHeading),
    })

    console.log("/api/publish saved post with author:", post.author.name)

    return new Response(
      JSON.stringify({
        ok: true,
        success: true,
        postId: post._id,
        post,
      }),
      {status: 201}
    )
  } catch (err) {
    console.error("/api/publish error:", err)
    return new Response(JSON.stringify({error: "Server error", details: err.message}), {status: 500})
  }
}

export async function GET() {
  try {
    await dbConnect()
    const posts = await Post.find({}).sort({createdAt: -1}).lean()

    return new Response(JSON.stringify({success: true, data: posts}), {status: 200, headers: {"Content-Type": "application/json"}})
  } catch (err) {
    console.error("🔥 /api/publish GET error:", err)
    return new Response(
      JSON.stringify({
        success: false,
        error: "Server Error",
        details: err.message,
      }),
      {status: 500, headers: {"Content-Type": "application/json"}}
    )
  }
}
