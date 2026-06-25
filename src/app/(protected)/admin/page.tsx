import { redirect } from "next/navigation"

export default function AdminDashboardPage() {
  // Admin dashboard logic here. For now, redirect to cases.
  redirect("/hr/cases")
}
