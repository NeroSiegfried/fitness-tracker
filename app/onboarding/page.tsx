"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { saveFitnessProfile } from "@/app/actions/fitness"
import SkillLevelStep from "@/app/onboarding/components/skill-level-step"
import GoalsStep from "@/app/onboarding/components/goals-step"
import MuscleGroupsStep from "@/app/onboarding/components/muscle-groups-step"
import WorkoutDetailsStep from "@/app/onboarding/components/workout-details-step"
import BiometricsStep from "@/app/onboarding/components/biometrics-step"
import DietaryRestrictionsStep from "@/app/onboarding/components/dietary-restrictions-step"
import SplitSelectionStep from "@/app/onboarding/components/split-selection-step"

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [fitnessProfile, setFitnessProfile] = useState({
    skillLevel: "",
    fitnessGoal: "",
    workoutDuration: 60,
    targetMuscleGroups: [] as string[],
    height: 0,
    weight: 0,
    age: 0,
    gender: "",
    dietaryRestrictions: [] as string[],
    workoutsPerWeek: 3,
    splitCount: 1,
    splitDetails: [] as { day: number; muscleGroups: string[] }[],
  })

  const totalSteps = fitnessProfile.skillLevel === "beginner" ? 6 : 7
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const updateProfile = (data: Partial<typeof fitnessProfile>) => {
    setFitnessProfile({ ...fitnessProfile, ...data })
  }

  const handleComplete = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      await saveFitnessProfile({
        userId: session.user.id,
        ...fitnessProfile,
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving fitness profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Let's set up your fitness profile</CardTitle>
          <CardDescription className="text-center">Tell us about your fitness goals and preferences</CardDescription>
          <Progress value={progress} className="h-2 mt-4" />
        </CardHeader>
        <CardContent className="pt-6">
          {step === 1 && (
            <SkillLevelStep
              value={fitnessProfile.skillLevel}
              onChange={(skillLevel) => updateProfile({ skillLevel })}
            />
          )}

          {step === 2 && (
            <GoalsStep value={fitnessProfile.fitnessGoal} onChange={(fitnessGoal) => updateProfile({ fitnessGoal })} />
          )}

          {step === 3 && (
            <MuscleGroupsStep
              value={fitnessProfile.targetMuscleGroups}
              onChange={(targetMuscleGroups) => updateProfile({ targetMuscleGroups })}
            />
          )}

          {step === 4 && (
            <WorkoutDetailsStep
              duration={fitnessProfile.workoutDuration}
              workoutsPerWeek={fitnessProfile.workoutsPerWeek}
              onChange={(data) => updateProfile(data)}
              skillLevel={fitnessProfile.skillLevel}
            />
          )}

          {step === 5 && fitnessProfile.skillLevel !== "beginner" && (
            <SplitSelectionStep
              splitCount={fitnessProfile.splitCount}
              splitDetails={fitnessProfile.splitDetails}
              workoutsPerWeek={fitnessProfile.workoutsPerWeek}
              onChange={(data) => updateProfile(data)}
            />
          )}

          {step === (fitnessProfile.skillLevel === "beginner" ? 5 : 6) && (
            <BiometricsStep
              height={fitnessProfile.height}
              weight={fitnessProfile.weight}
              age={fitnessProfile.age}
              gender={fitnessProfile.gender}
              onChange={(data) => updateProfile(data)}
            />
          )}

          {step === (fitnessProfile.skillLevel === "beginner" ? 6 : 7) && (
            <DietaryRestrictionsStep
              value={fitnessProfile.dietaryRestrictions}
              onChange={(dietaryRestrictions) => updateProfile({ dietaryRestrictions })}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            Back
          </Button>

          {step < totalSteps ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading ? "Saving..." : "Complete"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

