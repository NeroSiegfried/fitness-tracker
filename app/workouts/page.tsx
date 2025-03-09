"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserWorkoutPlan } from "@/app/actions/dashboard"
import Link from "next/link"

export default function WorkoutsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [workoutPlan, setWorkoutPlan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchWorkoutPlan(session.user.id)
    }
  }, [status, session, router])

  const fetchWorkoutPlan = async (userId: string) => {
    setIsLoading(true)
    try {
      const data = await getUserWorkoutPlan(userId)
      setWorkoutPlan(data.workoutPlan)
    } catch (error) {
      console.error("Error fetching workout plan:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!workoutPlan) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">No workout plan found</h2>
              <p className="text-muted-foreground mb-6">You don't have a workout plan yet.</p>
              <Button onClick={() => router.push("/onboarding")}>Create Workout Plan</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{workoutPlan.name}</h1>
          <p className="text-muted-foreground">{workoutPlan.description}</p>
        </div>
        <Button onClick={() => router.push("/workouts/edit")}>Edit Workout Plan</Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All Workouts</TabsTrigger>
          <TabsTrigger value="by-day">By Day</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workoutPlan.workoutDays.map((day: any) => (
              <Card key={day.id}>
                <CardHeader>
                  <CardTitle>{day.name}</CardTitle>
                  <CardDescription>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {day.targetMuscleGroups.map((group: string) => (
                        <Badge key={group} variant="outline">
                          {group.charAt(0).toUpperCase() + group.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {day.exercises.map((exercise: any) => (
                      <div key={exercise.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {exercise.sets} sets × {exercise.repsPerSet} reps
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/exercises/${exercise.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/workouts/${day.id}`}>Start Workout</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-day" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((dayName, index) => {
              const workoutDay = workoutPlan.workoutDays.find((day: any) => day.dayOfWeek === index + 1)

              return (
                <Card key={dayName}>
                  <CardHeader>
                    <CardTitle>{dayName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workoutDay ? (
                      <div className="space-y-2">
                        <p className="font-medium">{workoutDay.name}</p>
                        <div className="flex flex-wrap gap-1">
                          {workoutDay.targetMuscleGroups.map((group: string) => (
                            <Badge key={group} variant="outline">
                              {group.charAt(0).toUpperCase() + group.slice(1)}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{workoutDay.exercises.length} exercises</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Rest day</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    {workoutDay ? (
                      <Button asChild className="w-full">
                        <Link href={`/workouts/${workoutDay.id}`}>View Workout</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        No Workout
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

