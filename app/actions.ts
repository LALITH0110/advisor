"use server"

import { queueStore } from "@/lib/queue-store"
import { revalidatePath } from "next/cache"

export async function joinQueue(name: string) {
  const student = queueStore.addStudent(name)
  revalidatePath("/student")
  revalidatePath("/worker")
  revalidatePath("/display")
  return student
}

export async function callNextStudent(boothId: string) {
  const student = queueStore.callNextStudent(boothId)
  revalidatePath("/student")
  revalidatePath("/worker")
  revalidatePath("/display")
  return student
}

export async function finishStudent(boothId: string) {
  queueStore.finishStudent(boothId)
  revalidatePath("/student")
  revalidatePath("/worker")
  revalidatePath("/display")
}

export async function getQueueData() {
  return {
    queue: queueStore.getQueue(),
    booths: queueStore.getBooths(),
  }
}

export async function getStudentStatus(studentId: string) {
  const position = queueStore.getStudentPosition(studentId)
  const boothId = queueStore.findStudentInBooth(studentId)
  return { position, boothId }
}
