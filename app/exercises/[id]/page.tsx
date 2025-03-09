"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getExerciseDetails, logWorkout } from "@/app/actions/exercises"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ExerciseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [exercise, setExercise] = useState<any>(null)
  const [previousLogs, setPreviousLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [logData, setLogData] = useState({
    sets: 0,
    reps: "",
    weight: 0,
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }

    if (params.id && status === "authenticated") {
      fetchExerciseDetails(params.id as string)
    }
  }, [params.id, status, router])

  const fetchExerciseDetails = async (exerciseId: string) => {
    setIsLoading(true)
    try {
      const data = await getExerciseDetails(exerciseId, session?.user?.id as string)
      if (data.exercise) {
        setExercise(data.exercise)
        setPreviousLogs(data.logs || [])

        // Initialize log data with exercise defaults
        setLogData({
          sets: data.exercise.sets,
          reps: data.exercise.repsPerSet,
          weight: 0,
          notes: "",
        })
      }
    } catch (error) {
      console.error("Error fetching exercise details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id || !exercise) return

    setIsSubmitting(true)
    try {
      await logWorkout({
        userId: session.user.id,
        exerciseId: exercise.id,
        setsCompleted: logData.sets,
        repsCompleted: logData.reps,
        weightUsed: logData.weight,
        notes: logData.notes,
      })

      // Refresh data
      fetchExerciseDetails(exercise.id)
    } catch (error) {
      console.error("Error logging workout:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Exercise not found</h2>
              <p className="text-muted-foreground mb-6">
                The exercise you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => router.push("/workouts")}>Back to Workouts</Button>
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
          <h1 className="text-3xl font-bold">{exercise.name}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {exercise.muscleGroups.map((group: string) => (
              <Badge key={group} variant="outline">
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      <Tabs defaultValue="instructions">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="log">Log Workout</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How to Perform</CardTitle>
              <CardDescription>Follow these instructions for proper form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {exercise.isCustom ? (
                <div className="aspect-video w-full">
                  <iframe
                    width="100%"
                    height="100%"
                    src={exercise.videoUrl}
                    title={`${exercise.name} tutorial`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center p-4">
                      <p className="text-lg font-medium mb-2">Exercise Demonstration</p>
                      <Button asChild>
                        <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer">
                          Watch on YouTube
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Instructions:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Start with a weight that allows you to maintain proper form.</li>
                      <li>
                        Perform {exercise.sets} sets of {exercise.repsPerSet} repetitions.
                      </li>
                      <li>Rest for {exercise.restTime || 60} seconds between sets.</li>
                      <li>Focus on controlled movements and proper breathing.</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Target Muscles:</h3>
                    <p>{exercise.muscleGroups.map((m: string) => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log Your Workout</CardTitle>
              <CardDescription>Record your sets, reps, and weight</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sets">Sets Completed</Label>
                    <Input
                      id="sets"
                      type="number"
                      value={logData.sets || ""}
                      onChange={(e) => setLogData({ ...logData, sets: Number.parseInt(e.target.value) || 0 })}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reps">Reps Per Set</Label>
                    <Input
                      id="reps"
                      value={logData.reps}
                      onChange={(e) => setLogData({ ...logData, reps: e.target.value })}
                      placeholder="e.g., 8,10,12"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Separate with commas for different sets</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={logData.weight || ""}
                      onChange={(e) => setLogData({ ...logData, weight: Number.parseFloat(e.target.value) || 0 })}
                      step="0.5"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    value={logData.notes}
                    onChange={(e) => setLogData({ ...logData, notes: e.target.value })}
                    placeholder="How did it feel? Any adjustments needed?"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Workout"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workout History</CardTitle>
              <CardDescription>Track your progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              {previousLogs.length > 0 ? (
                <div className="space-y-4">
                  {previousLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{new Date(log.date).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.setsCompleted} sets × {log.repsCompleted} reps @ {log.weightUsed} kg
                          </p>
                        </div>
                        <Badge variant="outline">
                          {Math.round(
                            log.setsCompleted *
                              log.weightUsed *
                              (Number.parseInt(log.repsCompleted.split(",")[0]) || 1),
                          )}{" "}
                          kg volume
                        </Badge>
                      </div>
                      {log.notes && (
                        <div className="mt-2 text-sm border-t pt-2">
                          <p className="font-medium">Notes:</p>
                          <p>{log.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No workout history yet</p>
                  <p className="text-sm">Log your first workout to start tracking your progress!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

