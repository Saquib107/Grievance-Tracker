"use client"

import { useState } from "react"
import { submitGrievance } from "@/app/actions/grievance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, FileSpreadsheet } from "lucide-react"

export default function GrievanceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      await submitGrievance(formData)
    } catch (error) {
      console.error(error)
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1"></div>
      <CardHeader className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Grievance Tracking Form Template
            </CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              PROTECTIVE GENERAL ENGINEERING PVT. LTD.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-8 pb-8 px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="empIdGatepass" className="text-slate-700 dark:text-slate-300 font-semibold">Emp ID / Gatepass Number</Label>
              <Input 
                id="empIdGatepass" 
                name="empIdGatepass" 
                placeholder="e.g. 1018 or GW0324806322" 
                required
                className="bg-white dark:bg-slate-950 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all shadow-sm h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="location" className="text-slate-700 dark:text-slate-300 font-semibold">Site / Location</Label>
              <Input 
                id="location" 
                name="location" 
                placeholder="e.g. H.O, TSG, BSP" 
                required
                className="bg-white dark:bg-slate-950 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all shadow-sm h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="grievantName" className="text-slate-700 dark:text-slate-300 font-semibold">Grievant Name</Label>
              <Input 
                id="grievantName" 
                name="grievantName" 
                placeholder="Full Name" 
                required
                className="bg-white dark:bg-slate-950 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all shadow-sm h-11"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="grievantContact" className="text-slate-700 dark:text-slate-300 font-semibold">Grievant Contact</Label>
              <Input 
                id="grievantContact" 
                name="grievantContact" 
                placeholder="Phone Number" 
                required
                className="bg-white dark:bg-slate-950 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all shadow-sm h-11"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label htmlFor="issue" className="text-slate-700 dark:text-slate-300 font-semibold">Issue Details</Label>
            <Textarea 
              id="issue" 
              name="issue" 
              placeholder="Describe the grievance or issue in detail..." 
              rows={5}
              required
              className="bg-white dark:bg-slate-950 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all shadow-sm resize-none"
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 inline-block"></span>
            Date Reported and S.No are automatically generated upon submission.
          </p>

        </CardContent>
        
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 px-8 py-5">
          <Button type="button" variant="outline" onClick={() => window.history.back()} className="h-11 px-6 hover:bg-slate-100 transition-colors">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6 shadow-md hover:shadow-lg transition-all">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Grievance
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
