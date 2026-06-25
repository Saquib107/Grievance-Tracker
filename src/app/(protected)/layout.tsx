import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import EmployeeLayout from "@/components/layout/EmployeeLayout"
import HRLayout from "@/components/layout/HRLayout"

import AdminLayout from "@/components/layout/AdminLayout"

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
    return <div className="theme-hr"><HRLayout user={session.user}>{children}</HRLayout></div>
  }

  return <div className="theme-employee"><EmployeeLayout user={session.user}>{children}</EmployeeLayout></div>
}
