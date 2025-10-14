import dotenv from "dotenv"
dotenv.config({path: ".env.local"})

import mongoose from "mongoose"

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error("MONGODB_URI not set in .env.local")
  process.exit(1)
}

async function run() {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(uri, {maxPoolSize: 5})
    console.log("Connected. Collections:")
    const cols = await mongoose.connection.db.listCollections().toArray()
    console.log(cols.map(c => c.name))
    const docs = await mongoose.connection.db.collection("users").find({}).limit(5).toArray()
    console.log("Sample docs:", JSON.stringify(docs, null, 2))
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error("Connection error:", err.message)
    process.exit(1)
  }
}

run()
