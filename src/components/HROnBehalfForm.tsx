"use client"

import { useState, useEffect } from "react"
import { submitGrievance } from "@/app/actions/grievance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, UserPlus, Paperclip, Save, UserX } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

const CATEGORIES = [
  { id: "c1", name: "Payroll & Salary", sla: 3 },
  { id: "c2", name: "Harassment", sla: 2 },
  { id: "c3", name: "Leave & Attendance", sla: 5 },
  { id: "c4", name: "Safety & Environment", sla: 1 },
]

export default function HROnBehalfForm({ sites = [] }: { sites?: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDrafting, setIsDrafting] = useState(false)
  const [error, setError] = useState("")
  
  const [empId, setEmpId] = useState("")
  const [empName, setEmpName] = useState("")
  const [empPhone, setEmpPhone] = useState("")
  const [empSiteId, setEmpSiteId] = useState("")
  const [issue, setIssue] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  
  // Auto-fill logic mock
  useEffect(() => {
    if (empId === "1018") {
      setEmpName("Mili Sahu")
      setEmpPhone("+91 98765 43210")
      setEmpSiteId(sites.find(s => s.code === 'SITE-A')?.id || "")
    } else if (empId === "1019") {
      setEmpName("John Doe")
      setEmpPhone("+91 12345 67890")
      setEmpSiteId(sites.find(s => s.code === 'SITE-B')?.id || "")
    } else if (empId.length > 0 && empId !== "1018" && empId !== "1019") {
      setEmpName("")
      setEmpPhone("")
      setEmpSiteId("")
    }
  }, [empId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    formData.append("onBehalf", "true")
    
    try {
      await submitGrievance(formData)
    } catch (err: any) {
      setError(err.message || "Failed to submit. Check the data and try again.")
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    setIsDrafting(true)
    setTimeout(() => {
      toast.success("Draft saved successfully!")
      setIsDrafting(false)
    }, 1000)
  }

  const getSlaText = () => {
    const cat = CATEGORIES.find(c => c.id === selectedCategory)
    if (!cat) return null
    return `${cat.sla} Working Days`
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
              <Input 
                id="empIdGatepass" 
                name="empIdGatepass" 
                required 
                className="h-11" 
                placeholder="Type '1018' to auto-fill" 
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="siteId" className="text-slate-700 dark:text-slate-300 font-semibold">Site / Location *</Label>
              <Select name="siteId" required value={empSiteId} onValueChange={(val: any) => { if (val) setEmpSiteId(val as string) }}>
                <SelectTrigger className="h-11 bg-white dark:bg-slate-950">
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} {s.code ? `(${s.code})` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="grievantName" className="text-slate-700 dark:text-slate-300 font-semibold">Employee Name *</Label>
              <Input id="grievantName" name="grievantName" required className="h-11" value={empName} onChange={(e) => setEmpName(e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="grievantContact" className="text-slate-700 dark:text-slate-300 font-semibold">Employee Phone Number *</Label>
              <Input id="grievantContact" name="grievantContact" type="tel" required className="h-11" value={empPhone} onChange={(e) => setEmpPhone(e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="category" className="text-slate-700 dark:text-slate-300 font-semibold">Category *</Label>
              <Select name="categoryId" required onValueChange={(val: any) => { if (val) setSelectedCategory(val as string) }}>
                <SelectTrigger className="h-11 bg-white dark:bg-slate-950">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getSlaText() && (
                <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mr-2">Expected Resolution</span>
                  {getSlaText()}
                </p>
              )}
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
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end">
              <Label htmlFor="issue" className="text-slate-700 dark:text-slate-300 font-semibold">Issue Details *</Label>
              <span className={`text-xs ${issue.length > 2000 ? 'text-red-500' : 'text-slate-400'}`}>
                {issue.length} / 2000
              </span>
            </div>
            <Textarea 
              id="issue" 
              name="issue" 
              rows={5}
              required
              className="resize-none"
              placeholder="Record the details exactly as the employee described..."
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              maxLength={2000}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Label className="text-slate-700 dark:text-slate-300 font-semibold mb-3 block">Attachments</Label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
              <Paperclip className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload Files</p>
              <p className="text-xs text-slate-500 mt-1">Letters, Salary slips, Photos (Max 5MB)</p>
              <Button type="button" variant="outline" size="sm" className="mt-4">
                Choose Files
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-between px-4 sm:px-8 py-5">
          <Button type="button" variant="outline" onClick={() => window.history.back()} className="h-11 px-6">
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={isDrafting || isSubmitting} className="h-11 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300">
              {isDrafting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Draft
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white h-11 px-8 shadow-md">
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Submit On Behalf
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
