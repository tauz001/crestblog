// app/api/upload/image/route.js
import {v2 as cloudinary} from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!file) {
      return Response.json({success: false, error: "No file provided"}, {status: 400})
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return Response.json({success: false, error: "File size exceeds 2MB limit"}, {status: 400})
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataURI = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "crestblog",
      resource_type: "auto",
      transformation: [{width: 1200, height: 600, crop: "limit"}, {quality: "auto"}, {fetch_format: "auto"}],
    })

    return Response.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (err) {
    console.error("Cloudinary upload error:", err)
    return Response.json({success: false, error: err.message}, {status: 500})
  }
}

// Validate URL endpoint
export async function PUT(req) {
  try {
    const {url} = await req.json()

    if (!url) {
      return Response.json({success: false, error: "No URL provided"}, {status: 400})
    }

    // Check if URL is valid image
    const response = await fetch(url, {method: "HEAD"})
    const contentType = response.headers.get("content-type")

    if (!contentType || !contentType.startsWith("image/")) {
      return Response.json({success: false, error: "URL is not a valid image"}, {status: 400})
    }

    return Response.json({
      success: true,
      url: url,
    })
  } catch (err) {
    console.error("URL validation error:", err)
    return Response.json({success: false, error: "Invalid image URL"}, {status: 400})
  }
}
