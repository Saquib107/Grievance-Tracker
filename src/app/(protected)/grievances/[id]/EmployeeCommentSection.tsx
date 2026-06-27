"use client"

import { useState } from "react"
import { addComment } from "@/app/actions/comment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send, Loader2, Info } from "lucide-react"

export default function EmployeeCommentSection({ grievance, currentUser }: { grievance: any, currentUser: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const comments = grievance.comments.filter((c: any) => !c.isInternal)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      await addComment(grievance.id, formData)
      e.currentTarget.reset()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const assignedHR = grievance.assignedTo

  return (
    <Card className="shadow-sm border-blue-100 dark:border-blue-900 overflow-hidden mt-6">
      <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b flex flex-row items-center justify-between py-4">
        <CardTitle className="text-base flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
          <MessageSquare className="h-5 w-5 text-indigo-500" />
          Messages
        </CardTitle>
        {assignedHR && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
            <Avatar className="h-6 w-6">
              <AvatarImage src={grievance.isAnonymous ? "" : (assignedHR.image || "")} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px]">
                {grievance.isAnonymous ? "HR" : (assignedHR.name?.split(' ').map((n: string) => n[0]).join('') || "HR")}
              </AvatarFallback>
            </Avatar>
            <span>Your case is handled by <strong>{grievance.isAnonymous ? "the HR Team" : assignedHR.name}</strong></span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[500px]">
        {/* Status Update Banner */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 text-xs text-indigo-800 dark:text-indigo-300 flex items-center justify-center gap-2 border-b border-indigo-100 dark:border-indigo-900/30">
          <Info className="h-3.5 w-3.5" />
          Status update: Your case moved to <strong>{grievance.status.replace('_', ' ')}</strong> on {new Date(grievance.updatedAt).toLocaleDateString()}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-slate-900/20">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm">
                <MessageSquare className="h-8 w-8 text-indigo-300" />
              </div>
              <p className="text-slate-500 text-sm max-w-[200px]">No messages yet. You can securely message the HR team here.</p>
            </div>
          ) : (
            comments.map((comment: any) => {
              const isMe = comment.authorId === currentUser.id
              return (
                <div key={comment.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="h-8 w-8 shrink-0 mt-auto">
                    <AvatarImage src={comment.author.image || ""} />
                    <AvatarFallback className={isMe ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}>
                      {comment.author.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-400 mx-1">
                      {isMe ? 'You' : (grievance.isAnonymous ? "HR Team" : comment.author.name)} • {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className={`px-4 py-2.5 text-sm shadow-sm ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm' 
                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-sm'
                    }`}>
                      {comment.content}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="p-4 bg-white dark:bg-slate-950 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <Textarea 
              name="content" 
              placeholder="Type your message..." 
              required
              className="resize-none min-h-[44px] max-h-[120px] rounded-2xl pr-12 py-3 bg-slate-50 focus-visible:ring-indigo-500"
              rows={1}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isSubmitting}
              className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5 text-white" />}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
