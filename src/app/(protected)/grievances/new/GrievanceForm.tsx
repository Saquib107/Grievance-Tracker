"use client"

import { useState } from "react"
import { submitGrievance } from "@/app/actions/grievance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, FileSpreadsheet, Shield, UploadCloud, Save } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"

export default function GrievanceForm({ categories, sites }: { categories: any[], sites: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    // Check which button was clicked based on a hidden input or submitter value
    // (We use a workaround by appending draft status directly via button onClick if needed, 
    // but here we just rely on standard submit. We'll handle Draft in a separate function or via formAction if supported,
    // but Next.js server actions work well with hidden inputs.)
    
    try {
      await submitGrievance(formData)
    } catch (error) {
      console.error(error)
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-1"></div>
      <CardHeader className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Grievance Submission Form
            </CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              Please provide accurate details. Your submission is secure.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8 pt-8 pb-8 px-8">
          
          {/* Triage Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">1. Classification</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="categoryId" className="text-slate-700 dark:text-slate-300 font-semibold">Category <span className="text-red-500">*</span></Label>
                <Select name="categoryId" required>
                  <SelectTrigger className="h-11 bg-white dark:bg-slate-950 border-slate-300">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="priority" className="text-slate-700 dark:text-slate-300 font-semibold">Priority <span className="text-red-500">*</span></Label>
                <Select name="priority" defaultValue="LOW" required>
                  <SelectTrigger className="h-11 bg-white dark:bg-slate-950 border-slate-300">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low - Routine issue</SelectItem>
                    <SelectItem value="MEDIUM">Medium - Needs attention</SelectItem>
                    <SelectItem value="HIGH">High - Urgent concern</SelectItem>
                    <SelectItem value="CRITICAL">Critical - Immediate safety/legal risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">2. Incident Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="incidentDate" className="text-slate-700 dark:text-slate-300 font-semibold">Date of Incident <span className="text-red-500">*</span></Label>
                <Input 
                  id="incidentDate" 
                  name="incidentDate" 
                  type="date"
                  required
                  className="bg-white dark:bg-slate-950 border-slate-300 h-11"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="siteId" className="text-slate-700 dark:text-slate-300 font-semibold">Site / Location <span className="text-red-500">*</span></Label>
                <Select name="siteId" required>
                  <SelectTrigger className="h-11 bg-white dark:bg-slate-950 border-slate-300">
                    <SelectValue placeholder="Select Site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} {s.code ? `(${s.code})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="subject" className="text-slate-700 dark:text-slate-300 font-semibold">Subject / Short Summary <span className="text-red-500">*</span></Label>
                <Input 
                  id="subject" 
                  name="subject" 
                  placeholder="Briefly summarize the issue (e.g. Harassment in break room)" 
                  required
                  className="bg-white dark:bg-slate-950 border-slate-300 h-11"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="description" className="text-slate-700 dark:text-slate-300 font-semibold">Detailed Description <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Please describe exactly what happened..." 
                  rows={6}
                  required
                  className="bg-white dark:bg-slate-950 border-slate-300 resize-none"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="personsInvolved" className="text-slate-700 dark:text-slate-300 font-semibold">Persons Involved (Optional)</Label>
                <Input 
                  id="personsInvolved" 
                  name="personsInvolved" 
                  placeholder="Manager Name, Employee Name, Witness Name" 
                  className="bg-white dark:bg-slate-950 border-slate-300 h-11"
                />
              </div>
            </div>
          </div>

          {/* Outcome & Evidence */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">3. Evidence & Resolution</h3>
            
            <div className="space-y-3">
              <Label htmlFor="expectedOutcome" className="text-slate-700 dark:text-slate-300 font-semibold">Expected Resolution (Optional)</Label>
              <Textarea 
                id="expectedOutcome" 
                name="expectedOutcome" 
                placeholder="What outcome would you like to see?" 
                rows={3}
                className="bg-white dark:bg-slate-950 border-slate-300 resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold">Attachments / Evidence</Label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer">
                <UploadCloud className="h-10 w-10 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload files or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">Supported: PDF, JPG, PNG, DOCX (Max 10MB)</p>
                {/* Mock File Input for UI Purposes */}
                <input type="file" className="hidden" />
              </div>
            </div>
          </div>

        </CardContent>
        
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-between gap-3 px-8 py-5">
          <Button type="button" variant="ghost" onClick={() => router.back()} className="h-11 px-6 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </Button>
          
          <div className="flex gap-3">
            <Button 
              type="submit" 
              name="actionType" 
              value="DRAFT" 
              disabled={isSubmitting} 
              variant="outline" 
              className="h-11 px-6 bg-white dark:bg-slate-950 border-slate-300 hover:bg-slate-100 transition-colors"
            >
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </Button>
            
            <Button 
              type="submit" 
              name="actionType" 
              value="SUBMIT" 
              disabled={isSubmitting} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-8 shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Grievance
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
