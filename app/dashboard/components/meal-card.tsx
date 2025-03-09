import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

interface MealCardProps {
  meal: {
    id: string
    name: string
    description: string
    mealType: string
    calories: number
    protein: number
    carbs: number
    fat: number
    imageUrl: string
  }
}

export default function MealCard({ meal }: MealCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{meal.name}</CardTitle>
            <CardDescription className="capitalize">{meal.mealType}</CardDescription>
          </div>
          <div className="text-right">
            <div className="font-bold">{meal.calories} kcal</div>
            <div className="text-xs text-muted-foreground">
              P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="relative h-20 w-20 rounded-md overflow-hidden">
            <Image src={meal.imageUrl || "/placeholder.svg"} alt={meal.name} fill className="object-cover" />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">{meal.description}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/meals/${meal.id}`}>View Recipe</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

