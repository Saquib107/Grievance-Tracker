"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { ShieldAlert, LayoutDashboard, LogOut, Users, MapPin, Inbox, PieChart, FileText, Settings, ClipboardList, UserCog, Bell, ChevronDown, User, Search, Clock, ChevronRight, Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NotificationBell } from "@/components/ui/notification-bell"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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
  ]



  const lastSyncTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const getBreadcrumb = () => {
    if (pathname === "/admin") return "Dashboard"
    if (pathname.includes("/admin/users")) return "HR Management"
    if (pathname.includes("/admin/employees")) return "Employee Management"
    if (pathname.includes("/admin/sites")) return "Site Management"
    if (pathname.includes("/admin/cases")) return "Case Management"
    if (pathname.includes("/admin/reports")) return "Reports"
    if (pathname.includes("/admin/analytics")) return "Analytics"
    if (pathname.includes("/admin/settings")) return "Settings"
    if (pathname.includes("/admin/audit-logs")) return "Audit Logs"
    if (pathname.includes("/admin/system-users")) return "System Users"
    return "Dashboard"
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#111827] text-slate-300 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 font-bold text-xl text-white border-b border-slate-800">
          <ShieldAlert className="h-6 w-6 mr-2 text-indigo-400" />
          GrievanceHub
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
            Admin Panel
          </div>
          <nav className="space-y-1 mb-8">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = link.href === "/admin" 
                ? pathname === "/admin" 
                : (pathname === link.href || pathname.startsWith(`${link.href}/`))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400"
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? "text-indigo-200" : "text-slate-500"}`} />
                  {link.label}
                </Link>
              )
            })}
          </nav>

        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 w-full hover:bg-slate-800 p-2 rounded-md transition-colors text-left">
                <Avatar className="h-9 w-9 ring-2 ring-slate-800">
                  <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                  <AvatarFallback className="bg-slate-800 text-slate-300">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden flex-1">
                  <span className="text-sm font-medium text-white truncate">{user.name}</span>
                  <span className="text-xs text-slate-500 truncate">{user.role}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#111827] text-white border-slate-800">
              <DropdownMenuItem 
                className="focus:bg-slate-800 focus:text-white text-red-400 focus:text-red-400 cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex justify-between items-center text-[10px] text-slate-500 px-2 pt-2">
            <span>GrievanceHub v1.0</span>
            <span>Last Sync: {lastSyncTime}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <div className="md:hidden flex items-center font-bold text-xl text-slate-900 dark:text-white">
            <Sheet>
              <SheetTrigger render={<button className="mr-3 p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" />}>
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-[#111827] text-slate-300 border-r-slate-800 p-0">
                <div className="h-16 flex items-center px-6 font-bold text-xl text-white border-b border-slate-800">
                  <ShieldAlert className="h-6 w-6 mr-2 text-indigo-400" />
                  GrievanceHub
                </div>
                <div className="py-6 px-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
                    Admin Panel
                  </div>
                  <nav className="space-y-1">
                    {links.map((link) => {
                      const Icon = link.icon
                      const isActive = link.href === "/admin" 
                        ? pathname === "/admin" 
                        : (pathname === link.href || pathname.startsWith(`${link.href}/`))
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? "bg-indigo-600 text-white"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? "text-indigo-200" : "text-slate-500"}`} />
                          {link.label}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                  <span>GrievanceHub v1.0</span>
                </div>
              </SheetContent>
            </Sheet>
            <ShieldAlert className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
            GrievanceHub
          </div>
          
          <div className="hidden md:flex flex-1 items-center justify-between">
            {/* Left side: Breadcrumb */}
            <div className="flex items-center text-sm font-medium text-slate-500 w-1/4">
              <Link href="/admin" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Dashboard</Link>
              {pathname !== "/admin" && (
                <>
                  <ChevronRight className="h-4 w-4 mx-1.5 text-slate-400" />
                  <span className="text-slate-900 dark:text-slate-100">{getBreadcrumb()}</span>
                </>
              )}
            </div>

            {/* Middle: Global Search Removed */}

            {/* Right side: Last Updated, Notifications */}
            <div className="flex items-center justify-end gap-3 w-1/4">
              <div className="hidden lg:flex items-center text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full whitespace-nowrap">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Updated {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>

              <NotificationBell />
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar className="h-8 w-8 ring-2 ring-slate-200">
                  <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                  <AvatarFallback className="bg-slate-200 text-slate-600">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#111827]">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs leading-none text-slate-500">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400 cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

