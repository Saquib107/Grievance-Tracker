"use client"

import { useState } from "react"
import { submitGrievance } from "@/app/actions/grievance" // use the protected submit action
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, UserPlus } from "lucide-react"

export default function HROnBehalfForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    // Add a flag to indicate this was submitted on behalf of someone
    formData.append("onBehalf", "true")
    
    try {
      await submitGrievance(formData)
      setSuccess(true)
      // The submitGrievance action currently redirects to the new grievance page.
      // If it redirects, the setSuccess won't be seen, which is fine.
    } catch (err: any) {
      setError(err.message || "Failed to submit. Check the data and try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-1"></div>
      <CardHeader className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Log Grievance On-Behalf
            </CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              Submit a grievance for an employee who walked in or called.
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
              <Input id="empIdGatepass" name="empIdGatepass" required className="h-11" placeholder="e.g. 1018" />
            </div>

            <div className="space-y-3">
              <Label htmlFor="location" className="text-slate-700 dark:text-slate-300 font-semibold">Site / Location *</Label>
              <Input id="location" name="location" required className="h-11" placeholder="e.g. BSP" />
            </div>

            <div className="space-y-3">
              <Label htmlFor="grievantName" className="text-slate-700 dark:text-slate-300 font-semibold">Employee Name *</Label>
              <Input id="grievantName" name="grievantName" required className="h-11" />
            </div>

            <div className="space-y-3">
              <Label htmlFor="grievantContact" className="text-slate-700 dark:text-slate-300 font-semibold">Employee Phone Number *</Label>
              <Input id="grievantContact" name="grievantContact" type="tel" required className="h-11" />
            </div>

            <div className="space-y-3">
              <Label htmlFor="priority" className="text-slate-700 dark:text-slate-300 font-semibold">Priority Assessment</Label>
              <Select name="priority" defaultValue="LOW">
                <SelectTrigger className="h-11 bg-white dark:bg-slate-950">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low - General/Minor (7 Days)</SelectItem>
                  <SelectItem value="MEDIUM">Medium - Needs Attention (3 Days)</SelectItem>
                  <SelectItem value="HIGH">High - Urgent (48 Hrs)</SelectItem>
                  <SelectItem value="CRITICAL">Critical - Immediate (24 Hrs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="concernedPerson" className="text-slate-700 dark:text-slate-300 font-semibold">Assign To (Optional)</Label>
              <Input id="concernedPerson" name="concernedPerson" className="h-11" placeholder="e.g. HR Manager Name" />
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
              placeholder="Record the details exactly as the employee described..."
            />
          </div>
        </CardContent>
        
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end px-4 sm:px-8 py-5 gap-3">
          <Button type="button" variant="outline" onClick={() => window.history.back()} className="h-11 px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white h-11 px-8 shadow-md">
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Submit On Behalf
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
