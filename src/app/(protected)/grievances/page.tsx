import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import MyGrievancesClient from "./MyGrievancesClient"

export default async function MyGrievancesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  const grievances = await prisma.grievance.findMany({
    where: { employeeId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  })

  const categories = await prisma.category.findMany()

  return (
    <MyGrievancesClient initialGrievances={grievances} categories={categories} />
  )
}
