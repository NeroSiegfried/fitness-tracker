"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface WorkoutDetailsStepProps {
  duration: number
  workoutsPerWeek: number
  skillLevel: string
  onChange: (data: { workoutDuration?: number; workoutsPerWeek?: number }) => void
}

export default function WorkoutDetailsStep({
  duration,
  workoutsPerWeek,
  skillLevel,
  onChange,
}: WorkoutDetailsStepProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-center mb-6">Workout Details</h2>

      <div className="space-y-4">
        <Label htmlFor="duration">How long do you want each workout to be?</Label>
        <div className="flex items-center space-x-4">
          <Slider
            id="duration"
            min={30}
            max={120}
            step={5}
            value={[duration]}
            onValueChange={(value) => onChange({ workoutDuration: value[0] })}
            className="flex-1"
          />
          <span className="w-12 text-center font-medium">{duration} min</span>
        </div>
      </div>

      {skillLevel !== "beginner" && (
        <div className="space-y-4">
          <Label htmlFor="workoutsPerWeek">How many times per week do you want to workout?</Label>
          <div className="flex items-center space-x-4">
            <Slider
              id="workoutsPerWeek"
              min={1}
              max={7}
              step={1}
              value={[workoutsPerWeek]}
              onValueChange={(value) => onChange({ workoutsPerWeek: value[0] })}
              className="flex-1"
            />
            <span className="w-12 text-center font-medium">{workoutsPerWeek} days</span>
          </div>
        </div>
      )}
    </div>
  )
}

