import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock, CheckCircle2, Inbox, Plus, Download, BarChart2, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import HRCasesTableClient from "./HRCasesTableClient"

export default async function HRCasesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    redirect("/dashboard")
  }

  const newComplaints = await prisma.grievance.count({
    where: { status: "SUBMITTED" }
  })

  const criticalComplaints = await prisma.grievance.count({
    where: { priority: "CRITICAL", status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } }
  })

  const now = new Date()
  const overdueCases = await prisma.grievance.count({
    where: { 
      status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] },
      slaDueDate: { lt: now }
    }
  })

  const myOpenCases = await prisma.grievance.count({
    where: { 
      status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] },
      assignedToId: session.user.id
    }
  })

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const startOfLastMonth = new Date(startOfMonth)
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)
  
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const resolvedThisMonth = await prisma.grievance.count({
    where: {
      status: "RESOLVED",
      updatedAt: { gte: startOfMonth }
    }
  })

  const resolvedLastMonth = await prisma.grievance.count({
    where: {
      status: "RESOLVED",
      updatedAt: { gte: startOfLastMonth, lt: startOfMonth }
    }
  })

  const resolvedToday = await prisma.grievance.count({
    where: {
      status: "RESOLVED",
      updatedAt: { gte: startOfDay }
    }
  })

  const totalOpenCases = await prisma.grievance.count({
    where: { status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } }
  })

  const myOpenCasesLastMonth = await prisma.grievance.count({
    where: { 
      status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] },
      assignedToId: session.user.id,
      createdAt: { lt: startOfMonth }
    }
  })

  const resolvedTrend = resolvedLastMonth === 0 ? 100 : Math.round(((resolvedThisMonth - resolvedLastMonth) / resolvedLastMonth) * 100)
  const openCasesTrend = myOpenCasesLastMonth === 0 ? 0 : Math.round(((myOpenCases - myOpenCasesLastMonth) / myOpenCasesLastMonth) * 100)

  const allGrievances = await prisma.grievance.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
      category: true, 
      employee: { select: { name: true } },
      assignedTo: { select: { name: true } }
    }
  })

  const hrUsers = await prisma.user.findMany({
    where: { role: { in: ["HR", "ADMIN"] } },
    select: { id: true, name: true }
  })

  const categories = await prisma.category.findMany()

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Case Management</h1>
          <div className="flex items-center text-slate-500 dark:text-slate-400 mt-1 space-x-2 text-sm">
            <span><strong className="font-medium text-slate-700 dark:text-slate-200">{allGrievances.length}</strong> Cases</span>
            <span>•</span>
            <span><strong className="font-medium text-slate-700 dark:text-slate-200">{totalOpenCases}</strong> Open</span>
            <span>•</span>
            <span><strong className="font-medium text-slate-700 dark:text-slate-200">{resolvedToday}</strong> Resolved Today</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Open Cases</CardTitle>
            <Inbox className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalOpenCases}</div>
            <p className="text-xs text-slate-500 mt-1">Across all sites</p>
          </CardContent>
        </Card>
        
        <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Critical Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{criticalComplaints}</div>
            <p className="text-xs text-slate-500 mt-1">Needs Immediate Attention</p>
          </CardContent>
        </Card>

        <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Overdue Cases</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{overdueCases}</div>
            <p className="text-xs text-slate-500 mt-1">Past SLA Deadline</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Grievances</CardTitle>
        </CardHeader>
        <CardContent>
          <HRCasesTableClient 
            grievances={allGrievances} 
            hrUsers={hrUsers} 
            categories={categories}
            currentUserId={session.user.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
