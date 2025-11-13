import { Redis } from "@upstash/redis"
import { BOOTH_CONFIG } from "./booth-config"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

type Student = {
  id: string
  name: string
  joinedAt: number
  position: number
}

type Booth = {
  id: string
  name: string
  currentStudent: Student | null
  status: "free" | "busy" | "closed"
}

class QueueStore {
  private async initBooths() {
    const exists = await redis.exists("booths:1")
    if (!exists) {
      const booths = BOOTH_CONFIG.map((config) => ({
        id: config.id,
        name: config.name,
        currentStudent: null,
        status: "free" as const,
      }))
      for (const booth of booths) {
        await redis.set(`booths:${booth.id}`, booth)
      }
      // Store booth IDs list
      await redis.set("booth_ids", ["1", "2", "3"])
    }
  }

  private async getBoothIds(): Promise<string[]> {
    const ids = await redis.get<string[]>("booth_ids")
    return ids || ["1", "2", "3"]
  }

  async addStudent(name: string): Promise<Student> {
    await this.initBooths()

    const student: Student = {
      id: Math.random().toString(36).substring(7),
      name,
      joinedAt: Date.now(),
      position: 0, // Will be calculated on-the-fly
    }

    // RPUSH returns the new length, use it to calculate position
    const queueLength = await redis.rpush("queue", student)
    student.position = queueLength

    return student
  }

  private async updatePositions() {
    // Positions are calculated on-the-fly in getQueue(), no need to rewrite
    // This method is kept for backward compatibility but does nothing
  }

  async callNextStudent(boothId: string): Promise<Student | null> {
    await this.initBooths()

    const booth = await redis.get<Booth>(`booths:${boothId}`)
    if (!booth) return null

    const student = await redis.lpop<Student>("queue")
    if (!student) return null

    booth.currentStudent = student
    booth.status = "busy"

    await redis.set(`booths:${boothId}`, booth)
    // Positions will be recalculated on next getQueue() call

    return student
  }

  async callSpecificStudent(boothId: string, studentId: string): Promise<Student | null> {
    await this.initBooths()

    const booth = await redis.get<Booth>(`booths:${boothId}`)
    if (!booth) return null

    // Get all students in queue
    const queue = await redis.lrange<Student>("queue", 0, -1)

    // Find the specific student
    const studentIndex = queue.findIndex(s => s.id === studentId)
    if (studentIndex === -1) return null

    const student = queue[studentIndex]

    // Remove student from queue at specific index
    // Redis doesn't have a direct remove by index, so we:
    // 1. Mark the student with a unique placeholder
    // 2. Remove the placeholder
    await redis.lset("queue", studentIndex, { ...student, id: "__REMOVE__" })
    await redis.lrem("queue", 1, { ...student, id: "__REMOVE__" })

    // Assign to booth
    booth.currentStudent = student
    booth.status = "busy"
    await redis.set(`booths:${boothId}`, booth)

    return student
  }

  async finishStudent(boothId: string) {
    await this.initBooths()

    const booth = await redis.get<Booth>(`booths:${boothId}`)
    if (booth) {
      booth.currentStudent = null
      booth.status = "free"
      await redis.set(`booths:${boothId}`, booth)
    }
  }

  async returnStudentToFront(boothId: string): Promise<Student | null> {
    await this.initBooths()

    const booth = await redis.get<Booth>(`booths:${boothId}`)
    if (!booth || !booth.currentStudent) return null

    const student = booth.currentStudent

    // Add student to front of queue
    await redis.lpush("queue", student)

    // Free the booth
    booth.currentStudent = null
    booth.status = "free"
    await redis.set(`booths:${boothId}`, booth)

    return student
  }

  async getQueue(): Promise<Student[]> {
    const queue = await redis.lrange<Student>("queue", 0, -1)
    // Calculate positions on-the-fly instead of storing them
    return queue.map((student, index) => ({
      ...student,
      position: index + 1,
    }))
  }

  async getBooths(): Promise<Booth[]> {
    await this.initBooths()

    const boothIds = await this.getBoothIds()
    const boothKeys = boothIds.map(id => `booths:${id}`)

    // Fetch all booths dynamically
    if (boothKeys.length === 0) return []

    const booths = await redis.mget<Booth>(...boothKeys)
    return booths.filter((booth): booth is Booth => booth !== null)
  }

  async getStudentPosition(studentId: string): Promise<number | null> {
    const queue = await this.getQueue()
    const student = queue.find((s) => s.id === studentId)
    return student ? student.position : null
  }

  async findStudentInBooth(studentId: string): Promise<string | null> {
    const booths = await this.getBooths()
    for (const booth of booths) {
      if (booth.currentStudent?.id === studentId) {
        return booth.id
      }
    }
    return null
  }

  // Update booth names from config (preserves current students)
  async updateBoothNames() {
    const booths = await this.getBooths()
    for (const booth of booths) {
      const config = BOOTH_CONFIG.find((c) => c.id === booth.id)
      if (config && booth.name !== config.name) {
        booth.name = config.name
        await redis.set(`booths:${booth.id}`, booth)
      }
    }
  }

  // Update a single booth name (from UI)
  async updateBoothName(boothId: string, newName: string) {
    const booth = await redis.get<Booth>(`booths:${boothId}`)
    if (booth) {
      booth.name = newName.trim() || `Booth ${boothId}`
      await redis.set(`booths:${boothId}`, booth)
    }
  }

  // Update booth status (from UI)
  async updateBoothStatus(boothId: string, newStatus: "free" | "busy" | "closed") {
    const booth = await redis.get<Booth>(`booths:${boothId}`)
    if (booth) {
      booth.status = newStatus
      // If closing booth, clear current student
      if (newStatus === "closed" && booth.currentStudent) {
        booth.currentStudent = null
      }
      await redis.set(`booths:${boothId}`, booth)
    }
  }

  // Add a new booth
  async addBooth(): Promise<Booth> {
    await this.initBooths()

    const boothIds = await this.getBoothIds()
    const nextId = (Math.max(...boothIds.map(id => parseInt(id))) + 1).toString()

    const newBooth: Booth = {
      id: nextId,
      name: `Booth ${nextId}`,
      currentStudent: null,
      status: "free"
    }

    await redis.set(`booths:${nextId}`, newBooth)

    // Update booth IDs list
    const updatedIds = [...boothIds, nextId]
    await redis.set("booth_ids", updatedIds)

    return newBooth
  }

  // Remove a booth
  async removeBooth(boothId: string): Promise<boolean> {
    const booth = await redis.get<Booth>(`booths:${boothId}`)
    if (!booth) return false

    // Don't allow removing if booth has a student
    if (booth.currentStudent) return false

    await redis.del(`booths:${boothId}`)

    // Update booth IDs list
    const boothIds = await this.getBoothIds()
    const updatedIds = boothIds.filter(id => id !== boothId)
    await redis.set("booth_ids", updatedIds)

    return true
  }
}

export const queueStore = new QueueStore()
