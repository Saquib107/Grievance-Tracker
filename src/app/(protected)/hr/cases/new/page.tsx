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

  const categories = await prisma.category.findMany()

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <HROnBehalfForm sites={sites} categories={categories} />
    </div>
  )
}
