import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import EmployeeCommentSection from "./EmployeeCommentSection"
import StatusTimeline from "./StatusTimeline"
import SatisfactionSurvey from "./SatisfactionSurvey"
import { Clock, ShieldAlert, FileText } from "lucide-react"

export default async function GrievanceDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  // Await params if needed in Next.js 15, but Next.js 14 params are synchronous mostly, though Next 15 requires awaiting params
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

  if (!grievance) {
    notFound()
  }

  // Ensure employee can only see their own, HR/Admin can see all
  if (session.user.role === "EMPLOYEE" && grievance.employeeId !== session.user.id) {
    redirect("/dashboard")
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800'
      case 'UNDER_REVIEW': return 'bg-purple-100 text-purple-800'
      case 'INVESTIGATION': return 'bg-amber-100 text-amber-800'
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800'
      case 'CLOSED': return 'bg-slate-100 text-slate-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
      {/* Main Content */}
      <div className="md:col-span-2 space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{grievance.ticketNumber}</h1>
            <Badge className={`${getStatusColor(grievance.status)} hover:${getStatusColor(grievance.status)} border-none`}>
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

            {grievance.isAnonymous && session.user.role === "EMPLOYEE" && (
              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-500 text-sm p-3 rounded-md flex items-center gap-2 border border-amber-200 dark:border-amber-900/50">
                <ShieldAlert className="h-4 w-4" />
                This grievance was submitted anonymously. Your identity is hidden.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Satisfaction Survey - Only for the employee when RESOLVED */}
        {(grievance.status === 'RESOLVED' || grievance.status === 'CLOSED') && session.user.id === grievance.employeeId && (
          <SatisfactionSurvey 
            grievanceId={grievance.id} 
            initialScore={grievance.satisfactionScore} 
            initialFeedback={grievance.satisfactionFeedback} 
          />
        )}

        {/* Comment Section */}
        <EmployeeCommentSection 
          grievance={grievance}
          currentUser={session.user} 
        />
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticket Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                {grievance.isAnonymous && session.user.role !== "ADMIN" 
                  ? "Anonymous Employee" 
                  : grievance.employee?.name || "Unknown"}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline currentStatus={grievance.status} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
