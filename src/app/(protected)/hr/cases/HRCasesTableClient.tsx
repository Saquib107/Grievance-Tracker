"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { bulkUpdateGrievanceStatus, bulkAssignGrievance } from "@/app/actions/grievance"
import { toast } from "sonner"
import { ArrowUpDown, Download, CheckCircle2, UserPlus, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function HRCasesTableClient({ 
  grievances, 
  hrUsers,
  categories 
}: { 
  grievances: any[],
  hrUsers: { id: string, name: string | null }[],
  categories: any[]
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Filters
  const [filterSearch, setFilterSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [filterPriority, setFilterPriority] = useState("ALL")
  const [filterCategory, setFilterCategory] = useState("ALL")
  const [filterAssignedTo, setFilterAssignedTo] = useState("ALL")

  const clearFilters = () => {
    setFilterSearch("")
    setFilterStatus("ALL")
    setFilterPriority("ALL")
    setFilterCategory("ALL")
    setFilterAssignedTo("ALL")
  }

  // Derived filtered & sorted data
  const processedGrievances = useMemo(() => {
    let result = grievances

    // Apply filters
    if (filterSearch) {
      const lower = filterSearch.toLowerCase()
      result = result.filter(g => 
        g.ticketNumber.toLowerCase().includes(lower) || 
        g.subject.toLowerCase().includes(lower) ||
        g.employee?.name?.toLowerCase().includes(lower) ||
        g.location?.toLowerCase().includes(lower)
      )
    }
    if (filterStatus !== "ALL") result = result.filter(g => g.status === filterStatus)
    if (filterPriority !== "ALL") result = result.filter(g => g.priority === filterPriority)
    if (filterCategory !== "ALL") result = result.filter(g => g.categoryId === filterCategory)
    if (filterAssignedTo !== "ALL") {
      if (filterAssignedTo === "UNASSIGNED") result = result.filter(g => !g.assignedToId)
      else result = result.filter(g => g.assignedToId === filterAssignedTo)
    }

    // Apply Sort
    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        if (sortConfig.key === 'date') {
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
        } else if (sortConfig.key === 'sla') {
          aValue = a.slaDueDate ? new Date(a.slaDueDate).getTime() : Infinity
          bValue = b.slaDueDate ? new Date(b.slaDueDate).getTime() : Infinity
        } else if (sortConfig.key === 'priority') {
          const p = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
          aValue = p[a.priority as keyof typeof p] || 0
          bValue = p[b.priority as keyof typeof p] || 0
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [grievances, filterSearch, filterStatus, filterPriority, filterCategory, filterAssignedTo, sortConfig])


  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIds.size === processedGrievances.length && processedGrievances.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(processedGrievances.map(g => g.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  // Sorting
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'
    setSortConfig({ key, direction })
  }

  // Actions
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedIds.size === 0) return
    setIsUpdating(true)
    try {
      await bulkUpdateGrievanceStatus(Array.from(selectedIds), status)
      toast.success(`Updated ${selectedIds.size} cases to ${status.replace('_', ' ')}`)
      setSelectedIds(new Set())
    } catch (e) {
      toast.error("Failed to update status")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBulkAssign = async (userId: string | null) => {
    if (selectedIds.size === 0) return
    setIsUpdating(true)
    try {
      await bulkAssignGrievance(Array.from(selectedIds), userId)
      toast.success(`Assigned ${selectedIds.size} cases`)
      setSelectedIds(new Set())
    } catch (e) {
      toast.error("Failed to assign cases")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleExportCSV = () => {
    const toExport = processedGrievances.filter(g => selectedIds.has(g.id))
    const headers = ["Ticket ID", "Subject", "Category", "Priority", "Status", "Date Submitted"]
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + toExport.map(g => [
          g.ticketNumber,
          `"${g.subject.replace(/"/g, '""')}"`,
          g.category?.name || "None",
          g.priority,
          g.status,
          new Date(g.createdAt).toLocaleDateString()
        ].join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "grievances_export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setSelectedIds(new Set())
    toast.success("Export started")
  }

  // Display Helpers
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

  const getSlaBorderColor = (slaDate: Date | null, status: string) => {
    if (!slaDate || ['RESOLVED', 'CLOSED', 'REJECTED'].includes(status)) return 'border-l-transparent'
    const now = new Date().getTime()
    const due = new Date(slaDate).getTime()
    const hoursLeft = (due - now) / (1000 * 60 * 60)
    
    if (hoursLeft < 0) return 'border-l-red-500' // Overdue
    if (hoursLeft < 24) return 'border-l-amber-500' // Due very soon
    return 'border-l-emerald-500' // On track
  }

  return (
    <div className="space-y-4">
      {/* Advanced Filters */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row flex-wrap gap-4 items-end">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-slate-500">Search</label>
          <Input 
            placeholder="Ticket ID, Subject, Employee..." 
            value={filterSearch} 
            onChange={(e) => setFilterSearch(e.target.value)}
            className="h-9"
          />
        </div>
        
        <div className="space-y-1 w-full sm:w-[150px]">
          <label className="text-xs font-semibold text-slate-500">Status</label>
          <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val ?? "")}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="INVESTIGATION">Investigation</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 w-full sm:w-[140px]">
          <label className="text-xs font-semibold text-slate-500">Priority</label>
          <Select value={filterPriority} onValueChange={(val) => setFilterPriority(val ?? "")}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priority</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 w-full sm:w-[180px]">
          <label className="text-xs font-semibold text-slate-500">Category</label>
          <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val ?? "")}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 w-full sm:w-[180px]">
          <label className="text-xs font-semibold text-slate-500">Assigned To</label>
          <Select value={filterAssignedTo} onValueChange={(val) => setFilterAssignedTo(val ?? "")}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Anyone" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Anyone</SelectItem>
              <SelectItem value="UNASSIGNED">Unassigned Only</SelectItem>
              {hrUsers.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="ghost" onClick={clearFilters} className="h-9 px-3 text-slate-500" title="Clear Filters">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium mr-2">{selectedIds.size} selected</span>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white h-8 px-3" disabled={isUpdating}>
              <UserPlus className="h-3 w-3 mr-2" />
              Assign
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkAssign(null)}>Unassign</DropdownMenuItem>
              {hrUsers.map(u => (
                <DropdownMenuItem key={u.id} onClick={() => handleBulkAssign(u.id)}>{u.name}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white h-8 px-3" disabled={isUpdating}>
              <CheckCircle2 className="h-3 w-3 mr-2" />
              Status
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkStatusUpdate('UNDER_REVIEW')}>Under Review</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatusUpdate('INVESTIGATION')}>Investigation</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatusUpdate('RESOLVED')}>Resolved</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatusUpdate('CLOSED')}>Closed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" variant="outline" onClick={handleExportCSV} className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white h-8 text-xs">
            <Download className="h-3 w-3 mr-2" />
            Export CSV
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border border-slate-200 overflow-hidden relative">
        <div className="overflow-auto max-h-[600px]">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[40px] pl-4">
                  <Checkbox 
                    checked={selectedIds.size === processedGrievances.length && processedGrievances.length > 0} 
                    onCheckedChange={toggleSelectAll} 
                  />
                </TableHead>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('priority')} className="h-8 p-0 hover:bg-transparent font-medium flex items-center">
                    Priority <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('status')} className="h-8 p-0 hover:bg-transparent font-medium flex items-center">
                    Status <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('date')} className="h-8 p-0 hover:bg-transparent font-medium flex items-center">
                    Submitted <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('sla')} className="h-8 p-0 hover:bg-transparent font-medium flex items-center text-right">
                    SLA Due <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedGrievances.map((g) => (
                <TableRow key={g.id} className={`h-10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-l-4 ${getSlaBorderColor(g.slaDueDate, g.status)}`}>
                  <TableCell className="pl-4">
                    <Checkbox checked={selectedIds.has(g.id)} onCheckedChange={() => toggleSelect(g.id)} />
                  </TableCell>
                  <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                    <Link href={`/grievances/${g.id}`} className="hover:underline text-indigo-600">{g.ticketNumber}</Link>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">{g.subject}</TableCell>
                  <TableCell>{g.category?.name || "None"}</TableCell>
                  <TableCell>
                    {g.isAnonymous ? <span className="italic text-slate-500">Anonymous</span> : g.employee?.name || "Unknown"}
                  </TableCell>
                  <TableCell className={getPriorityColor(g.priority)}>
                    {g.priority}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none">
                        <Badge variant="outline" className={`${getStatusColor(g.status)} border-none cursor-pointer hover:opacity-80`}>
                          {g.status.replace('_', ' ')}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                          toggleSelect(g.id)
                          setTimeout(() => handleBulkStatusUpdate('UNDER_REVIEW'), 50)
                        }}>Under Review</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          toggleSelect(g.id)
                          setTimeout(() => handleBulkStatusUpdate('INVESTIGATION'), 50)
                        }}>Investigation</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          toggleSelect(g.id)
                          setTimeout(() => handleBulkStatusUpdate('RESOLVED'), 50)
                        }}>Resolved</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          toggleSelect(g.id)
                          setTimeout(() => handleBulkStatusUpdate('CLOSED'), 50)
                        }}>Closed</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 transition-colors text-xs whitespace-nowrap inline-block">
                        {g.assignedTo?.name || "Unassigned"}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                          toggleSelect(g.id)
                          setTimeout(() => handleBulkAssign(null), 50)
                        }}>Unassign</DropdownMenuItem>
                        {hrUsers.map(u => (
                          <DropdownMenuItem key={u.id} onClick={() => {
                            toggleSelect(g.id)
                            setTimeout(() => handleBulkAssign(u.id), 50)
                          }}>{u.name}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs whitespace-nowrap">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs whitespace-nowrap text-right">
                    {g.slaDueDate ? new Date(g.slaDueDate).toLocaleDateString() : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
              {processedGrievances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-slate-500">
                    No cases match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
