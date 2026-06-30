"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError("Invalid email or password")
      setIsLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      
      {/* Left Side - Branding (Hidden on small mobile screens) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-indigo-600 dark:bg-indigo-900 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grad1)"/>
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'white', stopOpacity: 0.8}} />
                <stop offset="100%" style={{stopColor: 'white', stopOpacity: 0}} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-white blur-3xl opacity-20"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-white blur-3xl opacity-10"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-12">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="flex items-center gap-3 font-bold text-3xl mb-6">
            <ShieldAlert className="h-10 w-10" />
            <span>GrievanceHub</span>
          </div>
          <p className="text-indigo-100 text-xl max-w-md font-light leading-relaxed">
            The secure, transparent, and efficient way to manage workplace concerns and promote a healthier work environment.
          </p>
        </div>

        <div className="relative z-10 text-indigo-200 text-sm">
          &copy; {new Date().getFullYear()} PGEPL Grievance Management System.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center md:text-left">
            <div className="md:hidden flex items-center justify-center gap-2 font-bold text-2xl text-indigo-600 dark:text-indigo-400 mb-8">
              <ShieldAlert className="h-8 w-8" />
              <span>GrievanceHub</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Please enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="employee@pgepl.com" 
                required
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-indigo-500 h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Forgot password?
                </a>
              </div>
              <Input 
                id="password" 
                type="password" 
                required
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus-visible:ring-indigo-500 h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center">
                <ShieldAlert className="h-4 w-4 mr-2" /> {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 text-base font-medium transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in securely"
              )}
            </Button>
          </form>

          <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Demo Accounts:</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                  <p className="font-medium text-slate-800 dark:text-slate-200">Employee</p>
                  <p className="text-[10px] break-all">employee@pgepl.com / emp123</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                  <p className="font-medium text-slate-800 dark:text-slate-200">HR Manager</p>
                  <p className="text-[10px] break-all">hr@pgepl.com / hr123</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  )
}
