"use server"

import { queueStore } from "@/lib/queue-store"
import { revalidatePath } from "next/cache"

export async function joinQueue(name: string) {
  const student = await queueStore.addStudent(name)
  revalidatePath("/student")
  revalidatePath("/counselor")
  revalidatePath("/display")
  return student
}

export async function callNextStudent(boothId: string) {
  const student = await queueStore.callNextStudent(boothId)
  revalidatePath("/student")
  revalidatePath("/counselor")
  revalidatePath("/display")
  return student
}

export async function callSpecificStudent(boothId: string, studentId: string) {
  const student = await queueStore.callSpecificStudent(boothId, studentId)
  revalidatePath("/student")
  revalidatePath("/counselor")
  revalidatePath("/display")
  return student
}

export async function finishStudent(boothId: string) {
  await queueStore.finishStudent(boothId)
  revalidatePath("/student")
  revalidatePath("/counselor")
  revalidatePath("/display")
}

export async function returnStudentToFront(boothId: string) {
  const student = await queueStore.returnStudentToFront(boothId)
  revalidatePath("/student")
  revalidatePath("/counselor")
  revalidatePath("/display")
  return student
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
  const [position, boothId, booths] = await Promise.all([
    queueStore.getStudentPosition(studentId),
    queueStore.findStudentInBooth(studentId),
    queueStore.getBooths(),
  ])

  const booth = boothId ? booths.find((b) => b.id === boothId) : null
  const boothName = booth?.name || null

  return { position, boothId, boothName }
}

export async function updateBoothName(boothId: string, newName: string) {
  await queueStore.updateBoothName(boothId, newName)
  revalidatePath("/counselor")
  revalidatePath("/display")
  revalidatePath("/student")
  return { success: true }
}

export async function updateBoothStatus(
  boothId: string,
  newStatus: "free" | "busy" | "closed"
) {
  await queueStore.updateBoothStatus(boothId, newStatus)
  revalidatePath("/counselor")
  revalidatePath("/display")
  revalidatePath("/student")
  return { success: true }
}
