import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import HRCommentSection from "./HRCommentSection"
import StatusTimeline from "@/app/(protected)/grievances/[id]/StatusTimeline"
import StatusUpdater from "./StatusUpdater"
import AssigneeUpdater from "./AssigneeUpdater"
import { Clock, ShieldAlert, AlertCircle, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function HRCaseDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    redirect("/dashboard")
  }

  const { id } = await params

  const grievance = await prisma.grievance.findUnique({
    where: { id },
    include: {
      category: true,
      assignedTo: { select: { name: true, image: true, role: true } },
      employee: {
        select: { name: true, department: true }
      },
      comments: {
        include: {
          author: { select: { name: true, role: true, image: true } }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  const hrUsers = await prisma.user.findMany({
    where: { role: { in: ["HR", "ADMIN"] } },
    select: { id: true, name: true }
  })

  if (!grievance) {
    notFound()
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

  const getSlaCountdown = (slaDate: Date | null) => {
    if (!slaDate) return null
    const now = new Date().getTime()
    const due = new Date(slaDate).getTime()
    const hoursLeft = Math.floor((due - now) / (1000 * 60 * 60))
    const daysLeft = Math.floor(hoursLeft / 24)
    
    if (hoursLeft < 0) return <span className="text-red-600 font-bold">Overdue by {Math.abs(hoursLeft)} hours</span>
    if (daysLeft > 0) return <span className="text-emerald-600 font-medium">{daysLeft} days remaining</span>
    return <span className="text-amber-600 font-bold">{hoursLeft} hours remaining</span>
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6 py-6 text-sm">
      {/* Main Content (60%) */}
      <div className="md:col-span-3 space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{grievance.ticketNumber}</h1>
            <Badge className={`${getStatusColor(grievance.status)} border-none`}>
              {grievance.status.replace('_', ' ')}
            </Badge>
          </div>
          <h2 className="text-xl text-slate-700 dark:text-slate-300 font-medium">{grievance.subject}</h2>
        </div>

        <Card>
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-indigo-500" /> 
              Grievance Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {grievance.description}
            </div>
            
            {grievance.isAnonymous && (
              <div className="bg-amber-50 text-amber-800 text-sm p-3 rounded-md border border-amber-200">
                <strong>Note:</strong> This grievance was submitted anonymously. Real name is shown here due to your HR privileges, but should be kept strictly confidential.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Action Button Row */}
        <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 mr-2">Quick Actions:</div>
          <div className="w-[180px]"><StatusUpdater grievanceId={grievance.id} currentStatus={grievance.status} /></div>
          <div className="w-[180px]"><AssigneeUpdater grievanceId={grievance.id} currentAssigneeId={grievance.assignedToId} hrUsers={hrUsers} /></div>
          <Button variant="outline" size="sm" className="ml-auto text-amber-600 border-amber-200 hover:bg-amber-50">
            <ArrowUpRight className="h-4 w-4 mr-2" /> Escalate
          </Button>
        </div>

        {/* Comment Section */}
        <HRCommentSection 
          grievanceId={grievance.id} 
          comments={grievance.comments} 
          currentUser={session.user} 
        />
      </div>

      {/* Sidebar (40%) */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticket Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Assigned HR Rep</p>
              <p className="font-medium mt-1 text-indigo-700 dark:text-indigo-400">{grievance.assignedTo?.name || "Unassigned"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Category</p>
              <p className="font-medium mt-1">{grievance.category.name}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Priority</p>
              <Badge variant="outline" className="mt-1">
                {grievance.priority}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Submitted By</p>
              <p className="font-medium mt-1">
                {grievance.employee?.name || "Unknown"} {grievance.isAnonymous && <Badge variant="secondary" className="ml-2 text-[10px]">ANONYMOUS</Badge>}
              </p>
              <p className="text-sm text-slate-500">{grievance.department}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Date Submitted</p>
              <p className="font-medium mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                {new Date(grievance.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">SLA Deadline</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-medium">
                  {grievance.slaDueDate ? new Date(grievance.slaDueDate).toLocaleDateString() : "N/A"}
                </span>
                {getSlaCountdown(grievance.slaDueDate)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Case History Log</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline currentStatus={grievance.status} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
