import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, Inbox, CheckCircle2, AlertCircle } from "lucide-react"

export default async function MyGrievancesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  const grievances = await prisma.grievance.findMany({
    where: { employeeId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  })

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'SUBMITTED': return 'bg-sky-100 text-sky-800 border-sky-200'
      case 'UNDER_REVIEW': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'INVESTIGATION': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'ACTION_TAKEN': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'CLOSED': return 'bg-slate-100 text-slate-800 border-slate-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getProgressState = (status: string) => {
    switch(status) {
      case 'SUBMITTED': return { width: '25%', label: 'Submitted' }
      case 'UNDER_REVIEW': return { width: '50%', label: 'Under Review' }
      case 'INVESTIGATION': return { width: '75%', label: 'Investigation' }
      case 'ACTION_TAKEN': return { width: '85%', label: 'Action Taken' }
      case 'RESOLVED': return { width: '100%', label: 'Resolved' }
      case 'CLOSED': return { width: '100%', label: 'Closed' }
      case 'REJECTED': return { width: '100%', label: 'Rejected', error: true }
      default: return { width: '0%', label: 'Unknown' }
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Grievances</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage all the grievances you have submitted.</p>
      </div>

      {grievances.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-full">
              <Inbox className="h-10 w-10 text-sky-500" />
            </div>
            <div className="max-w-sm space-y-2">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No grievances yet</h3>
              <p className="text-slate-500 dark:text-slate-400">You haven't submitted any grievances yet. Need help or want to voice a concern?</p>
            </div>
            <Link 
              href="/grievances/new" 
              className="mt-4 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded-lg transition-all"
            >
              Submit a Grievance
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {grievances.map((g) => {
            const progress = getProgressState(g.status)
            return (
              <Link key={g.id} href={`/grievances/${g.id}`} className="block group">
                <Card className="overflow-hidden hover:shadow-md hover:border-sky-200 dark:hover:border-sky-800 transition-all border-slate-200 dark:border-slate-800">
                  <div className="p-6 space-y-5">
                    {/* Header Row: Title and Badge */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 mb-1">{g.ticketNumber}</p>
                        <h3 className="font-semibold text-xl text-slate-900 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                          {g.subject}
                        </h3>
                      </div>
                      <Badge variant="outline" className={`${getStatusColor(g.status)} uppercase tracking-wider text-xs px-3 py-1 font-bold shrink-0`}>
                        {g.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Meta Info Row */}
                    <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm">
                      <div className="flex items-center text-slate-600 dark:text-slate-400">
                        <FileText className="h-4 w-4 mr-2 opacity-70" />
                        {g.category.name}
                      </div>
                      <div className="flex items-center text-slate-600 dark:text-slate-400">
                        <Clock className="h-4 w-4 mr-2 opacity-70" />
                        Submitted on {new Date(g.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Progress Bar Row */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 -mx-6 -mb-6 mt-4 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pipeline Stage</span>
                        <span className={`text-xs font-bold ${progress.error ? 'text-red-600' : 'text-sky-600'}`}>
                          {progress.label}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${progress.error ? 'bg-red-500' : 'bg-sky-500'}`}
                          style={{ width: progress.width }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium px-1">
                        <span>Submitted</span>
                        <span>Review</span>
                        <span>Investigation</span>
                        <span>Resolved</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
