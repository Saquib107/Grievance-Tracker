"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { sendEmail } from "@/lib/email"
import { analyzeGrievance } from "@/lib/ai"

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
  const attachment = formData.get("attachment") as string

  // New Excel Tracker Fields
  const empIdGatepass = formData.get("empIdGatepass") as string
  const location = formData.get("location") as string
  const grievantName = formData.get("grievantName") as string
  const grievantContact = formData.get("grievantContact") as string
  const issue = formData.get("issue") as string
  const concernedPerson = formData.get("concernedPerson") as string
  const currentStatus = formData.get("currentStatus") as string || "PENDING"
  const solved = formData.get("solved") as string || "PENDING"

  if ((!subject || !categoryId || !description) && !issue) {
    throw new Error("Missing required fields")
  }

  // Generate Ticket Number (e.g., GRV-2026-00124)
  const currentYear = new Date().getFullYear()
  const count = await prisma.grievance.count()
  const ticketNumber = `GRV-${currentYear}-${String(count + 1).padStart(5, '0')}`

  // Analyze the issue with Gemini AI
  const aiResult = await analyzeGrievance(issue || description)
  // If the form provided a priority other than LOW, respect the user's choice, otherwise use AI.
  const finalPriority = priority !== "LOW" ? priority : (aiResult?.priority || "LOW")
  const finalSentiment = aiResult?.sentiment || "Neutral"

  // Calculate SLA Due Date
  const slaDueDate = new Date()
  switch (finalPriority) {
    case 'CRITICAL': slaDueDate.setHours(slaDueDate.getHours() + 24); break;
    case 'HIGH': slaDueDate.setHours(slaDueDate.getHours() + 48); break; // 48 Hrs
    case 'MEDIUM': slaDueDate.setDate(slaDueDate.getDate() + 3); break; // 3 Days
    case 'LOW': default: slaDueDate.setDate(slaDueDate.getDate() + 7); break; // 7 Days
  }

  const onBehalf = formData.get("onBehalf") === "true"

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) throw new Error("User not found")

  const newGrievance = await prisma.grievance.create({
    data: {
      ticketNumber,
      subject,
      description,
      priority: finalPriority,
      sentiment: finalSentiment,
      categoryId: categoryId || undefined,
      isAnonymous,
      employeeId: onBehalf ? undefined : session.user.id,
      department: user.department || "General",
      status: "SUBMITTED",
      attachments: attachment ? JSON.stringify([attachment]) : "[]",
      slaDueDate,
      // Excel fields
      empIdGatepass,
      location,
      grievantName,
      grievantContact,
      concernedPerson,
      issue,
      currentStatus,
      solved
    }
  })

  await prisma.grievanceLog.create({
    data: {
      grievanceId: newGrievance.id,
      changedBy: user.name || "SYSTEM",
      action: "GRIEVANCE_SUBMITTED",
      details: onBehalf ? "Submitted on behalf of employee by HR/Admin" : "Submitted by employee"
    }
  })

  revalidatePath("/dashboard")
  redirect(onBehalf ? `/hr/cases` : `/grievances/${newGrievance.id}`)
}

export async function updateGrievanceTracker(grievanceId: string, data: any) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized")
  }

  const updated = await prisma.grievance.update({
    where: { id: grievanceId },
    data,
    include: { employee: true }
  })

  revalidatePath(`/hr/cases/${grievanceId}`)
  revalidatePath("/hr/cases")
  revalidatePath("/admin/tracker")
  return updated
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

