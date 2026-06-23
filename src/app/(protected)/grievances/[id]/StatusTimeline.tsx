"use client"

import { Check, Circle } from "lucide-react"

const STATUSES = [
  { id: "SUBMITTED", label: "Submitted" },
  { id: "UNDER_REVIEW", label: "Under Review" },
  { id: "INVESTIGATION", label: "Investigation" },
  { id: "ACTION_TAKEN", label: "Action Taken" },
  { id: "RESOLVED", label: "Resolved" },
  { id: "CLOSED", label: "Closed" }
]

export default function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  if (currentStatus === "REJECTED") {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-red-500">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
          <span className="font-bold text-xl">X</span>
        </div>
        <p className="font-semibold">Case Rejected</p>
      </div>
    )
  }

  const currentIndex = STATUSES.findIndex(s => s.id === currentStatus)

  return (
    <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-6 py-2">
      {STATUSES.map((status, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const isPending = index > currentIndex

        return (
          <div key={status.id} className="relative pl-6">
            {/* Circle Marker */}
            <div className={`absolute -left-[11px] top-0.5 h-5 w-5 rounded-full flex items-center justify-center bg-white dark:bg-slate-950
              ${isCompleted ? 'border-2 border-emerald-500 bg-emerald-500' : ''}
              ${isCurrent ? 'border-4 border-indigo-500 ring-4 ring-indigo-500/20' : ''}
              ${isPending ? 'border-2 border-slate-300 dark:border-slate-700' : ''}
            `}>
              {isCompleted && <Check className="h-3 w-3 text-white" />}
            </div>
            
            {/* Text */}
            <p className={`font-medium text-sm ${
              isCompleted ? 'text-slate-700 dark:text-slate-300' : 
              isCurrent ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 
              'text-slate-400'
            }`}>
              {status.label}
            </p>
            {isCurrent && (
              <p className="text-xs text-slate-500 mt-1">
                Current stage of the grievance process.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
