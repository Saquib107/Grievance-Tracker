"use client"

import { useState } from "react"
import { addComment } from "@/app/actions/comment"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send, Loader2, Lock, Unlock } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function HRCommentSection({ grievanceId, comments, currentUser }: { grievanceId: string, comments: any[], currentUser: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInternal, setIsInternal] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    if (isInternal) {
      formData.set("isInternal", "true")
    }
    try {
      await addComment(grievanceId, formData)
      e.currentTarget.reset()
      // Optional: don't reset isInternal to keep flow going, but typically reset is good.
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b py-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
            Communication Thread
          </CardTitle>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border text-sm shadow-sm">
            <Switch 
              id="internal-mode" 
              checked={isInternal} 
              onCheckedChange={setIsInternal} 
              className="data-[state=checked]:bg-amber-500"
            />
            <Label htmlFor="internal-mode" className={`cursor-pointer font-medium ${isInternal ? 'text-amber-600 dark:text-amber-500' : 'text-slate-600 dark:text-slate-400'}`}>
              Internal Note Mode
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[550px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-slate-900/20">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm">
                <MessageSquare className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm max-w-[250px]">No messages yet. Send an update to the employee or add an internal note.</p>
            </div>
          ) : (
            comments.map((comment: any) => {
              const isMe = comment.authorId === currentUser.id
              return (
                <div key={comment.id} className={`flex gap-3 ${isMe && !comment.isInternal ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                    <AvatarImage src={comment.author.image || ""} />
                    <AvatarFallback className={comment.isInternal ? 'bg-amber-100 text-amber-700' : isMe ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}>
                      {comment.author.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 max-w-[85%] ${isMe && !comment.isInternal ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {isMe ? 'You' : comment.author.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    
                    <div className={`px-4 py-2.5 text-sm shadow-sm ${
                      comment.isInternal 
                        ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 rounded-2xl rounded-tl-sm w-full' 
                        : isMe 
                          ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm' 
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm'
                    }`}>
                      {comment.isInternal && (
                        <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500">
                          <Lock className="h-3 w-3" /> Internal Only
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{comment.content}</div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className={`p-4 border-t transition-colors ${isInternal ? 'bg-amber-50/50 dark:bg-amber-950/20' : 'bg-white dark:bg-slate-950'}`}>
          <form onSubmit={handleSubmit} className="flex gap-2 relative">
            <Textarea 
              name="content" 
              placeholder={isInternal ? "Type a private internal note..." : "Type a message to the employee..."} 
              required
              className={`resize-none min-h-[52px] max-h-[150px] rounded-2xl pr-12 py-3.5 focus-visible:ring-2 ${
                isInternal 
                  ? 'bg-amber-100/50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 placeholder:text-amber-600/50 focus-visible:ring-amber-500 text-amber-900 dark:text-amber-100' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 focus-visible:ring-indigo-500'
              }`}
              rows={1}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isSubmitting}
              className={`absolute bottom-2.5 right-2 h-9 w-9 rounded-full transition-colors ${
                isInternal 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isInternal ? <Lock className="h-4 w-4" /> : <Send className="h-4 w-4 ml-0.5" />}
            </Button>
          </form>
          {isInternal && (
            <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-2 ml-1 font-medium flex items-center gap-1">
              <Lock className="h-3 w-3" /> This note will be hidden from the employee.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
