"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { processGrievanceApproval } from "@/app/actions/grievance"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { Eye, Search, FilterX, Clock, Paperclip, MessageSquare, AlertCircle } from "lucide-react"

export default function ApprovalsClient({ initialCases }: { initialCases: any[] }) {
  const [cases, setCases] = useState(initialCases)
  const [loading, setLoading] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [isRejecting, setIsRejecting] = useState(false)
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState("")
  const [siteFilter, setSiteFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [priorityFilter, setPriorityFilter] = useState("ALL")

  const router = useRouter()

  const handleApprove = async (id: string) => {
    setLoading(id)
    const result = await processGrievanceApproval(id, "APPROVE")
    setLoading(null)
    
    if (result.success) {
      toast.success("Grievance approved successfully!")
      setCases(cases.filter(c => c.id !== id))
      setSelectedCaseId(null) // Close drawer
      router.refresh()
    } else {
      toast.error(result.error || "Failed to approve grievance")
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    setLoading(id)
    const result = await processGrievanceApproval(id, "REJECT", rejectionReason)
    setLoading(null)

    if (result.success) {
      toast.success("Grievance rejected.")
      setCases(cases.filter(c => c.id !== id))
      setSelectedCaseId(null)
      setIsRejecting(false)
      setRejectionReason("")
      router.refresh()
    } else {
      toast.error(result.error || "Failed to reject grievance")
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return <span className="flex items-center text-red-600 font-medium"><span className="h-2 w-2 rounded-full bg-red-600 mr-2"></span>Critical</span>
      case "HIGH": return <span className="flex items-center text-orange-600 font-medium"><span className="h-2 w-2 rounded-full bg-orange-500 mr-2"></span>High</span>
      case "MEDIUM": return <span className="flex items-center text-amber-600 font-medium"><span className="h-2 w-2 rounded-full bg-amber-400 mr-2"></span>Medium</span>
      case "LOW": return <span className="flex items-center text-emerald-600 font-medium"><span className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>Low</span>
      default: return <span className="flex items-center text-slate-500"><span className="h-2 w-2 rounded-full bg-slate-400 mr-2"></span>Normal</span>
    }
  }

  const formatDate = (dateInput: any) => {
    if (!dateInput) return "Unknown date"
    const d = new Date(dateInput)
    const day = d.getDate().toString().padStart(2, '0')
    const month = d.toLocaleString('en-US', { month: 'short' })
    const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `${day} ${month}\n${time}`
  }

  const filteredCases = cases.filter(c => {
    const matchesSearch = (c.ticketNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.subject || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSite = siteFilter === "ALL" || c.site?.name === siteFilter
    const matchesCategory = categoryFilter === "ALL" || c.category?.name === categoryFilter
    const matchesPriority = priorityFilter === "ALL" || c.priority === priorityFilter
    
    return matchesSearch && matchesSite && matchesCategory && matchesPriority
  })

  // Extract unique filter options
  const uniqueSites = Array.from(new Set(cases.map(c => c.site?.name).filter(Boolean)))
  const uniqueCategories = Array.from(new Set(cases.map(c => c.category?.name).filter(Boolean)))

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Pending Approvals</h2>
        <Badge variant="secondary" className="text-sm font-medium">
          {cases.length} Total
        </Badge>
      </div>
      
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg border shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-slate-500">Search Ticket ID</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="e.g. GRV-2026..." 
              className="pl-9 h-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5 min-w-[150px]">
          <label className="text-xs font-semibold text-slate-500">Site</label>
          <Select value={siteFilter} onValueChange={(val) => { if (val) setSiteFilter(val) }}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All Sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sites</SelectItem>
              {uniqueSites.map(site => (
                <SelectItem key={site} value={site}>{site}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 min-w-[150px]">
          <label className="text-xs font-semibold text-slate-500">Category</label>
          <Select value={categoryFilter} onValueChange={(val) => { if (val) setCategoryFilter(val) }}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {uniqueCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 min-w-[150px]">
          <label className="text-xs font-semibold text-slate-500">Priority</label>
          <Select value={priorityFilter} onValueChange={(val) => { if (val) setPriorityFilter(val) }}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="ghost" 
          className="h-9 px-3 text-slate-500 hover:text-slate-700"
          onClick={() => {
            setSearchTerm("")
            setSiteFilter("ALL")
            setCategoryFilter("ALL")
            setPriorityFilter("ALL")
          }}
        >
          <FilterX className="h-4 w-4 mr-2" /> Reset
        </Button>
      </div>

      {cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-lg dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <p className="text-lg font-medium text-slate-500">No pending approvals at your site.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Ticket</th>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Site</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Submitted</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {c.ticketNumber}
                      <div className="text-xs text-slate-500 mt-1 max-w-[200px] truncate">{c.subject}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {c.isAnonymous ? "👤 Anonymous" : c.employee?.name || c.grievantName}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(c.priority)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {c.site?.name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                        {c.category?.name || "Uncategorized"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-pre-line">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Sheet open={selectedCaseId === c.id} onOpenChange={(open) => {
                        if (!open) {
                          setSelectedCaseId(null)
                          setIsRejecting(false)
                        } else {
                          setSelectedCaseId(c.id)
                        }
                      }}>
                        <SheetTrigger render={<Button variant="outline" size="sm" className="font-medium bg-white" />}>
                          <Eye className="h-4 w-4 mr-2 text-indigo-500" /> View
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-0 flex flex-col">
                          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                            <SheetHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <SheetTitle className="text-xl flex items-center">
                                    {c.ticketNumber}
                                  </SheetTitle>
                                  <SheetDescription className="mt-1.5 flex items-center">
                                    {getPriorityBadge(c.priority)}
                                    <span className="mx-2 text-slate-300">•</span>
                                    {formatDate(c.createdAt).replace("\n", " at ")}
                                  </SheetDescription>
                                </div>
                              </div>
                            </SheetHeader>
                          </div>
                          
                          <div className="p-6 flex-1 overflow-y-auto space-y-8">
                            {/* Employee Info */}
                            <section>
                              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Employee Details</h3>
                              <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs text-slate-500">Name</p>
                                    <p className="text-sm font-medium">{c.isAnonymous ? "👤 Anonymous" : c.employee?.name || c.grievantName}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500">Site</p>
                                    <p className="text-sm font-medium">{c.site?.name || "N/A"}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs text-slate-500">Department</p>
                                    <p className="text-sm font-medium">{c.department || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500">Category</p>
                                    <p className="text-sm font-medium">{c.category?.name || "N/A"}</p>
                                  </div>
                                </div>
                              </div>
                            </section>

                            {/* Issue Details */}
                            <section>
                              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Issue Description</h3>
                              <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-md whitespace-pre-wrap leading-relaxed border border-slate-100 dark:border-slate-800">
                                {c.description}
                              </div>
                            </section>

                            {/* Mock Timeline */}
                            <section>
                              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Timeline</h3>
                              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 pl-5 space-y-6 pb-2">
                                <div className="relative">
                                  <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-950"></div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">Draft Created</p>
                                  <p className="text-xs text-slate-500 mt-1">{formatDate(c.createdAt).replace("\n", " ")}</p>
                                </div>
                                <div className="relative">
                                  <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-950"></div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">Submitted for Approval</p>
                                  <p className="text-xs text-slate-500 mt-1">Pending your review</p>
                                </div>
                              </div>
                            </section>
                          </div>

                          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
                            {isRejecting ? (
                              <div className="space-y-3">
                                <Textarea 
                                  placeholder="Provide reason for rejection..." 
                                  className="w-full text-sm resize-none bg-white"
                                  rows={3}
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                />
                                <div className="flex gap-2 w-full">
                                  <Button variant="ghost" className="flex-1" onClick={() => setIsRejecting(false)}>Cancel</Button>
                                  <Button variant="destructive" className="flex-1" onClick={() => handleReject(c.id)} disabled={loading === c.id}>
                                    Confirm Reject
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-3 w-full">
                                <Button 
                                  variant="outline" 
                                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => setIsRejecting(true)}
                                >
                                  Reject Case
                                </Button>
                                <Button 
                                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                  onClick={() => handleApprove(c.id)}
                                  disabled={loading === c.id}
                                >
                                  Approve Case
                                </Button>
                              </div>
                            )}
                          </div>
                        </SheetContent>
                      </Sheet>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
