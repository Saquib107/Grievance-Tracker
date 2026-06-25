import * as xlsx from 'xlsx'
import fs from 'fs'

const workbook = xlsx.readFile('GRIEVANCE TRACKING FORM TEMPLATE.xlsx')
const sheetName = workbook.SheetNames[0]
const worksheet = workbook.Sheets[sheetName]
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 })

console.log(`Found ${data.length} rows.`)
const rows = data.slice(3)
let emptyCount = 0
for (const r of rows) {
  const row = r as any[]
  if (row.length === 0 || !row[7]) {
    emptyCount++
    if (emptyCount === 1) {
      console.log("First skipped row:", row)
    }
  }
}
console.log("Empty Issue Count:", emptyCount)
