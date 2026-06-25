"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateGrievanceTracker } from "@/app/actions/grievance"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

export default function ResolutionNotesForm({ grievanceId, initialNotes }: { grievanceId: string, initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateGrievanceTracker(grievanceId, { remark: notes })
      toast.success("Resolution notes saved successfully")
    } catch (err) {
      toast.error("Failed to save notes")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <Textarea 
        placeholder="Enter resolution details, findings, or closure notes here..." 
        className="min-h-[120px] resize-y"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || notes === initialNotes} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Notes
        </Button>
      </div>
    </div>
  )
}
