import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface WorkoutPlanData {
  userId: string
  skillLevel: string
  fitnessGoal: string
  workoutDuration: number
  targetMuscleGroups: string[]
  workoutsPerWeek?: number
  splitCount?: number
  splitDetails?: { day: number; muscleGroups: string[] }[]
}

// Database of exercises
const exerciseDatabase = {
  arms: [
    { name: "Bicep Curls", muscleGroups: ["arms"], beginner: true },
    { name: "Tricep Pushdowns", muscleGroups: ["arms"], beginner: true },
    { name: "Hammer Curls", muscleGroups: ["arms"], beginner: true },
    { name: "Skull Crushers", muscleGroups: ["arms"], beginner: false },
    { name: "Preacher Curls", muscleGroups: ["arms"], beginner: false },
    { name: "Dips", muscleGroups: ["arms", "chest"], beginner: false },
  ],
  back: [
    { name: "Lat Pulldowns", muscleGroups: ["back"], beginner: true },
    { name: "Seated Rows", muscleGroups: ["back"], beginner: true },
    { name: "Pull-Ups", muscleGroups: ["back", "arms"], beginner: false },
    { name: "Deadlifts", muscleGroups: ["back", "glutes", "hams"], beginner: false },
    { name: "T-Bar Rows", muscleGroups: ["back"], beginner: false },
    { name: "Bent Over Rows", muscleGroups: ["back"], beginner: true },
  ],
  shoulders: [
    { name: "Shoulder Press", muscleGroups: ["shoulders"], beginner: true },
    { name: "Lateral Raises", muscleGroups: ["shoulders"], beginner: true },
    { name: "Front Raises", muscleGroups: ["shoulders"], beginner: true },
    { name: "Reverse Flyes", muscleGroups: ["shoulders"], beginner: false },
    { name: "Upright Rows", muscleGroups: ["shoulders"], beginner: false },
    { name: "Face Pulls", muscleGroups: ["shoulders"], beginner: false },
  ],
  chest: [
    { name: "Push-Ups", muscleGroups: ["chest", "arms"], beginner: true },
    { name: "Bench Press", muscleGroups: ["chest", "arms"], beginner: true },
    { name: "Chest Flyes", muscleGroups: ["chest"], beginner: true },
    { name: "Incline Bench Press", muscleGroups: ["chest"], beginner: false },
    { name: "Decline Bench Press", muscleGroups: ["chest"], beginner: false },
    { name: "Cable Crossovers", muscleGroups: ["chest"], beginner: false },
  ],
  abs: [
    { name: "Crunches", muscleGroups: ["abs"], beginner: true },
    { name: "Planks", muscleGroups: ["abs"], beginner: true },
    { name: "Leg Raises", muscleGroups: ["abs"], beginner: true },
    { name: "Russian Twists", muscleGroups: ["abs"], beginner: true },
    { name: "Mountain Climbers", muscleGroups: ["abs"], beginner: false },
    { name: "Ab Rollouts", muscleGroups: ["abs"], beginner: false },
  ],
  quads: [
    { name: "Squats", muscleGroups: ["quads", "glutes"], beginner: true },
    { name: "Leg Press", muscleGroups: ["quads", "glutes"], beginner: true },
    { name: "Lunges", muscleGroups: ["quads", "glutes"], beginner: true },
    { name: "Leg Extensions", muscleGroups: ["quads"], beginner: false },
    { name: "Hack Squats", muscleGroups: ["quads"], beginner: false },
    { name: "Bulgarian Split Squats", muscleGroups: ["quads", "glutes"], beginner: false },
  ],
  hams: [
    { name: "Leg Curls", muscleGroups: ["hams"], beginner: true },
    { name: "Romanian Deadlifts", muscleGroups: ["hams", "glutes"], beginner: true },
    { name: "Good Mornings", muscleGroups: ["hams", "back"], beginner: false },
    { name: "Glute-Ham Raises", muscleGroups: ["hams", "glutes"], beginner: false },
    { name: "Nordic Curls", muscleGroups: ["hams"], beginner: false },
  ],
  glutes: [
    { name: "Hip Thrusts", muscleGroups: ["glutes"], beginner: true },
    { name: "Glute Bridges", muscleGroups: ["glutes"], beginner: true },
    { name: "Cable Kickbacks", muscleGroups: ["glutes"], beginner: true },
    { name: "Sumo Deadlifts", muscleGroups: ["glutes", "hams"], beginner: false },
    { name: "Step-Ups", muscleGroups: ["glutes", "quads"], beginner: false },
  ],
  calves: [
    { name: "Standing Calf Raises", muscleGroups: ["calves"], beginner: true },
    { name: "Seated Calf Raises", muscleGroups: ["calves"], beginner: true },
    { name: "Calf Press on Leg Press", muscleGroups: ["calves"], beginner: true },
    { name: "Donkey Calf Raises", muscleGroups: ["calves"], beginner: false },
    { name: "Jump Rope", muscleGroups: ["calves"], beginner: true },
  ],
}

