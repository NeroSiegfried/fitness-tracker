"use server"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        fitnessProfile: true,
      },
    })

    if (!user) {
      return { error: "User not found" }
    }

    // Get forum posts
    const forumPosts = await prisma.forumPost.findMany({
      where: { userId },
      include: {
        comments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    })

    // Get forum comments
    const forumComments = await prisma.forumComment.findMany({
      where: { userId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    })

    // Get workout logs
    const workoutLogs = await prisma.workoutLog.findMany({
      where: { userId },
      include: {
        exercise: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 10,
    })

    // Calculate stats
    const totalWorkouts = await prisma.workoutLog.count({
      where: { userId },
    })

    const totalPosts = await prisma.forumPost.count({
      where: { userId },
    })

    const totalComments = await prisma.forumComment.count({
      where: { userId },
    })

    // Generate recent activity
    const recentActivity = [
      ...forumPosts.map((post) => ({
        id: `post-${post.id}`,
        type: "Forum Post",
        title: post.title,
        description: post.content,
        date: post.createdAt,
        link: `/forum/${post.id}`,
      })),
      ...forumComments.map((comment) => ({
        id: `comment-${comment.id}`,
        type: "Forum Comment",
        title: `Comment on "${comment.post.title}"`,
        description: comment.content,
        date: comment.createdAt,
        link: `/forum/${comment.postId}`,
      })),
      ...workoutLogs.map((log) => ({
        id: `workout-${log.id}`,
        type: "Workout",
        title: `Completed ${log.exercise.name}`,
        description: `${log.setsCompleted} sets × ${log.repsCompleted} reps @ ${log.weightUsed} kg`,
        date: log.date,
        link: `/exercises/${log.exerciseId}`,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)

    return {
      profile: {
        user,
        forumPosts,
        workoutLogs,
        recentActivity,
        stats: {
          totalWorkouts,
          totalPosts,
          totalComments,
        },
      },
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return { error: "Failed to fetch user profile" }
  }
}

