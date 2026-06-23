"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Info, ShieldAlert, CheckCircle2, ChevronRight, FileText } from "lucide-react"

export default function EmployeeDashboard({ 
  user, 
  activeGrievances 
}: { 
  user: any, 
  activeGrievances: any[] 
}) {
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

  const calculateDaysOpen = (date: Date) => {
    const diffTime = Math.abs(new Date().getTime() - new Date(date).getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-8">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 rounded-2xl p-6 sm:p-10 border border-sky-100 dark:border-sky-900/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-3 text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-lg text-lg">
            A safe space to voice your concerns. We are committed to maintaining a trustworthy and respectful workplace.
          </p>
        </div>
        <Link 
          href="/grievances/new" 
          className={buttonVariants({ 
            size: "lg", 
            className: "bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200 dark:shadow-none transition-all hover:scale-105" 
          })}
        >
          Submit New Grievance
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Grievances Timeline/Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-sky-500" />
              Active Grievances
            </h2>
            <Link href="/grievances" className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {activeGrievances.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="bg-sky-100 dark:bg-sky-900/50 p-3 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">You have no active grievances.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeGrievances.map((g) => (
                <Card key={g.id} className="overflow-hidden hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row">
                    <div className="p-5 flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-1">{g.ticketNumber}</p>
                          <h3 className="font-semibold text-lg line-clamp-1">{g.subject}</h3>
                        </div>
                        <Badge variant="outline" className={`${getStatusColor(g.status)} uppercase tracking-wider text-[10px] font-bold`}>
                          {g.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm">
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <FileText className="h-4 w-4 mr-2 opacity-70" />
                          {g.category.name}
                        </div>
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4 mr-2 opacity-70" />
                          {calculateDaysOpen(g.createdAt)} days open
                        </div>
                      </div>
                    </div>
                    
                    {/* HR Assignee Section */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 sm:w-48 flex flex-row sm:flex-col items-center sm:justify-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800">
                      <div className="flex flex-col sm:items-center w-full">
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-2 hidden sm:block">Assigned HR</p>
                        {g.assignedTo ? (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-slate-800 shadow-sm">
                              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                                {g.assignedTo.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{g.assignedTo.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-500">
                            <div className="h-8 w-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center bg-white dark:bg-transparent">
                              <span className="text-xs">--</span>
                            </div>
                            <span className="text-sm italic">Unassigned</span>
                          </div>
                        )}
                      </div>
                      <Link href={`/grievances/${g.id}`} className="ml-auto sm:ml-0 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full text-sky-600 border-sky-200 hover:bg-sky-50 dark:hover:bg-sky-900/20">
                          View details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Info className="h-5 w-5 text-sky-500" />
            What happens next?
          </h2>
          
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-4 flex gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 flex items-center justify-center font-bold text-xs">1</div>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">Under Review</h4>
                    <p className="text-sm text-slate-500 mt-1">HR acknowledges receipt and assesses the priority and appropriate handler.</p>
                  </div>
                </div>
                
                <div className="p-4 flex gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center font-bold text-xs">2</div>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">Investigation</h4>
                    <p className="text-sm text-slate-500 mt-1">HR gathers information. You may be contacted via the ticket's secure chat for details.</p>
                  </div>
                </div>
                
                <div className="p-4 flex gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center font-bold text-xs">3</div>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">Resolution</h4>
                    <p className="text-sm text-slate-500 mt-1">An outcome is reached and action is taken. You will have a chance to rate the handling.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
            <ShieldAlert className="h-5 w-5 flex-shrink-0 text-slate-400 mt-0.5" />
            <p>Your privacy is important. Submissions marked as anonymous will hide your identity from the assigned HR manager.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
