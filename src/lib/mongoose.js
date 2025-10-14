import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  // In development, prefer failing fast so the developer adds .env.local
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

const options = {
  // Keep a modest pool size for serverless/dev environments; tune in production
  maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE || "10", 10),
  serverSelectionTimeoutMS: 5000,
}

let cached = globalThis._mongooseCached || (globalThis._mongooseCached = {conn: null, promise: null})

export default async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, options).then(m => {
      console.log("Mongoose connected")
      return m
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
