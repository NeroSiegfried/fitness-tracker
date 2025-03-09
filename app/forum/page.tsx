"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getForumPosts } from "@/app/actions/forum"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default function ForumPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("latest")

  useEffect(() => {
    if (status === "authenticated") {
      fetchPosts()
    }
  }, [status, activeTab])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const data = await getForumPosts(activeTab)
      setPosts(data.posts || [])
    } catch (error) {
      console.error("Error fetching forum posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPosts = searchQuery
    ? posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : posts

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground">Discuss fitness topics with other members</p>
        </div>
        <Button onClick={() => router.push("/forum/new")}>Create New Post</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-3/4 space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-4">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Card key={post.id} className="hover:border-primary transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Link href={`/forum/${post.id}`} className="hover:underline">
                          <CardTitle>{post.title}</CardTitle>
                        </Link>
                        <Badge variant="outline">
                          {post.comments.length} {post.comments.length === 1 ? "reply" : "replies"}
                        </Badge>
                      </div>
                      <CardDescription>
                        Posted by {post.user.name} •{" "}
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2">{post.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                              className="h-4 w-4"
                            >
                              <path d="m19 14-7-7-7 7" />
                            </svg>
                            <span className="sr-only">Upvote</span>
                          </Button>
                          <span>{post.upvotes - post.downvotes}</span>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                              className="h-4 w-4"
                            >
                              <path d="m5 10 7 7 7-7" />
                            </svg>
                            <span className="sr-only">Downvote</span>
                          </Button>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/forum/${post.id}`}>Read More</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No posts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? `No posts matching "${searchQuery}"` : "There are no posts in this category yet"}
                  </p>
                  <Button onClick={() => router.push("/forum/new")}>Create the First Post</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full md:w-1/4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">1. Be respectful to other members</p>
              <p className="text-sm">2. Stay on topic and share valuable content</p>
              <p className="text-sm">3. No spam or self-promotion</p>
              <p className="text-sm">4. Provide sources for fitness claims</p>
              <p className="text-sm">5. Respect privacy and personal information</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/placeholder.svg?height=32&width=32&text=User${i}`} />
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">User {i}</p>
                    <p className="text-xs text-muted-foreground">{100 - i * 20} karma</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Topics</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="secondary">Nutrition</Badge>
              <Badge variant="secondary">Strength Training</Badge>
              <Badge variant="secondary">Weight Loss</Badge>
              <Badge variant="secondary">Cardio</Badge>
              <Badge variant="secondary">Supplements</Badge>
              <Badge variant="secondary">Recovery</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

