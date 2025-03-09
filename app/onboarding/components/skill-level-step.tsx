"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface SkillLevelStepProps {
  value: string
  onChange: (value: string) => void
}

export default function SkillLevelStep({ value, onChange }: SkillLevelStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center mb-6">What's your fitness experience level?</h2>

      <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <RadioGroupItem value="beginner" id="beginner" className="peer sr-only" />
          <Label
            htmlFor="beginner"
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
                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <div className="text-center">
              <div className="font-semibold">Beginner</div>
              <div className="text-sm text-muted-foreground">New to fitness or returning after a long break</div>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="intermediate" id="intermediate" className="peer sr-only" />
          <Label
            htmlFor="intermediate"
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
                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                <path d="M8 12h8" />
                <path d="M12 16V8" />
              </svg>
            </div>
            <div className="text-center">
              <div className="font-semibold">Intermediate</div>
              <div className="text-sm text-muted-foreground">Consistent training for 6+ months</div>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="advanced" id="advanced" className="peer sr-only" />
          <Label
            htmlFor="advanced"
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
                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                <path d="M8 12h8" />
                <path d="M12 16V8" />
                <path d="M16 12h-8" />
              </svg>
            </div>
            <div className="text-center">
              <div className="font-semibold">Advanced</div>
              <div className="text-sm text-muted-foreground">Consistent training for 2+ years</div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}

