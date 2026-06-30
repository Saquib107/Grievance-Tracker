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
import { ArrowUpDown, Download, CheckCircle2, UserPlus, Filter, X, Search, MoreVertical, Eye, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import * as XLSX from "xlsx"

export default function HRCasesTableClient({ 
  grievances, 
  hrUsers,
  categories,
  currentUserId 
}: { 
  grievances: any[],
  hrUsers: { id: string, name: string | null }[],
  categories: any[],
  currentUserId: string
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const searchParams = useSearchParams()
  const initialFilter = "ALL"
  const [quickFilter, setQuickFilter] = useState(initialFilter)
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Filters
  const [filterSearch, setFilterSearch] = useState("")
  const debouncedSearch = useDebounce(filterSearch, 300)
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

    // Quick filter
    if (quickFilter === "TODAY") {
      const today = new Date(); today.setHours(0,0,0,0);
      result = result.filter(g => new Date(g.createdAt) >= today)
    }
    if (quickFilter === "THIS_WEEK") {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter(g => new Date(g.createdAt) >= weekAgo)
    }
    if (quickFilter === "UNASSIGNED") result = result.filter(g => !g.assignedToId)
    if (quickFilter === "NEAR_SLA") {
      const now = new Date();
      result = result.filter(g => g.slaDueDate && g.status !== "RESOLVED" && g.status !== "CLOSED" && g.status !== "REJECTED" && new Date(g.slaDueDate).getTime() - now.getTime() > 0 && new Date(g.slaDueDate).getTime() - now.getTime() <= 48 * 60 * 60 * 1000)
    }

    // Apply filters
    if (debouncedSearch) {
      const lower = debouncedSearch.toLowerCase()
      result = result.filter(g => 
        (g.ticketNumber || "").toLowerCase().includes(lower) || 
        (g.subject || "").toLowerCase().includes(lower) ||
        (g.employee?.name || "").toLowerCase().includes(lower) ||
        (g.location || "").toLowerCase().includes(lower) ||
        (g.site?.name || "").toLowerCase().includes(lower)
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
  }, [grievances, debouncedSearch, filterStatus, filterPriority, filterCategory, filterAssignedTo, sortConfig, quickFilter])

  // Reset pagination on filter change
  useMemo(() => {
    setCurrentPage(1)
  }, [debouncedSearch, filterStatus, filterPriority, filterCategory, filterAssignedTo, quickFilter])

  const paginatedGrievances = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return processedGrievances.slice(start, start + itemsPerPage)
  }, [processedGrievances, currentPage])
  
  const totalPages = Math.ceil(processedGrievances.length / itemsPerPage)


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
    toast.success("Export to CSV started")
  }

  const handleExportExcel = () => {
    const toExport = processedGrievances.filter(g => selectedIds.has(g.id))
    if (toExport.length === 0) return toast.error("Select cases to export")

    const data = toExport.map(g => ({
      "Ticket ID": g.ticketNumber,
      "Subject": g.subject,
      "Category": g.category?.name || "None",
      "Priority": g.priority,
      "Status": g.status,
      "Employee": g.employee?.name || "Anonymous",
      "Date Submitted": new Date(g.createdAt).toLocaleDateString(),
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Grievances")
    XLSX.writeFile(workbook, "grievances_export.xlsx")
    setSelectedIds(new Set())
    toast.success("Export to Excel started")
  }

  // Display Helpers
  const getStatusBadge = (status: string) => {
    let classes = "px-3 py-1 text-xs font-semibold rounded-full border border-transparent shadow-sm inline-block text-center min-w-[110px] "
    switch(status) {
      case 'SUBMITTED': classes += 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'; break;
      case 'UNDER_REVIEW': classes += 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'; break;
      case 'INVESTIGATION': classes += 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'; break;
      case 'ACTION_TAKEN': classes += 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'; break;
      case 'RESOLVED': classes += 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'; break;
      case 'CLOSED': classes += 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'; break;
      case 'REJECTED': classes += 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'; break;
      default: classes += 'bg-slate-100 text-slate-700'; break;
    }
    return <div className={classes}>{status.replace('_', ' ')}</div>
  }

  const getPriorityDisplay = (priority: string) => {
    switch(priority) {
      case 'LOW': return <span className="text-emerald-600 font-medium flex items-center"><span className="mr-1 text-xs">🟢</span> Low</span>
      case 'MEDIUM': return <span className="text-yellow-600 font-medium flex items-center"><span className="mr-1 text-xs">🟡</span> Medium</span>
      case 'HIGH': return <span className="text-amber-600 font-medium flex items-center"><span className="mr-1 text-xs">🟠</span> High</span>
      case 'CRITICAL': return <span className="text-red-600 font-bold flex items-center"><span className="mr-1 text-xs">🔴</span> Critical</span>
      default: return <span className="text-slate-500">{priority}</span>
    }
  }

  const formatSLA = (date: Date | null, status: string) => {
    if (!date) return <span className="text-slate-400">N/A</span>
    const isClosed = ['RESOLVED', 'CLOSED', 'REJECTED'].includes(status)
    const formatted = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    if (isClosed) return <span className="text-slate-500">{formatted}</span>

    const diff = new Date(date).getTime() - new Date().getTime()
    const days = Math.floor(diff / (1000 * 3600 * 24))
    
    if (days < 0) return <div className="text-red-600 font-medium">❌ Overdue<br/><span className="text-xs">{Math.abs(days)} Days</span></div>
    if (days === 0) return <div className="text-amber-600 font-medium">🟠 Tomorrow<br/><span className="text-xs">{formatted}</span></div>
    if (days === 1) return <div className="text-amber-600 font-medium">🟠 Tomorrow<br/><span className="text-xs">{formatted}</span></div>
    return <div className="text-emerald-600 font-medium">🟢 {days} Days<br/><span className="text-xs text-slate-500">{formatted}</span></div>
  }
  
  const calculateAge = (date: Date) => {
    const diff = new Date().getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 3600 * 24))
    return days === 0 ? "Today" : `${days} Days`
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
      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={quickFilter === "ALL" ? "default" : "outline"} className={`cursor-pointer px-3 py-1.5 transition-colors border-slate-200 ${quickFilter === 'ALL' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100 bg-white'}`} onClick={() => setQuickFilter("ALL")}>All</Badge>
        <Badge variant={quickFilter === "TODAY" ? "default" : "outline"} className={`cursor-pointer px-3 py-1.5 transition-colors border-blue-200 ${quickFilter === 'TODAY' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-blue-600 hover:bg-blue-50 bg-white'}`} onClick={() => setQuickFilter("TODAY")}>Today</Badge>
        <Badge variant={quickFilter === "THIS_WEEK" ? "default" : "outline"} className={`cursor-pointer px-3 py-1.5 transition-colors border-blue-200 ${quickFilter === 'THIS_WEEK' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-blue-600 hover:bg-blue-50 bg-white'}`} onClick={() => setQuickFilter("THIS_WEEK")}>This Week</Badge>
        <Badge variant={quickFilter === "UNASSIGNED" ? "default" : "outline"} className={`cursor-pointer px-3 py-1.5 transition-colors border-slate-300 ${quickFilter === 'UNASSIGNED' ? 'bg-slate-700 text-white hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50 bg-white'}`} onClick={() => setQuickFilter("UNASSIGNED")}>Unassigned</Badge>
        <Badge variant={quickFilter === "NEAR_SLA" ? "default" : "outline"} className={`cursor-pointer px-3 py-1.5 transition-colors border-amber-200 ${quickFilter === 'NEAR_SLA' ? 'bg-amber-600 text-white hover:bg-amber-700' : 'text-amber-600 hover:bg-amber-50 bg-white'}`} onClick={() => setQuickFilter("NEAR_SLA")}>Near SLA</Badge>
      </div>

      {/* Advanced Filters */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row flex-wrap gap-4 items-end">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-slate-500">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="🔍 Search Ticket ID, Subject, Employee..." 
              value={filterSearch} 
              onChange={(e) => setFilterSearch(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
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

      {/* Filter Summary and Exports */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-sm text-slate-500 font-medium">
          Showing <span className="text-slate-900 dark:text-white font-bold">{processedGrievances.length}</span> Cases
          {filterStatus !== "ALL" && ` • Status: ${filterStatus.replace('_', ' ')}`}
          {filterPriority !== "ALL" && ` • Priority: ${filterPriority}`}
          {filterCategory !== "ALL" && ` • Category: Filtered`}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={selectedIds.size === 0} className="h-8">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={selectedIds.size === 0} className="h-8">
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
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
              Change Status
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkStatusUpdate('UNDER_REVIEW')}>Under Review</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatusUpdate('INVESTIGATION')}>Investigation</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatusUpdate('RESOLVED')}>Resolved</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('CLOSED')} className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white h-8 text-xs font-medium" disabled={isUpdating}>
            <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
            Mark Closed
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
                <TableHead className="text-right">Age</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => requestSort('date')} className="h-8 p-0 hover:bg-transparent font-medium inline-flex items-center">
                    Submitted <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => requestSort('sla')} className="h-8 p-0 hover:bg-transparent font-medium inline-flex items-center">
                    SLA Due <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedGrievances.map((g) => (
                <TableRow key={g.id} className={`h-[60px] cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-l-4 ${getSlaBorderColor(g.slaDueDate, g.status)}`}>
                  <TableCell className="pl-4">
                    <Checkbox checked={selectedIds.has(g.id)} onCheckedChange={() => toggleSelect(g.id)} />
                  </TableCell>
                  <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                    <Link href={`/grievances/${g.id}`} className="hover:underline text-indigo-600">{g.ticketNumber}</Link>
                  </TableCell>
                  <TableCell className="max-w-[180px]" title={g.subject}>
                    <div className="font-medium truncate">{g.subject}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium rounded-full">
                      {g.category?.name || "None"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {g.isAnonymous ? (
                      <span className="text-slate-500 font-medium">👤 Anonymous</span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-medium">{g.employee?.name || "Unknown"}</span>
                        <span className="text-xs text-slate-500">{g.employee?.employeeIdStr || "No ID"}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getPriorityDisplay(g.priority)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none hover:opacity-80 transition-opacity">
                        {getStatusBadge(g.status)}
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
                  <TableCell className="text-right whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                    {calculateAge(g.createdAt)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="text-slate-900 dark:text-slate-300 font-medium">
                      {new Date(g.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(g.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs whitespace-nowrap text-right">
                    {new Date(g.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {formatSLA(g.slaDueDate, g.status)}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none">
                        <MoreVertical className="h-4 w-4 text-slate-500" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/grievances/${g.id}`}><DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View Case</DropdownMenuItem></Link>
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {processedGrievances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="text-4xl">🎉</div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Cases Found</h3>
                      <p className="text-slate-500">You're all caught up! No cases match your current filters.</p>
                      <Button variant="outline" onClick={clearFilters} className="mt-2 h-8 text-xs">Clear Filters</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 pt-2 gap-4">
          <div className="text-sm text-slate-500">
            Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, processedGrievances.length)} of {processedGrievances.length}
          </div>
          <div className="flex gap-1 overflow-x-auto max-w-full pb-2 sm:pb-0">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              &lt; Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                className="w-9"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next &gt;
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
