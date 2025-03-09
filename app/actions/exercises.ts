"use server"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getExerciseDetails(exerciseId: string, userId: string) {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    })

    if (!exercise) {
      return { error: "Exercise not found" }
    }

    // Get workout logs for this exercise
    const logs = await prisma.workoutLog.findMany({
      where: {
        userId,
        exerciseId,
      },
      orderBy: {
        date: "desc",
      },
    })

    return { exercise, logs }
  } catch (error) {
    console.error("Error fetching exercise details:", error)
    return { error: "Failed to fetch exercise details" }
  }
}

interface LogWorkoutParams {
  userId: string
  exerciseId: string
  setsCompleted: number
  repsCompleted: string
  weightUsed: number
  notes?: string
}

export async function logWorkout(data: LogWorkoutParams) {
  try {
    const log = await prisma.workoutLog.create({
      data: {
        userId: data.userId,
        exerciseId: data.exerciseId,
        date: new Date(),
        setsCompleted: data.setsCompleted,
        repsCompleted: data.repsCompleted,
        weightUsed: data.weightUsed,
        notes: data.notes,
      },
    })

    return { success: true, logId: log.id }
  } catch (error) {
    console.error("Error logging workout:", error)
    return { error: "Failed to log workout" }
  }
}

