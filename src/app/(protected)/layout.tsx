import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import EmployeeLayout from "@/components/layout/EmployeeLayout"
import HRLayout from "@/components/layout/HRLayout"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Choose layout based on role
  if (session.user.role === "HR" || session.user.role === "ADMIN") {
    return <HRLayout user={session.user}>{children}</HRLayout>
  }

  return <EmployeeLayout user={session.user}>{children}</EmployeeLayout>
}
