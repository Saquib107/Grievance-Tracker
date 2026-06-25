"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { bulkImportGrievances } from "@/app/actions/bulkImport"
import { Upload, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"

export default function ExcelImportButton() {
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: "array" })
      
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert to JSON
      // Expected Headers in Excel: empIdGatepass, location, grievantName, grievantContact, issue, concernedPerson, currentStatus, priority, solved
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      if (jsonData.length === 0) {
        alert("The uploaded Excel file is empty.")
        setIsImporting(false)
        return
      }

      const res = await bulkImportGrievances(jsonData)
      
      if (res.success) {
        alert(`Successfully imported ${res.count} records!`)
      }
    } catch (err: any) {
      console.error(err)
      alert("Failed to import Excel file. Ensure headers match the expected schema.")
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <>
      <input 
        type="file" 
        accept=".xlsx, .xls, .csv" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />
      <Button 
        variant="outline" 
        className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200"
        disabled={isImporting}
        onClick={() => fileInputRef.current?.click()}
      >
        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        Bulk Import Excel
      </Button>
    </>
  )
}
