import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) return null

  // Fetch metrics
  const totalGrievances = await prisma.grievance.count({
    where: { employeeId: userId }
  })
  
  const openCases = await prisma.grievance.count({
    where: { employeeId: userId, status: { in: ["SUBMITTED", "UNDER_REVIEW", "INVESTIGATION"] } }
  })
  
  const resolvedCases = await prisma.grievance.count({
    where: { employeeId: userId, status: "RESOLVED" }
  })
  
  const pendingAction = await prisma.grievance.count({
    where: { employeeId: userId, status: "ACTION_TAKEN" }
  })

  // Fetch recent
  const recentGrievances = await prisma.grievance.findMany({
    where: { employeeId: userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { category: true }
  })

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'UNDER_REVIEW': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'INVESTIGATION': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
      case 'CLOSED': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-slate-100 text-slate-800'
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back, {session.user.name?.split(' ')[0]}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here is the overview of your grievances.</p>
        </div>
        <Link href="/grievances/new" className={buttonVariants({ className: "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none" })}>
          Raise New Grievance
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Grievances</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalGrievances}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Open Cases</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">{openCases}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Action</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-500">{pendingAction}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Resolved Cases</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{resolvedCases}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Your most recent grievance tickets and their current status.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentGrievances.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>You haven't submitted any grievances yet.</p>
              <Link href="/grievances/new" className={buttonVariants({ variant: "link", className: "mt-2" })}>
                Create your first ticket
              </Link>
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentGrievances.map((g) => (
                    <TableRow key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                      <TableCell className="font-medium text-indigo-600 dark:text-indigo-400">
                        <Link href={`/grievances/${g.id}`}>{g.ticketNumber}</Link>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{g.subject}</TableCell>
                      <TableCell>{g.category.name}</TableCell>
                      <TableCell className={getPriorityColor(g.priority)}>
                        {g.priority}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(g.status)} border-none shadow-none`}>
                          {g.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
