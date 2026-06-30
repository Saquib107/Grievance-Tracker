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

  // Fetch only what's needed using fewer queries to prevent exhausting the DB connection pool
  const [
    grievances,
    totalEmployees,
    totalHR,
    totalSites,
    recentLogs
  ] = await Promise.all([
    prisma.grievance.findMany({ 
      select: { 
        id: true, createdAt: true, status: true, priority: true, isAnonymous: true, 
        escalationLevel: true, dateResolved: true, slaDueDate: true, 
        site: { select: { name: true } }, ticketNumber: true, employee: { select: { name: true } }
      } 
    }),
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
    prisma.user.count({ where: { role: { in: ["HR", "ADMIN"] } } }),
    prisma.site.count(),
    prisma.grievanceLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { grievance: { select: { ticketNumber: true } } } })
  ])

  // In-memory calculations
  let totalGrievances = grievances.length;
  let openCases = 0;
  let resolvedCases = 0;
  let overdueCases = 0;
  let submittedToday = 0;
  let highPriorityCases = 0;
  let anonymousComplaints = 0;
  let escalatedCases = 0;
  let grievancesThisMonth = 0;
  let grievancesLastMonth = 0;
  let resolvedGrievances: any[] = [];
  
  const siteMap = new Map<string, number>()
  const monthlyMap = new Map<string, number>()
  const statusMap = new Map<string, number>()
  const priorityMap = new Map<string, number>()
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  for (const g of grievances) {
    const isResolved = g.status === "RESOLVED" || g.status === "CLOSED";
    const isRejected = g.status === "REJECTED";
    const isOpen = !isResolved && !isRejected;

    if (isOpen) openCases++;
    if (isResolved) {
      resolvedCases++;
      if (g.dateResolved) resolvedGrievances.push(g);
    }
    if (isOpen && g.slaDueDate && g.slaDueDate < now) overdueCases++;
    if (g.createdAt >= todayStart) submittedToday++;
    if ((g.priority === "HIGH" || g.priority === "CRITICAL") && isOpen) highPriorityCases++;
    if (g.isAnonymous) anonymousComplaints++;
    if (g.escalationLevel > 0 && isOpen) escalatedCases++;
    if (g.createdAt >= startOfThisMonth) grievancesThisMonth++;
    if (g.createdAt >= startOfLastMonth && g.createdAt < startOfThisMonth) grievancesLastMonth++;

    // Charts
    const siteName = g.site?.name || "Unassigned"
    siteMap.set(siteName, (siteMap.get(siteName) || 0) + 1)
    statusMap.set(g.status, (statusMap.get(g.status) || 0) + 1)
    priorityMap.set(g.priority, (priorityMap.get(g.priority) || 0) + 1)
    const d = new Date(g.createdAt)
    const mKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
    monthlyMap.set(mKey, (monthlyMap.get(mKey) || 0) + 1)
  }

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

