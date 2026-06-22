"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { ShieldAlert, LogOut, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar({ user }: { user: any }) {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/grievances/new", label: "Raise Grievance" },
    { href: "/grievances", label: "My Grievances" },
  ]

  if (user.role === "HR" || user.role === "ADMIN") {
    links.push({ href: "/hr/cases", label: "Case Management" })
    links.push({ href: "/hr/analytics", label: "Analytics" })
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 font-bold text-xl mr-8 text-indigo-600 dark:text-indigo-400">
          <ShieldAlert className="h-6 w-6" />
          <Link href="/dashboard">GrievanceHub</Link>
        </div>
        
        <div className="hidden md:flex gap-6 items-center flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                pathname === link.href
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-8 w-8 rounded-full focus:outline-none hover:opacity-80 transition-opacity">
              <Avatar className="h-8 w-8 ring-2 ring-indigo-500/20">
                <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  {user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs font-semibold text-indigo-600 mt-1 uppercase tracking-wider">
                    {user.role}
                  </p>
                </div>
              </DropdownMenuLabel>
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

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
