import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import UsersClient from "./UsersClient"

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const users = await prisma.user.findMany({
    where: { role: "HR" },
    include: { site: true },
    orderBy: { createdAt: 'desc' }
  })

  const sites = await prisma.site.findMany({
    orderBy: { name: 'asc' }
  })

  return <UsersClient initialUsers={users} sites={sites} />
}
