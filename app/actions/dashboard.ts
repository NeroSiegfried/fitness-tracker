"use server"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getUserWorkoutPlan(userId: string) {
  try {
    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: { userId },
      include: {
        workoutDays: {
          include: {
            exercises: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { workoutPlan }
  } catch (error) {
    console.error("Error fetching workout plan:", error)
    return { error: "Failed to fetch workout plan" }
  }
}

export async function getUserMealPlan(userId: string) {
  try {
    const mealPlan = await prisma.mealPlan.findFirst({
      where: { userId },
      include: {
        meals: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { mealPlan }
  } catch (error) {
    console.error("Error fetching meal plan:", error)
    return { error: "Failed to fetch meal plan" }
  }
}

