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

  // Chart Data preparation
  const grievances = await prisma.grievance.findMany({
    select: { createdAt: true, status: true, category: { select: { name: true } }, site: { select: { name: true } } }
  })

  // Site-wise distribution
  const siteMap = new Map<string, number>()
  // Category-wise distribution
  const categoryMap = new Map<string, number>()
  // Monthly trend (last 6 months)
  const monthlyMap = new Map<string, number>()

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  grievances.forEach(g => {
    // Site
    const siteName = g.site?.name || "Unassigned"
    siteMap.set(siteName, (siteMap.get(siteName) || 0) + 1)
    
    // Category
    const catName = g.category?.name || "Uncategorized"
    categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1)
    
    // Monthly
    const date = new Date(g.createdAt)
    const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1)
  })

  const siteData = Array.from(siteMap, ([name, value]) => ({ name, value }))
  const categoryData = Array.from(categoryMap, ([name, value]) => ({ name, value }))
  
  // Sort monthly chronologically (basic implementation for the current year context)
  const monthlyData = Array.from(monthlyMap, ([name, value]) => ({ name, value })).reverse().slice(0, 6).reverse()

  const metrics = {
    totalGrievances, openCases, resolvedCases, overdueCases,
    totalEmployees, totalHR, totalSites, submittedToday
  }

  return (
    <AdminDashboardClient 
      metrics={metrics} 
      siteData={siteData} 
      categoryData={categoryData} 
      monthlyData={monthlyData} 
    />
  )
}
