import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import GrievanceForm from "./GrievanceForm"

export default async function NewGrievancePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const categories = await prisma.category.findMany()

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Raise a Grievance</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Please fill out the form below to submit your grievance. You can choose to remain anonymous if company policy allows.
        </p>
      </div>
      
      <GrievanceForm categories={categories} />
    </div>
  )
}
