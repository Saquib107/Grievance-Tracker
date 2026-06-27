import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import GrievanceForm from "./GrievanceForm"
import { CheckCircle2, ShieldAlert } from "lucide-react"
import { prisma } from "@/lib/prisma"

export default async function NewGrievancePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const categories = await prisma.category.findMany()
  const sites = await prisma.site.findMany({ where: { isActive: true } })

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Raise a Grievance</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Your voice matters. Please provide as much detail as possible to help us investigate and resolve your concern.
        </p>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-4">
          <ShieldAlert className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          What can be reported here?
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-indigo-800/80 dark:text-indigo-200/80">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Harassment or Bullying</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Workplace Safety Concerns</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Payroll or Benefits Issues</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Management or Leadership Issues</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Discrimination</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Ethics or Policy Violations</div>
        </div>
        <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-4 italic">
          For immediate life-threatening emergencies, please contact local emergency services immediately.
        </p>
      </div>
      
      <GrievanceForm categories={categories} sites={sites} />
    </div>
  )
}
