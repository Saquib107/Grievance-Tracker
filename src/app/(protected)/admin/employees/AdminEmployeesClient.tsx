"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Upload, Users, UserPlus, FileSpreadsheet, Lock, MoreHorizontal, Eye, Ban, CheckCircle, Trash2, Search, Printer, Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { bulkImportEmployees, updateEmployeeStatus } from "@/app/actions/employees"

export default function AdminEmployeesClient({ initialEmployees, sites }: { initialEmployees: any[], sites: any[] }) {
  const [employees, setEmployees] = useState(initialEmployees)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [filterSearch, setFilterSearch] = useState("")
  const [filterSite, setFilterSite] = useState("ALL")
  const [filterDept, setFilterDept] = useState("ALL")
  const [filterStatus, setFilterStatus] = useState("ALL")
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalEmployees = initialEmployees.length
  const activeEmployees = initialEmployees.filter(e => e.isActive).length
  const inactiveEmployees = initialEmployees.filter(e => !e.isActive).length
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const newThisMonth = initialEmployees.filter(e => {
    if (!e.createdAt) return false
    const d = new Date(e.createdAt)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  }).length
  const allDepts = Array.from(new Set(initialEmployees.map(e => e.department).filter(Boolean))) as string[]

  const processedEmployees = useMemo(() => {
    let result = employees
    if (filterSearch) {
      const q = filterSearch.toLowerCase()
      result = result.filter(e => (e.name || "").toLowerCase().includes(q) || (e.employeeIdStr || "").toLowerCase().includes(q) || (e.email || "").toLowerCase().includes(q))
    }
    if (filterSite !== "ALL") result = result.filter(e => e.site?.id === filterSite)
    if (filterDept !== "ALL") result = result.filter(e => e.department === filterDept)
    if (filterStatus !== "ALL") {
      if (filterStatus === "ACTIVE") result = result.filter(e => e.isActive)
      if (filterStatus === "INACTIVE") result = result.filter(e => !e.isActive)
    }
    return result
  }, [employees, filterSearch, filterSite, filterDept, filterStatus])
  
  useMemo(() => { setCurrentPage(1) }, [filterSearch, filterSite, filterDept, filterStatus])

  const paginatedEmployees = processedEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(processedEmployees.length / itemsPerPage)

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error("Please select an Excel file.")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)

    const res = await bulkImportEmployees(formData)
    setLoading(false)

    if (res.success) {
      toast.success(`Successfully imported ${res.count} employees!`)
      setIsImportOpen(false)
      setFile(null)
      router.refresh()
    } else {
      toast.error(res.error || "Failed to import employees")
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await updateEmployeeStatus(id, !currentStatus)
    if (res.success) {
      toast.success(`Employee ${!currentStatus ? 'activated' : 'disabled'} successfully.`)
      router.refresh()
    } else {
      toast.error("Failed to update status")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Employee Management</h2>
          <p className="text-sm text-slate-500">Manage employee accounts, designations, and bulk import from Excel.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden md:flex items-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            Last Import: 25 Employees • Today, 10:40 AM
          </div>
          <Button variant="outline" className="bg-white border-slate-200">
            <UserPlus className="h-4 w-4 mr-2" /> Add Employee
          </Button>
          
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700" />}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Import Excel
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleImport}>
                <DialogHeader>
                  <DialogTitle>Bulk Import Employees</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-6">
                  <div className="space-y-2">
                    <Label>Excel File (.xlsx)</Label>
                    <Input 
                      type="file" 
                      accept=".xlsx, .xls" 
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required 
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Required columns: <strong>Employee ID, Name, Phone, Department, Designation, Site</strong>. 
                      Default password will be set to <code className="bg-slate-100 px-1 py-0.5 rounded">Pgepl@123</code>.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading || !file}>
                    {loading ? "Importing..." : "Upload & Import"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Total Employees</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalEmployees}</div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
            <span className="text-emerald-600 font-medium">{activeEmployees} Active</span>
            <span className="text-rose-600 font-medium">{inactiveEmployees} Inactive</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">New This Month</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{newThisMonth}</div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
            <span className="text-indigo-600 font-medium">Recent joiners</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Departments</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{allDepts.length}</div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Active departments</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Total Sites</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{sites.length}</div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Operational locations</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row flex-wrap gap-4 items-end">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <Label className="text-xs font-semibold text-slate-500">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="🔍 Search Employee Name, ID, or Email..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </div>
        <div className="space-y-1 w-full sm:w-[150px]">
          <Label className="text-xs font-semibold text-slate-500">Site</Label>
          <Select value={filterSite} onValueChange={val => setFilterSite(val || "")}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All Sites" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sites</SelectItem>
              {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 w-full sm:w-[150px]">
          <Label className="text-xs font-semibold text-slate-500">Department</Label>
          <Select value={filterDept} onValueChange={val => setFilterDept(val || "")}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All Depts" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Depts</SelectItem>
              {allDepts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 w-full sm:w-[150px]">
          <Label className="text-xs font-semibold text-slate-500">Status</Label>
          <Select value={filterStatus} onValueChange={val => setFilterStatus(val || "")}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 bg-white" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button variant="outline" className="h-9 bg-white">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Designation</th>
                <th className="px-6 py-4 font-medium">Site</th>
                <th className="px-6 py-4 font-medium">Reporting HR</th>
                <th className="px-6 py-4 font-medium">Joining Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors h-[60px] border-l-4 border-transparent hover:border-indigo-400">
                  <td className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 shadow-sm">
                        {emp.name?.charAt(0) || "E"}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          <Link href={`/admin/employees/${emp.id}`} className="hover:text-indigo-600 hover:underline">{emp.name}</Link>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">{emp.employeeIdStr || "No ID"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 text-slate-700 dark:text-slate-300 font-medium">{emp.department || "N/A"}</td>
                  <td className="px-6 text-slate-700 dark:text-slate-300">{emp.designation || "N/A"}</td>
                  <td className="px-6 text-slate-700 dark:text-slate-300 font-medium">{emp.site?.name || "Unassigned"}</td>
                  <td className="px-6">
                    {emp.site?.users?.length > 0 ? (
                       <span className="text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-md shadow-sm">{emp.site.users[0].name}</span>
                    ) : (
                       <span className="text-xs text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="px-6 text-slate-600 dark:text-slate-400 text-sm">
                    {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown"}
                  </td>
                  <td className="px-6">
                    {emp.isActive ? (
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 font-semibold text-xs rounded-full shadow-sm">🟢 Active</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-rose-100 text-rose-700 border-none px-3 py-1 font-semibold text-xs rounded-full shadow-sm">🔴 Inactive</Badge>
                    )}
                  </td>
                  <td className="px-6 text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none">
                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/admin/employees/${emp.id}`}><DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem></Link>
                        <DropdownMenuItem onClick={() => toggleStatus(emp.id, emp.isActive)}>
                          {emp.isActive ? <Ban className="mr-2 h-4 w-4 text-red-500" /> : <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />} 
                          {emp.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {paginatedEmployees.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="text-4xl">👥</div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Employees Found</h3>
                      <p className="text-slate-500">Import an Excel list or add an employee manually.</p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" onClick={() => setIsImportOpen(true)}>Import Excel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm text-xs h-9">Add Employee</Button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="text-sm text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, processedEmployees.length)} of {processedEmployees.length}
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>&lt; Previous</Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button key={page} variant={currentPage === page ? "default" : "ghost"} size="sm" className="w-9" onClick={() => setCurrentPage(page)}>{page}</Button>
              ))}
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next &gt;</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
