import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard"
import HRDashboard from "@/components/dashboard/HRDashboard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  const role = session?.user?.role

  if (!userId) return null

  if (role === "ADMIN") {
    redirect("/admin")
  }

  if (role === "HR") {
    redirect("/hr")
  }

  // Employee Dashboard Data Fetching
  const activeGrievances = await prisma.grievance.findMany({
    where: { 
      employeeId: userId,
      status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] }
    },
    orderBy: { createdAt: 'desc' },
    include: { 
      category: true,
      assignedTo: { select: { name: true } }
    }
  })

  return (
    <EmployeeDashboard 
      user={session.user} 
      activeGrievances={activeGrievances} 
    />
  )
}
