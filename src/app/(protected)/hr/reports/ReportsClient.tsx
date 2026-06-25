"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import PDFExportButton from "@/components/PDFExportButton"
import { CalendarDays, MapPin, CheckCircle2, Clock } from "lucide-react"

export default function ReportsClient({ grievances }: { grievances: any[] }) {
  
  // 1. Monthly Grievance Report (This month only)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyData = grievances.filter(g => {
    const d = new Date(g.createdAt)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  // 2. Resolution Report (Resolved and Closed only)
  const resolutionData = grievances.filter(g => g.status === "RESOLVED" || g.status === "CLOSED")

  // 3. SLA Report (Overdue only)
  const slaData = grievances.filter(g => {
    if (g.status === "RESOLVED" || g.status === "CLOSED") return false
    return g.slaDueDate && new Date(g.slaDueDate) < new Date()
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Monthly Report */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Monthly Report</CardTitle>
            <CardDescription className="mt-1">All grievances submitted in the current month.</CardDescription>
          </div>
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <CalendarDays className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-4 border-t mt-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">{monthlyData.length} Records</span>
          <PDFExportButton 
            data={monthlyData} 
            title={`Monthly Grievance Report - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`} 
            filename={`Monthly_Report_${currentMonth+1}_${currentYear}.pdf`} 
          />
        </CardContent>
      </Card>

      {/* Site Wise Report */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Site-Wise Report</CardTitle>
            <CardDescription className="mt-1">Complete dump of all active and past grievances across all sites.</CardDescription>
          </div>
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <MapPin className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-4 border-t mt-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">{grievances.length} Records</span>
          <PDFExportButton 
            data={grievances} 
            title="Comprehensive Site-Wise Report" 
            filename="Site_Wise_Report.pdf" 
          />
        </CardContent>
      </Card>

      {/* Resolution Report */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Resolution Report</CardTitle>
            <CardDescription className="mt-1">Grievances that have been successfully resolved or closed.</CardDescription>
          </div>
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-4 border-t mt-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">{resolutionData.length} Records</span>
          <PDFExportButton 
            data={resolutionData} 
            title="Resolution & Closure Report" 
            filename="Resolution_Report.pdf" 
          />
        </CardContent>
      </Card>

      {/* SLA Breach Report */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <CardTitle className="text-lg">SLA Breach Report</CardTitle>
            <CardDescription className="mt-1">Active grievances that have passed their SLA Due Date.</CardDescription>
          </div>
          <div className="p-2 bg-red-100 text-red-600 rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="pt-4 border-t mt-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-red-600">{slaData.length} Overdue</span>
          <PDFExportButton 
            data={slaData} 
            title="SLA Breach (Overdue) Report" 
            filename="SLA_Breach_Report.pdf" 
          />
        </CardContent>
      </Card>

    </div>
  )
}
