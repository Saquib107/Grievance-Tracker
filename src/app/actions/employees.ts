"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import * as xlsx from "xlsx"

export async function updateEmployeeStatus(id: string, isActive: boolean) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    await prisma.user.update({
      where: { id },
      data: { isActive }
    })
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to update status" }
  }
}

export async function bulkImportEmployees(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" }

    const file = formData.get("file") as File
    if (!file) return { success: false, error: "No file provided" }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = xlsx.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    if (rawData.length < 2) return { success: false, error: "Excel file is empty or missing data rows" }

    // Read headers to map columns safely (Assuming row 0 is header)
    const headers = rawData[0].map((h: any) => h?.toString().trim().toLowerCase() || "")
    const idIdx = headers.findIndex(h => h.includes("id"))
    const nameIdx = headers.findIndex(h => h.includes("name"))
    const phoneIdx = headers.findIndex(h => h.includes("phone") || h.includes("contact"))
    const deptIdx = headers.findIndex(h => h.includes("department") || h.includes("dept"))
    const desigIdx = headers.findIndex(h => h.includes("designation"))
    const siteIdx = headers.findIndex(h => h.includes("site") || h.includes("location"))

    if (idIdx === -1 || nameIdx === -1) {
      return { success: false, error: "Missing required columns: Employee ID or Name" }
    }

    const defaultPassword = await bcrypt.hash("Pgepl@123", 10)
    let count = 0

    // Caching sites to avoid repeated DB lookups
    const sites = await prisma.site.findMany()
    const siteMap = new Map(sites.map(s => [s.name.toLowerCase(), s.id]))

    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i]
      if (!row || row.length === 0 || !row[idIdx]) continue

      const employeeIdStr = row[idIdx].toString().trim()
      const name = row[nameIdx]?.toString().trim() || "Unknown"
      const phone = phoneIdx !== -1 ? row[phoneIdx]?.toString().trim() : null
      const department = deptIdx !== -1 ? row[deptIdx]?.toString().trim() : null
      const designation = desigIdx !== -1 ? row[desigIdx]?.toString().trim() : null
      
      let siteId = null
      if (siteIdx !== -1 && row[siteIdx]) {
        const siteName = row[siteIdx].toString().trim()
        if (siteMap.has(siteName.toLowerCase())) {
          siteId = siteMap.get(siteName.toLowerCase())
        } else {
          // Auto create missing site
          const newSite = await prisma.site.create({
            data: { name: siteName, code: siteName.substring(0, 3).toUpperCase() }
          })
          siteMap.set(siteName.toLowerCase(), newSite.id)
          siteId = newSite.id
        }
      }

      // We use Employee ID as a pseudo-email if no email is provided, because NextAuth needs an email for credentials.
      // E.g., 1018@pgepl.local
      const email = `${employeeIdStr.toLowerCase().replace(/\s/g, '')}@pgepl.local`

      await prisma.user.upsert({
        where: { employeeIdStr },
        update: {
          name,
          phone,
          department,
          designation,
          siteId,
          isActive: true
        },
        create: {
          employeeIdStr,
          email,
          name,
          password: defaultPassword,
          role: "EMPLOYEE",
          phone,
          department,
          designation,
          siteId,
          isActive: true
        }
      })
      count++
    }

    return { success: true, count }
  } catch (error: any) {
    console.error("Bulk Import Error:", error)
    return { success: false, error: "Failed to process Excel file. " + error.message }
  }
}
