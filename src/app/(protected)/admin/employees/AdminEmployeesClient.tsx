"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Upload, Users, UserPlus, FileSpreadsheet, Lock } from "lucide-react"
import { bulkImportEmployees, updateEmployeeStatus } from "@/app/actions/employees"

export default function AdminEmployeesClient({ initialEmployees, sites }: { initialEmployees: any[], sites: any[] }) {
  const [employees, setEmployees] = useState(initialEmployees)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white border-slate-200">
            <UserPlus className="h-4 w-4 mr-2" /> Add Employee
          </Button>
          
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Import Excel
              </Button>
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

      <div className="bg-white rounded-lg border shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Employee ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Designation / Dept</th>
                <th className="px-6 py-4 font-medium">Site</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {initialEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                    {emp.employeeIdStr || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">
                      <Link href={`/admin/employees/${emp.id}`} className="hover:text-indigo-600 hover:underline">
                        {emp.name}
                      </Link>
                    </div>
                    <div className="text-xs text-slate-500">{emp.phone || emp.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-700 dark:text-slate-300">{emp.designation || "N/A"}</div>
                    <div className="text-xs text-slate-500">{emp.department || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {emp.site?.name || "Unassigned"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={emp.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
                      {emp.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleStatus(emp.id, emp.isActive)}
                      className={emp.isActive ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}
                    >
                      {emp.isActive ? "Disable" : "Enable"}
                    </Button>
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
