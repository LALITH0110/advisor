"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getQueueData } from "@/app/actions"
import { UserCircle, Users } from "lucide-react"

type Student = {
  id: string
  name: string
  position: number
}

type Booth = {
  id: string
  name: string
  currentStudent: Student | null
  status: "free" | "busy"
}

type QueueData = {
  queue: Student[]
  booths: Booth[]
}

export function DisplayScreen({ initialData }: { initialData: QueueData }) {
  const [data, setData] = useState<QueueData>(initialData)

  useEffect(() => {
    const interval = setInterval(async () => {
      const newData = await getQueueData()
      setData(newData)
    }, 5000) // Increased from 2000ms to 5000ms to reduce Redis commands

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-iit-red">IIT Advising Queue</h1>
          <p className="text-2xl text-muted-foreground">Department Queue Status</p>
        </div>

        {/* Booths Status */}
        <div className="grid md:grid-cols-3 gap-6">
          {data.booths.map((booth) => (
            <Card
              key={booth.id}
              className={`p-6 transition-all ${
                booth.status === "busy"
                  ? "border-2 border-iit-red bg-iit-red/5"
                  : "border-2 border-green-500 bg-green-50"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">{booth.name}</h2>
                  <Badge
                    variant={booth.status === "free" ? "secondary" : "default"}
                    className={`text-lg px-4 py-2 ${
                      booth.status === "free" ? "bg-green-600 text-white" : "bg-iit-red text-white"
                    }`}
                  >
                    {booth.status === "free" ? "Available" : "Busy"}
                  </Badge>
                </div>

                {booth.currentStudent ? (
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <UserCircle className="w-10 h-10 text-iit-red" />
                      <div>
                        <p className="text-sm text-muted-foreground">Now Serving</p>
                        <p className="text-2xl font-bold">{booth.currentStudent.name}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-lg text-center">
                    <p className="text-xl text-muted-foreground">Waiting...</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Queue List */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-iit-red" />
            <h3 className="text-3xl font-semibold">Queue ({data.queue.length} waiting)</h3>
          </div>

          {data.queue.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-2xl text-muted-foreground">No students in queue</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {data.queue.map((student) => (
                <div key={student.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-12 h-12 bg-iit-red text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {student.position}
                  </div>
                  <span className="text-xl font-medium">{student.name}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
