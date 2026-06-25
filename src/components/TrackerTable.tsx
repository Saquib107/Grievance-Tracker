"use client"

import { useState } from "react"
import { updateGrievanceTracker } from "@/app/actions/grievance"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"

type Grievance = any // using any for quick MVP, properly we should type it against Prisma model

export default function TrackerTable({ initialData }: { initialData: Grievance[] }) {
  const [data, setData] = useState<Grievance[]>(initialData)
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())

  const handleFieldChange = (id: string, field: string, value: string) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const handleSave = async (id: string) => {
    const itemToSave = data.find(i => i.id === id)
    if (!itemToSave) return

    setSavingIds(prev => new Set(prev).add(id))
    try {
      await updateGrievanceTracker(id, {
        concernedPerson: itemToSave.concernedPerson,
        currentStatus: itemToSave.currentStatus,
        solved: itemToSave.solved,
        dateResolved: itemToSave.dateResolved ? new Date(itemToSave.dateResolved) : null,
        remark: itemToSave.remark
      })
    } catch (error) {
      console.error("Failed to update", error)
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  return (
    <div className="overflow-auto w-full h-full">
      <table className="w-full text-sm text-left border-collapse min-w-max">
        <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0 shadow-sm z-10">
          <tr>
            <th className="px-4 py-3 border-b border-r dark:border-slate-700 whitespace-nowrap">S.No</th>
            <th className="px-4 py-3 border-b border-r dark:border-slate-700 whitespace-nowrap">Emp ID / Gatepass Number</th>
            <th className="px-4 py-3 border-b border-r dark:border-slate-700 whitespace-nowrap">Site / Location</th>
            <th className="px-4 py-3 border-b border-r dark:border-slate-700 whitespace-nowrap">Date Reported</th>
            <th className="px-4 py-3 border-b border-r dark:border-slate-700 whitespace-nowrap">Grievant</th>
            <th className="px-4 py-3 border-b border-r dark:border-slate-700 whitespace-nowrap">Grievant Contact</th>
            <th className="px-4 py-3 border-b border-r dark:border-slate-700 w-48">Concerned Person</th>
            <th className="px-4 py-3 border-b border-r dark:border-slate-700 w-64">Issue</th>
            <th className="px-4 py-3 border-b border-r dark:border-slate-700 w-48">Current Status</th>
            <th className="px-4 py-3 border-b border-r dark:border-slate-700 w-40">Solved</th>
            <th className="px-4 py-3 border-b border-r dark:border-slate-700 w-48">Date Resolved</th>
            <th className="px-4 py-3 border-b border-r dark:border-slate-700 w-48">Remark</th>
            <th className="px-4 py-3 border-b sticky right-0 bg-slate-100 dark:bg-slate-800 z-20">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id} className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <td className="px-4 py-2 border-r dark:border-slate-800 font-medium">{row.ticketNumber}</td>
              <td className="px-4 py-2 border-r dark:border-slate-800">{row.empIdGatepass}</td>
              <td className="px-4 py-2 border-r dark:border-slate-800">{row.location}</td>
              <td className="px-4 py-2 border-r dark:border-slate-800">
                {new Date(row.createdAt).toLocaleDateString('en-GB')}
              </td>
              <td className="px-4 py-2 border-r dark:border-slate-800">{row.grievantName}</td>
              <td className="px-4 py-2 border-r dark:border-slate-800">{row.grievantContact}</td>
              
              {/* Editable Fields */}
              <td className="px-2 py-2 border-r dark:border-slate-800">
                <Input 
                  value={row.concernedPerson || ""} 
                  onChange={e => handleFieldChange(row.id, "concernedPerson", e.target.value)}
                  className="h-8 shadow-none focus-visible:ring-1 bg-transparent"
                  placeholder="Assign Person"
                />
              </td>
              <td className="px-4 py-2 border-r dark:border-slate-800 max-w-xs truncate" title={row.issue}>
                {row.issue}
              </td>
              <td className="px-2 py-2 border-r dark:border-slate-800">
                <Input 
                  value={row.currentStatus || ""} 
                  onChange={e => handleFieldChange(row.id, "currentStatus", e.target.value)}
                  className="h-8 shadow-none focus-visible:ring-1 bg-transparent"
                  placeholder="Status Detail"
                />
              </td>
              <td className="px-2 py-2 border-r dark:border-slate-800">
                <Select value={row.solved || "PENDING"} onValueChange={(v) => handleFieldChange(row.id, "solved", v)}>
                  <SelectTrigger className="h-8 border-none bg-transparent shadow-none focus:ring-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-2 py-2 border-r dark:border-slate-800">
                <Input 
                  type="date"
                  value={row.dateResolved ? new Date(row.dateResolved).toISOString().split('T')[0] : ""} 
                  onChange={e => handleFieldChange(row.id, "dateResolved", e.target.value)}
                  className="h-8 shadow-none focus-visible:ring-1 bg-transparent"
                />
              </td>
              <td className="px-2 py-2 border-r dark:border-slate-800">
                <Input 
                  value={row.remark || ""} 
                  onChange={e => handleFieldChange(row.id, "remark", e.target.value)}
                  className="h-8 shadow-none focus-visible:ring-1 bg-transparent"
                  placeholder="Remarks..."
                />
              </td>
              <td className="px-2 py-2 sticky right-0 bg-white dark:bg-slate-950/80 backdrop-blur-sm border-l dark:border-slate-800">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleSave(row.id)}
                  disabled={savingIds.has(row.id)}
                  className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                >
                  {savingIds.has(row.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={13} className="px-4 py-8 text-center text-slate-500">
                No grievances found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
