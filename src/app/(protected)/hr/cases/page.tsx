import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock, CheckCircle2, Inbox } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
  const resolvedThisMonth = await prisma.grievance.count({
    where: {
      status: "RESOLVED",
      updatedAt: { gte: startOfMonth }
    }
  })

  const allGrievances = await prisma.grievance.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
      category: true, 
      employee: { select: { name: true } },
      assignedTo: { select: { name: true } }
    }
  })

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'SUBMITTED': return 'bg-blue-600 text-white'
      case 'UNDER_REVIEW': return 'bg-purple-600 text-white'
      case 'INVESTIGATION': return 'bg-amber-500 text-white'
      case 'ACTION_TAKEN': return 'bg-blue-700 text-white'
      case 'RESOLVED': return 'bg-emerald-600 text-white'
      case 'CLOSED': return 'bg-slate-700 text-white'
      case 'REJECTED': return 'bg-red-600 text-white'
      default: return 'bg-slate-600 text-white'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'LOW': return 'text-slate-500'
      case 'MEDIUM': return 'text-blue-500'
      case 'HIGH': return 'text-amber-500'
      case 'CRITICAL': return 'text-red-500 font-bold'
      default: return 'text-slate-500'
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Case Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage, investigate, and resolve employee grievances.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">My Open Cases</CardTitle>
            <Inbox className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{myOpenCases}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Critical Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{criticalComplaints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Overdue Cases</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{overdueCases}</div>
            <p className="text-xs text-slate-500 mt-1">Past SLA Deadline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Resolved This Month</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{resolvedThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Grievances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allGrievances.map((g) => (
                  <TableRow key={g.id} className="h-10 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                    <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                      <Link href={`/hr/cases/${g.id}`}>{g.ticketNumber}</Link>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{g.subject}</TableCell>
                    <TableCell>{g.category.name}</TableCell>
                    <TableCell>
                      {g.isAnonymous ? "Anonymous" : g.employee?.name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {g.assignedTo?.name || "Unassigned"}
                    </TableCell>
                    <TableCell className={getPriorityColor(g.priority)}>
                      {g.priority}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getStatusColor(g.status)} border-none`}>
                        {g.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                      {g.slaDueDate ? new Date(g.slaDueDate).toLocaleDateString() : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
