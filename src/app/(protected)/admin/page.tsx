import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminDashboardClient from "./AdminDashboardClient"

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // KPI Metrics
  const totalGrievances = await prisma.grievance.count()
  const openCases = await prisma.grievance.count({
    where: { status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } }
  })
  const resolvedCases = await prisma.grievance.count({
    where: { status: { in: ["RESOLVED", "CLOSED"] } }
  })
  const overdueCases = await prisma.grievance.count({
    where: { 
      status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] },
      slaDueDate: { lt: now }
    }
  })
  
  const totalEmployees = await prisma.user.count({ where: { role: "EMPLOYEE" } })
  const totalHR = await prisma.user.count({ where: { role: { in: ["HR", "ADMIN"] } } })
  const totalSites = await prisma.site.count()
  
  const submittedToday = await prisma.grievance.count({
    where: { createdAt: { gte: todayStart } }
  })

  // New Metrics for Dashboard Improvements
  const highPriorityCases = await prisma.grievance.count({
    where: { 
      priority: { in: ["HIGH", "CRITICAL"] },
      status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] }
    }
  })

  const anonymousComplaints = await prisma.grievance.count({
    where: { isAnonymous: true }
  })

  const escalatedCases = await prisma.grievance.count({
    where: { escalationLevel: { gt: 0 }, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } }
  })

  // Resolution Time calculation
  const resolvedGrievances = await prisma.grievance.findMany({
    where: { status: { in: ["RESOLVED", "CLOSED"] }, dateResolved: { not: null } },
    select: { createdAt: true, dateResolved: true }
  })
  
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
  const grievancesThisMonth = await prisma.grievance.count({
    where: { createdAt: { gte: startOfThisMonth } }
  })
  const grievancesLastMonth = await prisma.grievance.count({
    where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } }
  })
  
  let trendPercentage = 0;
  if (grievancesLastMonth > 0) {
    trendPercentage = Math.round(((grievancesThisMonth - grievancesLastMonth) / grievancesLastMonth) * 100)
  } else if (grievancesThisMonth > 0) {
    trendPercentage = 100 // if 0 last month but some this month
  }

  // Chart Data preparation
  const grievances = await prisma.grievance.findMany({
    select: { createdAt: true, status: true, priority: true, category: { select: { name: true } }, site: { select: { name: true } } }
  })

  // Site-wise distribution
  const siteMap = new Map<string, number>()
  // Monthly trend (last 6 months)
  const monthlyMap = new Map<string, number>()
  
  // Status and Priority distributions
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

  // Recent Activity (Logs)
  let recentLogs = await prisma.grievanceLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      grievance: {
        select: { ticketNumber: true }
      }
    }
  })
  
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
    />
  )
}

