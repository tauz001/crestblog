export const mockPosts = [
  {
    _id: "post-1",
    title: "Test Blog Post",
    category: "Technology",
    summary: "A test blog post",
    author: {
      uid: "user-1",
      name: "John Doe",
      email: "john@example.com",
    },
    sections: [
      {
        subHeading: "Introduction",
        content: "This is the introduction.",
      },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    likes: 10,
    views: 100,
  },
]
