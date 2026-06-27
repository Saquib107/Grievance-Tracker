import HROnBehalfForm from "@/components/HROnBehalfForm"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function HROnBehalfPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    redirect("/dashboard")
  }

  const sites = await prisma.site.findMany({ where: { isActive: true } })

  return (
    <div className="py-6">
      <HROnBehalfForm sites={sites} />
    </div>
  )
}
