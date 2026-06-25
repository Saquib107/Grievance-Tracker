import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminEmployeesClient from "./AdminEmployeesClient"

export default async function AdminEmployeesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    include: { site: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  })

  const sites = await prisma.site.findMany({
    orderBy: { name: 'asc' }
  })

  return <AdminEmployeesClient initialEmployees={employees} sites={sites} />
}
