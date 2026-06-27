"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { createHRUser, resetHRPassword, deleteUser } from "@/app/actions/admin"
import { updateEmployeeStatus } from "@/app/actions/employees"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Key, BadgeCheck, Clock, Inbox, CheckCircle2, UserPlus, Activity, Ban, CheckCircle, Trash2, Search, Download, Printer } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function UsersClient({ initialUsers, sites, unassignedCasesCount = 0 }: { initialUsers: any[], sites: any[], unassignedCasesCount?: number }) {
  const [users, setUsers] = useState(initialUsers)
  const [isOpen, setIsOpen] = useState(false)
  const [performanceOpen, setPerformanceOpen] = useState(false)
  const [selectedHR, setSelectedHR] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Form State
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [employeeIdStr, setEmployeeIdStr] = useState("")
  const [designation, setDesignation] = useState("")
  const [department, setDepartment] = useState("")
  const [password, setPassword] = useState("")
  const [siteId, setSiteId] = useState("")

  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetUserId, setResetUserId] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const [filterSearch, setFilterSearch] = useState("")
  const [filterSite, setFilterSite] = useState("ALL")
  const [filterStatus, setFilterStatus] = useState("ALL")
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalHR = users.length
  const activeHR = users.filter(u => u.isActive).length
  const inactiveHR = users.filter(u => !u.isActive).length
  const totalAssignedCases = users.reduce((acc, u) => acc + (u.casesAssigned || 0), 0)
  const averageCases = totalHR > 0 ? Math.round(totalAssignedCases / totalHR) : 0
  const maxLoad = Math.max(...users.map(u => u.casesAssigned || 0), 20)

  const processedUsers = useMemo(() => {
    let result = users
    if (filterSearch) {
      const q = filterSearch.toLowerCase()
      result = result.filter(u => u.name?.toLowerCase().includes(q) || u.employeeIdStr?.toLowerCase().includes(q))
    }
    if (filterSite !== "ALL") result = result.filter(u => u.site?.id === filterSite)
    if (filterStatus !== "ALL") {
      if (filterStatus === "ACTIVE") result = result.filter(u => u.isActive)
      if (filterStatus === "INACTIVE") result = result.filter(u => !u.isActive)
    }
    return result
  }, [users, filterSearch, filterSite, filterStatus])

  useMemo(() => { setCurrentPage(1) }, [filterSearch, filterSite, filterStatus])

  const paginatedUsers = processedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(processedUsers.length / itemsPerPage)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createHRUser({ name, email, password, siteId, phone, employeeIdStr, designation, department })
    setLoading(false)
    if (res.success) {
      toast.success("HR User created successfully!")
      setIsOpen(false)
      setName(""); setEmail(""); setPassword(""); setSiteId("");
      setPhone(""); setEmployeeIdStr(""); setDesignation(""); setDepartment("");
      router.refresh()
    } else {
      toast.error(res.error || "Failed to create user")
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await resetHRPassword(resetUserId, newPassword)
    setLoading(false)
    if (res.success) {
      toast.success("Password reset successfully!")
      setResetModalOpen(false)
      setNewPassword("")
    } else {
      toast.error(res.error || "Failed to reset password")
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await updateEmployeeStatus(id, !currentStatus)
    if (res.success) {
      toast.success(`HR User ${!currentStatus ? 'activated' : 'deactivated'} successfully.`)
      router.refresh()
    } else {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return
    const res = await deleteUser(id)
    if (res.success) {
      toast.success("User deleted successfully!")
      router.refresh()
    } else {
      toast.error(res.error || "Failed to delete user")
    }
  }

  const openPerformance = (user: any) => {
    setSelectedHR(user)
    setPerformanceOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">HR Management</h2>
          <p className="text-sm text-slate-500">Manage Human Resources staff and monitor performance.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700" />}>
            <UserPlus className="w-4 h-4 mr-2" /> Add HR User
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create HR Account</DialogTitle>
                <DialogDescription>Role will be automatically assigned as HR.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Ravi Kumar" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ravi@pgepl.local" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" />
                </div>
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input required value={employeeIdStr} onChange={e => setEmployeeIdStr(e.target.value)} placeholder="EMP-1001" />
                </div>
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input required value={designation} onChange={e => setDesignation(e.target.value)} placeholder="Senior HR Manager" />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input required value={department} onChange={e => setDepartment(e.target.value)} placeholder="Human Resources" />
                </div>
                <div className="space-y-2">
                  <Label>Assigned Site</Label>
                  <Select value={siteId} onValueChange={(val) => setSiteId(val ?? "")} required>
                    <SelectTrigger><SelectValue placeholder="Select a site" /></SelectTrigger>
                    <SelectContent>
                      {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>Create HR User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Total HR Users</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalHR}</div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
            <span className="text-emerald-600 font-medium">{activeHR} Active</span>
            <span className="text-rose-600 font-medium">{inactiveHR} Inactive</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Assigned Cases</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalAssignedCases}</div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
            <span className="text-indigo-600 font-medium">Across all HRs</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Average Workload</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{averageCases}</div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Cases per HR</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Unassigned Cases</div>
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{unassignedCasesCount}</div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
            <span className="text-rose-600 font-medium cursor-pointer hover:underline">Needs assignment</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row flex-wrap gap-4 items-end">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <Label className="text-xs font-semibold text-slate-500">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="🔍 Search HR Name or ID..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} className="h-9 pl-9" />
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

      {/* HR Performance Dashboard Modal */}
      <Dialog open={performanceOpen} onOpenChange={setPerformanceOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>HR Performance Dashboard</DialogTitle>
            <DialogDescription>Metrics for {selectedHR?.name}</DialogDescription>
          </DialogHeader>
          {selectedHR && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center">
                <Inbox className="w-8 h-8 text-blue-500 mb-2" />
                <div className="text-2xl font-bold">{selectedHR.casesAssigned}</div>
                <div className="text-sm text-slate-500">Assigned Cases</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <div className="text-2xl font-bold">{selectedHR.casesResolved}</div>
                <div className="text-sm text-slate-500">Resolved Cases</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center">
                <Clock className="w-8 h-8 text-amber-500 mb-2" />
                <div className="text-2xl font-bold">{selectedHR.casesOverdue}</div>
                <div className="text-sm text-slate-500">Overdue Cases</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center">
                <BadgeCheck className="w-8 h-8 text-purple-500 mb-2" />
                <div className="text-2xl font-bold">{selectedHR.approvedCases}</div>
                <div className="text-sm text-slate-500">Approvals Given</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleResetPassword}>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>Enter a new password for this user.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>Reset Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg border shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">HR Name & ID</th>
                <th className="px-6 py-4 font-medium">Site</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Cases Assigned</th>
                <th className="px-6 py-4 font-medium w-48">Workload</th>
                <th className="px-6 py-4 font-medium text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors h-[60px] border-l-4 border-transparent hover:border-indigo-400">
                  <td className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {u.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{u.employeeIdStr}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 text-slate-600 dark:text-slate-300 font-medium">{u.site?.name || "Unassigned"}</td>
                  <td className="px-6">
                    {u.isActive ? (
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 font-semibold text-xs rounded-full shadow-sm">🟢 Active</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-rose-100 text-rose-700 border-none px-3 py-1 font-semibold text-xs rounded-full shadow-sm">🔴 Inactive</Badge>
                    )}
                  </td>
                  <td className="px-6">
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-none px-3 py-1 font-semibold text-xs rounded-full shadow-sm">
                      🟣 {u.casesAssigned || 0} Cases
                    </Badge>
                  </td>
                  <td className="px-6">
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Load</span>
                        <span>{Math.round(((u.casesAssigned || 0) / maxLoad) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full ${
                            ((u.casesAssigned || 0) / maxLoad) > 0.8 ? 'bg-rose-500' :
                            ((u.casesAssigned || 0) / maxLoad) > 0.5 ? 'bg-amber-500' :
                            'bg-indigo-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.round(((u.casesAssigned || 0) / maxLoad) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none">
                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openPerformance(u)}>
                          <Activity className="mr-2 h-4 w-4" /> View Performance
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setResetUserId(u.id); setResetModalOpen(true); }}>
                          <Key className="mr-2 h-4 w-4" /> Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatus(u.id, u.isActive)}>
                          {u.isActive ? <Ban className="mr-2 h-4 w-4 text-red-500" /> : <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />} 
                          {u.isActive ? "Deactivate HR" : "Activate HR"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => handleDelete(u.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete HR
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="text-4xl">👥</div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">No HR Users Found</h3>
                      <p className="text-slate-500">You haven't added any HR users yet, or none match your filters.</p>
                      <Button variant="outline" className="mt-2" onClick={() => setIsOpen(true)}>Add HR User</Button>
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
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, processedUsers.length)} of {processedUsers.length}
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
