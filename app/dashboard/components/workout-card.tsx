import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface WorkoutCardProps {
  workout: {
    id: string
    name: string
    targetMuscleGroups: string[]
    exercises: {
      id: string
      name: string
      sets: number
      repsPerSet: string
    }[]
  }
}

export default function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{workout.name}</CardTitle>
        <CardDescription>
          <div className="flex flex-wrap gap-2 mt-1">
            {workout.targetMuscleGroups.map((group) => (
              <Badge key={group} variant="outline">
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </Badge>
            ))}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workout.exercises.map((exercise) => (
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
          <Link href={`/workouts/${workout.id}`}>Start Workout</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

