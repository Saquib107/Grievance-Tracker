import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import HRDashboardClient from "./HRDashboardClient"

export default async function HRDashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) return null

  // Fetch HR User details and Site
  const hrUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { site: true }
  })

  const siteId = hrUser?.siteId || ""
  const siteName = hrUser?.site?.name || "Corporate Hub"
  
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Base query for this HR's site
  const siteQuery = siteId ? { siteId } : {}

  // Run all independent DB queries concurrently
  const [
    pendingApproval,
    pendingNewToday,
    assignedToMe,
    inProgress,
    overdueSLA,
    closedToday,
    resolvedCases,
    urgentCasesRaw,
    reviewCount,
    resolvedCount,
    catGroups,
    allCats,
    deptGroups
  ] = await Promise.all([
    prisma.grievance.count({ where: { ...siteQuery, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.grievance.count({ where: { ...siteQuery, status: { in: ["SUBMITTED", "UNDER_REVIEW"] }, createdAt: { gte: todayStart } } }),
    prisma.grievance.count({ where: { assignedToId: userId, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } } }),
    prisma.grievance.count({ where: { ...siteQuery, status: "INVESTIGATION" } }),
    prisma.grievance.count({ where: { ...siteQuery, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] }, slaDueDate: { lt: now } } }),
    prisma.grievance.count({ where: { ...siteQuery, status: { in: ["RESOLVED", "CLOSED"] }, dateResolved: { gte: todayStart } } }),
    prisma.grievance.findMany({ where: { ...siteQuery, status: { in: ["RESOLVED", "CLOSED"] } }, select: { createdAt: true, dateResolved: true, slaDueDate: true } }),
    prisma.grievance.findMany({
      where: { ...siteQuery, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] }, OR: [{ slaDueDate: { lt: now } }, { priority: { in: ["HIGH", "CRITICAL"] } }] },
      include: { category: true },
      take: 4,
      orderBy: { slaDueDate: 'asc' }
    }),
    prisma.grievance.count({ where: { ...siteQuery, status: "UNDER_REVIEW" } }),
    prisma.grievance.count({ where: { ...siteQuery, status: "RESOLVED" } }),
    prisma.grievance.groupBy({ by: ['categoryId'], where: { ...siteQuery }, _count: { id: true } }),
    prisma.category.findMany(),
    prisma.grievance.groupBy({ by: ['department'], where: { ...siteQuery }, _count: { id: true } })
  ])

  // Calculate Avg Resolution & SLA
  let totalResolutionDays = 0
  let slaMet = 0
  
  resolvedCases.forEach(c => {
    if (c.dateResolved) {
      const days = (c.dateResolved.getTime() - c.createdAt.getTime()) / (1000 * 3600 * 24)
      totalResolutionDays += days
      if (c.slaDueDate && c.dateResolved <= c.slaDueDate) {
        slaMet++
      }
    }
  })

  const avgResolutionDays = resolvedCases.length > 0 ? (totalResolutionDays / resolvedCases.length).toFixed(1) : 0
  const slaCompliancePct = resolvedCases.length > 0 ? Math.round((slaMet / resolvedCases.length) * 100) : 100

  // 2. Urgent Cases
  const urgentCases = urgentCasesRaw.map(c => ({
    id: c.id,
    ticketNumber: c.ticketNumber,
    category: c.category?.name || "General",
    department: c.department || "Unknown",
    urgency: c.slaDueDate && c.slaDueDate < now ? "Overdue" : "Urgent",
    message: c.slaDueDate && c.slaDueDate < now ? "SLA Overdue" : "Critical Priority",
    color: c.slaDueDate && c.slaDueDate < now ? "red" : "amber"
  }))

  // 3. Activity Feed (Mocked dynamically for UI since logs might be empty in new DB)
  const recentActivity = [
    { time: "09:20 AM", text: "New grievance submitted (#EMP-2041)" },
    { time: "10:15 AM", text: "You assigned Case #EMP-2035 to yourself" },
    { time: "11:30 AM", text: "Employee uploaded document to #EMP-2029" },
    { time: "12:45 PM", text: "Status changed to Investigation for #EMP-2010" }
  ]

  // 4. Pipeline
  const pipeline = [
    { name: "Submitted", value: pendingApproval },
    { name: "Review", value: reviewCount },
    { name: "Investigation", value: inProgress },
    { name: "Resolved", value: resolvedCount }
  ]

  // 5. Categories
  const categories = catGroups.map(cg => {
    const name = allCats.find(c => c.id === cg.categoryId)?.name || "Other"
    return { name, value: cg._count.id }
  }).sort((a,b) => b.value - a.value).slice(0, 5)

  if (categories.length === 0) categories.push({ name: "General", value: 1 })

  // 6. Departments
  const departments = deptGroups
    .filter(dg => dg.department)
    .map(dg => ({ name: dg.department!, value: dg._count.id }))
    .sort((a,b) => b.value - a.value).slice(0, 5)
    
  if (departments.length === 0) departments.push({ name: "General", value: 1 })

  // 7. Monthly Trend (Mocking historical data since DB is new)
  const monthlyTrend = [
    { month: "Jan", cases: 24 },
    { month: "Feb", cases: 35 },
    { month: "Mar", cases: 28 },
    { month: "Apr", cases: 42 },
    { month: "May", cases: 38 },
    { month: "Jun", cases: 45 }
  ]

  const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }

  const dashboardData = {
    user: { 
      name: hrUser?.name || "HR Manager", 
      siteName: siteName,
      dateStr: now.toLocaleDateString('en-US', dateOptions)
    },
    kpis: {
      pendingApproval, pendingNewToday,
      assignedToMe,
      inProgress,
      overdueSLA: overdueSLA,
      closedToday,
      avgResolutionDays: Number(avgResolutionDays),
      slaCompliancePct: slaCompliancePct,
      employeeSatisfaction: 4.6
    },
    urgentCases,
    recentActivity,
    pipeline,
    categories,
    departments,
    monthlyTrend,
    nearSLA: [],
    performance: {
      assigned: assignedToMe + closedToday + inProgress,
      closed: closedToday,
      avgRes: Number(avgResolutionDays),
      sla: slaCompliancePct,
      rating: 4.6
    },
    pendingResponse: [],
    workload: {
      assigned: assignedToMe,
      recommended: 15,
      status: (assignedToMe > 15 ? "Heavy Workload" : "Healthy") as "Healthy" | "Heavy Workload"
    },
    notifications: {
      grievances: pendingNewToday,
      slaAlerts: overdueSLA,
      escalations: 1
    },
    followups: []
  }

  return <HRDashboardClient data={dashboardData} />
}
