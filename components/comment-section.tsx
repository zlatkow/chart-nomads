"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useUser, SignedIn, SignedOut } from "@clerk/nextjs"
import { MessageSquare, Edit, Trash, X, Loader, Check, ChevronUpIcon, ChevronDownIcon } from "lucide-react"
// Remove this import since we won't be using it directly in this component
// import LoginModal from "./Auth/LoginModal"

// Types for our comment system
type CommentType = "propfirm" | "news" | "blog"

interface CommentSectionProps {
  type: CommentType
  itemId: number | string
  onLoginModalOpen?: () => void
}

interface CommentData {
  id: number
  author: string
  comment: string
  user_name: string
  user_image: string
  created_at: string
  parent_comment_id: number | null
  upvotes_count: number
  downvotes_count: number
  user_vote?: "upvote" | "downvote" | null
  replies?: CommentData[]
}

// Helper function to format relative time
function formatRelativeTime(dateString: string) {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  // Less than a minute
  if (diffInSeconds < 60) {
    return "Just now"
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    const minutes = Math.floor((diffInSeconds % 3600) / 60)
    return `${hours} ${hours === 1 ? "hour" : "hours"}${
      minutes > 0 ? ` and ${minutes} ${minutes === 1 ? "minute" : "minutes"}` : ""
    } ago`
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} ${days === 1 ? "day" : "days"} ago`
  }

  // Less than a month (30 days)
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800)
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
  }

  // More than a month, show the date
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Main component
export default function CommentSection({ type, itemId, onLoginModalOpen }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([])
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()
  // Remove this state declaration since we'll use the parent's state
  // const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({})
  const router = useRouter()

  // Get table names based on comment type
  const getTableNames = () => {
    switch (type) {
      case "propfirm":
        return {
          comments: "propfirm_comments",
          votes: "propfirm_comment_votes",
          itemField: "commented_on",
        }
      case "news":
        return {
          comments: "news_comments",
          votes: "news_comment_votes",
          itemField: "news_id",
        }
      case "blog":
        return {
          comments: "blog_comments",
          votes: "blog_comment_votes",
          itemField: "blog_id",
        }
      default:
        return {
          comments: "propfirm_comments",
          votes: "propfirm_comment_votes",
          itemField: "commented_on",
        }
    }
  }

  const { comments: commentsTable, votes: votesTable, itemField } = getTableNames()

  // Handle comment deletion
  const handleCommentDelete = (commentId: number) => {
    // Update the comments state by filtering out the deleted comment
    setComments(comments.filter((comment) => comment.id !== commentId))
  }

  // Toggle replies visibility
  const toggleReplies = (commentId: number) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }))
  }

  // Fetch comments for this item
  useEffect(() => {
    async function fetchComments() {
      if (!itemId) return

      setIsLoading(true)
      try {
        // Step 1: Fetch parent comments with vote counts
        const { data: parentComments, error: parentError } = await supabase
          .from(commentsTable)
          .select(`
            id, 
            author, 
            comment, 
            user_name, 
            user_image, 
            created_at, 
            parent_comment_id,
            upvotes_count,
            downvotes_count
          `)
          .eq(itemField, itemId)
          .is("parent_comment_id", null)
          .order("created_at", { ascending: false })

        if (parentError) {
          console.error(`Error fetching parent comments from ${commentsTable}:`, parentError)
          return
        }

        // Step 2: Fetch user's votes if logged in
        let userVotes = {}
        if (user) {
          const { data: userVotesData, error: userVotesError } = await supabase
            .from(votesTable)
            .select("comment_id, vote_type")
            .eq("user_id", user.id)

          if (userVotesError) {
            console.error("Error fetching user votes:", userVotesError)
          } else if (userVotesData) {
            // Create a map of comment_id -> vote_type
            userVotes = userVotesData.reduce((acc, vote) => {
              acc[vote.comment_id] = vote.vote_type
              return acc
            }, {})
          }
        }

        // Step 3: Fetch replies for each parent comment
        const commentsWithReplies = await Promise.all(
          (parentComments || []).map(async (comment) => {
            const { data: replies, error: repliesError } = await supabase
              .from(commentsTable)
              .select(`
                id, 
                author, 
                comment, 
                user_name, 
                user_image, 
                created_at, 
                parent_comment_id,
                upvotes_count,
                downvotes_count
              `)
              .eq("parent_comment_id", comment.id)
              .order("created_at", { ascending: true })

            if (repliesError) {
              console.error(`Error fetching replies for comment ${comment.id}:`, repliesError)
              return {
                ...comment,
                replies: [],
                user_vote: userVotes[comment.id] || null,
              }
            }

            // Add user_vote to each reply
            const repliesWithUserVotes = (replies || []).map((reply) => ({
              ...reply,
              user_vote: userVotes[reply.id] || null,
            }))

            return {
              ...comment,
              replies: repliesWithUserVotes,
              user_vote: userVotes[comment.id] || null,
            }
          }),
        )

        setComments(commentsWithReplies || [])
      } catch (error) {
        console.error("Error in fetchComments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [itemId, commentsTable, votesTable, itemField, type, user])

  // Submit a new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!commentText.trim() || !user) return

    setIsSubmitting(true)

    try {
      // Store user's name and profile image URL directly in the comment
      const { data, error } = await supabase
        .from(commentsTable)
        .insert([
          {
            [itemField]: itemId,
            author: user.id,
            comment: commentText.trim(),
            user_name: user.fullName || user.username || "User",
            user_image: user.imageUrl || "/placeholder-user.jpg",
            upvotes_count: 0,
            downvotes_count: 0,
          },
        ])
        .select()

      if (error) {
        console.error("Error posting comment:", error)
        return
      }

      // Clear the comment text
      setCommentText("")

      // Add the new comment to the state
      if (data && data.length > 0) {
        const newComment = {
          ...data[0],
          replies: [],
          user_vote: null,
        }
        setComments([newComment, ...comments])
      }
    } catch (error) {
      console.error("Error in handleSubmitComment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit a reply to a comment
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyText.trim() || !user || !replyingTo) return

    try {
      // Store user's name and profile image URL directly in the comment
      const { data, error } = await supabase
        .from(commentsTable)
        .insert([
          {
            [itemField]: itemId,
            author: user.id,
            comment: replyText.trim(),
            user_name: user.fullName || user.username || "User",
            user_image: user.imageUrl || "/placeholder-user.jpg",
            parent_comment_id: replyingTo,
            upvotes_count: 0,
            downvotes_count: 0,
          },
        ])
        .select()

      if (error) {
        console.error("Error posting reply:", error)
        return
      }

      // Clear the reply text and close the reply form
      setReplyText("")
      setReplyingTo(null)

      // Find the parent comment and add the new reply
      const updatedComments = comments.map((comment) => {
        if (comment.id === replyingTo) {
          // Make sure replies array exists
          const replies = comment.replies || []
          // Add the new reply
          const newReply = {
            ...data[0],
            user_vote: null,
          }
          return {
            ...comment,
            replies: [...replies, newReply],
          }
        }
        return comment
      })

      setComments(updatedComments)

      // Ensure the replies for this comment are expanded
      setExpandedReplies((prev) => ({
        ...prev,
        [replyingTo]: true,
      }))
    } catch (error) {
      console.error("Error in handleSubmitReply:", error)
    }
  }

  // Update the handleVote function to use the parent's onLoginModalOpen
  const handleVote = async (commentId: number, voteType: "upvote" | "downvote") => {
    if (!user) {
      // Open the login modal instead of trying to redirect
      onLoginModalOpen ? onLoginModalOpen() : null
      return
    }

    try {
      // Find the comment in our state
      let targetComment: CommentData | null = null
      let isReply = false
      let parentCommentId: number | null = null

      // Search in main comments
      for (const comment of comments) {
        if (comment.id === commentId) {
          targetComment = comment
          break
        }
        // Search in replies
        if (comment.replies) {
          for (const reply of comment.replies) {
            if (reply.id === commentId) {
              targetComment = reply
              isReply = true
              parentCommentId = comment.id
              break
            }
          }
          if (targetComment) break
        }
      }

      if (!targetComment) {
        console.error(`Comment with ID ${commentId} not found`)
        return
      }

      // Check if the user has already voted on this comment
      const { data: existingVote, error: existingVoteError } = await supabase
        .from(votesTable)
        .select("*")
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .single()

      if (existingVoteError && existingVoteError.code !== "PGRST116") {
        console.error("Error checking existing vote:", existingVoteError)
        return
      }

      // Determine the action based on existing vote and new vote type
      if (existingVote) {
        // If user is clicking the same vote type again, remove the vote
        if (existingVote.vote_type === voteType) {
          // Call a database function to remove the vote and update counts
          const { error: removeError } = await supabase.rpc("remove_comment_vote", {
            p_comment_id: commentId,
            p_user_id: user.id,
            p_vote_table: votesTable,
            p_comment_table: commentsTable,
          })

          if (removeError) {
            console.error("Error removing vote:", removeError)
            return
          }

          // Update the comment in state
          setComments((prevComments) => {
            return prevComments.map((comment) => {
              if (comment.id === commentId) {
                // Update main comment
                return {
                  ...comment,
                  upvotes_count:
                    voteType === "upvote" ? Math.max(0, (comment.upvotes_count || 0) - 1) : comment.upvotes_count,
                  downvotes_count:
                    voteType === "downvote" ? Math.max(0, (comment.downvotes_count || 0) - 1) : comment.downvotes_count,
                  user_vote: null,
                }
              } else if (comment.replies) {
                // Check if the vote is for a reply
                return {
                  ...comment,
                  replies: comment.replies.map((reply) => {
                    if (reply.id === commentId) {
                      return {
                        ...reply,
                        upvotes_count:
                          voteType === "upvote" ? Math.max(0, (reply.upvotes_count || 0) - 1) : reply.upvotes_count,
                        downvotes_count:
                          voteType === "downvote"
                            ? Math.max(0, (reply.downvotes_count || 0) - 1)
                            : reply.downvotes_count,
                        user_vote: null,
                      }
                    }
                    return reply
                  }),
                }
              }
              return comment
            })
          })
        } else {
          // User has already voted, but with a different vote type, update the vote
          // Call a database function to change the vote and update counts
          const { error: changeError } = await supabase.rpc("change_comment_vote", {
            p_comment_id: commentId,
            p_user_id: user.id,
            p_new_vote_type: voteType,
            p_vote_table: votesTable,
            p_comment_table: commentsTable,
          })

          if (changeError) {
            console.error("Error changing vote:", changeError)
            return
          }

          // Update the comment in state
          setComments((prevComments) => {
            return prevComments.map((comment) => {
              if (comment.id === commentId) {
                // Update main comment - switching vote type
                const oldVoteType = existingVote.vote_type
                return {
                  ...comment,
                  upvotes_count:
                    voteType === "upvote"
                      ? (comment.upvotes_count || 0) + 1
                      : oldVoteType === "upvote"
                        ? Math.max(0, (comment.upvotes_count || 0) - 1)
                        : comment.upvotes_count,
                  downvotes_count:
                    voteType === "downvote"
                      ? (comment.downvotes_count || 0) + 1
                      : oldVoteType === "downvote"
                        ? Math.max(0, (comment.downvotes_count || 0) - 1)
                        : comment.downvotes_count,
                  user_vote: voteType,
                }
              } else if (comment.replies) {
                // Check if the vote is for a reply
                return {
                  ...comment,
                  replies: comment.replies.map((reply) => {
                    if (reply.id === commentId) {
                      const oldVoteType = existingVote.vote_type
                      return {
                        ...reply,
                        upvotes_count:
                          voteType === "upvote"
                            ? (reply.upvotes_count || 0) + 1
                            : oldVoteType === "upvote"
                              ? Math.max(0, (reply.upvotes_count || 0) - 1)
                              : reply.upvotes_count,
                        downvotes_count:
                          voteType === "downvote"
                            ? (reply.downvotes_count || 0) + 1
                            : oldVoteType === "downvote"
                              ? Math.max(0, (reply.downvotes_count || 0) - 1)
                              : reply.downvotes_count,
                        user_vote: voteType,
                      }
                    }
                    return reply
                  }),
                }
              }
              return comment
            })
          })
        }
      } else {
        // User has not voted, create a new vote
        // Call a database function to add the vote and update counts
        const { error: addError } = await supabase.rpc("add_comment_vote", {
          p_comment_id: commentId,
          p_user_id: user.id,
          p_vote_type: voteType,
          p_vote_table: votesTable,
          p_comment_table: commentsTable,
        })

        if (addError) {
          console.error("Error adding vote:", addError)
          return
        }

        // Update the comment in state
        setComments((prevComments) => {
          return prevComments.map((comment) => {
            if (comment.id === commentId) {
              // Update main comment - new vote
              return {
                ...comment,
                upvotes_count: voteType === "upvote" ? (comment.upvotes_count || 0) + 1 : comment.upvotes_count,
                downvotes_count: voteType === "downvote" ? (comment.downvotes_count || 0) + 1 : comment.downvotes_count,
                user_vote: voteType,
              }
            } else if (comment.replies) {
              // Check if the vote is for a reply
              return {
                ...comment,
                replies: comment.replies.map((reply) => {
                  if (reply.id === commentId) {
                    return {
                      ...reply,
                      upvotes_count: voteType === "upvote" ? (reply.upvotes_count || 0) + 1 : reply.upvotes_count,
                      downvotes_count:
                        voteType === "downvote" ? (reply.downvotes_count || 0) + 1 : reply.downvotes_count,
                      user_vote: voteType,
                    }
                  }
                  return reply
                }),
              }
            }
            return comment
          })
        })
      }
    } catch (error) {
      console.error("Error in handleVote:", error)
    }
  }

  // Count total comments including replies
  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0)
  }, 0)

  return (
    <div className="space-y-6">
      <h3 className="text-xl text-[#edb900]">
        {totalComments} {totalComments === 1 ? "comment" : "comments"}
      </h3>

      {/* Comment form for logged-in users */}
      <SignedIn>
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <img
                src={user?.imageUrl || "/placeholder-user.jpg"}
                alt="Your profile"
                className="w-10 h-10 rounded-full"
              />
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Create a new comment."
                className="w-full min-h-[100px] p-3 bg-[#0f0f0f] border border-[rgba(237,185,0,0.3)] rounded-lg text-white focus:outline-none focus:border-[#edb900]"
                required
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="px-6 py-2 bg-[#edb900] text-[#0f0f0f] font-medium rounded-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </SignedIn>

      {/* Login/signup prompt for non-authenticated users */}
      <SignedOut>
        <div className="border border-[rgba(237,185,0,0.3)] rounded-lg p-6 mb-8">
          <h3 className="text-2xl font-bold text-[#edb900] text-center mb-2">Want to join the discussion?</h3>
          <p className="text-center text-white mb-6">Login or sign-up to leave a comment.</p>
          <div className="flex justify-center gap-4">
            {/* Update the login button in the SignedOut section */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log("Heart clicked by unauthenticated user")
                onLoginModalOpen ? onLoginModalOpen() : null
                console.log("Login modal opened")
              }}
              className="px-8 py-3 bg-[#edb900] text-[#0f0f0f] font-medium rounded-md hover:brightness-110"
            >
              Login
            </button>
            <button
              onClick={() => {
                // Always redirect to sign-up page
                router.push("/sign-up")
              }}
              className="px-8 py-3 bg-[#edb900] text-[#0f0f0f] font-medium rounded-md hover:brightness-110"
            >
              Sign-up
            </button>
          </div>
        </div>
      </SignedOut>

      {/* Reply form */}
      <SignedIn>
        {replyingTo && (
          <div className="mb-6 ml-12 border-l-2 border-[rgba(237,185,0,0.3)] pl-4">
            <form onSubmit={handleSubmitReply}>
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <img
                    src={user?.imageUrl || "/placeholder-user.jpg"}
                    alt="Your profile"
                    className="w-8 h-8 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Replying to comment</span>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="text-gray-400 hover:text-[#edb900]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full min-h-[80px] p-3 bg-[#0f0f0f] border border-[rgba(237,185,0,0.3)] rounded-lg text-white focus:outline-none focus:border-[#edb900]"
                    required
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-4 py-1.5 bg-[#edb900] text-[#0f0f0f] text-sm font-medium rounded-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Post Reply
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </SignedIn>

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#edb900]"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            /* Update the CommentItem props to pass onLoginModalOpen instead of setIsLoginOpen */
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={handleCommentDelete}
              onReply={() => setReplyingTo(comment.id)}
              onVote={handleVote}
              isReplyOpen={replyingTo === comment.id}
              replies={comment.replies || []}
              showReplies={expandedReplies[comment.id]}
              toggleReplies={() => toggleReplies(comment.id)}
              commentsTable={commentsTable}
              votesTable={votesTable}
              onLoginModalOpen={onLoginModalOpen}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#edb900] text-[#0f0f0f] rounded-lg p-6 text-center">Be the first to leave a comment.</div>
      )}

      {/* Remove the LoginModal component at the bottom of the CommentSection */}
      {/* <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} /> */}
    </div>
  )
}

// Update the CommentItemProps interface
interface CommentItemProps {
  comment: CommentData
  onDelete: (commentId: number) => void
  onReply: () => void
  onVote: (commentId: number, voteType: "upvote" | "downvote") => void
  isReplyOpen: boolean
  replies: CommentData[]
  showReplies: boolean
  toggleReplies: () => void
  commentsTable: string
  votesTable: string
  onLoginModalOpen?: () => void
}

// Update the CommentItem component to use onLoginModalOpen
function CommentItem({
  comment,
  onDelete,
  onReply,
  onVote,
  isReplyOpen,
  replies = [],
  showReplies,
  toggleReplies,
  commentsTable,
  votesTable,
  onLoginModalOpen,
}: CommentItemProps) {
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [editedComment, setEditedComment] = useState(comment.comment)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = user && user.id === comment.author
  const formattedTime = formatRelativeTime(comment.created_at)
  const score = (comment.upvotes_count || 0) - (comment.downvotes_count || 0)
  const userVote = comment.user_vote
  const hasReplies = replies.length > 0

  const handleSaveEdit = async () => {
    if (!editedComment.trim()) return

    try {
      const { error } = await supabase
        .from(commentsTable)
        .update({ comment: editedComment.trim() })
        .eq("id", comment.id)

      if (error) {
        console.error("Error updating comment:", error)
        return
      }

      // Update the comment locally
      comment.comment = editedComment.trim()
      setIsEditing(false)
    } catch (error) {
      console.error("Error in handleSaveEdit:", error)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      // First, delete all votes associated with this comment
      const { error: votesError } = await supabase.from(votesTable).delete().eq("comment_id", comment.id)

      if (votesError) {
        console.error("Error deleting comment votes:", votesError)
        return
      }

      // Then delete the comment itself
      const { error } = await supabase.from(commentsTable).delete().eq("id", comment.id)

      if (error) {
        console.error("Error deleting comment:", error)
        return
      }

      // Call the onDelete callback to update the parent component's state
      onDelete(comment.id)
    } catch (error) {
      console.error("Error in handleDelete:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="border-b border-[rgba(237,185,0,0.1)] pb-6">
      <div className="flex gap-3">
        {/* Vote buttons */}
        <div className="flex flex-col items-center">
          <SignedIn>
            <button
              onClick={() => onVote(comment.id, "upvote")}
              className={`p-1 rounded-full transition-colors ${
                userVote === "upvote"
                  ? "text-[#edb900] bg-[rgba(237,185,0,0.1)]"
                  : "text-gray-400 hover:text-[#edb900] hover:bg-[rgba(237,185,0,0.05)]"
              }`}
            >
              <ChevronUpIcon className="h-4 w-4" />
            </button>
          </SignedIn>
          {/* Update the SignedOut button to use onLoginModalOpen */}
          <SignedOut>
            <button
              onClick={() => onLoginModalOpen && onLoginModalOpen()}
              className="p-1 rounded-full transition-colors text-gray-400 hover:text-[#edb900] hover:bg-[rgba(237,185,0,0.05)]"
            >
              <ChevronUpIcon className="h-4 w-4" />
            </button>
          </SignedOut>

          <span
            className={`text-xs font-medium ${
              score > 0 ? "text-[#edb900]" : score < 0 ? "text-red-500" : "text-gray-400"
            }`}
          >
            {score}
          </span>

          <SignedIn>
            <button
              onClick={() => onVote(comment.id, "downvote")}
              className={`p-1 rounded-full transition-colors ${
                userVote === "downvote"
                  ? "text-red-500 bg-[rgba(239,68,68,0.1)]"
                  : "text-gray-400 hover:text-red-500 hover:bg-[rgba(239,68,68,0.05)]"
              }`}
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </SignedIn>
          {/* Update the other SignedOut button */}
          <SignedOut>
            <button
              onClick={() => onLoginModalOpen && onLoginModalOpen()}
              className="p-1 rounded-full transition-colors text-gray-400 hover:text-red-500 hover:bg-[rgba(239,68,68,0.05)]"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </SignedOut>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src={
                  comment.user_image || (user && user.id === comment.author ? user.imageUrl : "/placeholder-user.jpg")
                }
                alt={comment.user_name || "User"}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-medium text-white">
                  {comment.user_name ||
                    (user && user.id === comment.author ? user.fullName || user.username : "Anonymous User")}
                </div>
                <div className="text-xs text-gray-400">{formattedTime}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <SignedIn>
                {isAuthor && !isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-400 hover:text-[#edb900] transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {isDeleting ? <Loader className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                    </button>
                  </>
                )}
                {isEditing && (
                  <>
                    <button onClick={handleSaveEdit} className="text-gray-400 hover:text-green-500 transition-colors">
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditedComment(comment.comment)
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
              </SignedIn>
            </div>
          </div>

          <div className="pl-[52px]">
            {isEditing ? (
              <textarea
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                className="w-full min-h-[100px] p-3 bg-[#0f0f0f] border border-[rgba(237,185,0,0.3)] rounded-lg text-white focus:outline-none focus:border-[#edb900]"
              />
            ) : (
              <p className="text-white whitespace-pre-wrap">{comment.comment}</p>
            )}

            {/* Comment actions */}
            {!isEditing && (
              <div className="mt-3 flex items-center gap-4">
                <SignedIn>
                  <button
                    onClick={onReply}
                    className={`text-xs flex items-center gap-1 ${
                      isReplyOpen ? "text-[#edb900]" : "text-gray-400 hover:text-[#edb900]"
                    } transition-colors`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Reply
                  </button>
                </SignedIn>

                {hasReplies && (
                  <button
                    onClick={toggleReplies}
                    className="text-xs flex items-center gap-1 text-gray-400 hover:text-[#edb900]"
                  >
                    {showReplies ? (
                      <>
                        <ChevronUpIcon className="h-3.5 w-3.5" />
                        Hide replies ({replies.length})
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="h-3.5 w-3.5" />
                        Show replies ({replies.length})
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Replies */}
            {hasReplies && showReplies && (
              <div className="mt-4 space-y-4 border-l-2 border-[rgba(237,185,0,0.15)] pl-4">
                {replies.map((reply) => (
                  <ReplyItem
                    key={reply.id}
                    reply={reply}
                    onVote={onVote}
                    commentsTable={commentsTable}
                    votesTable={votesTable}
                    onLoginModalOpen={onLoginModalOpen}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Update the ReplyItem props and component similarly
interface ReplyItemProps {
  reply: CommentData
  onVote: (commentId: number, voteType: "upvote" | "downvote") => void
  commentsTable: string
  votesTable: string
  onLoginModalOpen?: () => void
}

function ReplyItem({ reply, onVote, commentsTable, votesTable, onLoginModalOpen }: ReplyItemProps) {
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [editedReply, setEditedReply] = useState(reply.comment)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = user && user.id === reply.author
  const formattedTime = formatRelativeTime(reply.created_at)
  const score = (reply.upvotes_count || 0) - (reply.downvotes_count || 0)
  const userVote = reply.user_vote

  const handleSaveEdit = async () => {
    if (!editedReply.trim()) return

    try {
      const { error } = await supabase.from(commentsTable).update({ comment: editedReply.trim() }).eq("id", reply.id)

      if (error) {
        console.error("Error updating reply:", error)
        return
      }

      // Update the reply locally
      reply.comment = editedReply.trim()
      setIsEditing(false)
    } catch (error) {
      console.error("Error in handleSaveEdit:", error)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      // First, delete all votes associated with this reply
      const { error: votesError } = await supabase.from(votesTable).delete().eq("comment_id", reply.id)

      if (votesError) {
        console.error("Error deleting reply votes:", votesError)
        return
      }

      // Then delete the reply itself
      const { error } = await supabase.from(commentsTable).delete().eq("id", reply.id)

      if (error) {
        console.error("Error deleting reply:", error)
        return
      }

      // Remove the reply from the DOM
      const replyElement = document.getElementById(`reply-${reply.id}`)
      if (replyElement) {
        replyElement.remove()
      }
    } catch (error) {
      console.error("Error in handleDelete:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div id={`reply-${reply.id}`} className="flex gap-2">
      {/* Vote buttons */}
      <div className="flex flex-col items-center">
        <SignedIn>
          <button
            onClick={() => onVote(reply.id, "upvote")}
            className={`p-1 rounded-full transition-colors ${
              userVote === "upvote"
                ? "text-[#edb900] bg-[rgba(237,185,0,0.1)]"
                : "text-gray-400 hover:text-[#edb900] hover:bg-[rgba(237,185,0,0.05)]"
            }`}
          >
            <ChevronUpIcon className="h-3 w-3" />
          </button>
        </SignedIn>
        {/* Update the SignedOut buttons */}
        <SignedOut>
          <button
            onClick={() => onLoginModalOpen && onLoginModalOpen()}
            className="p-1 rounded-full transition-colors text-gray-400 hover:text-[#edb900] hover:bg-[rgba(237,185,0,0.05)]"
          >
            <ChevronUpIcon className="h-3 w-3" />
          </button>
        </SignedOut>

        <span
          className={`text-xs font-medium ${
            score > 0 ? "text-[#edb900]" : score < 0 ? "text-red-500" : "text-gray-400"
          }`}
        >
          {score}
        </span>

        <SignedIn>
          <button
            onClick={() => onVote(reply.id, "downvote")}
            className={`p-1 rounded-full transition-colors ${
              userVote === "downvote"
                ? "text-red-500 bg-[rgba(239,68,68,0.1)]"
                : "text-gray-400 hover:text-red-500 hover:bg-[rgba(239,68,68,0.05)]"
            }`}
          >
            <ChevronDownIcon className="h-3 w-3" />
          </button>
        </SignedIn>
        <SignedOut>
          <button
            onClick={() => onLoginModalOpen && onLoginModalOpen()}
            className="p-1 rounded-full transition-colors text-gray-400 hover:text-red-500 hover:bg-[rgba(239,68,68,0.05)]"
          >
            <ChevronDownIcon className="h-3 w-3" />
          </button>
        </SignedOut>
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <img
              src={reply.user_image || (user && user.id === reply.author ? user.imageUrl : "/placeholder-user.jpg")}
              alt={reply.user_name || "User"}
              className="w-6 h-6 rounded-full"
            />
            <div>
              <div className="font-medium text-white text-sm">
                {reply.user_name ||
                  (user && user.id === reply.author ? user.fullName || user.username : "Anonymous User")}
              </div>
              <div className="text-xs text-gray-400">{formattedTime}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <SignedIn>
              {isAuthor && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-[#edb900] transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {isDeleting ? <Loader className="h-3 w-3 animate-spin" /> : <Trash className="h-3 w-3" />}
                  </button>
                </>
              )}
              {isEditing && (
                <>
                  <button onClick={handleSaveEdit} className="text-gray-400 hover:text-green-500 transition-colors">
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedReply(reply.comment)
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              )}
            </SignedIn>
          </div>
        </div>
        {isEditing ? (
          <textarea
            value={editedReply}
            onChange={(e) => setEditedReply(e.target.value)}
            className="w-full min-h-[80px] p-3 bg-[#0f0f0f] border border-[rgba(237,185,0,0.3)] rounded-lg text-white text-sm focus:outline-none focus:border-[#edb900]"
          />
        ) : (
          <p className="text-white text-sm whitespace-pre-wrap mt-2">{reply.comment}</p>
        )}
      </div>
    </div>
  )
}

