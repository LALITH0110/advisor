"use server"

import { queueStore } from "@/lib/queue-store"
import { revalidatePath } from "next/cache"

export async function joinQueue(name: string) {
  const student = await queueStore.addStudent(name)
  revalidatePath("/student")
  revalidatePath("/worker")
  revalidatePath("/display")
  return student
}

export async function callNextStudent(boothId: string) {
  const student = await queueStore.callNextStudent(boothId)
  revalidatePath("/student")
  revalidatePath("/worker")
  revalidatePath("/display")
  return student
}

export async function finishStudent(boothId: string) {
  await queueStore.finishStudent(boothId)
  revalidatePath("/student")
  revalidatePath("/worker")
  revalidatePath("/display")
}

export async function getQueueData() {
  const [queue, booths] = await Promise.all([
    queueStore.getQueue(),
    queueStore.getBooths(),
  ])
  return {
    queue,
    booths,
  }
}

export async function getStudentStatus(studentId: string) {
  const [position, boothId] = await Promise.all([
    queueStore.getStudentPosition(studentId),
    queueStore.findStudentInBooth(studentId),
  ])
  return { position, boothId }
}
