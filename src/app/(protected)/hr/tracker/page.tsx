import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import TrackerTable from "@/components/TrackerTable"

export default async function TrackerPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    redirect("/dashboard")
  }

  // Fetch all grievances ordered by creation date
  const grievances = await prisma.grievance.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Grievance Tracker</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Master view for all employee grievances based on the official tracking template.
        </p>
      </div>
      
      <div className="flex-1 min-h-0 border rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
        <TrackerTable initialData={grievances} />
      </div>
    </div>
  )
}
