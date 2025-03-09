"use server"

import { PrismaClient } from "@prisma/client"
import { generateWorkoutPlan } from "@/app/lib/workout-generator"
import { generateMealPlan } from "@/app/lib/meal-generator"

const prisma = new PrismaClient()

interface FitnessProfileData {
  userId: string
  skillLevel: string
  fitnessGoal: string
  workoutDuration: number
  targetMuscleGroups: string[]
  height?: number
  weight?: number
  age?: number
  gender?: string
  dietaryRestrictions: string[]
  workoutsPerWeek?: number
  splitCount?: number
  splitDetails?: { day: number; muscleGroups: string[] }[]
}

export async function saveFitnessProfile(data: FitnessProfileData) {
  try {
    // Check if profile already exists
    const existingProfile = await prisma.fitnessProfile.findUnique({
      where: { userId: data.userId },
    })

    if (existingProfile) {
      // Update existing profile
      await prisma.fitnessProfile.update({
        where: { userId: data.userId },
        data: {
          skillLevel: data.skillLevel,
          fitnessGoal: data.fitnessGoal,
          workoutDuration: data.workoutDuration,
          targetMuscleGroups: data.targetMuscleGroups,
          height: data.height,
          weight: data.weight,
          age: data.age,
          gender: data.gender,
          dietaryRestrictions: data.dietaryRestrictions,
          workoutsPerWeek: data.workoutsPerWeek,
          splitCount: data.splitCount,
        },
      })
    } else {
      // Create new profile
      await prisma.fitnessProfile.create({
        data: {
          userId: data.userId,
          skillLevel: data.skillLevel,
          fitnessGoal: data.fitnessGoal,
          workoutDuration: data.workoutDuration,
          targetMuscleGroups: data.targetMuscleGroups,
          height: data.height,
          weight: data.weight,
          age: data.age,
          gender: data.gender,
          dietaryRestrictions: data.dietaryRestrictions,
          workoutsPerWeek: data.workoutsPerWeek,
          splitCount: data.splitCount,
        },
      })
    }

    // Generate workout plan based on user profile
    await generateWorkoutPlan(data)

    // Generate meal plan based on user profile
    if (data.height && data.weight && data.age && data.gender) {
      await generateMealPlan(data)
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving fitness profile:", error)
    return { error: "Failed to save fitness profile" }
  }
}

