import * as xlsx from 'xlsx'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function importExcel() {
  console.log("Starting Excel Import...")
  const workbook = xlsx.readFile('GRIEVANCE TRACKING FORM TEMPLATE.xlsx')
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  
  // Parse with raw arrays
  const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 })
  
  // Headers are on row index 2 (the 3rd row)
  const headers = rawData[2] as string[]
  const rows = rawData.slice(3) // Data starts from index 3
  
  console.log(`Parsed ${rows.length} data rows.`)

  // Create a default category for legacy items
  let legacyCategory = await prisma.category.findFirst({ where: { name: "Legacy Import" } })
  if (!legacyCategory) {
    legacyCategory = await prisma.category.create({
      data: { name: "Legacy Import", description: "Imported from Excel tracker" }
    })
  }

  // Find or Create all Sites mentioned
  const sitesMap = new Map<string, string>() // Name -> ID
  for (const row of rows) {
    const r = row as any[]
    if (r.length === 0) continue
    const siteName = r[2]?.toString().trim()
    if (siteName && !sitesMap.has(siteName)) {
      let site = await prisma.site.findFirst({ where: { name: siteName } })
      if (!site) {
        site = await prisma.site.create({
          data: { name: siteName, code: siteName.substring(0, 3).toUpperCase() }
        })
        console.log(`Created new Site: ${siteName}`)
      }
      sitesMap.set(siteName, site.id)
    }
  }

  // Clear previous legacy imports to prevent duplicates
  await prisma.grievance.deleteMany({
    where: { categoryId: legacyCategory.id }
  })
  console.log("Cleared previous legacy imports.")

  // Prepare Grievance objects
  let count = await prisma.grievance.count()
  const currentYear = new Date().getFullYear()

  let successCount = 0
  let skipCount = 0

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] as any[]
    if (r.length === 0 || !r[7]) {
      skipCount++
      continue // Skip empty rows or rows without an issue
    }

    try {
      const siteName = r[2]?.toString().trim()
      const siteId = siteName ? sitesMap.get(siteName) : null

      const dateReportedStr = r[3]
      let createdAt = new Date()
      // Basic date parsing if it's a string like "23.02.2026"
      if (typeof dateReportedStr === 'string' && dateReportedStr.includes('.')) {
        const parts = dateReportedStr.split('.')
        if (parts.length === 3) {
          createdAt = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
        }
      } else if (typeof dateReportedStr === 'number') {
        // Excel serial date
        createdAt = new Date((dateReportedStr - (25567 + 2)) * 86400 * 1000)
      }

      const grievantName = r[4]?.toString()
      const grievantContact = r[5]?.toString()
      const concernedPerson = r[6]?.toString()
      const issue = r[7]?.toString() || "No issue description provided"
      const currentStatus = r[8]?.toString() || "PENDING"
      const solved = r[9]?.toString() || "PENDING"
      const remark = r[11]?.toString() || ""

      // Map solved string to our new ENUM
      let status: any = "SUBMITTED"
      if (solved.toUpperCase().includes("RESOLVED")) status = "RESOLVED"
      else if (solved.toUpperCase().includes("CLOSED")) status = "CLOSED"
      else if (solved.toUpperCase().includes("IN PROGRESS") || currentStatus.toUpperCase().includes("IN PROGRESS")) status = "IN_PROGRESS"

      // Generate Ticket Number
      const ticketNumber = `GRV-${currentYear}-${String(count + 1).padStart(5, '0')}`
      count++

      const priority = "LOW"
      const slaDueDate = new Date(createdAt)
      slaDueDate.setDate(slaDueDate.getDate() + 7)

      await prisma.grievance.create({
        data: {
          ticketNumber,
          subject: issue.substring(0, 50) + (issue.length > 50 ? "..." : ""),
          description: issue,
          priority,
          sentiment: "Neutral",
          categoryId: legacyCategory.id,
          siteId,
          isAnonymous: false,
          department: "General",
          status,
          slaDueDate,
          createdAt,
          // Excel specific fields
          empIdGatepass: r[1]?.toString() || null,
          location: siteName || null,
          grievantName,
          grievantContact,
          concernedPerson,
          issue,
          currentStatus,
          solved,
          remark
        }
      })
      successCount++
    } catch (e) {
      console.error(`Error row ${i}:`, e)
      skipCount++
    }
  }

  console.log(`\nImport Complete! Successfully imported ${successCount} rows. Skipped ${skipCount} rows.`)
}

importExcel().catch(console.error).finally(() => prisma.$disconnect())
