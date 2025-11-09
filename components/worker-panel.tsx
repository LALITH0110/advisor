"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { callNextStudent, finishStudent, getQueueData, updateBoothName, updateBoothStatus } from "@/app/actions"
import { UserCircle, Check, Edit2, Save, X, ChevronDown } from "lucide-react"

type Student = {
  id: string
  name: string
  position: number
}

type Booth = {
  id: string
  name: string
  currentStudent: Student | null
  status: "free" | "busy" | "closed"
}

type QueueData = {
  queue: Student[]
  booths: Booth[]
}

export function WorkerPanel({ initialData }: { initialData: QueueData }) {
  const [data, setData] = useState<QueueData>(initialData)
  const [loading, setLoading] = useState<string | null>(null)
  const [editingBooth, setEditingBooth] = useState<string | null>(null)
  const [editedName, setEditedName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const interval = setInterval(async () => {
      const newData = await getQueueData()
      setData(newData)
    }, 5000) // Increased from 2000ms to 5000ms to reduce Redis commands

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

  function startEditing(boothId: string, currentName: string) {
    setEditingBooth(boothId)
    setEditedName(currentName)
  }

  function cancelEditing() {
    setEditingBooth(null)
    setEditedName("")
  }

  async function saveBoothName(boothId: string) {
    if (!editedName.trim()) return

    setSaving(true)
    try {
      await updateBoothName(boothId, editedName)
      const newData = await getQueueData()
      setData(newData)
      setEditingBooth(null)
      setEditedName("")
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(boothId: string, newStatus: "free" | "busy" | "closed") {
    setLoading(boothId)
    try {
      await updateBoothStatus(boothId, newStatus)
      const newData = await getQueueData()
      setData(newData)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {data.booths.map((booth) => (
          <Card key={booth.id} className="p-6 space-y-4">
            <div className="space-y-4">
              {/* Booth Name Header */}
              <div className="flex items-center justify-between gap-2">
                {editingBooth === booth.id ? (
                  <div className="flex-1 space-y-2">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-lg font-semibold"
                      placeholder="Booth name"
                      disabled={saving}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveBoothName(booth.id)
                        if (e.key === "Escape") cancelEditing()
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => saveBoothName(booth.id)}
                        disabled={saving || !editedName.trim()}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button onClick={cancelEditing} disabled={saving} size="sm" variant="outline">
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <h2
                    className="text-2xl font-semibold flex-1 cursor-pointer hover:text-iit-red transition-colors px-2 py-1 rounded hover:bg-gray-50"
                    onDoubleClick={() => startEditing(booth.id, booth.name)}
                    title="Double-click to edit"
                  >
                    {booth.name}
                  </h2>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge
                      variant={booth.status === "free" ? "secondary" : "default"}
                      className={`cursor-pointer ${
                        booth.status === "free"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : booth.status === "closed"
                          ? "bg-gray-400 text-white hover:bg-gray-500"
                          : "bg-iit-red text-white hover:bg-iit-red/90"
                      }`}
                    >
                      {booth.status === "free" ? "Free" : booth.status === "closed" ? "Closed" : "Busy"}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(booth.id, "free")}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        Free
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(booth.id, "busy")}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        Busy
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(booth.id, "closed")}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        Closed
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                  <p className="text-muted-foreground">
                    {booth.status === "closed" ? "Booth Closed" : "No student"}
                  </p>
                </div>
                <Button
                  onClick={() => handleCallNext(booth.id)}
                  disabled={data.queue.length === 0 || loading === booth.id || booth.status === "closed"}
                  className="w-full"
                >
                  {loading === booth.id ? "Calling..." : booth.status === "closed" ? "Booth Closed" : "Call Next Student"}
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
