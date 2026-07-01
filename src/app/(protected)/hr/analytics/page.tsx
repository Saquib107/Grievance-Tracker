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

  const now = new Date()

  // Single fast query instead of multiple counts
  const grievances = await prisma.grievance.findMany({ 
    select: { createdAt: true, status: true, priority: true, department: true, dateResolved: true, slaDueDate: true } 
  });

  let total = grievances.length;
  let pendingCount = 0;
  let resolvedCount = 0;
  let overdueCount = 0;


  const priorityMap = new Map<string, number>()
  const statusMap = new Map<string, number>()
  
  // Real data calculations
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  // 1. Monthly Data (Last 6 months)
  const monthlyMap = new Map<string, { total: number, resolved: number, pending: number }>()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthlyMap.set(`${monthNames[d.getMonth()]}`, { total: 0, resolved: 0, pending: 0 })
  }


  grievances.forEach(g => {
    // Top Stats
    if (g.status === "RESOLVED" || g.status === "CLOSED") resolvedCount++;
    else if (g.status !== "REJECTED") {
      if (["SUBMITTED", "UNDER_REVIEW", "APPROVED", "ASSIGNED", "IN_PROGRESS"].includes(g.status)) pendingCount++;
      if (g.slaDueDate && g.slaDueDate < now) overdueCount++;
    }

    // Priority
    priorityMap.set(g.priority, (priorityMap.get(g.priority) || 0) + 1)
    // Status
    statusMap.set(g.status, (statusMap.get(g.status) || 0) + 1)

    // Monthly
    const d = new Date(g.createdAt)
    const mKey = monthNames[d.getMonth()]
    if (monthlyMap.has(mKey)) {
      const mData = monthlyMap.get(mKey)!
      mData.total += 1;
      if (g.status === "RESOLVED" || g.status === "CLOSED") mData.resolved += 1;
      else if (g.status !== "REJECTED") mData.pending += 1;
    }


  })

  const monthlyData = Array.from(monthlyMap, ([name, data]) => ({ name, ...data }))
  const priorityData = Array.from(priorityMap, ([name, value]) => ({ name, value }))
  const statusData = Array.from(statusMap, ([name, value]) => ({ name, value }))

  return (
    <div className="py-6">
      <AnalyticsDashboard 
        stats={{ total, pending: pendingCount, resolved: resolvedCount, overdue: overdueCount }} 
        monthlyData={monthlyData}
        priorityData={priorityData}
        statusData={statusData}
      />
    </div>
  )
}
