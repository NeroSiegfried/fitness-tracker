import { PrismaClient } from "@prisma/client"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

const prisma = new PrismaClient()

interface MealPlanData {
  userId: string
  fitnessGoal: string
  height?: number
  weight?: number
  age?: number
  gender?: string
  dietaryRestrictions: string[]
}

export async function generateMealPlan(data: MealPlanData) {
  try {
    if (!data.height || !data.weight || !data.age || !data.gender) {
      throw new Error("Height, weight, age, and gender are required for meal plan generation")
    }

    // Delete existing meal plan if it exists
    const existingPlans = await prisma.mealPlan.findMany({
      where: { userId: data.userId },
      include: { meals: true },
    })

    for (const plan of existingPlans) {
      await prisma.mealPlan.delete({
        where: { id: plan.id },
      })
    }

    // Calculate BMR (Basal Metabolic Rate) using the Mifflin-St Jeor Equation
    let bmr = 0
    if (data.gender === "male") {
      bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5
    } else {
      bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161
    }

    // Calculate TDEE (Total Daily Energy Expenditure) with moderate activity
    const tdee = bmr * 1.55

    // Adjust calories based on fitness goal
    let targetCalories = tdee
    if (data.fitnessGoal === "lose_weight") {
      targetCalories = tdee - 500 // Caloric deficit for weight loss
    } else if (data.fitnessGoal === "gain_muscle") {
      targetCalories = tdee + 300 // Caloric surplus for muscle gain
    }

    // Calculate macronutrient distribution
    let proteinPercentage = 0.3 // 30% of calories from protein
    let fatPercentage = 0.25 // 25% of calories from fat
    let carbPercentage = 0.45 // 45% of calories from carbs

    if (data.fitnessGoal === "gain_strength") {
      proteinPercentage = 0.35
      fatPercentage = 0.3
      carbPercentage = 0.35
    } else if (data.fitnessGoal === "lose_weight") {
      proteinPercentage = 0.4
      fatPercentage = 0.3
      carbPercentage = 0.3
    }

    // Calculate grams of each macronutrient
    const proteinGrams = (targetCalories * proteinPercentage) / 4 // 4 calories per gram of protein
    const fatGrams = (targetCalories * fatPercentage) / 9 // 9 calories per gram of fat
    const carbGrams = (targetCalories * carbPercentage) / 4 // 4 calories per gram of carbs

    // Create a new meal plan
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: data.userId,
        name: `${data.fitnessGoal.replace("_", " ")} Meal Plan`,
        description: `Custom meal plan for ${data.fitnessGoal.replace("_", " ")}`,
        totalCalories: Math.round(targetCalories),
        protein: Math.round(proteinGrams),
        carbs: Math.round(carbGrams),
        fat: Math.round(fatGrams),
      },
    })

    // Generate meals using AI
    await generateMealsWithAI(
      mealPlan.id,
      data.dietaryRestrictions,
      Math.round(targetCalories),
      Math.round(proteinGrams),
      Math.round(carbGrams),
      Math.round(fatGrams),
      data.fitnessGoal,
    )

    return { success: true, mealPlanId: mealPlan.id }
  } catch (error) {
    console.error("Error generating meal plan:", error)
    return { error: "Failed to generate meal plan" }
  }
}

