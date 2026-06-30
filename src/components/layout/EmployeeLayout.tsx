"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { ShieldAlert, LogOut, User, Menu, Bell, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function EmployeeLayout({ user, children }: { user: any, children: React.ReactNode }) {
  const pathname = usePathname()

  const links = [
    { href: "/grievances/new", label: "Raise Grievance" },
    { href: "/grievances", label: "My Grievances" },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-xl mr-8 text-indigo-600 dark:text-indigo-400">
            <ShieldAlert className="h-6 w-6" />
            <Link href="/grievances">GrievanceHub</Link>
          </div>
          
          <div className="hidden md:flex gap-6 items-center flex-1">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 relative ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"></span>
                  )}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors outline-none focus:ring-2 focus:ring-indigo-500">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950"></span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex justify-between items-center">
                    Notifications
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">2 New</span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <div className="flex flex-col max-h-[320px] overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-l-2 border-indigo-500 transition-colors">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">HR responded to Ticket #GH-1004</p>
                    <p className="text-xs text-slate-500 mt-1">Please check the ticket for further details.</p>
                    <p className="text-xs text-indigo-600 mt-1 font-medium">10 mins ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-l-2 border-amber-500 transition-colors">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Case moved to Investigation</p>
                    <p className="text-xs text-slate-500 mt-1">Ticket #GH-0992 is now under investigation.</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Yesterday</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 pr-2 rounded-full transition-colors outline-none focus:ring-2 focus:ring-indigo-500">
                <Avatar className="h-8 w-8 ring-2 ring-indigo-500/20">
                  <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-none">
                    {user.name?.split(' ')[0]} {user.name?.split(' ')[1]?.[0] ? user.name?.split(' ')[1]?.[0] + '.' : ''}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-none mt-1 uppercase font-semibold">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0">
                  <Link href="/profile" className="flex items-center w-full p-2 cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-red-600 cursor-pointer p-2 flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
                <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] bg-slate-50 dark:bg-slate-950">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <ShieldAlert className="h-5 w-5" />
                    GrievanceHub
                  </SheetTitle>
                </SheetHeader>
                <div className="py-6 flex flex-col gap-4">
                  {links.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(link.href)
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`text-lg font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                          isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex items-center text-red-600 dark:text-red-400 text-lg font-medium"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Log out
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  )
}
