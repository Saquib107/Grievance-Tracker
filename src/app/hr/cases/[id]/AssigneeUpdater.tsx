"use client"

import { useState } from "react"
import { assignGrievance } from "@/app/actions/grievance"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function AssigneeUpdater({ 
  grievanceId, 
  currentAssigneeId, 
  hrUsers 
}: { 
  grievanceId: string, 
  currentAssigneeId: string | null,
  hrUsers: { id: string, name: string | null }[]
}) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleAssigneeChange = async (value: string | null) => {
    if (!value) return
    setIsUpdating(true)
    try {
      await assignGrievance(grievanceId, value === "unassigned" ? null : value)
      toast.success("Assignee updated successfully")
    } catch (error) {
      toast.error("Failed to update assignee")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-2 mt-4">
      <Label className="text-slate-500">Assigned To</Label>
      <div className="flex items-center gap-2">
        <Select defaultValue={currentAssigneeId || "unassigned"} onValueChange={handleAssigneeChange} disabled={isUpdating}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {hrUsers.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.name || "Unknown HR"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isUpdating && <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />}
      </div>
    </div>
  )
}
