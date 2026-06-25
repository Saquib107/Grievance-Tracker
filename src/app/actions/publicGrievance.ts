"use server"

import { prisma } from "@/lib/prisma"
import { analyzeGrievance } from "@/lib/ai"

export async function submitPublicGrievance(formData: FormData) {
  const empIdGatepass = formData.get("empIdGatepass") as string
  const location = formData.get("location") as string
  const grievantName = formData.get("grievantName") as string
  const grievantContact = formData.get("grievantContact") as string
  const issue = formData.get("issue") as string

  if (!empIdGatepass || !grievantName || !grievantContact || !issue) {
    throw new Error("Missing required fields")
  }

  // Generate Ticket Number (e.g., GRV-2026-00124)
  const currentYear = new Date().getFullYear()
  const count = await prisma.grievance.count()
  const ticketNumber = `GRV-${currentYear}-${String(count + 1).padStart(5, '0')}`

  // Analyze the issue with Gemini AI
  const aiResult = await analyzeGrievance(issue)
  const finalPriority = aiResult?.priority || "LOW"
  const finalSentiment = aiResult?.sentiment || "Neutral"

  // Calculate SLA Due Date based on final priority
  const slaDueDate = new Date()
  switch (finalPriority) {
    case 'CRITICAL': slaDueDate.setHours(slaDueDate.getHours() + 24); break;
    case 'HIGH': slaDueDate.setHours(slaDueDate.getHours() + 48); break;
    case 'MEDIUM': slaDueDate.setDate(slaDueDate.getDate() + 3); break;
    case 'LOW': default: slaDueDate.setDate(slaDueDate.getDate() + 7); break;
  }

  const newGrievance = await prisma.grievance.create({
    data: {
      ticketNumber,
      empIdGatepass,
      location,
      grievantName,
      grievantContact,
      issue,
      status: "SUBMITTED",
      currentStatus: "PENDING",
      solved: "PENDING",
      priority: finalPriority,
      sentiment: finalSentiment,
      slaDueDate,
      isAnonymous: false,
    }
  })

  // Log the creation
  await prisma.grievanceLog.create({
    data: {
      grievanceId: newGrievance.id,
      changedBy: "PUBLIC",
      action: "GRIEVANCE_SUBMITTED",
      details: "Grievance submitted via public kiosk/mobile form."
    }
  })

  return {
    success: true,
    ticketNumber: newGrievance.ticketNumber
  }
}

export async function trackPublicGrievance(ticketNumber: string, phone: string) {
  const grievance = await prisma.grievance.findUnique({
    where: { ticketNumber }
  })

  if (!grievance) {
    throw new Error("Grievance not found")
  }

  // Security check: Only return data if the phone number matches
  if (grievance.grievantContact !== phone) {
    throw new Error("Unauthorized: Phone number does not match our records for this grievance.")
  }

  // Fetch the latest logs to show the history
  const logs = await prisma.grievanceLog.findMany({
    where: { grievanceId: grievance.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return {
    success: true,
    data: {
      ticketNumber: grievance.ticketNumber,
      dateReported: grievance.createdAt,
      status: grievance.status,
      currentStatus: grievance.currentStatus,
      priority: grievance.priority,
      issue: grievance.issue,
      concernedPerson: grievance.concernedPerson,
      solved: grievance.solved,
      dateResolved: grievance.dateResolved,
      logs
    }
  }
}
