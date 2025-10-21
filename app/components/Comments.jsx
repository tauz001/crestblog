// app/components/Comments.jsx
"use client"
import React, {useState, useEffect} from "react"
import {MessageCircle, Heart, Edit2, Trash2, Send, X} from "lucide-react"
import {useAuth} from "@/src/context/authContext"

const Comments = ({postId}) => {
  const {currentUser} = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState(null)
  const [editingComment, setEditingComment] = useState(null)
  const [editContent, setEditContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Fetch comments
  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`)
      const data = await res.json()
      if (data.success) {
        setComments(data.comments)
      }
    } catch (err) {
      console.error("Error fetching comments:", err)
    } finally {
      setLoading(false)
    }
  }

  // Post comment or reply
  const handleSubmit = async e => {
    e.preventDefault()

    if (!currentUser || currentUser.isAnonymous) {
      alert("Please login to comment")
      return
    }

    const content = editingComment ? editContent : newComment
    if (!content.trim()) return

    setSubmitting(true)

    try {
      if (editingComment) {
        // Update comment
        const res = await fetch("/api/comments", {
          method: "PUT",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            commentId: editingComment._id,
            content,
            authorUid: currentUser.uid,
          }),
        })

        const data = await res.json()
        if (data.success) {
          setEditingComment(null)
          setEditContent("")
          fetchComments()
        }
      } else {
        // Create new comment
        const res = await fetch("/api/comments", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            postId,
            content,
            parentId: replyTo?._id,
            authorUid: currentUser.uid,
          }),
        })

        const data = await res.json()
        if (data.success) {
          setNewComment("")
          setReplyTo(null)
          fetchComments()
        }
      }
    } catch (err) {
      console.error("Error posting comment:", err)
      alert("Failed to post comment")
    } finally {
      setSubmitting(false)
    }
  }

  // Delete comment
  const handleDelete = async commentId => {
    if (!confirm("Delete this comment?")) return

    try {
      const res = await fetch(`/api/comments?commentId=${commentId}&authorUid=${currentUser.uid}`, {method: "DELETE"})

      const data = await res.json()
      if (data.success) {
        fetchComments()
      }
    } catch (err) {
      console.error("Error deleting comment:", err)
    }
  }

  // Like comment
  const handleLike = async (commentId, isLiked) => {
    if (!currentUser || currentUser.isAnonymous) {
      alert("Please login to like comments")
      return
    }

    try {
      const res = await fetch("/api/comments/like", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          commentId,
          uid: currentUser.uid,
          action: isLiked ? "unlike" : "like",
        }),
      })

      if (res.ok) {
        fetchComments()
      }
    } catch (err) {
      console.error("Error liking comment:", err)
    }
  }

  const getUserInitials = name => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = date => {
    const now = new Date()
    const commentDate = new Date(date)
    const diff = now - commentDate
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return commentDate.toLocaleDateString()
  }

  const CommentItem = ({comment, isReply = false}) => {
    const isOwner = currentUser?.uid === comment.author.uid
    const isLiked = comment.likedBy?.includes(currentUser?.uid)

    return (
      <div className={`${isReply ? "ml-12 border-l-2 border-gray-200 pl-4" : ""}`}>
        <div className="flex gap-3 py-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-emerald-700">{getUserInitials(comment.author.name)}</span>
          </div>

          {/* Comment Content */}
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-gray-900">{comment.author.name}</span>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                  {comment.isEdited && " (edited)"}
                </span>
              </div>

              {editingComment?._id === comment._id ? (
                <form onSubmit={handleSubmit} className="mt-2">
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none" rows="2" maxLength={1000} />
                  <div className="flex gap-2 mt-2">
                    <button type="submit" disabled={submitting} className="px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingComment(null)
                        setEditContent("")
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-2 text-xs">
              <button onClick={() => handleLike(comment._id, isLiked)} className={`flex items-center gap-1 ${isLiked ? "text-red-600" : "text-gray-600"} hover:text-red-600 transition-colors`}>
                <Heart className={`w-3 h-3 ${isLiked ? "fill-current" : ""}`} />
                <span>{comment.likes || 0}</span>
              </button>

              {!isReply && (
                <button onClick={() => setReplyTo(comment)} className="text-gray-600 hover:text-emerald-600 transition-colors">
                  Reply
                </button>
              )}

              {isOwner && !editingComment && (
                <>
                  <button
                    onClick={() => {
                      setEditingComment(comment)
                      setEditContent(comment.content)
                    }}
                    className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button onClick={() => handleDelete(comment._id)} className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1">
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Replies */}
        {comment.replies?.map(reply => (
          <CommentItem key={reply._id} comment={reply} isReply={true} />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mt-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-emerald-600" />
        <h3 className="text-xl font-bold text-gray-900">Comments ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      {currentUser && !currentUser.isAnonymous ? (
        <form onSubmit={handleSubmit} className="mb-6">
          {replyTo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex items-center justify-between">
              <span className="text-sm text-blue-800">
                Replying to <strong>{replyTo.author.name}</strong>
              </span>
              <button type="button" onClick={() => setReplyTo(null)} className="text-blue-600 hover:text-blue-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-emerald-700">{getUserInitials(currentUser.displayName || currentUser.email)}</span>
            </div>
            <div className="flex-1">
              <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder={replyTo ? "Write a reply..." : "Write a comment..."} className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" rows="3" maxLength={1000} />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{newComment.length}/1000</span>
                <button type="submit" disabled={submitting || !newComment.trim()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="w-4 h-4" />
                  <span>{submitting ? "Posting..." : "Post"}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-600">Please login to comment</p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {comments.map(comment => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Comments
