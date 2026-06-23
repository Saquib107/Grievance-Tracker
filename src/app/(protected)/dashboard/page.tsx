import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard"
import HRDashboard from "@/components/dashboard/HRDashboard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  const role = session?.user?.role

  if (!userId) return null

  if (role === "HR" || role === "ADMIN") {
    // HR Dashboard Data Fetching
    const now = new Date()
    
    // SLA thresholds
    const todayEnd = new Date(now)
    todayEnd.setHours(23, 59, 59, 999)
    
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() + 7)
    weekEnd.setHours(23, 59, 59, 999)

    const totalOpen = await prisma.grievance.count({
      where: { status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } }
    })

    const overdue = await prisma.grievance.count({
      where: { 
        status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] },
        slaDueDate: { lt: now }
      }
    })

    const dueToday = await prisma.grievance.count({
      where: { 
        status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] },
        slaDueDate: { gte: now, lte: todayEnd }
      }
    })

    const dueThisWeek = await prisma.grievance.count({
      where: { 
        status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] },
        slaDueDate: { gt: todayEnd, lte: weekEnd }
      }
    })

    // Calculate Avg Resolution Time
    const resolvedCases = await prisma.grievance.findMany({
      where: { status: "RESOLVED" },
      select: { createdAt: true, updatedAt: true }
    })

    let avgResolutionTime = 0
    if (resolvedCases.length > 0) {
      const totalDays = resolvedCases.reduce((sum, g) => {
        const diffTime = Math.abs(g.updatedAt.getTime() - g.createdAt.getTime())
        return sum + Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }, 0)
      avgResolutionTime = totalDays / resolvedCases.length
    }

    const myCases = await prisma.grievance.findMany({
      where: { 
        assignedToId: userId,
        status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] }
      },
      orderBy: { slaDueDate: 'asc' },
      include: { category: true }
    })

    return (
      <HRDashboard 
        metrics={{ totalOpen, overdue, avgResolutionTime }}
        myCases={myCases}
        slaCounts={{ overdue, dueToday, dueThisWeek }}
      />
    )
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
