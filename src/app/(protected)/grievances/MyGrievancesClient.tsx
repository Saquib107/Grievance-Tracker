"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Clock, Inbox, Search, SlidersHorizontal, CheckCircle2, ChevronRight } from "lucide-react"

export default function MyGrievancesClient({ 
  initialGrievances,
  categories
}: { 
  initialGrievances: any[],
  categories: any[]
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [dateFilter, setDateFilter] = useState("ALL")

  const filteredGrievances = useMemo(() => {
    let result = initialGrievances

    // Search Filter
    if (searchQuery) {
      const lower = searchQuery.toLowerCase()
      result = result.filter(g => 
        g.ticketNumber.toLowerCase().includes(lower) || 
        g.subject?.toLowerCase().includes(lower)
      )
    }

    // Status Filter
    if (statusFilter !== "ALL") {
      if (statusFilter === "OPEN") {
        result = result.filter(g => ['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATION', 'ACTION_TAKEN'].includes(g.status))
      } else {
        result = result.filter(g => g.status === statusFilter)
      }
    }

    // Category Filter
    if (categoryFilter !== "ALL") {
      result = result.filter(g => g.categoryId === categoryFilter)
    }

    // Date Filter
    if (dateFilter !== "ALL") {
      const now = new Date().getTime()
      let days = 30
      if (dateFilter === "7") days = 7
      if (dateFilter === "90") days = 90
      
      const cutoff = now - (days * 24 * 60 * 60 * 1000)
      result = result.filter(g => new Date(g.createdAt).getTime() >= cutoff)
    }

    return result
  }, [initialGrievances, searchQuery, statusFilter, categoryFilter, dateFilter])

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'SUBMITTED': return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300'
      case 'UNDER_REVIEW': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300'
      case 'INVESTIGATION': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300'
      case 'ACTION_TAKEN': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300'
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300'
      case 'CLOSED': return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300'
      case 'DRAFT': return 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-300'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getProgressState = (status: string) => {
    switch(status) {
      case 'DRAFT': return { step: 0, width: '5%', label: 'Draft', color: 'bg-slate-400' }
      case 'SUBMITTED': return { step: 1, width: '25%', label: 'Submitted', color: 'bg-sky-500' }
      case 'UNDER_REVIEW': return { step: 2, width: '50%', label: 'Under Review', color: 'bg-indigo-500' }
      case 'INVESTIGATION': return { step: 3, width: '75%', label: 'Investigation', color: 'bg-amber-500' }
      case 'ACTION_TAKEN': return { step: 3, width: '85%', label: 'Action Taken', color: 'bg-blue-500' }
      case 'RESOLVED': return { step: 4, width: '100%', label: 'Resolved', color: 'bg-emerald-500' }
      case 'CLOSED': return { step: 4, width: '100%', label: 'Closed', color: 'bg-slate-500' }
      case 'REJECTED': return { step: 4, width: '100%', label: 'Rejected', color: 'bg-red-500', error: true }
      default: return { step: 0, width: '0%', label: 'Unknown', color: 'bg-slate-400' }
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Grievances</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage all the grievances you have submitted.</p>
        </div>
        <Link href="/grievances/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md w-full md:w-auto">
            Raise New Grievance
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      {initialGrievances.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search Ticket Number or Subject..." 
                className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0">
                <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Filters</span>
              </div>
              
              <Select value={statusFilter} onValueChange={(val) => { if (val) setStatusFilter(val) }}>
                <SelectTrigger className="w-[140px] bg-white dark:bg-slate-950 border-slate-300 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="OPEN">Open Only</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="INVESTIGATION">Investigation</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={(val) => { if (val) setCategoryFilter(val) }}>
                <SelectTrigger className="w-[160px] bg-white dark:bg-slate-950 border-slate-300 text-sm hidden sm:flex">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grievance List */}
      {filteredGrievances.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-full">
              <span className="text-4xl">🎉</span>
            </div>
            <div className="max-w-sm space-y-2">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No active grievances</h3>
              <p className="text-slate-500 dark:text-slate-400">
                {searchQuery || statusFilter !== "ALL" 
                  ? "No grievances match your current filters." 
                  : "You haven't submitted any grievances yet. Need help or want to voice a concern?"}
              </p>
            </div>
            {(searchQuery || statusFilter !== "ALL") && (
              <Button variant="outline" onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); setCategoryFilter("ALL") }}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredGrievances.map((g) => {
            const progress = getProgressState(g.status)
            return (
              <Link key={g.id} href={`/grievances/${g.id}`} className="block group">
                <Card className="overflow-hidden hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all border-slate-200 dark:border-slate-800 relative bg-white dark:bg-slate-900">
                  <div className="p-6">
                    {/* Header Row */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">{g.ticketNumber}</p>
                          {g.isAnonymous && <Badge variant="outline" className="bg-slate-100 text-slate-600 text-[9px] h-4 py-0">Anonymous</Badge>}
                        </div>
                        <h3 className="font-semibold text-xl text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {g.subject}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge variant="outline" className={`${getStatusColor(g.status)} uppercase tracking-wider text-xs px-3 py-1 font-bold`}>
                          {g.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {/* Meta Info Row */}
                    <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm mb-6">
                      <div className="flex items-center text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-md font-medium border border-slate-100 dark:border-slate-800">
                        <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                        {g.category?.name || 'General'}
                      </div>
                      <div className="flex items-center text-slate-600 dark:text-slate-400">
                        <Clock className="h-4 w-4 mr-2 opacity-70" />
                        Submitted: {new Date(g.createdAt).toLocaleDateString()}
                      </div>
                      {g.slaDueDate && g.status !== 'RESOLVED' && g.status !== 'CLOSED' && g.status !== 'REJECTED' && (
                        <div className="flex items-center text-amber-700 dark:text-amber-400 font-medium">
                          <Clock className="h-4 w-4 mr-2" />
                          Expected Resolution: {new Date(g.slaDueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 -mx-6 -mb-6 px-6 py-5 border-t border-slate-100 dark:border-slate-800">
                      <div className="relative">
                        {/* Background track */}
                        <div className="absolute top-2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        
                        {/* Active track */}
                        <div 
                          className={`absolute top-2 left-0 h-1 rounded-full transition-all duration-1000 ${progress.color}`}
                          style={{ width: progress.width }}
                        />

                        {/* Milestones */}
                        <div className="relative flex justify-between text-xs font-medium text-slate-500">
                          {/* Step 1: Submitted */}
                          <div className="flex flex-col items-start w-1/4">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center border-2 mb-2 bg-white dark:bg-slate-900 transition-colors ${progress.step >= 1 ? `border-transparent ${progress.color} text-white` : 'border-slate-300 dark:border-slate-600'}`}>
                              {progress.step > 1 && <CheckCircle2 className="h-4 w-4" />}
                            </div>
                            <span className={progress.step >= 1 ? 'text-slate-900 dark:text-white' : ''}>Submitted</span>
                          </div>
                          
                          {/* Step 2: Under Review */}
                          <div className="flex flex-col items-center w-1/4">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center border-2 mb-2 bg-white dark:bg-slate-900 transition-colors ${progress.step >= 2 ? `border-transparent ${progress.color} text-white` : 'border-slate-300 dark:border-slate-600'}`}>
                              {progress.step > 2 && <CheckCircle2 className="h-4 w-4" />}
                            </div>
                            <span className={progress.step >= 2 ? 'text-slate-900 dark:text-white' : ''}>Under Review</span>
                          </div>

                          {/* Step 3: Investigation */}
                          <div className="flex flex-col items-center w-1/4">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center border-2 mb-2 bg-white dark:bg-slate-900 transition-colors ${progress.step >= 3 ? `border-transparent ${progress.color} text-white` : 'border-slate-300 dark:border-slate-600'}`}>
                              {progress.step > 3 && <CheckCircle2 className="h-4 w-4" />}
                            </div>
                            <span className={progress.step >= 3 ? 'text-slate-900 dark:text-white' : ''}>Investigation</span>
                          </div>

                          {/* Step 4: Resolved */}
                          <div className="flex flex-col items-end w-1/4">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center border-2 mb-2 bg-white dark:bg-slate-900 transition-colors ${progress.step >= 4 ? `border-transparent ${progress.color} text-white` : 'border-slate-300 dark:border-slate-600'}`}>
                              {progress.step >= 4 && <CheckCircle2 className="h-4 w-4" />}
                            </div>
                            <span className={progress.step >= 4 ? 'text-slate-900 dark:text-white' : ''}>Resolved</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <div className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Details <ChevronRight className="h-4 w-4" />
                        </div>
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
