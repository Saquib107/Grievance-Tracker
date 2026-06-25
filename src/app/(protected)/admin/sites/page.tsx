import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminSitesClient from "./AdminSitesClient"

export default async function AdminSitesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const sites = await prisma.site.findMany({
    include: {
      users: { where: { role: "HR" }, select: { name: true } },
      _count: {
        select: {
          users: { where: { role: "EMPLOYEE" } },
          grievances: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Format data for the client
  const formattedSites = sites.map(site => ({
    id: site.id,
    code: site.code || "N/A",
    name: site.name,
    location: site.location || "N/A",
    hrAssigned: site.users.map(u => u.name).join(", ") || "None",
    totalEmployees: site._count.users,
    totalCases: site._count.grievances
  }))

  return <AdminSitesClient initialSites={formattedSites} />
}
