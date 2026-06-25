"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { createHRUser, resetHRPassword, deleteUser } from "@/app/actions/admin"
import { updateEmployeeStatus } from "@/app/actions/employees"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Key, BadgeCheck, Clock, Inbox, CheckCircle2, UserPlus, Activity, Ban, CheckCircle, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function UsersClient({ initialUsers, sites }: { initialUsers: any[], sites: any[] }) {
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
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Site</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Cases Assigned</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{u.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{u.employeeIdStr}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{u.site?.name || "Unassigned"}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={u.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
                      {u.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <Badge variant="secondary">{u.casesAssigned}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openPerformance(u)}>
                          <Activity className="mr-2 h-4 w-4" /> Performance
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setResetUserId(u.id); setResetModalOpen(true); }}>
                          <Key className="mr-2 h-4 w-4" /> Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatus(u.id, u.isActive)}>
                          {u.isActive ? <Ban className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />} 
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
