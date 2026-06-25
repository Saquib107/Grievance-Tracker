import HROnBehalfForm from "@/components/HROnBehalfForm"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HROnBehalfPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    redirect("/dashboard")
  }

  return (
    <div className="py-6">
      <HROnBehalfForm />
    </div>
  )
}
