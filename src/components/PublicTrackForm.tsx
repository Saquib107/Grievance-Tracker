"use client"

import { useState } from "react"
import { trackPublicGrievance } from "@/app/actions/publicGrievance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Search, Activity, Clock, User, CheckCircle2 } from "lucide-react"

export default function PublicTrackForm() {
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<any>(null)

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSearching(true)
    setError("")
    setResult(null)
    
    const formData = new FormData(e.currentTarget)
    const ticketNumber = formData.get("ticketNumber") as string
    const phone = formData.get("phone") as string
    
    try {
      const res = await trackPublicGrievance(ticketNumber, phone)
      if (res.success) {
        setResult(res.data)
      }
    } catch (err: any) {
      setError(err.message || "Failed to find grievance. Check your number.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-8">
      <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1"></div>
        <CardHeader className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Track Grievance Status
              </CardTitle>
              <CardDescription className="text-slate-500 mt-1">
                Enter your Tracking Number and Phone Number to see live updates.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSearch}>
          <CardContent className="space-y-6 pt-8 pb-8 px-4 sm:px-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="ticketNumber" className="text-slate-700 dark:text-slate-300 font-semibold">Grievance / Tracking Number *</Label>
                <Input id="ticketNumber" name="ticketNumber" placeholder="e.g. GRV-2026-00124" required className="h-11 font-mono uppercase" />
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300 font-semibold">Registered Phone Number *</Label>
                <Input id="phone" name="phone" type="tel" placeholder="Used during submission" required className="h-11" />
              </div>
            </div>

            <Button type="submit" disabled={isSearching} className="w-full h-12 text-lg mt-4 bg-slate-900 hover:bg-slate-800 text-white shadow-md">
              {isSearching ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
              Track Status
            </Button>
          </CardContent>
        </form>
      </Card>

      {result && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-900 dark:bg-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between text-white">
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Status for</p>
              <h2 className="text-2xl font-black tracking-tight">{result.ticketNumber}</h2>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center bg-white/10 px-4 py-2 rounded-full">
              <Activity className="h-5 w-5 mr-2 text-indigo-300" />
              <span className="font-semibold text-lg">{result.currentStatus}</span>
            </div>
          </div>
          
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <div className="p-6 flex flex-col">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider flex items-center mb-2"><Clock className="h-3 w-3 mr-1" /> Reported On</span>
                <span className="font-medium text-slate-900 dark:text-white">{new Date(result.dateReported).toLocaleDateString()}</span>
              </div>
              <div className="p-6 flex flex-col">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider flex items-center mb-2"><User className="h-3 w-3 mr-1" /> Handled By</span>
                <span className="font-medium text-slate-900 dark:text-white">{result.concernedPerson || "Unassigned"}</span>
              </div>
              <div className="p-6 flex flex-col">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider flex items-center mb-2"><CheckCircle2 className="h-3 w-3 mr-1" /> Solved Status</span>
                <span className={`font-medium ${result.solved === 'RESOLVED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {result.solved}
                </span>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Issue Summary</h3>
              <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                {result.issue}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
