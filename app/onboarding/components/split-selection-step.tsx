"use client"

import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface SplitDetail {
  day: number
  muscleGroups: string[]
}

interface SplitSelectionStepProps {
  splitCount: number
  splitDetails: SplitDetail[]
  workoutsPerWeek: number
  onChange: (data: { splitCount?: number; splitDetails?: SplitDetail[] }) => void
}

const muscleGroups = [
  { id: "arms", label: "Arms" },
  { id: "back", label: "Back" },
  { id: "shoulders", label: "Shoulders" },
  { id: "chest", label: "Chest" },
  { id: "abs", label: "Abs" },
  { id: "quads", label: "Quads" },
  { id: "hams", label: "Hamstrings" },
  { id: "glutes", label: "Glutes" },
  { id: "calves", label: "Calves" },
]

export default function SplitSelectionStep({
  splitCount,
  splitDetails,
  workoutsPerWeek,
  onChange,
}: SplitSelectionStepProps) {
  useEffect(() => {
    // Initialize split details if empty
    if (splitDetails.length === 0) {
      const initialSplits = Array.from({ length: splitCount }, (_, i) => ({
        day: i + 1,
        muscleGroups: [],
      }))
      onChange({ splitDetails: initialSplits })
    }
  }, [splitCount, splitDetails, onChange])

  const handleSplitCountChange = (value: string) => {
    const count = Number.parseInt(value)
    onChange({
      splitCount: count,
      splitDetails: Array.from({ length: count }, (_, i) => {
        // Preserve existing data if available
        const existing = splitDetails.find((s) => s.day === i + 1)
        return existing || { day: i + 1, muscleGroups: [] }
      }),
    })
  }

  const handleMuscleGroupToggle = (day: number, groupId: string) => {
    const updatedSplits = splitDetails.map((split) => {
      if (split.day === day) {
        const groups = split.muscleGroups.includes(groupId)
          ? split.muscleGroups.filter((g) => g !== groupId)
          : [...split.muscleGroups, groupId]
        return { ...split, muscleGroups: groups }
      }
      return split
    })

    onChange({ splitDetails: updatedSplits })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center mb-6">Workout Split Selection</h2>

      <div className="space-y-4">
        <Label htmlFor="splitCount">How many different workout splits do you want?</Label>
        <Select value={splitCount.toString()} onValueChange={handleSplitCountChange}>
          <SelectTrigger id="splitCount">
            <SelectValue placeholder="Select number of splits" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num} {num === 1 ? "split" : "splits"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-sm text-muted-foreground mt-2">
          {splitCount === 1
            ? "Full body workout"
            : splitCount === 2
              ? "Upper/Lower split"
              : splitCount === 3
                ? "Push/Pull/Legs split"
                : "Custom split"}
        </p>
      </div>

      <div className="space-y-4 mt-6">
        <h3 className="font-medium">Select muscle groups for each split:</h3>

        {splitDetails.map((split) => (
          <Card key={split.day}>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-4">Split {split.day}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {muscleGroups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`split-${split.day}-${group.id}`}
                      checked={split.muscleGroups.includes(group.id)}
                      onCheckedChange={() => handleMuscleGroupToggle(split.day, group.id)}
                    />
                    <Label htmlFor={`split-${split.day}-${group.id}`} className="text-sm font-normal">
                      {group.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

