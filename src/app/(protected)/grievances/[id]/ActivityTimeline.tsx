import { Clock, MessageSquare, CheckCircle2, ShieldAlert, UserPlus, FileText } from "lucide-react"

export default function ActivityTimeline({ logs, comments }: { logs: any[], comments: any[] }) {
  // Combine logs and comments into a single timeline, sorted by date
  const events = [
    ...logs.map(l => ({
      id: l.id,
      type: "LOG",
      action: l.action,
      details: l.details,
      actor: l.changedBy,
      date: new Date(l.createdAt)
    })),
    ...comments.map(c => ({
      id: c.id,
      type: "COMMENT",
      action: "COMMENT_ADDED",
      details: c.text,
      actor: c.author?.name || "Unknown",
      date: new Date(c.createdAt)
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  const getEventIcon = (action: string) => {
    if (action === "GRIEVANCE_SUBMITTED") return <FileText className="h-4 w-4 text-blue-500" />
    if (action === "STATUS_CHANGED") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    if (action === "ASSIGNED") return <UserPlus className="h-4 w-4 text-purple-500" />
    if (action === "COMMENT_ADDED") return <MessageSquare className="h-4 w-4 text-amber-500" />
    return <Clock className="h-4 w-4 text-slate-500" />
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
      {events.map((event, i) => (
        <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          {/* Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 dark:bg-slate-800 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {getEventIcon(event.action)}
          </div>
          
          {/* Content */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                {event.actor}
              </span>
              <span className="text-xs text-slate-500">
                {event.date.toLocaleDateString()} {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {event.type === "LOG" && <span className="font-medium text-slate-700 dark:text-slate-300 mr-2">{event.action.replace(/_/g, ' ')}:</span>}
              {event.details}
            </p>
          </div>
        </div>
      ))}
      {events.length === 0 && (
        <p className="text-center text-slate-500 py-4">No activity recorded yet.</p>
      )}
    </div>
  )
}
