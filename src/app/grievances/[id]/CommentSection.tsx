"use client"

import { useState } from "react"
import { addComment } from "@/app/actions/comment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send, Loader2, Lock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function CommentSection({ grievanceId, comments, currentUser }: { grievanceId: string, comments: any[], currentUser: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      await addComment(grievanceId, formData)
      e.currentTarget.reset()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-indigo-500" />
          Communication Log
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col gap-6">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            No messages yet. Start the conversation below.
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => {
              const isMe = comment.authorId === currentUser.id
              return (
                <div key={comment.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={comment.author.image || ""} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700">
                      {comment.author.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 max-w-[80%] ${isMe ? 'items-end' : ''}`}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold">{comment.author.name}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      {comment.author.role === "HR" && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold uppercase">HR</span>
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      comment.isInternal 
                        ? 'bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-200'
                        : isMe 
                          ? 'bg-indigo-600 text-white rounded-tr-sm' 
                          : 'bg-slate-100 dark:bg-slate-800 rounded-tl-sm'
                    }`}>
                      {comment.isInternal && <Lock className="inline-block h-3 w-3 mr-1 mb-0.5" />}
                      {comment.content}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 relative">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 shrink-0 hidden sm:block">
              <AvatarImage src={currentUser.image || ""} />
              <AvatarFallback>{currentUser.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
              <Textarea 
                name="content" 
                placeholder="Type your message here..." 
                required
                className="pr-12 resize-none min-h-[60px]"
                rows={2}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isSubmitting}
                className="absolute bottom-2 right-2 h-8 w-8 bg-indigo-600 hover:bg-indigo-700 rounded-full"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {(currentUser.role === "HR" || currentUser.role === "ADMIN") && (
            <div className="flex items-center space-x-2 pl-[52px]">
              <Checkbox id="isInternal" name="isInternal" value="true" />
              <Label htmlFor="isInternal" className="text-sm font-medium text-amber-600 dark:text-amber-500 flex items-center gap-1 cursor-pointer">
                <Lock className="h-3 w-3" /> Mark as Internal Note (hidden from employee)
              </Label>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
