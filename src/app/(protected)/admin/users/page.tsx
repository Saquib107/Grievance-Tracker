import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import UsersClient from "./UsersClient"

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const users = await prisma.user.findMany({
    where: { role: { in: ["HR", "ADMIN"] } },
    include: {
      site: { select: { name: true } },
      _count: {
        select: {
          assignedTo: true,
          approvedCases: true
        }
      },
      assignedTo: {
        select: { status: true, slaDueDate: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate HR Performance Metrics
  const now = new Date()
  const usersWithMetrics = users.map(user => {
    const assigned = user.assignedTo
    const resolvedCount = assigned.filter(c => c.status === "RESOLVED" || c.status === "CLOSED").length
    const overdueCount = assigned.filter(c => c.slaDueDate && new Date(c.slaDueDate) < now && c.status !== "RESOLVED" && c.status !== "CLOSED" && c.status !== "REJECTED").length
    const assignedCount = assigned.length

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      employeeIdStr: user.employeeIdStr,
      designation: user.designation,
      department: user.department,
      role: user.role,
      site: user.site,
      isActive: user.isActive,
      casesAssigned: assignedCount,
      casesResolved: resolvedCount,
      casesOverdue: overdueCount,
      approvedCases: user._count.approvedCases
    }
  })

  const sites = await prisma.site.findMany({
    orderBy: { name: 'asc' }
  })

  return <UsersClient initialUsers={usersWithMetrics} sites={sites} />
}