export async function generateWorkoutPlan(data: WorkoutPlanData) {
  try {
    // Delete existing workout plan if it exists
    const existingPlans = await prisma.workoutPlan.findMany({
      where: { userId: data.userId },
      include: { workoutDays: { include: { exercises: true } } },
    })

    for (const plan of existingPlans) {
      await prisma.workoutPlan.delete({
        where: { id: plan.id },
      })
    }

    // Create a new workout plan
    const workoutPlan = await prisma.workoutPlan.create({
      data: {
        userId: data.userId,
        name: `${data.fitnessGoal.replace("_", " ")} Plan`,
        description: `Custom workout plan for ${data.fitnessGoal.replace("_", " ")}`,
      },
    })

    if (data.skillLevel === "beginner") {
      // For beginners, create a full-body workout plan
      await createBeginnerWorkoutPlan(workoutPlan.id, data)
    } else {
      // For intermediate and advanced users, create a split workout plan
      await createSplitWorkoutPlan(workoutPlan.id, data)
    }

    return { success: true, workoutPlanId: workoutPlan.id }
  } catch (error) {
    console.error("Error generating workout plan:", error)
    return { error: "Failed to generate workout plan" }
  }
}

async function createBeginnerWorkoutPlan(workoutPlanId: string, data: WorkoutPlanData) {
  // For beginners, create 3 full-body workouts per week
  const workoutDays = ["Monday", "Wednesday", "Friday"]

  for (let i = 0; i < 3; i++) {
    const workoutDay = await prisma.workoutDay.create({
      data: {
        workoutPlanId,
        name: `Day ${i + 1}: Full Body`,
        dayOfWeek: i === 0 ? 1 : i === 1 ? 3 : 5, // Monday, Wednesday, Friday
        targetMuscleGroups: data.targetMuscleGroups,
      },
    })

    // Select exercises for each target muscle group
    for (const muscleGroup of data.targetMuscleGroups) {
      const exercises = exerciseDatabase[muscleGroup as keyof typeof exerciseDatabase] || []
      const beginnerExercises = exercises.filter((ex) => ex.beginner)

      // Select 1-2 exercises per muscle group
      const selectedExercises = beginnerExercises.slice(0, Math.min(2, beginnerExercises.length))

      for (const exercise of selectedExercises) {
        // Determine sets and reps based on fitness goal
        let sets = 3
        let repsPerSet = "10-12"
        let restTime = 60

        if (data.fitnessGoal === "gain_strength") {
          sets = 4
          repsPerSet = "6-8"
          restTime = 90
        } else if (data.fitnessGoal === "gain_muscle") {
          sets = 3
          repsPerSet = "8-12"
          restTime = 60
        } else if (data.fitnessGoal === "lose_weight") {
          sets = 3
          repsPerSet = "12-15"
          restTime = 45
        }

        await prisma.exercise.create({
          data: {
            workoutDayId: workoutDay.id,
            name: exercise.name,
            sets,
            repsPerSet,
            restTime,
            muscleGroups: exercise.muscleGroups,
            videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + " exercise tutorial")}`,
          },
        })
      }
    }
  }
}

async function createSplitWorkoutPlan(workoutPlanId: string, data: WorkoutPlanData) {
  if (!data.splitDetails || !data.workoutsPerWeek) {
    throw new Error("Split details and workouts per week are required for intermediate/advanced users")
  }

  // Map split days to days of the week
  const daysOfWeek = [1, 2, 3, 4, 5, 6, 0] // Monday to Sunday
  const workoutDaysOfWeek = daysOfWeek.slice(0, data.workoutsPerWeek)

  // Create workout days based on split details
  for (let i = 0; i < data.splitDetails.length; i++) {
    const split = data.splitDetails[i]
    const dayIndex = i % workoutDaysOfWeek.length

    const workoutDay = await prisma.workoutDay.create({
      data: {
        workoutPlanId,
        name: `Day ${i + 1}: ${split.muscleGroups.map((g) => g.charAt(0).toUpperCase() + g.slice(1)).join("/")}`,
        dayOfWeek: workoutDaysOfWeek[dayIndex],
        targetMuscleGroups: split.muscleGroups,
      },
    })

    // Select exercises for each target muscle group in this split
    for (const muscleGroup of split.muscleGroups) {
      const exercises = exerciseDatabase[muscleGroup as keyof typeof exerciseDatabase] || []

      // Select more exercises for intermediate/advanced users
      const selectedExercises = exercises.slice(0, Math.min(3, exercises.length))

      for (const exercise of selectedExercises) {
        // Determine sets and reps based on fitness goal and experience level
        let sets = 3
        let repsPerSet = "10-12"
        let restTime = 60

        if (data.fitnessGoal === "gain_strength") {
          sets = data.skillLevel === "advanced" ? 5 : 4
          repsPerSet = data.skillLevel === "advanced" ? "3-5" : "5-8"
          restTime = data.skillLevel === "advanced" ? 180 : 120
        } else if (data.fitnessGoal === "gain_muscle") {
          sets = data.skillLevel === "advanced" ? 4 : 3
          repsPerSet = data.skillLevel === "advanced" ? "8-10" : "8-12"
          restTime = data.skillLevel === "advanced" ? 90 : 60
        } else if (data.fitnessGoal === "lose_weight") {
          sets = data.skillLevel === "advanced" ? 4 : 3
          repsPerSet = "12-15"
          restTime = 45
        }

        await prisma.exercise.create({
          data: {
            workoutDayId: workoutDay.id,
            name: exercise.name,
            sets,
            repsPerSet,
            restTime,
            muscleGroups: exercise.muscleGroups,
            videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + " exercise tutorial")}`,
          },
        })
      }
    }
  }
}

