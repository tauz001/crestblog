// scripts/migrate-posts.js
// Run this script ONCE to migrate existing posts to the new author structure
// Usage: node scripts/migrate-posts.js

import dotenv from "dotenv"
dotenv.config({path: ".env.local"})

import mongoose from "mongoose"
import User from "../src/models/user.js"
import Post from "../src/models/post.js"

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error("❌ MONGODB_URI not set in .env.local")
  process.exit(1)
}

async function migratePosts() {
  try {
    console.log("🔄 Connecting to MongoDB...")
    await mongoose.connect(uri)
    console.log("✅ Connected to MongoDB")

    // Find all posts where author is a string (old structure)
    const postsToMigrate = await Post.find({
      $or: [
        {author: {$type: "string"}}, // Old structure: author is string
        {authorUid: {$exists: false}}, // Missing authorUid field
      ],
    })

    console.log(`📊 Found ${postsToMigrate.length} posts to migrate`)

    if (postsToMigrate.length === 0) {
      console.log("✅ No posts need migration. All posts are up to date!")
      await mongoose.disconnect()
      process.exit(0)
    }

    let successCount = 0
    let errorCount = 0

    for (const post of postsToMigrate) {
      try {
        // Get the author UID (might be in author or authorUid field)
        const authorUid = typeof post.author === "string" ? post.author : post.authorUid

        if (!authorUid) {
          console.log(`⚠️  Skipping post ${post._id}: No author UID found`)
          errorCount++
          continue
        }

        // Fetch user data from User collection
        const user = await User.findOne({uid: authorUid})

        if (!user) {
          console.log(`⚠️  Skipping post ${post._id}: User not found for UID ${authorUid}`)
          errorCount++
          continue
        }

        // Update post with embedded author data
        await Post.findByIdAndUpdate(post._id, {
          author: {
            uid: user.uid,
            name: user.name,
            email: user.email,
            avatar: user.avatar || "",
            bio: user.bio || "",
          },
          authorUid: user.uid,
        })

        successCount++
        console.log(`✅ Migrated post: "${post.title}" by ${user.name}`)
      } catch (err) {
        console.error(`❌ Error migrating post ${post._id}:`, err.message)
        errorCount++
      }
    }

    console.log("\n📊 Migration Summary:")
    console.log(`✅ Successfully migrated: ${successCount} posts`)
    console.log(`❌ Failed: ${errorCount} posts`)
    console.log("\n✅ Migration complete!")

    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error("❌ Migration error:", err)
    await mongoose.disconnect()
    process.exit(1)
  }
}

migratePosts()
