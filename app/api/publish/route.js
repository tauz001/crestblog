import dbConnect from "@/src/lib/mongoose"
import Post from "@/src/models/post"

export async function POST(req) {
  try {
    const body = await req.json()
    // const {title, category, summary, sections, author} = body || {}
    const {title, category, summary, sections, author, tableOfContents} = body || {}

    if (!title || !Array.isArray(sections) || sections.length === 0) {
      return new Response(JSON.stringify({error: "Invalid payload: title and at least one section required"}), {status: 400})
    }

    await dbConnect()

    // Debug: log incoming payload summary and sections (helps confirm client sent summary)
    console.log("/api/publish received:", {title, category, summary, sectionsLength: Array.isArray(sections) ? sections.length : 0, author})

    // Simple server-side duplicate protection: look for an identical post (title + summary + first section content)
    // created in the last 30 seconds. This helps avoid duplicates when users double-click Publish.
    const now = new Date()
    const windowStart = new Date(now.getTime() - 30 * 1000) // 30 seconds ago
    const firstSectionContent = Array.isArray(sections) && sections.length ? sections[0].content : ""
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

    const post = await Post.create({title, category: category || "Uncategorized", summary: summary || "", sections, author, tableOfContents: sections.map(s => s.subHeading)})

    // Debug: log stored post summary
    console.log("/api/publish saved post summary:", post.summary)

    // Return the created post so client can inspect the saved document (useful during debugging)
    return new Response(JSON.stringify({ok: true, postId: post._id, post}), {status: 201})
  } catch (err) {
    console.error("/api/publish error:", err)
    return new Response(JSON.stringify({error: "Server error"}), {status: 500})
  }
}

export async function GET() {
  try {
    await dbConnect()
    const posts = await Post.find({}).sort({createdAt: -1})
    return new Response(JSON.stringify({success: true, data: posts}), {status: 200, headers: {"Content-Type": "application/json"}})
  } catch (err) {
    console.error("🔥 /api/publish GET error:", err) // <── Add this
    return new Response(
      JSON.stringify({
        success: false,
        error: "Server Error",
        details: err.message, // <── Add this too
      }),
      {status: 500, headers: {"Content-Type": "application/json"}}
    )
  }
}
