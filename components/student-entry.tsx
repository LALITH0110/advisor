"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { joinQueue, getStudentStatus } from "@/app/actions"
import { Users, CheckCircle, Loader2 } from "lucide-react"

export function StudentEntry() {
  const [name, setName] = useState("")
  const [studentId, setStudentId] = useState<string | null>(null)
  const [position, setPosition] = useState<number | null>(null)
  const [boothId, setBoothId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!studentId) return

    const interval = setInterval(async () => {
      const status = await getStudentStatus(studentId)
      setPosition(status.position)
      setBoothId(status.boothId)

      // Play notification sound when it's their turn
      if (status.boothId && !boothId) {
        try {
          const audio = new Audio(
            "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRA==",
          )
          audio.play()
        } catch (e) {
          console.log("[v0] Notification sound failed:", e)
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [studentId, boothId])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    const student = await joinQueue(name.trim())
    setStudentId(student.id)
    setPosition(student.position)
    setLoading(false)
  }

  if (studentId && boothId) {
    return (
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-iit-red">It's Your Turn!</h2>
          <p className="text-xl text-muted-foreground">
            Please proceed to <span className="font-bold text-iit-red">Booth {boothId}</span>
          </p>
        </div>
        <div className="p-6 bg-iit-red/10 rounded-lg">
          <p className="text-sm text-muted-foreground">Student Name</p>
          <p className="text-2xl font-semibold">{name}</p>
        </div>
      </Card>
    )
  }

  if (studentId && position !== null) {
    return (
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-iit-red/10 rounded-full flex items-center justify-center mx-auto">
          <Users className="w-12 h-12 text-iit-red" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">You're in Line!</h2>
          <p className="text-muted-foreground">Please wait for your turn</p>
        </div>
        <div className="p-8 bg-iit-red/5 rounded-lg space-y-2">
          <p className="text-sm text-muted-foreground">Your Position</p>
          <p className="text-6xl font-bold text-iit-red">{position}</p>
          <p className="text-sm text-muted-foreground">
            {position === 1 ? "You're next!" : `${position - 1} student${position > 2 ? "s" : ""} ahead`}
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Student Name</p>
          <p className="text-xl font-semibold">{name}</p>
        </div>
        <p className="text-sm text-muted-foreground">Keep this page open to receive updates</p>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md p-8 space-y-6">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-iit-red/10 rounded-full flex items-center justify-center mx-auto">
          <Users className="w-12 h-12 text-iit-red" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-iit-red">Join Queue</h1>
          <p className="text-muted-foreground mt-2">IIT Advising Department</p>
        </div>
      </div>

      <form onSubmit={handleJoin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="text-lg"
          />
        </div>
        <Button type="submit" className="w-full text-lg py-6" disabled={loading || !name.trim()}>
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            "Join Queue"
          )}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center">You'll be notified when it's your turn</p>
    </Card>
  )
}
