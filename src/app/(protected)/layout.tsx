import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import EmployeeLayout from "@/components/layout/EmployeeLayout"
import HRLayout from "@/components/layout/HRLayout"

import AdminLayout from "@/components/layout/AdminLayout"

import { prisma } from "@/lib/prisma"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role === "ADMIN") {
    return <div className="theme-admin"><AdminLayout user={session.user}>{children}</AdminLayout></div>
  }

  if (session.user.role === "HR") {
    // Fetch HR specific badges
    const pending = await prisma.grievance.count({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } }
    })
    const assigned = await prisma.grievance.count({
      where: { assignedToId: session.user.id, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } }
    })
    
    return <div className="theme-hr"><HRLayout user={session.user} badges={{ pending, assigned }}>{children}</HRLayout></div>
  }

  return <div className="theme-employee"><EmployeeLayout user={session.user}>{children}</EmployeeLayout></div>
}