async function generateMealsWithAI(
  mealPlanId: string,
  dietaryRestrictions: string[],
  totalCalories: number,
  proteinGrams: number,
  carbGrams: number,
  fatGrams: number,
  fitnessGoal: string,
) {
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"]
  const mealDistribution = {
    breakfast: 0.25, // 25% of daily calories
    lunch: 0.3, // 30% of daily calories
    dinner: 0.3, // 30% of daily calories
    snack: 0.15, // 15% of daily calories
  }

  for (const mealType of mealTypes) {
    const mealCalories = Math.round(totalCalories * mealDistribution[mealType as keyof typeof mealDistribution])
    const mealProtein = Math.round(proteinGrams * mealDistribution[mealType as keyof typeof mealDistribution])
    const mealCarbs = Math.round(carbGrams * mealDistribution[mealType as keyof typeof mealDistribution])
    const mealFat = Math.round(fatGrams * mealDistribution[mealType as keyof typeof mealDistribution])

    const restrictionsText = dietaryRestrictions.includes("none")
      ? "no dietary restrictions"
      : `following dietary restrictions: ${dietaryRestrictions.join(", ")}`

    const prompt = `
      Generate a ${mealType} recipe that meets these nutritional requirements:
      - Approximately ${mealCalories} calories
      - About ${mealProtein}g protein
      - About ${mealCarbs}g carbs
      - About ${mealFat}g fat
      
      The meal should support a ${fitnessGoal.replace("_", " ")} goal and follow ${restrictionsText}.
      
      Format your response as a JSON object with these fields:
      {
        "name": "Meal name",
        "description": "Brief description",
        "ingredients": ["ingredient 1", "ingredient 2", ...],
        "instructions": ["step 1", "step 2", ...],
        "nutritionalInfo": {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        }
      }
    `

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
      })

      // Parse the JSON response
      const mealData = JSON.parse(text)

      // Create the meal in the database
      await prisma.meal.create({
        data: {
          mealPlanId,
          name: mealData.name,
          description: mealData.description,
          mealType,
          calories: mealData.nutritionalInfo.calories,
          protein: mealData.nutritionalInfo.protein,
          carbs: mealData.nutritionalInfo.carbs,
          fat: mealData.nutritionalInfo.fat,
          recipe: `# Ingredients\n${mealData.ingredients.map((i) => `- ${i}`).join("\n")}\n\n# Instructions\n${mealData.instructions.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}`,
          imageUrl: `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(mealData.name)}`,
        },
      })
    } catch (error) {
      console.error(`Error generating ${mealType} with AI:`, error)
      // Create a fallback meal if AI generation fails
      await createFallbackMeal(mealPlanId, mealType, mealCalories, mealProtein, mealCarbs, mealFat)
    }
  }
}

async function createFallbackMeal(
  mealPlanId: string,
  mealType: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
) {
  const fallbackMeals = {
    breakfast: {
      name: "Protein Oatmeal",
      description: "A simple, protein-rich breakfast to start your day",
      recipe:
        "# Ingredients\n- 1 cup rolled oats\n- 1 scoop protein powder\n- 1 tbsp honey\n- 1 cup milk\n- 1/2 cup berries\n\n# Instructions\n1. Cook oats with milk\n2. Stir in protein powder\n3. Top with berries and honey",
    },
    lunch: {
      name: "Chicken Salad",
      description: "A balanced lunch with lean protein and vegetables",
      recipe:
        "# Ingredients\n- 4 oz grilled chicken breast\n- 2 cups mixed greens\n- 1/4 cup cherry tomatoes\n- 1/4 cup cucumber\n- 2 tbsp olive oil\n- 1 tbsp vinegar\n\n# Instructions\n1. Grill chicken breast\n2. Chop vegetables\n3. Mix all ingredients\n4. Dress with olive oil and vinegar",
    },
    dinner: {
      name: "Salmon with Vegetables",
      description: "A protein-rich dinner with healthy fats",
      recipe:
        "# Ingredients\n- 6 oz salmon fillet\n- 1 cup broccoli\n- 1 cup sweet potato\n- 1 tbsp olive oil\n- Herbs and spices\n\n# Instructions\n1. Bake salmon at 400°F for 15 minutes\n2. Steam broccoli\n3. Roast sweet potato\n4. Serve with olive oil and herbs",
    },
    snack: {
      name: "Protein Shake",
      description: "A quick protein boost between meals",
      recipe:
        "# Ingredients\n- 1 scoop protein powder\n- 1 cup milk\n- 1/2 banana\n- 1 tbsp peanut butter\n\n# Instructions\n1. Blend all ingredients\n2. Serve cold",
    },
  }

  const meal = fallbackMeals[mealType as keyof typeof fallbackMeals]

  await prisma.meal.create({
    data: {
      mealPlanId,
      name: meal.name,
      description: meal.description,
      mealType,
      calories,
      protein,
      carbs,
      fat,
      recipe: meal.recipe,
      imageUrl: `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(meal.name)}`,
    },
  })
}

