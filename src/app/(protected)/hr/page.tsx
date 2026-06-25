import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ShieldAlert, Users, Clock, AlertCircle } from "lucide-react"

export default async function HRDashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) return null

  // New KPI Cards for HR: Pending Approval, Assigned To Me, In Progress, Overdue
  const now = new Date()

  const pendingApproval = await prisma.grievance.count({
    where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } }
  })

  const assignedToMe = await prisma.grievance.count({
    where: { assignedToId: userId, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } }
  })

  const inProgress = await prisma.grievance.count({
    where: { status: "IN_PROGRESS" }
  })

  const overdue = await prisma.grievance.count({
    where: { 
      status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] },
      slaDueDate: { lt: now }
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        HR Workspace
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500 dark:text-slate-400">Pending Approval</h3>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{pendingApproval}</div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500 dark:text-slate-400">Assigned To Me</h3>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{assignedToMe}</div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500 dark:text-slate-400">In Progress</h3>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{inProgress}</div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500 dark:text-slate-400">Overdue SLA</h3>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{overdue}</div>
        </div>
      </div>
    </div>
  )
}
