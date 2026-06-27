import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import HRDashboard from "@/components/dashboard/HRDashboard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  const role = session?.user?.role

  if (!userId) return null

  if (role === "ADMIN") {
    redirect("/admin")
  }

  if (role === "HR") {
    redirect("/hr")
  }

  // Employee role defaults to their grievances list instead of a dashboard
  redirect("/grievances")
}
