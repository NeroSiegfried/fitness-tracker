"use server"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getForumPosts(sortBy = "latest") {
  try {
    let orderBy: any = {}

    switch (sortBy) {
      case "popular":
        orderBy = { upvotes: "desc" }
        break
      case "unanswered":
        // Will filter for posts with no comments below
        orderBy = { createdAt: "desc" }
        break
      case "latest":
      default:
        orderBy = { createdAt: "desc" }
        break
    }

    let posts = await prisma.forumPost.findMany({
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: true,
      },
    })

    if (sortBy === "unanswered") {
      posts = posts.filter((post) => post.comments.length === 0)
    }

    return { posts }
  } catch (error) {
    console.error("Error fetching forum posts:", error)
    return { error: "Failed to fetch forum posts" }
  }
}

export async function getForumPost(postId: string) {
  try {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (!post) {
      return { error: "Post not found" }
    }

    return { post }
  } catch (error) {
    console.error("Error fetching forum post:", error)
    return { error: "Failed to fetch forum post" }
  }
}

interface CreatePostParams {
  userId: string
  title: string
  content: string
}

export async function createForumPost({ userId, title, content }: CreatePostParams) {
  try {
    const post = await prisma.forumPost.create({
      data: {
        userId,
        title,
        content,
      },
    })

    return { success: true, postId: post.id }
  } catch (error) {
    console.error("Error creating forum post:", error)
    return { error: "Failed to create forum post" }
  }
}

interface AddCommentParams {
  postId: string
  userId: string
  content: string
}

export async function addComment({ postId, userId, content }: AddCommentParams) {
  try {
    const comment = await prisma.forumComment.create({
      data: {
        postId,
        userId,
        content,
      },
    })

    // Update user karma
    await prisma.user.update({
      where: { id: userId },
      data: {
        karma: {
          increment: 1,
        },
      },
    })

    return { success: true, commentId: comment.id }
  } catch (error) {
    console.error("Error adding comment:", error)
    return { error: "Failed to add comment" }
  }
}

interface VotePostParams {
  postId: string
  userId: string
  voteType: "up" | "down"
}

export async function voteOnPost({ postId, userId, voteType }: VotePostParams) {
  try {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return { error: "Post not found" }
    }

    // In a real app, you would track user votes in a separate table
    // to prevent multiple votes from the same user

    if (voteType === "up") {
      await prisma.forumPost.update({
        where: { id: postId },
        data: {
          upvotes: {
            increment: 1,
          },
        },
      })

      // Update post author's karma
      await prisma.user.update({
        where: { id: post.userId },
        data: {
          karma: {
            increment: 1,
          },
        },
      })
    } else {
      await prisma.forumPost.update({
        where: { id: postId },
        data: {
          downvotes: {
            increment: 1,
          },
        },
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error voting on post:", error)
    return { error: "Failed to vote on post" }
  }
}

interface VoteCommentParams {
  commentId: string
  userId: string
  voteType: "up" | "down"
}

export async function voteOnComment({ commentId, userId, voteType }: VoteCommentParams) {
  try {
    const comment = await prisma.forumComment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      return { error: "Comment not found" }
    }

    // In a real app, you would track user votes in a separate table
    // to prevent multiple votes from the same user

    if (voteType === "up") {
      await prisma.forumComment.update({
        where: { id: commentId },
        data: {
          upvotes: {
            increment: 1,
          },
        },
      })

      // Update comment author's karma
      await prisma.user.update({
        where: { id: comment.userId },
        data: {
          karma: {
            increment: 1,
          },
        },
      })
    } else {
      await prisma.forumComment.update({
        where: { id: commentId },
        data: {
          downvotes: {
            increment: 1,
          },
        },
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error voting on comment:", error)
    return { error: "Failed to vote on comment" }
  }
}

