import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import TrackerTable from "@/components/TrackerTable"
import ExcelImportButton from "@/components/ExcelImportButton"
import PDFExportButton from "@/components/PDFExportButton"

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

  const serializedGrievances = JSON.parse(JSON.stringify(grievances))

  return (
    <div className="py-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Excel Tracker</h2>
          <p className="text-slate-500 mt-1">Manage and update grievances in a spreadsheet-like view.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExcelImportButton />
          <PDFExportButton data={serializedGrievances} title="Grievance Master Tracker Report" />
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <TrackerTable initialData={grievances} />
      </div>
    </div>
  )
}
