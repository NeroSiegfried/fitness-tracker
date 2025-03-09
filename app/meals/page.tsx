"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserMealPlan } from "@/app/actions/dashboard"
import Link from "next/link"
import Image from "next/image"

export default function MealsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [mealPlan, setMealPlan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchMealPlan(session.user.id)
    }
  }, [status, session, router])

  const fetchMealPlan = async (userId: string) => {
    setIsLoading(true)
    try {
      const data = await getUserMealPlan(userId)
      setMealPlan(data.mealPlan)
    } catch (error) {
      console.error("Error fetching meal plan:", error)
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

  if (!mealPlan) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">No meal plan found</h2>
              <p className="text-muted-foreground mb-6">You don't have a meal plan yet.</p>
              <Button onClick={() => router.push("/onboarding")}>Create Meal Plan</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{mealPlan.name}</h1>
          <p className="text-muted-foreground">{mealPlan.description}</p>
        </div>
        <Button onClick={() => router.push("/meals/regenerate")}>Regenerate Meal Plan</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Nutrition Summary</CardTitle>
          <CardDescription>Your daily macronutrient targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted rounded-md p-4 text-center">
              <div className="text-2xl font-bold">{mealPlan.totalCalories}</div>
              <div className="text-sm text-muted-foreground">Calories</div>
            </div>
            <div className="bg-muted rounded-md p-4 text-center">
              <div className="text-2xl font-bold">{mealPlan.protein}g</div>
              <div className="text-sm text-muted-foreground">Protein</div>
            </div>
            <div className="bg-muted rounded-md p-4 text-center">
              <div className="text-2xl font-bold">{mealPlan.carbs}g</div>
              <div className="text-sm text-muted-foreground">Carbs</div>
            </div>
            <div className="bg-muted rounded-md p-4 text-center">
              <div className="text-2xl font-bold">{mealPlan.fat}g</div>
              <div className="text-sm text-muted-foreground">Fat</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Meals</TabsTrigger>
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
          <TabsTrigger value="lunch">Lunch</TabsTrigger>
          <TabsTrigger value="dinner">Dinner</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mealPlan.meals.map((meal: any) => (
              <Card key={meal.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{meal.name}</CardTitle>
                      <CardDescription className="capitalize">{meal.mealType}</CardDescription>
                    </div>
                    <Badge variant="outline">{meal.calories} kcal</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                    <Image src={meal.imageUrl || "/placeholder.svg"} alt={meal.name} fill className="object-cover" />
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{meal.description}</p>
                  <div className="flex justify-between mt-4 text-sm">
                    <div>Protein: {meal.protein}g</div>
                    <div>Carbs: {meal.carbs}g</div>
                    <div>Fat: {meal.fat}g</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/meals/${meal.id}`}>View Recipe</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="breakfast" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mealPlan.meals
              .filter((meal: any) => meal.mealType === "breakfast")
              .map((meal: any) => (
                <Card key={meal.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{meal.name}</CardTitle>
                        <CardDescription className="capitalize">{meal.mealType}</CardDescription>
                      </div>
                      <Badge variant="outline">{meal.calories} kcal</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                      <Image src={meal.imageUrl || "/placeholder.svg"} alt={meal.name} fill className="object-cover" />
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{meal.description}</p>
                    <div className="flex justify-between mt-4 text-sm">
                      <div>Protein: {meal.protein}g</div>
                      <div>Carbs: {meal.carbs}g</div>
                      <div>Fat: {meal.fat}g</div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/meals/${meal.id}`}>View Recipe</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="lunch" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mealPlan.meals
              .filter((meal: any) => meal.mealType === "lunch")
              .map((meal: any) => (
                <Card key={meal.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{meal.name}</CardTitle>
                        <CardDescription className="capitalize">{meal.mealType}</CardDescription>
                      </div>
                      <Badge variant="outline">{meal.calories} kcal</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                      <Image src={meal.imageUrl || "/placeholder.svg"} alt={meal.name} fill className="object-cover" />
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{meal.description}</p>
                    <div className="flex justify-between mt-4 text-sm">
                      <div>Protein: {meal.protein}g</div>
                      <div>Carbs: {meal.carbs}g</div>
                      <div>Fat: {meal.fat}g</div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/meals/${meal.id}`}>View Recipe</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="dinner" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mealPlan.meals
              .filter((meal: any) => meal.mealType === "dinner")
              .map((meal: any) => (
                <Card key={meal.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{meal.name}</CardTitle>
                        <CardDescription className="capitalize">{meal.mealType}</CardDescription>
                      </div>
                      <Badge variant="outline">{meal.calories} kcal</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                      <Image src={meal.imageUrl || "/placeholder.svg"} alt={meal.name} fill className="object-cover" />
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{meal.description}</p>
                    <div className="flex justify-between mt-4 text-sm">
                      <div>Protein: {meal.protein}g</div>
                      <div>Carbs: {meal.carbs}g</div>
                      <div>Fat: {meal.fat}g</div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/meals/${meal.id}`}>View Recipe</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

