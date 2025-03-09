"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getUserProfile } from "@/app/actions/profile"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchUserProfile(session.user.id)
    }
  }, [status, session, router])

  const fetchUserProfile = async (userId: string) => {
    setIsLoading(true)
    try {
      const data = await getUserProfile(userId)
      setProfile(data.profile)
    } catch (error) {
      console.error("Error fetching user profile:", error)
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

  if (!profile) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
              <p className="text-muted-foreground mb-6">Unable to load your profile information.</p>
              <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={profile.user.image || `/placeholder.svg?height=96&width=96&text=${profile.user.name.charAt(0)}`}
              />
              <AvatarFallback className="text-2xl">{profile.user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{profile.user.name}</h1>
              <p className="text-muted-foreground">{profile.user.email}</p>

              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                <Badge variant="outline">{profile.user.karma} Karma</Badge>
                <Badge variant="outline">Member since {new Date(profile.user.createdAt).toLocaleDateString()}</Badge>
                {profile.fitnessProfile && (
                  <Badge variant="outline" className="capitalize">
                    {profile.fitnessProfile.skillLevel} Level
                  </Badge>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings">Edit Profile</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="bg-muted rounded-md p-3">
                <div className="text-2xl font-bold">{profile.stats.totalWorkouts}</div>
                <div className="text-xs text-muted-foreground">Workouts</div>
              </div>
              <div className="bg-muted rounded-md p-3">
                <div className="text-2xl font-bold">{profile.stats.totalPosts}</div>
                <div className="text-xs text-muted-foreground">Forum Posts</div>
              </div>
              <div className="bg-muted rounded-md p-3">
                <div className="text-2xl font-bold">{profile.stats.totalComments}</div>
                <div className="text-xs text-muted-foreground">Comments</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="activity">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="posts">Forum Posts</TabsTrigger>
          <TabsTrigger value="workouts">Workout History</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          {profile.recentActivity.length > 0 ? (
            profile.recentActivity.map((activity: any) => (
              <Card key={activity.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{activity.title}</CardTitle>
                      <CardDescription>
                        {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{activity.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2">{activity.description}</p>
                </CardContent>
                {activity.link && (
                  <CardFooter>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={activity.link}>View Details</Link>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">No recent activity</p>
                  <p className="text-sm">Start working out or participate in the forum to see your activity here!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {profile.forumPosts.length > 0 ? (
            profile.forumPosts.map((post: any) => (
              <Card key={post.id}>
                <CardHeader className="pb-2">
                  <Link href={`/forum/${post.id}`} className="hover:underline">
                    <CardTitle>{post.title}</CardTitle>
                  </Link>
                  <CardDescription>
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })} •{post.comments.length}{" "}
                    {post.comments.length === 1 ? "comment" : "comments"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2">{post.content}</p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{post.upvotes - post.downvotes} votes</Badge>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">No forum posts yet</p>
                  <Button asChild>
                    <Link href="/forum/new">Create Your First Post</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          {profile.workoutLogs.length > 0 ? (
            profile.workoutLogs.map((log: any) => (
              <Card key={log.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{log.exercise.name}</CardTitle>
                      <CardDescription>{new Date(log.date).toLocaleDateString()}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {Math.round(
                        log.setsCompleted * log.weightUsed * (Number.parseInt(log.repsCompleted.split(",")[0]) || 1),
                      )}{" "}
                      kg volume
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="font-medium">Sets</p>
                      <p>{log.setsCompleted}</p>
                    </div>
                    <div>
                      <p className="font-medium">Reps</p>
                      <p>{log.repsCompleted}</p>
                    </div>
                    <div>
                      <p className="font-medium">Weight</p>
                      <p>{log.weightUsed} kg</p>
                    </div>
                  </div>
                  {log.notes && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium">Notes:</p>
                      <p>{log.notes}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/exercises/${log.exercise.id}`}>View Exercise</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">No workout history yet</p>
                  <Button asChild>
                    <Link href="/workouts">Start Working Out</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

