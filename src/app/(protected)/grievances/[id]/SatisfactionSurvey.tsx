"use client"

import { useState } from "react"
import { submitSatisfactionSurvey } from "@/app/actions/grievance"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function SatisfactionSurvey({ grievanceId, initialScore, initialFeedback }: { grievanceId: string, initialScore: number | null, initialFeedback: string | null }) {
  const [score, setScore] = useState<number>(initialScore || 0)
  const [feedback, setFeedback] = useState(initialFeedback || "")
  const [hoveredScore, setHoveredScore] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(initialScore !== null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (score === 0) {
      toast.error("Please provide a rating from 1 to 5 stars.")
      return
    }

    setIsSubmitting(true)
    try {
      await submitSatisfactionSurvey(grievanceId, score, feedback)
      setIsSubmitted(true)
      toast.success("Thank you for your feedback!")
    } catch (error) {
      toast.error("Failed to submit survey.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50">
        <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <div>
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-300">Feedback Received</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-400">Thank you for helping us improve our resolution process.</p>
          </div>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className={`h-5 w-5 ${star <= score ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-indigo-100 shadow-sm">
      <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/10">
        <CardTitle className="text-lg text-indigo-900 dark:text-indigo-300">Satisfaction Survey</CardTitle>
        <CardDescription>Your grievance has been marked as resolved. How did we do?</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <Label className="text-slate-600 dark:text-slate-400 font-medium">Was your grievance handled fairly?</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredScore(star)}
                  onMouseLeave={() => setHoveredScore(0)}
                  onClick={() => setScore(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`h-8 w-8 ${
                      star <= (hoveredScore || score) 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-slate-200 dark:text-slate-700'
                    } transition-colors`} 
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback">Additional Comments (Optional)</Label>
            <Textarea 
              id="feedback"
              placeholder="Tell us more about your experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
