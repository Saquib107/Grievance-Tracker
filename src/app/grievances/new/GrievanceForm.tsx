"use client"

import { useState } from "react"
import { submitGrievance } from "@/app/actions/grievance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, UploadCloud, ShieldAlert } from "lucide-react"

export default function GrievanceForm({ categories }: { categories: any[] }) {
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
    <Card className="border-slate-200 dark:border-slate-800 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select name="categoryId" required>
                <SelectTrigger className="bg-white dark:bg-slate-950">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue="LOW">
                <SelectTrigger className="bg-white dark:bg-slate-950">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low - General inquiry or minor issue</SelectItem>
                  <SelectItem value="MEDIUM">Medium - Needs attention soon</SelectItem>
                  <SelectItem value="HIGH">High - Urgent workplace issue</SelectItem>
                  <SelectItem value="CRITICAL">Critical - Immediate safety or policy violation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject" 
              name="subject" 
              placeholder="Briefly describe the issue" 
              required
              className="bg-white dark:bg-slate-950"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Provide all relevant details, dates, and people involved..." 
              rows={6}
              required
              className="bg-white dark:bg-slate-950 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
              <UploadCloud className="h-8 w-8 mb-2 text-indigo-500" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs mt-1">SVG, PNG, JPG or PDF (max. 5MB)</p>
              {/* Dummy hidden input for MVP */}
              <input type="hidden" name="attachment" value="" />
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-4 flex gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="isAnonymous" name="isAnonymous" value="true" />
                <Label htmlFor="isAnonymous" className="text-amber-900 dark:text-amber-500 font-semibold cursor-pointer">
                  Submit Anonymously
                </Label>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-600/80 pl-6">
                If checked, your identity will be hidden from the department managers and only accessible to authorized HR personnel if absolutely required for legal compliance.
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 rounded-b-xl py-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Grievance
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
