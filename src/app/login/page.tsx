"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Loader2 } from "lucide-react"

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      
      <Card className="w-full max-w-md relative z-10 border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md">
        <CardHeader className="space-y-3 pb-6">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-indigo-500/30">
            <ShieldAlert className="w-6 h-6 text-indigo-400" />
          </div>
          <CardTitle className="text-2xl text-center font-bold text-slate-100">GrievanceHub</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Secure Employee Grievance Management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="employee@pgepl.com" 
                required
                className="bg-slate-800/50 border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500/20 placeholder:text-slate-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                required
                className="bg-slate-800/50 border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in securely"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-xs text-slate-500">
            By signing in, you agree to our terms of service and privacy policy. 
            All submissions can be anonymized.
          </div>
          
          <div className="text-xs text-slate-600 pt-4 border-t border-slate-800/50 w-full">
            <p>Demo Accounts:</p>
            <p>employee@pgepl.com / password123</p>
            <p>hr@pgepl.com / password123</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
