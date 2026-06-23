"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, Inbox, Calendar, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { updateGrievanceStatus } from "@/app/actions/grievance"
import { toast } from "sonner"

export default function HRDashboard({
  metrics,
  myCases,
  slaCounts,
}: {
  metrics: { totalOpen: number; overdue: number; avgResolutionTime: number }
  myCases: any[]
  slaCounts: { overdue: number; dueToday: number; dueThisWeek: number }
}) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      await updateGrievanceStatus(id, newStatus)
      toast.success(`Status updated to ${newStatus}`)
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">HR Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your active cases and SLA urgency.</p>
      </div>

      {/* KPI Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Open Cases</CardTitle>
            <Inbox className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.totalOpen}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Overdue SLA</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-500">{metrics.overdue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Avg Resolution</CardTitle>
            <Clock className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{metrics.avgResolutionTime.toFixed(1)} <span className="text-sm font-normal text-slate-500">days</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Queue */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>My Queue</CardTitle>
              <CardDescription>Grievances currently assigned to you for investigation.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {myCases.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  You have no cases assigned to you at the moment.
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead className="w-[100px]">Ticket ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>SLA Due</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myCases.map((g) => (
                      <TableRow key={g.id} className="h-10 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                          <Link href={`/hr/cases/${g.id}`}>{g.ticketNumber}</Link>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">{g.subject}</TableCell>
                        <TableCell className={getPriorityColor(g.priority)}>
                          {g.priority}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getStatusColor(g.status)} border-none text-[10px] whitespace-nowrap`}>
                            {g.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-xs">
                          {g.slaDueDate ? new Date(g.slaDueDate).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 px-3 text-xs font-medium bg-transparent hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-md inline-flex items-center justify-center">
                              Update
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => handleStatusChange(g.id, 'UNDER_REVIEW')}>
                                Under Review
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(g.id, 'INVESTIGATION')}>
                                Investigation
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(g.id, 'RESOLVED')}>
                                Resolved
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/hr/cases/${g.id}`)}>
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SLA Urgency Widget */}
        <div className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                SLA Urgency
              </h3>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overdue</span>
                  </div>
                  <span className="font-bold text-red-600">{slaCounts.overdue}</span>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Due Today</span>
                  </div>
                  <span className="font-bold text-amber-600">{slaCounts.dueToday}</span>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Due This Week</span>
                  </div>
                  <span className="font-bold text-slate-600 dark:text-slate-400">{slaCounts.dueThisWeek}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
