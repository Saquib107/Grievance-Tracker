"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { processGrievanceApproval } from "@/app/actions/grievance"
import { useRouter } from "next/navigation"

export default function ApprovalsClient({ initialCases }: { initialCases: any[] }) {
  const [cases, setCases] = useState(initialCases)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleApprove = async (id: string) => {
    setLoading(id)
    const result = await processGrievanceApproval(id, "APPROVE")
    setLoading(null)
    
    if (result.success) {
      toast.success("Grievance approved successfully!")
      setCases(cases.filter(c => c.id !== id))
      router.refresh()
    } else {
      toast.error(result.error || "Failed to approve grievance")
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    setLoading(id)
    const result = await processGrievanceApproval(id, "REJECT", rejectionReason)
    setLoading(null)

    if (result.success) {
      toast.success("Grievance rejected.")
      setCases(cases.filter(c => c.id !== id))
      setRejectingId(null)
      setRejectionReason("")
      router.refresh()
    } else {
      toast.error(result.error || "Failed to reject grievance")
    }
  }

  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-lg dark:border-slate-800">
        <p className="text-lg font-medium text-slate-500">No pending approvals at your site.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">Pending Approvals</h2>
      
      <div className="bg-white rounded-lg border shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Ticket</th>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Site</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {c.ticketNumber}
                    <div className="text-xs text-slate-500 mt-1">{c.subject}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {c.isAnonymous ? "Anonymous" : c.employee?.name || c.grievantName}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {c.site?.name}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                      {c.category?.name || "Uncategorized"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {rejectingId === c.id ? (
                      <div className="flex flex-col gap-2 items-end">
                        <Textarea 
                          placeholder="Reason for rejection..." 
                          className="w-full min-w-[200px]"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setRejectingId(null)}>Cancel</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleReject(c.id)} disabled={loading === c.id}>Confirm Reject</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-500"
                          onClick={() => handleApprove(c.id)}
                          disabled={loading === c.id}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500"
                          onClick={() => setRejectingId(c.id)}
                          disabled={loading === c.id}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
