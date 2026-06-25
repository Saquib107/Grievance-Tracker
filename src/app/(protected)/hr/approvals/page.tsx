import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ApprovalsClient from "./ApprovalsClient"

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "HR") {
    redirect("/dashboard")
  }

  // HR should see cases that are SUBMITTED or UNDER_REVIEW for their site
  const cases = await prisma.grievance.findMany({
    where: {
      siteId: (session.user as any).siteId,
      status: {
        in: ["SUBMITTED", "UNDER_REVIEW"]
      }
    },
    include: {
      employee: true,
      site: true,
      category: true,
    },
    orderBy: { createdAt: 'asc' }
  })

  return <ApprovalsClient initialCases={cases} />
}
