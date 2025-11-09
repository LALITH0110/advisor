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
    }
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

  async finishStudent(boothId: string) {
    await this.initBooths()

    const booth = await redis.get<Booth>(`booths:${boothId}`)
    if (booth) {
      booth.currentStudent = null
      booth.status = "free"
      await redis.set(`booths:${boothId}`, booth)
    }
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

    // Use MGET to fetch all booths in a single command instead of 3 separate GETs
    const booths = await redis.mget<Booth>("booths:1", "booths:2", "booths:3")
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
}

export const queueStore = new QueueStore()
