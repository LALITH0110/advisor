"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { callNextStudent, finishStudent, getQueueData } from "@/app/actions"
import { UserCircle, Check } from "lucide-react"

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

export function WorkerPanel({ initialData }: { initialData: QueueData }) {
  const [data, setData] = useState<QueueData>(initialData)
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(async () => {
      const newData = await getQueueData()
      setData(newData)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  async function handleCallNext(boothId: string) {
    setLoading(boothId)
    await callNextStudent(boothId)
    const newData = await getQueueData()
    setData(newData)
    setLoading(null)
  }

  async function handleFinish(boothId: string) {
    setLoading(boothId)
    await finishStudent(boothId)
    const newData = await getQueueData()
    setData(newData)
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {data.booths.map((booth) => (
          <Card key={booth.id} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{booth.name}</h2>
              <Badge
                variant={booth.status === "free" ? "secondary" : "default"}
                className={booth.status === "free" ? "bg-green-100 text-green-800" : "bg-iit-red text-white"}
              >
                {booth.status === "free" ? "Free" : "Busy"}
              </Badge>
            </div>

            {booth.currentStudent ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-8 h-8 text-iit-red" />
                    <div>
                      <p className="text-sm text-muted-foreground">Currently serving</p>
                      <p className="text-xl font-semibold">{booth.currentStudent.name}</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleFinish(booth.id)}
                  disabled={loading === booth.id}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {loading === booth.id ? "Processing..." : "Finish & Free Booth"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted p-8 rounded-lg text-center">
                  <p className="text-muted-foreground">No student</p>
                </div>
                <Button
                  onClick={() => handleCallNext(booth.id)}
                  disabled={data.queue.length === 0 || loading === booth.id}
                  className="w-full"
                >
                  {loading === booth.id ? "Calling..." : "Call Next Student"}
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Queue ({data.queue.length} waiting)</h3>
        {data.queue.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No students in queue</p>
        ) : (
          <div className="space-y-2">
            {data.queue.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-iit-red text-white rounded-full flex items-center justify-center font-semibold">
                    {student.position}
                  </div>
                  <span className="font-medium">{student.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
