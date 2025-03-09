"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface BiometricsStepProps {
  height: number
  weight: number
  age: number
  gender: string
  onChange: (data: { height?: number; weight?: number; age?: number; gender?: string }) => void
}

export default function BiometricsStep({ height, weight, age, gender, onChange }: BiometricsStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center mb-6">Your Biometrics</h2>
      <p className="text-center text-muted-foreground mb-6">
        This information helps us create a personalized plan for you
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            value={height || ""}
            onChange={(e) => onChange({ height: Number.parseFloat(e.target.value) || 0 })}
            placeholder="e.g., 175"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={weight || ""}
            onChange={(e) => onChange({ weight: Number.parseFloat(e.target.value) || 0 })}
            placeholder="e.g., 70"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={age || ""}
            onChange={(e) => onChange({ age: Number.parseInt(e.target.value) || 0 })}
            placeholder="e.g., 30"
          />
        </div>

        <div className="space-y-2">
          <Label>Gender</Label>
          <RadioGroup value={gender} onValueChange={(value) => onChange({ gender: value })} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}

