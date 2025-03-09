"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { getUserWorkoutPlan, getUserMealPlan } from "@/app/actions/dashboard"
import DashboardHeader from "@/app/dashboard/components/dashboard-header"
import WorkoutCard from "@/app/dashboard/components/workout-card"
import MealCard from "@/app/dashboard/components/meal-card"
import { format } from "date-fns"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [date, setDate] = useState<Date>(new Date())
  const [workoutPlan, setWorkoutPlan] = useState<any>(null)
  const [mealPlan, setMealPlan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchUserData(session.user.id)
    }
  }, [status, session, router])

  const fetchUserData = async (userId: string) => {
    setIsLoading(true)
    try {
      const [workoutData, mealData] = await Promise.all([getUserWorkoutPlan(userId), getUserMealPlan(userId)])

      setWorkoutPlan(workoutData.workoutPlan)
      setMealPlan(mealData.mealPlan)
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getWorkoutForDay = (date: Date) => {
    if (!workoutPlan || !workoutPlan.workoutDays) return null

    const dayOfWeek = date.getDay() // 0 for Sunday, 1 for Monday, etc.
    return workoutPlan.workoutDays.find((day: any) => day.dayOfWeek === dayOfWeek)
  }

  const selectedWorkout = getWorkoutForDay(date)

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your fitness data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <DashboardHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view your schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{format(date, "EEEE, MMMM d, yyyy")}</CardTitle>
            <CardDescription>Your fitness schedule for today</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="workout">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="workout">Workout</TabsTrigger>
                <TabsTrigger value="meals">Meals</TabsTrigger>
              </TabsList>

              <TabsContent value="workout" className="space-y-4">
                {selectedWorkout ? (
                  <WorkoutCard workout={selectedWorkout} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No workout scheduled for this day</p>
                    <Button onClick={() => router.push("/workouts")}>View All Workouts</Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="meals" className="space-y-4">
                {mealPlan && mealPlan.meals ? (
                  <div className="space-y-6">
                    {mealPlan.meals
                      .filter((meal: any) => meal.mealType === "breakfast")
                      .map((meal: any) => (
                        <MealCard key={meal.id} meal={meal} />
                      ))}
                    {mealPlan.meals
                      .filter((meal: any) => meal.mealType === "lunch")
                      .map((meal: any) => (
                        <MealCard key={meal.id} meal={meal} />
                      ))}
                    {mealPlan.meals
                      .filter((meal: any) => meal.mealType === "dinner")
                      .map((meal: any) => (
                        <MealCard key={meal.id} meal={meal} />
                      ))}
                    {mealPlan.meals
                      .filter((meal: any) => meal.mealType === "snack")
                      .map((meal: any) => (
                        <MealCard key={meal.id} meal={meal} />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No meal plan available</p>
                    <Button onClick={() => router.push("/meals")}>View All Meals</Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

