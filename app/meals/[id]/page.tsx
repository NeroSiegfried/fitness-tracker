"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getMealDetails } from "@/app/actions/meals"
import Image from "next/image"
import ReactMarkdown from "react-markdown"

export default function MealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { status } = useSession()
  const [meal, setMeal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }

    if (params.id) {
      fetchMealDetails(params.id as string)
    }
  }, [params.id, status, router])

  const fetchMealDetails = async (mealId: string) => {
    setIsLoading(true)
    try {
      const data = await getMealDetails(mealId)
      setMeal(data.meal)
    } catch (error) {
      console.error("Error fetching meal details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!meal) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Meal not found</h2>
              <p className="text-muted-foreground mb-6">
                The meal you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => router.push("/meals")}>Back to Meals</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/meals")}>
          Back to Meals
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{meal.name}</CardTitle>
                  <CardDescription className="capitalize">{meal.mealType}</CardDescription>
                </div>
                <Badge variant="outline">{meal.calories} kcal</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                <Image src={meal.imageUrl || "/placeholder.svg"} alt={meal.name} fill className="object-cover" />
              </div>
              <p className="text-muted-foreground">{meal.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nutritional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted rounded-md p-4 text-center">
                  <div className="text-2xl font-bold">{meal.calories}</div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                </div>
                <div className="bg-muted rounded-md p-4 text-center">
                  <div className="text-2xl font-bold">{meal.protein}g</div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                </div>
                <div className="bg-muted rounded-md p-4 text-center">
                  <div className="text-2xl font-bold">{meal.carbs}g</div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                </div>
                <div className="bg-muted rounded-md p-4 text-center">
                  <div className="text-2xl font-bold">{meal.fat}g</div>
                  <div className="text-sm text-muted-foreground">Fat</div>
                </div>
                <div className="bg-muted rounded-md p-4 text-center">
                  <div className="text-2xl font-bold">{Math.round(((meal.protein * 4) / meal.calories) * 100)}%</div>
                  <div className="text-sm text-muted-foreground">Protein %</div>
                </div>
                <div className="bg-muted rounded-md p-4 text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(((meal.carbs * 4 + meal.fat * 9) / meal.calories) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Carbs+Fat %</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Recipe</CardTitle>
            <CardDescription>Follow these instructions to prepare your meal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none dark:prose-invert">
              <ReactMarkdown>{meal.recipe}</ReactMarkdown>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => window.print()}>
              Print Recipe
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

