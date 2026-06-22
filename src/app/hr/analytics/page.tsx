import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AnalyticsCharts from "./AnalyticsCharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function HRAnalyticsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    redirect("/dashboard")
  }

  // Aggregate Data for Charts
  // 1. Category-wise complaints
  const categoryCounts = await prisma.grievance.groupBy({
    by: ['categoryId'],
    _count: {
      _all: true,
    },
  })

  const categories = await prisma.category.findMany()
  const categoryData = categoryCounts.map(cc => ({
    name: categories.find(c => c.id === cc.categoryId)?.name || 'Unknown',
    value: cc._count._all
  }))

  // 2. Department-wise complaints
  const departmentCounts = await prisma.grievance.groupBy({
    by: ['department'],
    _count: {
      _all: true,
    },
  })
  
  const departmentData = departmentCounts.map(dc => ({
    name: dc.department,
    value: dc._count._all
  }))

  // 3. Status Distribution
  const statusCounts = await prisma.grievance.groupBy({
    by: ['status'],
    _count: {
      _all: true,
    },
  })

  const statusData = statusCounts.map(sc => ({
    name: sc.status.replace('_', ' '),
    value: sc._count._all
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Visualize grievance trends and metrics across the organization.</p>
      </div>

      <AnalyticsCharts 
        categoryData={categoryData} 
        departmentData={departmentData}
        statusData={statusData}
      />
    </div>
  )
}
