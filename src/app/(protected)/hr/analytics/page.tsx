import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AnalyticsDashboard from "@/components/AnalyticsDashboard"

export default async function HRAnalyticsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    redirect("/dashboard")
  }

  // Calculate live stats
  const total = await prisma.grievance.count()
  
  const pendingCount = await prisma.grievance.count({
    where: { 
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "ASSIGNED", "IN_PROGRESS"] }
    }
  })
  
  const resolvedCount = await prisma.grievance.count({
    where: { 
      status: { in: ["RESOLVED", "CLOSED"] }
    }
  })

  // Calculate overdue (where SLA date is past due and it's not resolved/closed/rejected)
  const overdueCount = await prisma.grievance.count({
    where: {
      slaDueDate: { lt: new Date() },
      status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] }
    }
  })

  const stats = {
    total,
    pending: pendingCount,
    resolved: resolvedCount,
    overdue: overdueCount
  }

  return (
    <div className="py-6">
      <AnalyticsDashboard stats={stats} />
    </div>
  )
}
