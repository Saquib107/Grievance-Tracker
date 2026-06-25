"use client"

import { useState } from "react"
import { submitPublicGrievance } from "@/app/actions/publicGrievance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, CheckCircle2, ShieldAlert, WifiOff } from "lucide-react"
import { get, set } from "idb-keyval"
import { useEffect } from "react"

export default function PublicGrievanceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successData, setSuccessData] = useState<{ ticketNumber: string, isOffline?: boolean } | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const syncOfflineData = async () => {
      if (!navigator.onLine) return;
      try {
        const offlineQueue = await get("grievanceQueue") || [];
        if (offlineQueue.length > 0) {
          for (const data of offlineQueue) {
            const fd = new FormData();
            Object.entries(data).forEach(([key, val]) => fd.append(key, val as string));
            await submitPublicGrievance(fd).catch(e => console.error("Sync error", e));
          }
          await set("grievanceQueue", []);
          // Optionally show a toast for synced items
        }
      } catch (err) {
        console.error("IDB error", err)
      }
    }

    window.addEventListener('online', syncOfflineData);
    syncOfflineData();
    return () => window.removeEventListener('online', syncOfflineData);
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    
    if (!navigator.onLine) {
      // Save Offline
      try {
        const dataObj: Record<string, any> = {};
        formData.forEach((value, key) => dataObj[key] = value);
        
        const queue = await get("grievanceQueue") || [];
        queue.push(dataObj);
        await set("grievanceQueue", queue);
        
        setSuccessData({ ticketNumber: "PENDING-SYNC", isOffline: true });
      } catch (err) {
        setError("Failed to save offline.")
      } finally {
        setIsSubmitting(false)
      }
      return;
    }

    try {
      const res = await submitPublicGrievance(formData)
      if (res.success) {
        setSuccessData({ ticketNumber: res.ticketNumber })
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit grievance. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successData) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden max-w-2xl mx-auto mt-12">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1"></div>
        <CardContent className="pt-12 pb-12 flex flex-col items-center text-center">
          {successData.isOffline ? (
            <WifiOff className="h-20 w-20 text-amber-500 mb-6" />
          ) : (
            <CheckCircle2 className="h-20 w-20 text-emerald-500 mb-6" />
          )}
          
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {successData.isOffline ? "Saved Offline!" : "Grievance Submitted!"}
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
            {successData.isOffline 
              ? "You are currently offline. Your grievance has been saved securely on this device and will automatically sync when you reconnect to the internet."
              : "Your grievance has been successfully recorded. Please save your tracking number below to check its status."}
          </p>
          
          {!successData.isOffline && (
            <div className="bg-slate-100 dark:bg-slate-950 px-8 py-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
              <span className="block text-sm text-slate-500 uppercase font-bold tracking-wider mb-1">Tracking Number</span>
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 select-all">{successData.ticketNumber}</span>
            </div>
          )}
          <Button className="mt-10" onClick={() => window.location.href = '/public/track'}>
            Track Status Now
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden max-w-3xl mx-auto mt-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1"></div>
      <CardHeader className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Public Grievance Portal
            </CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              Submit your concern directly to the HR department.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-8 pb-8 px-4 sm:px-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="empIdGatepass" className="text-slate-700 dark:text-slate-300 font-semibold">Emp ID / Gatepass Number *</Label>
              <Input id="empIdGatepass" name="empIdGatepass" required className="h-11" />
            </div>

            <div className="space-y-3">
              <Label htmlFor="location" className="text-slate-700 dark:text-slate-300 font-semibold">Site / Location *</Label>
              <Input id="location" name="location" required className="h-11" />
            </div>

            <div className="space-y-3">
              <Label htmlFor="grievantName" className="text-slate-700 dark:text-slate-300 font-semibold">Full Name *</Label>
              <Input id="grievantName" name="grievantName" required className="h-11" />
            </div>

            <div className="space-y-3">
              <Label htmlFor="grievantContact" className="text-slate-700 dark:text-slate-300 font-semibold">Phone Number *</Label>
              <Input id="grievantContact" name="grievantContact" type="tel" required className="h-11" placeholder="Used for tracking" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label htmlFor="issue" className="text-slate-700 dark:text-slate-300 font-semibold">Issue Details *</Label>
            <Textarea 
              id="issue" 
              name="issue" 
              rows={5}
              required
              className="resize-none"
              placeholder="Please describe your grievance in detail..."
            />
          </div>
        </CardContent>
        
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end px-4 sm:px-8 py-5">
          <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-8 w-full sm:w-auto text-lg shadow-md hover:shadow-lg transition-all">
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Submit Securely
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
