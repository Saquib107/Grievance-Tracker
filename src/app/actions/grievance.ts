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

  // Calculate SLA Due Date
  const slaDueDate = new Date()
  switch (priority) {
    case 'CRITICAL': slaDueDate.setHours(slaDueDate.getHours() + 24); break;
    case 'HIGH': slaDueDate.setDate(slaDueDate.getDate() + 3); break;
    case 'MEDIUM': slaDueDate.setDate(slaDueDate.getDate() + 5); break;
    case 'LOW': default: slaDueDate.setDate(slaDueDate.getDate() + 7); break;
  }

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
      slaDueDate,
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

export async function assignGrievance(grievanceId: string, assignedToId: string | null) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized")
  }

  await prisma.grievance.update({
    where: { id: grievanceId },
    data: { assignedToId }
  })

  revalidatePath(`/hr/cases/${grievanceId}`)
  revalidatePath("/hr/cases")
}

export async function submitSatisfactionSurvey(grievanceId: string, score: number, feedback: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const grievance = await prisma.grievance.findUnique({
    where: { id: grievanceId },
    select: { employeeId: true, status: true }
  })

  if (grievance?.employeeId !== session.user.id || grievance.status !== "RESOLVED") {
    throw new Error("Unauthorized or invalid state")
  }

  await prisma.grievance.update({
    where: { id: grievanceId },
    data: { 
      satisfactionScore: score,
      satisfactionFeedback: feedback
    }
  })

  revalidatePath(`/grievances/${grievanceId}`)
}

export async function bulkUpdateGrievanceStatus(grievanceIds: string[], status: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized")
  }

  await prisma.grievance.updateMany({
    where: { id: { in: grievanceIds } },
    data: { status }
  })

  // We could send emails in bulk here if necessary, but skipping for brevity
  revalidatePath("/hr/cases")
}

export async function bulkAssignGrievance(grievanceIds: string[], assignedToId: string | null) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized")
  }

  await prisma.grievance.updateMany({
    where: { id: { in: grievanceIds } },
    data: { assignedToId }
  })

  revalidatePath("/hr/cases")
}

