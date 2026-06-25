"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function createHRUser(data: { 
  name: string, email: string, password: string, siteId: string, 
  phone: string, employeeIdStr: string, designation: string, department: string 
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingUser) return { success: false, error: "Email already exists" }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "HR",
        siteId: data.siteId,
        phone: data.phone,
        employeeIdStr: data.employeeIdStr,
        designation: data.designation,
        department: data.department,
        isActive: true
      }
    })

    revalidatePath("/admin/users")
    return { success: true, data: user }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function resetHRPassword(userId: string, newPassword: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to reset password" }
  }
}
