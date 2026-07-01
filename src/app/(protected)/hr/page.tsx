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
    urgentCasesRaw
  ] = await Promise.all([
    prisma.grievance.count({ where: { ...siteQuery, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.grievance.count({ where: { ...siteQuery, status: { in: ["SUBMITTED", "UNDER_REVIEW"] }, createdAt: { gte: todayStart } } }),
    prisma.grievance.count({ where: { assignedToId: userId, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } } }),
    prisma.grievance.count({ where: { ...siteQuery, status: "INVESTIGATION" } }),
    prisma.grievance.count({ where: { ...siteQuery, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] }, slaDueDate: { lt: now } } }),
    prisma.grievance.findMany({
      where: { ...siteQuery, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] }, OR: [{ slaDueDate: { lt: now } }, { priority: { in: ["HIGH", "CRITICAL"] } }] },
      include: { category: true },
      take: 4,
      orderBy: { slaDueDate: 'asc' }
    })
  ])



  const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }

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
      overdueSLA: overdueSLA
    },
    urgentCases,
    recentActivity,
    notifications: {
      grievances: pendingNewToday,
      slaAlerts: overdueSLA,
      escalations: 1
    }
  }

  return <HRDashboardClient data={dashboardData} />
}
