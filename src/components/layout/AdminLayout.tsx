"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { ShieldAlert, LayoutDashboard, Settings, LogOut, Users, MapPin, Inbox, PieChart, FileText } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminLayout({ user, children }: { user: any, children: React.ReactNode }) {
  const pathname = usePathname()

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/cases", label: "All Cases", icon: Inbox },
    { href: "/admin/users", label: "HR Management", icon: Users },
    { href: "/admin/employees", label: "Employee Management", icon: Users },
    { href: "/admin/sites", label: "Sites", icon: MapPin },
    { href: "/admin/reports", label: "Reports", icon: FileText },
    { href: "/admin/analytics", label: "Analytics", icon: PieChart },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-300 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 font-bold text-xl text-white border-b border-slate-800">
          <ShieldAlert className="h-6 w-6 mr-2 text-indigo-400" />
          GrievanceHub
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
            Admin Panel
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? "text-indigo-200" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-slate-800">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback className="bg-slate-800 text-slate-300">
                {user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate">{user.name}</span>
              <span className="text-xs text-slate-500 truncate">{user.role}</span>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center text-sm font-medium text-slate-400 hover:text-red-400 transition-colors w-full px-2"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden flex h-16 items-center justify-between px-4 bg-slate-900 text-white">
          <div className="flex items-center font-bold text-xl">
            <ShieldAlert className="h-6 w-6 mr-2 text-indigo-400" />
            GrievanceHub
          </div>
          <Avatar className="h-8 w-8 ring-2 ring-slate-800">
            <AvatarFallback className="bg-slate-800 text-slate-300">
              {user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
