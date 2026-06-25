import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ReportsClient from "./ReportsClient"

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    redirect("/dashboard")
  }

  // Fetch all grievances with relations for reporting
  const grievances = await prisma.grievance.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
      category: true, 
      employee: { select: { name: true, department: true } },
      assignedTo: { select: { name: true } }
    }
  })

  // We serialize to pass to Client Component safely
  const serialized = JSON.parse(JSON.stringify(grievances))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Reports Module</h1>
        <p className="text-slate-500 mt-1">Generate and export official PDF reports for compliance and auditing.</p>
      </div>

      <ReportsClient grievances={serialized} />
    </div>
  )
}
