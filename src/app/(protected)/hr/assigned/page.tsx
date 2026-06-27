import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import HRCasesTableClient from "../cases/HRCasesTableClient"

export default async function HRAssignedCasesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    redirect("/dashboard")
  }

  const currentUserId = session.user.id

  // Fetch only cases assigned to this user
  const assignedGrievances = await prisma.grievance.findMany({
    where: { assignedToId: currentUserId },
    orderBy: { createdAt: 'desc' },
    include: { 
      category: true, 
      employee: { select: { name: true } },
      assignedTo: { select: { name: true } }
    }
  })

  // Pre-fetch related data for the table component
  const hrUsers = await prisma.user.findMany({
    where: { role: { in: ["HR", "ADMIN"] } },
    select: { id: true, name: true }
  })

  const categories = await prisma.category.findMany()

  // Calculate stats for KPIs
  const totalAssigned = assignedGrievances.length
  
  const now = new Date()
  const overdueAssigned = assignedGrievances.filter(g => 
    g.status !== "RESOLVED" && g.status !== "CLOSED" && g.status !== "REJECTED" && 
    g.slaDueDate && new Date(g.slaDueDate) < now
  ).length

  const criticalAssigned = assignedGrievances.filter(g => 
    g.priority === "CRITICAL" && g.status !== "RESOLVED" && g.status !== "CLOSED" && g.status !== "REJECTED"
  ).length

  const resolvedAssigned = assignedGrievances.filter(g => g.status === "RESOLVED").length

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Assigned Cases</h1>
          <p className="text-slate-500 mt-1">Manage and resolve the grievances assigned directly to you.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer border-indigo-200 dark:border-indigo-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Assigned</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{totalAssigned}</div>
          </CardContent>
        </Card>

        <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Critical Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{criticalAssigned}</div>
          </CardContent>
        </Card>

        <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{overdueAssigned}</div>
          </CardContent>
        </Card>

        <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{resolvedAssigned}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Grievances List</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedGrievances.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-16">
              <div className="text-4xl">🎉</div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Assigned Cases</h3>
              <p className="text-slate-500">There are no assigned cases for this HR right now.</p>
            </div>
          ) : (
            <HRCasesTableClient 
              grievances={assignedGrievances} 
              hrUsers={hrUsers} 
              categories={categories}
              currentUserId={session.user.id}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
