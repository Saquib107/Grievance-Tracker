"use client"

import { useState } from "react"
import { updateGrievanceStatus } from "@/app/actions/grievance"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function StatusUpdater({ grievanceId, currentStatus }: { grievanceId: string, currentStatus: string }) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (value: string | null) => {
    if (!value) return
    setIsUpdating(true)
    try {
      await updateGrievanceStatus(grievanceId, value)
      toast.success("Status updated successfully")
    } catch (error) {
      toast.error("Failed to update status")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-slate-500">Update Status</Label>
      <div className="flex items-center gap-2">
        <Select defaultValue={currentStatus} onValueChange={handleStatusChange} disabled={isUpdating}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="INVESTIGATION">Investigation</SelectItem>
            <SelectItem value="ACTION_TAKEN">Action Taken</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        {isUpdating && <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />}
      </div>
    </div>
  )
}
