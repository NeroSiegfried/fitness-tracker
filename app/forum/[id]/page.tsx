"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { getForumPost, addComment, voteOnPost, voteOnComment } from "@/app/actions/forum"
import { formatDistanceToNow } from "date-fns"

export default function ForumPostPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [post, setPost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string)
    }
  }, [params.id])

  const fetchPost = async (postId: string) => {
    setIsLoading(true)
    try {
      const data = await getForumPost(postId)
      setPost(data.post)
    } catch (error) {
      console.error("Error fetching forum post:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id || !comment.trim()) return

    setIsSubmitting(true)
    try {
      await addComment({
        postId: post.id,
        userId: session.user.id,
        content: comment,
      })

      setComment("")
      fetchPost(post.id)
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVotePost = async (vote: "up" | "down") => {
    if (!session?.user?.id) {
      router.push("/login")
      return
    }

    try {
      await voteOnPost({
        postId: post.id,
        userId: session.user.id,
        voteType: vote,
      })

      fetchPost(post.id)
    } catch (error) {
      console.error("Error voting on post:", error)
    }
  }

  const handleVoteComment = async (commentId: string, vote: "up" | "down") => {
    if (!session?.user?.id) {
      router.push("/login")
      return
    }

    try {
      await voteOnComment({
        commentId,
        userId: session.user.id,
        voteType: vote,
      })

      fetchPost(post.id)
    } catch (error) {
      console.error("Error voting on comment:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Post not found</h2>
              <p className="text-muted-foreground mb-6">
                The post you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push("/forum")}>Back to Forum</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/forum")}>
          Back to Forum
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{post.title}</CardTitle>
              <CardDescription>
                Posted by {post.user.name} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </CardDescription>
            </div>
            <div className="flex flex-col items-center">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleVotePost("up")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m19 14-7-7-7 7" />
                </svg>
                <span className="sr-only">Upvote</span>
              </Button>
              <span className="font-bold">{post.upvotes - post.downvotes}</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleVotePost("down")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m5 10 7 7 7-7" />
                </svg>
                <span className="sr-only">Downvote</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none dark:prose-invert">
            <p className="whitespace-pre-line">{post.content}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          {post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments"}
        </h2>

        {status === "authenticated" && (
          <Card>
            <CardHeader>
              <CardTitle>Add a Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCommentSubmit}>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-4"
                  rows={4}
                  required
                />
                <Button type="submit" disabled={isSubmitting || !comment.trim()}>
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {post.comments.length > 0 ? (
          <div className="space-y-4">
            {post.comments.map((comment: any) => (
              <Card key={comment.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            comment.user.image ||
                            `/placeholder.svg?height=32&width=32&text=${comment.user.name.charAt(0)}`
                          }
                        />
                        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{comment.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleVoteComment(comment.id, "up")}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <path d="m19 14-7-7-7 7" />
                        </svg>
                        <span className="sr-only">Upvote</span>
                      </Button>
                      <span className="text-sm">{comment.upvotes - comment.downvotes}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleVoteComment(comment.id, "down")}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <path d="m5 10 7 7 7-7" />
                        </svg>
                        <span className="sr-only">Downvote</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{comment.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No comments yet. Be the first to share your thoughts!</p>
                {status !== "authenticated" && <Button onClick={() => router.push("/login")}>Login to Comment</Button>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

