"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addComment(grievanceId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const content = formData.get("content") as string
  if (!content) return

  await prisma.comment.create({
    data: {
      content,
      grievanceId,
      authorId: session.user.id
    }
  })

  revalidatePath(`/grievances/${grievanceId}`)
}
