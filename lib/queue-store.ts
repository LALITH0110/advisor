// In-memory queue storage - no database needed
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
  status: "free" | "busy"
}

class QueueStore {
  private queue: Student[] = []
  private booths: Map<string, Booth> = new Map([
    ["1", { id: "1", name: "Booth 1", currentStudent: null, status: "free" }],
    ["2", { id: "2", name: "Booth 2", currentStudent: null, status: "free" }],
    ["3", { id: "3", name: "Booth 3", currentStudent: null, status: "free" }],
  ])
  private subscribers: Set<() => void> = new Set()

  subscribe(callback: () => void) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  private notify() {
    this.subscribers.forEach((callback) => callback())
  }

  addStudent(name: string): Student {
    const student: Student = {
      id: Math.random().toString(36).substring(7),
      name,
      joinedAt: Date.now(),
      position: this.queue.length + 1,
    }
    this.queue.push(student)
    this.updatePositions()
    this.notify()
    return student
  }

  private updatePositions() {
    this.queue.forEach((student, index) => {
      student.position = index + 1
    })
  }

  callNextStudent(boothId: string): Student | null {
    const booth = this.booths.get(boothId)
    if (!booth) return null

    const nextStudent = this.queue.shift()
    if (nextStudent) {
      booth.currentStudent = nextStudent
      booth.status = "busy"
      this.updatePositions()
      this.notify()
      return nextStudent
    }
    return null
  }

  finishStudent(boothId: string) {
    const booth = this.booths.get(boothId)
    if (booth) {
      booth.currentStudent = null
      booth.status = "free"
      this.notify()
    }
  }

  getQueue(): Student[] {
    return [...this.queue]
  }

  getBooths(): Booth[] {
    return Array.from(this.booths.values())
  }

  getStudentPosition(studentId: string): number | null {
    const student = this.queue.find((s) => s.id === studentId)
    return student ? student.position : null
  }

  findStudentInBooth(studentId: string): string | null {
    for (const [boothId, booth] of this.booths) {
      if (booth.currentStudent?.id === studentId) {
        return boothId
      }
    }
    return null
  }
}

export const queueStore = new QueueStore()
