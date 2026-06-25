import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ActivityTimeline from "./ActivityTimeline"
import ResolutionNotesForm from "./ResolutionNotesForm"
import SatisfactionSurvey from "./SatisfactionSurvey"
import { Clock, ShieldAlert, User, Briefcase, Paperclip, CheckCircle2, Calendar } from "lucide-react"

export default async function GrievanceDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
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
      },
      logs: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!grievance) {
    notFound()
  }

  const isHR = session.user.role === "HR" || session.user.role === "ADMIN"

  if (!isHR && grievance.employeeId !== session.user.id) {
    redirect("/dashboard")
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'UNDER_REVIEW': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'INVESTIGATION': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'CLOSED': return 'bg-slate-100 text-slate-800 border-slate-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'LOW': return 'bg-slate-100 text-slate-800'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800 font-bold border-red-200'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{grievance.ticketNumber}</h1>
            <Badge variant="outline" className={`${getStatusColor(grievance.status)} px-3 py-1 text-xs uppercase tracking-wider`}>
              {grievance.status.replace('_', ' ')}
            </Badge>
          </div>
          <h2 className="text-xl text-slate-600 dark:text-slate-400 font-medium">{grievance.subject}</h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className={`${getPriorityColor(grievance.priority)} px-3 py-1`}>
            {grievance.priority} Priority
          </Badge>
          <div className="flex items-center text-sm text-slate-500">
            <Calendar className="w-4 h-4 mr-2" />
            Submitted: {new Date(grievance.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Resolution */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Grievance Information */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-indigo-500" /> 
                Grievance Description
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                {grievance.description}
              </div>

              {grievance.isAnonymous && session.user.role === "EMPLOYEE" && (
                <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-500 text-sm p-4 rounded-lg flex items-start gap-3 border border-amber-200 dark:border-amber-900/50">
                  <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>This grievance was submitted anonymously. Your identity is hidden from HR and Management.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resolution & Attachments (HR Only or if Resolved) */}
          {(isHR || grievance.status === 'RESOLVED' || grievance.status === 'CLOSED') && (
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" /> 
                  Resolution Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {isHR ? (
                  <ResolutionNotesForm grievanceId={grievance.id} initialNotes={grievance.remark} />
                ) : (
                  <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
                    {grievance.remark || "No resolution notes provided yet."}
                  </div>
                )}

                {/* Satisfaction Survey - Only for the employee when RESOLVED */}
                {(grievance.status === 'RESOLVED' || grievance.status === 'CLOSED') && session.user.id === grievance.employeeId && (
                  <div className="pt-4 border-t">
                    <SatisfactionSurvey 
                      grievanceId={grievance.id} 
                      initialScore={grievance.satisfactionScore} 
                      initialFeedback={grievance.satisfactionFeedback} 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" /> 
                Activity & Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ActivityTimeline logs={grievance.logs} comments={grievance.comments} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Metadata Sidebar */}
        <div className="space-y-6">
          
          {/* Employee Information */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" /> Employee Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Reported By</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {grievance.isAnonymous && !isHR 
                    ? "Anonymous" 
                    : grievance.grievantName || grievance.employee?.name || "Walk-in / Unknown"}
                </p>
                {grievance.empIdGatepass && (
                  <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {grievance.empIdGatepass}</p>
                )}
              </div>
              <Separator />
              <div>
                <p className="text-slate-500 mb-1">Contact Details</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {grievance.grievantContact || "No contact provided"}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-slate-500 mb-1">Site / Location</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {grievance.location || grievance.employee?.department || "Unspecified"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Information */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-500" /> Ticket Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Category & Sentiment</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="secondary">{grievance.category?.name || 'Uncategorized'}</Badge>
                  {grievance.sentiment && <Badge variant="outline">{grievance.sentiment}</Badge>}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-slate-500 mb-1">Assigned To</p>
                <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  {grievance.assignedTo ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {grievance.assignedTo.name}
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Unassigned
                    </>
                  )}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-slate-500 mb-1">SLA Due Date</p>
                <p className={`font-semibold ${grievance.slaDueDate && new Date(grievance.slaDueDate) < new Date() && grievance.status !== 'RESOLVED' && grievance.status !== 'CLOSED' ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                  {grievance.slaDueDate ? new Date(grievance.slaDueDate).toLocaleString() : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Attachments Placeholder */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-slate-500" /> Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <Paperclip className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">No attachments found.</p>
                {isHR && <p className="text-xs text-slate-400 mt-1">Supabase Storage bucket integration pending.</p>}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
