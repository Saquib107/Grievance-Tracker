"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface PDFExportButtonProps {
  data: any[]
  title?: string
  filename?: string
}

export default function PDFExportButton({ data, title = "Grievance Report", filename = "Grievance_Report.pdf" }: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const generatePDF = () => {
    setIsExporting(true)
    
    try {
      const doc = new jsPDF('landscape')
      
      // Add Title
      doc.setFontSize(18)
      doc.text(title, 14, 22)
      
      doc.setFontSize(11)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

      // Transform Data for Table
      const tableColumn = ["S.No", "Location", "Grievant Name", "Contact", "Issue", "Concerned Person", "Status", "Solved"]
      const tableRows: any[] = []

      data.forEach(item => {
        const rowData = [
          item.ticketNumber,
          item.location || "-",
          item.grievantName || "-",
          item.grievantContact || "-",
          item.issue ? (item.issue.substring(0, 50) + "...") : "-",
          item.concernedPerson || "-",
          item.currentStatus || "-",
          item.solved || "-"
        ]
        tableRows.push(rowData)
      })

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
        alternateRowStyles: { fillColor: [248, 250, 252] },
      })

      doc.save(filename)
    } catch (err) {
      console.error("Failed to generate PDF", err)
      alert("Failed to generate PDF")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={generatePDF}
      disabled={isExporting}
      className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
    >
      {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      Export to PDF
    </Button>
  )
}
