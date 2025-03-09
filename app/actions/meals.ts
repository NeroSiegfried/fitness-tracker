"use server"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getMealDetails(mealId: string) {
  try {
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
    })

    if (!meal) {
      return { error: "Meal not found" }
    }

    return { meal }
  } catch (error) {
    console.error("Error fetching meal details:", error)
    return { error: "Failed to fetch meal details" }
  }
}

