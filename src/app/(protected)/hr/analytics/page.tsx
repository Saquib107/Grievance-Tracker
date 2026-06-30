import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AnalyticsDashboard from "@/components/AnalyticsDashboard"

export default async function HRAnalyticsPage(props: {
  searchParams: Promise<{ site?: string, dateRange?: string, category?: string }>
}) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    redirect("/dashboard")
  }

  const now = new Date()

  // Parse filters
  const siteFilter = searchParams.site && searchParams.site !== "all" ? searchParams.site : undefined;
  const categoryFilter = searchParams.category && searchParams.category !== "all" ? searchParams.category : undefined;
  let dateFilter = undefined;
  if (searchParams.dateRange === '7days') dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  else if (searchParams.dateRange === 'month') dateFilter = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  else if (searchParams.dateRange === 'year') dateFilter = new Date(now.getFullYear(), 0, 1);
  else if (searchParams.dateRange === 'thisQuarter') {
    const q = Math.floor(now.getMonth() / 3);
    dateFilter = new Date(now.getFullYear(), q * 3, 1);
  }

  // Base where clause for grievances
  const baseWhere: any = {};
  if (siteFilter) baseWhere.siteId = siteFilter;
  if (categoryFilter) {
    const cat = await prisma.category.findFirst({ where: { name: { equals: categoryFilter, mode: 'insensitive' } } });
    if (cat) baseWhere.categoryId = cat.id;
  }
  if (dateFilter) baseWhere.createdAt = { gte: dateFilter };

  // Calculate live stats
  const [
    total,
    pendingCount,
    resolvedCount,
    overdueCount,
    grievances,
    availableSites,
    availableCategories
  ] = await Promise.all([
    prisma.grievance.count({ where: baseWhere }),
    prisma.grievance.count({ where: { ...baseWhere, status: { in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "ASSIGNED", "IN_PROGRESS"] } } }),
    prisma.grievance.count({ where: { ...baseWhere, status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.grievance.count({ where: { ...baseWhere, slaDueDate: { lt: now }, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } } }),
    prisma.grievance.findMany({ where: baseWhere, select: { createdAt: true, status: true, priority: true, department: true, dateResolved: true, slaDueDate: true } }),
    prisma.site.findMany({ select: { id: true, name: true } }),
    prisma.category.findMany({ select: { id: true, name: true } })
  ])

  const stats = {
    total,
    pending: pendingCount,
    resolved: resolvedCount,
    overdue: overdueCount
  }

  // Real data calculations
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  // 1. Monthly Data (Last 6 months)
  const monthlyMap = new Map<string, { total: number, resolved: number, pending: number }>()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthlyMap.set(`${monthNames[d.getMonth()]}`, { total: 0, resolved: 0, pending: 0 })
  }

  // 2. Priority Data
  const priorityMap = new Map<string, number>()
  // 3. Status Data
  const statusMap = new Map<string, number>()
  // 4. Dept Data
  const deptMap = new Map<string, number>()
  
  // Resolution Time & SLA
  const slaMap = new Map<string, { total: number, compliant: number }>()
  const resTimeMap = new Map<string, { totalDays: number, count: number }>()

  grievances.forEach(g => {
    // Priority
    priorityMap.set(g.priority, (priorityMap.get(g.priority) || 0) + 1)
    // Status
    statusMap.set(g.status, (statusMap.get(g.status) || 0) + 1)
    // Dept
    const dept = g.department || "Unknown"
    deptMap.set(dept, (deptMap.get(dept) || 0) + 1)

    // Monthly
    const d = new Date(g.createdAt)
    const mKey = monthNames[d.getMonth()]
    if (monthlyMap.has(mKey)) {
      const mData = monthlyMap.get(mKey)!
      mData.total += 1;
      if (g.status === "RESOLVED" || g.status === "CLOSED") mData.resolved += 1;
      else if (g.status !== "REJECTED") mData.pending += 1;
    }

    // SLA & Resolution Time
    if (g.status === "RESOLVED" || g.status === "CLOSED") {
      if (!slaMap.has(mKey)) slaMap.set(mKey, { total: 0, compliant: 0 })
      const sData = slaMap.get(mKey)!
      sData.total += 1;
      if (g.dateResolved && g.slaDueDate && g.dateResolved <= g.slaDueDate) sData.compliant += 1;

      if (g.dateResolved) {
        if (!resTimeMap.has(mKey)) resTimeMap.set(mKey, { totalDays: 0, count: 0 })
        const rData = resTimeMap.get(mKey)!
        rData.count += 1;
        const diffTime = Math.abs(g.dateResolved.getTime() - g.createdAt.getTime());
        rData.totalDays += Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }
  })

  const monthlyData = Array.from(monthlyMap, ([name, data]) => ({ name, ...data }))
  const priorityData = Array.from(priorityMap, ([name, value]) => ({ name, value }))
  const statusData = Array.from(statusMap, ([name, value]) => ({ name, value }))
  const deptData = Array.from(deptMap, ([name, cases]) => ({ name, cases })).sort((a,b) => b.cases - a.cases).slice(0, 5) // Top 5
  
  const slaTrendData = monthlyData.map(m => {
    const s = slaMap.get(m.name)
    const compliance = s && s.total > 0 ? Math.round((s.compliant / s.total) * 100) : 100 // Default 100% if no resolved cases
    return { name: m.name, compliance }
  })

  const resolutionTimeData = monthlyData.map(m => {
    const r = resTimeMap.get(m.name)
    const days = r && r.count > 0 ? Number((r.totalDays / r.count).toFixed(1)) : 0
    return { name: m.name, days }
  })

  return (
    <div className="py-6">
      <AnalyticsDashboard 
        stats={stats} 
        monthlyData={monthlyData}
        priorityData={priorityData}
        statusData={statusData}
        deptData={deptData}
        slaTrendData={slaTrendData}
        resolutionTimeData={resolutionTimeData}
        availableSites={availableSites}
      />
    </div>
  )
}
