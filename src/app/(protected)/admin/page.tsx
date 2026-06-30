import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminDashboardClient from "./AdminDashboardClient"

export default async function AdminOverviewPage(props: {
  searchParams: Promise<{ site?: string, dateRange?: string, department?: string }>
}) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // Parse filters
  const siteFilter = searchParams.site && searchParams.site !== "all" ? searchParams.site : undefined;
  const deptFilter = searchParams.department && searchParams.department !== "all" ? searchParams.department : undefined;
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
  if (deptFilter) baseWhere.department = deptFilter;
  if (dateFilter) baseWhere.createdAt = { gte: dateFilter };

  // Run all DB queries concurrently to fix waterfall performance issue
  const [
    totalGrievances,
    openCases,
    resolvedCases,
    overdueCases,
    totalEmployees,
    totalHR,
    totalSites,
    submittedToday,
    highPriorityCases,
    anonymousComplaints,
    escalatedCases,
    resolvedGrievances,
    grievancesThisMonth,
    grievancesLastMonth,
    grievances,
    recentLogs,
    availableSites
  ] = await Promise.all([
    prisma.grievance.count({ where: baseWhere }),
    prisma.grievance.count({ where: { ...baseWhere, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } } }),
    prisma.grievance.count({ where: { ...baseWhere, status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.grievance.count({ where: { ...baseWhere, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] }, slaDueDate: { lt: now } } }),
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
    prisma.user.count({ where: { role: { in: ["HR", "ADMIN"] } } }),
    prisma.site.count(),
    prisma.grievance.count({ where: { ...baseWhere, createdAt: { gte: todayStart } } }),
    prisma.grievance.count({ where: { ...baseWhere, priority: { in: ["HIGH", "CRITICAL"] }, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } } }),
    prisma.grievance.count({ where: { ...baseWhere, isAnonymous: true } }),
    prisma.grievance.count({ where: { ...baseWhere, escalationLevel: { gt: 0 }, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } } }),
    prisma.grievance.findMany({ where: { ...baseWhere, status: { in: ["RESOLVED", "CLOSED"] }, dateResolved: { not: null } }, select: { createdAt: true, dateResolved: true } }),
    prisma.grievance.count({ where: { ...baseWhere, createdAt: { gte: startOfThisMonth } } }),
    prisma.grievance.count({ where: { ...baseWhere, createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
    prisma.grievance.findMany({ where: baseWhere, select: { createdAt: true, status: true, priority: true, category: { select: { name: true } }, site: { select: { name: true } } } }),
    prisma.grievanceLog.findMany({ where: { grievance: baseWhere }, orderBy: { createdAt: 'desc' }, take: 5, include: { grievance: { select: { ticketNumber: true } } } }),
    prisma.site.findMany({ select: { id: true, name: true } })
  ])

  // Resolution Time calculation
  let averageResolutionTime = 0
  if (resolvedGrievances.length > 0) {
    const totalDays = resolvedGrievances.reduce((acc, curr) => {
      const diffTime = Math.abs(curr.dateResolved!.getTime() - curr.createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return acc + diffDays;
    }, 0)
    averageResolutionTime = Number((totalDays / resolvedGrievances.length).toFixed(1))
  }

  // Month-over-month trend for Total Grievances
  let trendPercentage = 0;
  if (grievancesLastMonth > 0) {
    trendPercentage = Math.round(((grievancesThisMonth - grievancesLastMonth) / grievancesLastMonth) * 100)
  } else if (grievancesThisMonth > 0) {
    trendPercentage = 100 // if 0 last month but some this month
  }

  // Chart Data preparation
  const siteMap = new Map<string, number>()
  const monthlyMap = new Map<string, number>()
  const statusMap = new Map<string, number>()
  const priorityMap = new Map<string, number>()

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  grievances.forEach(g => {
    // Site
    const siteName = g.site?.name || "Unassigned"
    siteMap.set(siteName, (siteMap.get(siteName) || 0) + 1)
    
    // Status
    statusMap.set(g.status, (statusMap.get(g.status) || 0) + 1)

    // Priority
    priorityMap.set(g.priority, (priorityMap.get(g.priority) || 0) + 1)

    // Monthly
    const date = new Date(g.createdAt)
    const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1)
  })

  const siteData = Array.from(siteMap, ([name, value]) => ({ name, value }))
  const statusData = Array.from(statusMap, ([name, value]) => ({ name, value }))
  const priorityData = Array.from(priorityMap, ([name, value]) => ({ name, value }))
  
  // Sort monthly chronologically
  const monthlyData = Array.from(monthlyMap, ([name, value]) => ({ name, value })).reverse().slice(0, 6).reverse()
  
  // If no logs exist, fetch recent grievances as fallback activity
  let recentActivity = recentLogs.map(log => ({
    id: log.id,
    time: log.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    action: log.action,
    details: log.details || `Ticket ${log.grievance?.ticketNumber || 'Unknown'} updated`,
    changedBy: log.changedBy || 'System'
  }))

  if (recentActivity.length === 0) {
    const recentGrievances = await prisma.grievance.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: { id: true, ticketNumber: true, createdAt: true, status: true, employee: { select: { name: true } } }
    })
    
    recentActivity = recentGrievances.map(g => ({
      id: g.id,
      time: g.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      action: "SUBMITTED",
      details: `Grievance ${g.ticketNumber} submitted`,
      changedBy: g.employee?.name || "Anonymous"
    }))
  }

  const metrics = {
    totalGrievances, openCases, resolvedCases, overdueCases,
    totalEmployees, totalHR, totalSites, submittedToday,
    highPriorityCases, anonymousComplaints, escalatedCases, averageResolutionTime,
    trendPercentage
  }

  return (
    <AdminDashboardClient 
      metrics={metrics} 
      siteData={siteData} 
      statusData={statusData}
      priorityData={priorityData}
      monthlyData={monthlyData} 
      recentActivity={recentActivity}
      availableSites={availableSites}
    />
  )
}

