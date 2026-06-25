"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function createSite(data: { name: string, code: string, location: string }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    const site = await prisma.site.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        location: data.location
      }
    })
    return { success: true, data: site }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create site" }
  }
}

export async function updateSite(id: string, data: { name: string, code: string, location: string }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    const site = await prisma.site.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        location: data.location
      }
    })
    return { success: true, data: site }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to update site" }
  }
}

export async function deleteSite(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    await prisma.site.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to delete site" }
  }
}
