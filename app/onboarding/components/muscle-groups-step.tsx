import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface MuscleGroupsStepProps {
  value: string[]
  onChange: (value: string[]) => void
}

const muscleGroups = [
  { id: "arms", label: "Arms", description: "Biceps, Triceps, Forearms" },
  { id: "back", label: "Back", description: "Lats, Traps, Rhomboids" },
  { id: "shoulders", label: "Shoulders", description: "Deltoids" },
  { id: "chest", label: "Chest", description: "Pectorals" },
  { id: "abs", label: "Abs", description: "Rectus Abdominis, Obliques" },
  { id: "quads", label: "Quads", description: "Quadriceps" },
  { id: "hams", label: "Hamstrings", description: "Biceps Femoris, Semitendinosus" },
  { id: "glutes", label: "Glutes", description: "Gluteus Maximus, Medius, Minimus" },
  { id: "calves", label: "Calves", description: "Gastrocnemius, Soleus" },
]

export default function MuscleGroupsStep({ value, onChange }: MuscleGroupsStepProps) {
  const handleToggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center mb-6">Which muscle groups do you want to focus on?</h2>
      <p className="text-center text-muted-foreground mb-6">Select all that apply</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {muscleGroups.map((group) => (
          <div
            key={group.id}
            className={`flex items-start space-x-3 rounded-md border p-4 ${
              value.includes(group.id) ? "border-primary bg-primary/5" : "border-muted"
            }`}
          >
            <Checkbox id={group.id} checked={value.includes(group.id)} onCheckedChange={() => handleToggle(group.id)} />
            <div className="space-y-1">
              <Label
                htmlFor={group.id}
                className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {group.label}
              </Label>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

