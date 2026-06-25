import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Mail, Building2, Briefcase, Calendar, History, Inbox, MapPin } from "lucide-react"
import Link from "next/link"

export default async function EmployeeProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const { id } = await params

  const employee = await prisma.user.findUnique({
    where: { id },
    include: {
      site: true,
      grievances: {
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          assignedTo: { select: { name: true } }
        }
      }
    }
  })

  if (!employee) notFound()

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/employees" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          &larr; Back to Employees
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <Card className="md:col-span-1 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b flex flex-col items-center py-6">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <User className="w-10 h-10" />
            </div>
            <CardTitle className="text-xl text-center">{employee.name}</CardTitle>
            <p className="text-slate-500 font-mono mt-1 text-sm">{employee.employeeIdStr || "No ID"}</p>
            <div className="mt-3">
              <Badge variant="outline" className={employee.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
                {employee.isActive ? "Active Employee" : "Disabled Account"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Designation</p>
                <p className="font-medium text-slate-900 dark:text-white">{employee.designation || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Department</p>
                <p className="font-medium text-slate-900 dark:text-white">{employee.department || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Site</p>
                <p className="font-medium text-slate-900 dark:text-white">{employee.site?.name || "Unassigned"}</p>
              </div>
            </div>
            <hr className="my-4 border-slate-100 dark:border-slate-800" />
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="font-medium text-slate-900 dark:text-white">{employee.phone || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm break-all">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium text-slate-900 dark:text-white">{employee.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Case History */}
        <Card className="md:col-span-2 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="w-5 h-5 text-indigo-500" />
              Grievance History ({employee.grievances.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {employee.grievances.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p>No grievances submitted by this employee.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {employee.grievances.map(g => (
                  <div key={g.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/admin/cases/${g.id}`} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                        {g.ticketNumber}: {g.subject || "No Subject"}
                      </Link>
                      <Badge variant="outline" className={
                        g.status === 'RESOLVED' || g.status === 'CLOSED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        g.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }>
                        {g.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                      {g.description || "No description provided."}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(g.createdAt).toLocaleDateString()}
                      </span>
                      {g.assignedTo && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> Assigned: {g.assignedTo.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
