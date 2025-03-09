"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function DashboardHeader() {
  const { data: session } = useSession()

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {session?.user?.name || "Fitness Enthusiast"}</h1>
          <p className="text-muted-foreground">Track your fitness journey and stay on top of your goals</p>
        </div>
        <div className="flex items-center mt-4 md:mt-0 space-x-2">
          <Button asChild variant="outline">
            <Link href="/workouts">Workouts</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/meals">Meal Plans</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/progress">Progress</Link>
          </Button>
          <Button asChild>
            <Link href="/forum">Community</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="text-4xl font-bold text-primary">3</div>
            <p className="text-sm text-muted-foreground">Workouts This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="text-4xl font-bold text-primary">12</div>
            <p className="text-sm text-muted-foreground">Workouts Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="text-4xl font-bold text-primary">5</div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="text-4xl font-bold text-primary">2100</div>
            <p className="text-sm text-muted-foreground">Daily Calories</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

