"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { sendEmail } from "@/lib/email"

export async function submitGrievance(formData: FormData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const subject = formData.get("subject") as string
  const categoryId = formData.get("categoryId") as string
  const priority = formData.get("priority") as string || "LOW"
  const description = formData.get("description") as string
  const isAnonymous = formData.get("isAnonymous") === "true"
  // For MVP file uploads, we just accept a string URL or mock it.
  const attachment = formData.get("attachment") as string

  if (!subject || !categoryId || !description) {
    throw new Error("Missing required fields")
  }

  // Generate Ticket Number (e.g., GRV-2026-00124)
  const currentYear = new Date().getFullYear()
  const count = await prisma.grievance.count()
  const ticketNumber = `GRV-${currentYear}-${String(count + 1).padStart(5, '0')}`

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) throw new Error("User not found")

  const newGrievance = await prisma.grievance.create({
    data: {
      ticketNumber,
      subject,
      description,
      priority,
      categoryId,
      isAnonymous,
      employeeId: session.user.id,
      department: user.department || "General",
      status: "SUBMITTED",
      attachments: attachment ? JSON.stringify([attachment]) : "[]",
    }
  })

  revalidatePath("/dashboard")
  redirect(`/grievances/${newGrievance.id}`)
}

export async function updateGrievanceStatus(grievanceId: string, status: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized")
  }

  const updated = await prisma.grievance.update({
    where: { id: grievanceId },
    data: { status },
    include: { employee: true }
  })

  if (updated.employee?.email) {
    await sendEmail({
      to: updated.employee.email,
      subject: `Update on Grievance ${updated.ticketNumber}`,
      text: `Your grievance ticket (${updated.ticketNumber}) status has been updated to: ${status.replace('_', ' ')}.`
    })
  }

  revalidatePath(`/hr/cases/${grievanceId}`)
  revalidatePath("/hr/cases")
}

