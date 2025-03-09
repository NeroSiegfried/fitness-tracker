"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface GoalsStepProps {
  value: string
  onChange: (value: string) => void
}

export default function GoalsStep({ value, onChange }: GoalsStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center mb-6">What's your primary fitness goal?</h2>

      <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <RadioGroupItem value="lose_weight" id="lose_weight" className="peer sr-only" />
          <Label
            htmlFor="lose_weight"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <div className="mb-3 rounded-full bg-primary/20 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <div className="text-center">
              <div className="font-semibold">Lose Weight</div>
              <div className="text-sm text-muted-foreground">Burn fat and improve body composition</div>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="gain_muscle" id="gain_muscle" className="peer sr-only" />
          <Label
            htmlFor="gain_muscle"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <div className="mb-3 rounded-full bg-primary/20 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M6 18h8" />
                <path d="M3 22h18" />
                <path d="M14 22a7 7 0 1 0 0-14h-4" />
                <path d="M4 8v6" />
              </svg>
            </div>
            <div className="text-center">
              <div className="font-semibold">Gain Muscle</div>
              <div className="text-sm text-muted-foreground">Build muscle mass and definition</div>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="gain_strength" id="gain_strength" className="peer sr-only" />
          <Label
            htmlFor="gain_strength"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <div className="mb-3 rounded-full bg-primary/20 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" />
                <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" />
                <path d="M14.5 17.5 4.5 15" />
              </svg>
            </div>
            <div className="text-center">
              <div className="font-semibold">Gain Strength</div>
              <div className="text-sm text-muted-foreground">Increase power and performance</div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}

