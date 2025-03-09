import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface DietaryRestrictionsStepProps {
  value: string[]
  onChange: (value: string[]) => void
}

const dietaryRestrictions = [
  { id: "none", label: "No Restrictions", description: "I eat everything" },
  { id: "vegetarian", label: "Vegetarian", description: "No meat, but dairy and eggs are okay" },
  { id: "vegan", label: "Vegan", description: "No animal products" },
  { id: "keto", label: "Keto", description: "Low carb, high fat" },
  {
    id: "paleo",
    label: "Paleo",
    description: "Foods similar to what might have been eaten during the Paleolithic era",
  },
  { id: "gluten_free", label: "Gluten-Free", description: "No gluten-containing foods" },
  { id: "dairy_free", label: "Dairy-Free", description: "No dairy products" },
  { id: "nut_free", label: "Nut-Free", description: "No nuts or nut-derived products" },
]

export default function DietaryRestrictionsStep({ value, onChange }: DietaryRestrictionsStepProps) {
  const handleToggle = (id: string) => {
    if (id === "none") {
      // If "No Restrictions" is selected, clear all other selections
      onChange(["none"])
      return
    }

    // If any other restriction is selected, remove "No Restrictions"
    let newValue = value.filter((item) => item !== "none")

    if (value.includes(id)) {
      newValue = newValue.filter((item) => item !== id)
    } else {
      newValue = [...newValue, id]
    }

    // If no restrictions are selected, default to "No Restrictions"
    if (newValue.length === 0) {
      newValue = ["none"]
    }

    onChange(newValue)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center mb-6">Do you have any dietary restrictions?</h2>
      <p className="text-center text-muted-foreground mb-6">Select all that apply</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dietaryRestrictions.map((restriction) => (
          <div
            key={restriction.id}
            className={`flex items-start space-x-3 rounded-md border p-4 ${
              value.includes(restriction.id) ? "border-primary bg-primary/5" : "border-muted"
            }`}
          >
            <Checkbox
              id={restriction.id}
              checked={value.includes(restriction.id)}
              onCheckedChange={() => handleToggle(restriction.id)}
              disabled={restriction.id !== "none" && value.includes("none")}
            />
            <div className="space-y-1">
              <Label
                htmlFor={restriction.id}
                className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {restriction.label}
              </Label>
              <p className="text-sm text-muted-foreground">{restriction.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

