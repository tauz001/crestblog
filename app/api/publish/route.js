import dbConnect from "@/src/lib/mongoose"
import Post from "@/src/models/post"

export async function POST(req) {
  try {
    const body = await req.json()
    const { title, category, summary, sections, author, tableOfContents } = body || {}

    if (!title || !Array.isArray(sections) || sections.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid payload: title and at least one section required" }),
        { status: 400 }
      )
    }

    await dbConnect()

    console.log("/api/publish received:", {
      title,
      category,
      summary,
      sectionsLength: Array.isArray(sections) ? sections.length : 0,
      author,
      tableOfContents,
    })

    // Prevent accidental double-publish (same post within 30s)
    const now = new Date()
    const windowStart = new Date(now.getTime() - 30 * 1000) // 30 seconds ago
    const firstSectionContent =
      Array.isArray(sections) && sections.length ? sections[0].content : ""
    const duplicate = await Post.findOne({
      title,
      summary: summary || "",
      "sections.0.content": firstSectionContent,
      createdAt: { $gte: windowStart },
    }).lean()

    if (duplicate) {
      console.log(
        "/api/publish duplicate detected, returning existing post id:",
        duplicate._id
      )
      return new Response(
        JSON.stringify({ ok: true, duplicate: true, postId: duplicate._id }),
        { status: 200 }
      )
    }

    // ✅ Fix: use provided tableOfContents if exists, else auto-generate
    // const toc =
    //   Array.isArray(tableOfContents) && tableOfContents.length > 0
    //     ? tableOfContents
    //     : sections.map((s) => s.subHeading)

    const post = await Post.create({
      title,
      category: category || "Uncategorized",
      summary: summary || "",
      sections,
      author,
      tableOfContents,
    })

    console.log("/api/publish saved post summary:", post.summary)

    return new Response(
      JSON.stringify({ ok: true, postId: post._id, post }),
      { status: 201 }
    )
  } catch (err) {
    console.error("/api/publish error:", err)
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await dbConnect()
    const posts = await Post.find({}).sort({ createdAt: -1 }) // latest first
    return new Response(
      JSON.stringify({ success: true, data: posts }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("/api/publish GET error:", err)
    return new Response(
      JSON.stringify({ success: false, error: "Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
