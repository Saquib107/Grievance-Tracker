"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function bulkImportGrievances(data: any[]) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    throw new Error("Unauthorized")
  }

  const currentYear = new Date().getFullYear()
  
  // Get current count to generate ticket numbers
  const count = await prisma.grievance.count()
  
  const grievancesToCreate = data.map((row, index) => {
    const ticketNumber = `GRV-${currentYear}-${String(count + index + 1).padStart(5, '0')}`
    
    const priority = row.priority || "LOW"
    const slaDueDate = new Date()
    switch (priority) {
      case 'CRITICAL': slaDueDate.setHours(slaDueDate.getHours() + 24); break;
      case 'HIGH': slaDueDate.setHours(slaDueDate.getHours() + 48); break;
      case 'MEDIUM': slaDueDate.setDate(slaDueDate.getDate() + 3); break;
      case 'LOW': default: slaDueDate.setDate(slaDueDate.getDate() + 7); break;
    }

    return {
      ticketNumber,
      empIdGatepass: row.empIdGatepass || null,
      location: row.location || null,
      grievantName: row.grievantName || null,
      grievantContact: row.grievantContact || null,
      issue: row.issue || "No description provided",
      concernedPerson: row.concernedPerson || null,
      currentStatus: row.currentStatus || "PENDING",
      solved: row.solved || "PENDING",
      priority,
      slaDueDate,
      status: "SUBMITTED",
      isAnonymous: false,
      attachments: "[]",
      department: "Imported"
    }
  })

  // SQLite and Prisma handle createMany
  const result = await prisma.grievance.createMany({
    data: grievancesToCreate,
    skipDuplicates: true,
  })

  // We skip logging for bulk imports to save db writes, or we can log them if needed.

  revalidatePath("/hr/cases")
  revalidatePath("/hr/tracker")
  revalidatePath("/dashboard")
  
  return { success: true, count: result.count }
}
