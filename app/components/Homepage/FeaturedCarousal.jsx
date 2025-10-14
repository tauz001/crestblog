import {ChevronLeft, ChevronRight, TrendingUp} from "lucide-react"
import {useEffect, useState} from "react"

const FeaturedCarousal = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const featuredPosts = [
    {
      id: 1,
      title: "Mastering Modern Web Development in 2025",
      excerpt: "Explore the latest trends and technologies shaping the future of web development.",
      author: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=600&fit=crop",
      category: "Technology",
    },
    {
      id: 2,
      title: "The Ultimate Guide to Healthy Living",
      excerpt: "Transform your lifestyle with these proven health and wellness strategies.",
      author: "Mike Chen",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=600&fit=crop",
      category: "Health",
    },
    {
      id: 3,
      title: "Design Thinking: A Creative Approach",
      excerpt: "Learn how design thinking can revolutionize your problem-solving process.",
      author: "Emma Wilson",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=600&fit=crop",
      category: "Design",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % featuredPosts.length)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + featuredPosts.length) % featuredPosts.length)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredPosts.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])
  return (
    <>
      <div className="relative mb-8">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-6 h-6 text-emerald-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Featured Stories</h2>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative h-96">
            {featuredPosts.map((post, index) => (
              <div key={post.id} className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}>
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <span className="inline-block px-3 py-1 bg-emerald-600 rounded-full text-sm font-medium mb-3">{post.category}</span>
                  <h3 className="text-3xl font-bold mb-2">{post.title}</h3>
                  <p className="text-gray-200 mb-3 text-lg">{post.excerpt}</p>
                  <p className="text-sm">By {post.author}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm hover:bg-white/50 text-white p-2 rounded-full transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm hover:bg-white/50 text-white p-2 rounded-full transition-all">
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {featuredPosts.map((_, index) => (
              <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "bg-white w-8" : "bg-white/50"}`} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default FeaturedCarousal
