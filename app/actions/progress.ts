"use server"

import { PrismaClient } from "@prisma/client"
import { subDays, format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"

const prisma = new PrismaClient()

export async function getUserProgress(userId: string, days = 30) {
  try {
    const endDate = new Date()
    const startDate = subDays(endDate, days)

    // Get workout logs
    const workoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        exercise: true,
      },
      orderBy: {
        date: "asc",
      },
    })

    // Calculate workout volume over time
    const workoutVolume = calculateWorkoutVolume(workoutLogs)

    // Calculate workout frequency by week
    const workoutFrequency = calculateWorkoutFrequency(workoutLogs)

    // Calculate workout streaks
    const { currentStreak, longestStreak } = calculateWorkoutStreaks(workoutLogs)

    // Calculate muscle group distribution
    const muscleGroupDistribution = calculateMuscleGroupDistribution(workoutLogs)

    // Mock weight data (in a real app, this would come from a weight tracking table)
    const weightData = generateMockWeightData(startDate, endDate, 70, 68)

    // Mock calorie data
    const calorieData = generateMockCalorieData(startDate, endDate, 2000, 2500)

    // Mock macro data
    const macroData = [
      { name: "Protein", value: 150 },
      { name: "Carbs", value: 200 },
      { name: "Fat", value: 70 },
    ]

    return {
      workoutVolume,
      workoutFrequency,
      currentStreak,
      longestStreak,
      muscleGroupDistribution,
      weightData,
      calorieData,
      macroData,
    }
  } catch (error) {
    console.error("Error fetching user progress:", error)
    return { error: "Failed to fetch progress data" }
  }
}

function calculateWorkoutVolume(logs: any[]) {
  const volumeByDate: Record<string, number> = {}

  logs.forEach((log) => {
    const date = format(new Date(log.date), "yyyy-MM-dd")
    const reps = log.repsCompleted.split(",").map((r: string) => Number.parseInt(r.trim()))
    const avgReps = reps.reduce((sum: number, r: number) => sum + r, 0) / reps.length
    const volume = log.setsCompleted * log.weightUsed * avgReps

    if (volumeByDate[date]) {
      volumeByDate[date] += volume
    } else {
      volumeByDate[date] = volume
    }
  })

  return Object.entries(volumeByDate).map(([date, volume]) => ({
    date,
    volume: Math.round(volume),
  }))
}

function calculateWorkoutFrequency(logs: any[]) {
  const workoutsByWeek: Record<string, number> = {}

  logs.forEach((log) => {
    const date = new Date(log.date)
    const weekStart = format(startOfWeek(date), "yyyy-MM-dd")
    const weekEnd = format(endOfWeek(date), "yyyy-MM-dd")
    const weekKey = `${weekStart} to ${weekEnd}`

    if (workoutsByWeek[weekKey]) {
      workoutsByWeek[weekKey]++
    } else {
      workoutsByWeek[weekKey] = 1
    }
  })

  return Object.entries(workoutsByWeek).map(([week, count]) => ({
    week,
    count,
  }))
}

function calculateWorkoutStreaks(logs: any[]) {
  if (logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Get unique workout dates
  const workoutDates = [...new Set(logs.map((log) => format(new Date(log.date), "yyyy-MM-dd")))].sort()

  let currentStreak = 0
  let longestStreak = 0
  let streakCount = 0

  // Check if the most recent workout was today or yesterday
  const today = format(new Date(), "yyyy-MM-dd")
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd")

  if (workoutDates[workoutDates.length - 1] === today || workoutDates[workoutDates.length - 1] === yesterday) {
    // Calculate current streak
    let lastDate = new Date()

    for (let i = workoutDates.length - 1; i >= 0; i--) {
      const currentDate = new Date(workoutDates[i])
      const expectedDate = format(lastDate, "yyyy-MM-dd")
      const actualDate = format(currentDate, "yyyy-MM-dd")

      // If this workout was on the expected date or the day before
      if (actualDate === expectedDate || actualDate === format(subDays(lastDate, 1), "yyyy-MM-dd")) {
        streakCount++
        lastDate = currentDate
      } else {
        break
      }
    }

    currentStreak = streakCount
  }

  // Calculate longest streak
  streakCount = 1

  for (let i = 1; i < workoutDates.length; i++) {
    const prevDate = new Date(workoutDates[i - 1])
    const currDate = new Date(workoutDates[i])
    const dayDiff = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

    if (dayDiff <= 1) {
      streakCount++
    } else {
      longestStreak = Math.max(longestStreak, streakCount)
      streakCount = 1
    }
  }

  longestStreak = Math.max(longestStreak, streakCount)

  return { currentStreak, longestStreak }
}

function calculateMuscleGroupDistribution(logs: any[]) {
  const muscleGroupCounts: Record<string, number> = {}

  logs.forEach((log) => {
    log.exercise.muscleGroups.forEach((group: string) => {
      if (muscleGroupCounts[group]) {
        muscleGroupCounts[group]++
      } else {
        muscleGroupCounts[group] = 1
      }
    })
  })

  return Object.entries(muscleGroupCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))
}

function generateMockWeightData(startDate: Date, endDate: Date, startWeight: number, endWeight: number) {
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const weightDiff = endWeight - startWeight
  const weightPerDay = weightDiff / days.length

  return days.map((day, index) => {
    // Add some random variation
    const randomVariation = (Math.random() - 0.5) * 0.6
    const weight = startWeight + weightPerDay * index + randomVariation

    return {
      date: format(day, "yyyy-MM-dd"),
      weight: Number.parseFloat(weight.toFixed(1)),
    }
  })
}

function generateMockCalorieData(startDate: Date, endDate: Date, minCalories: number, maxCalories: number) {
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  return days.map((day) => {
    // Random calories within range
    const randomVariation = Math.random()
    const calories = Math.round(minCalories + (maxCalories - minCalories) * randomVariation)

    return {
      date: format(day, "yyyy-MM-dd"),
      calories,
    }
  })
}

