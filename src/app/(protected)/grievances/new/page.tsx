import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import GrievanceForm from "./GrievanceForm"

export default async function NewGrievancePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Submit a New Grievance</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Please fill out the tracking form template below to register your grievance.
        </p>
      </div>
      
      <GrievanceForm />
    </div>
  )
}
