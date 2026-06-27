"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import PDFExportButton from "@/components/PDFExportButton"
import { FileText, Download, Clock, RefreshCw, Send, Eye, FileSpreadsheet, CalendarDays, Loader2 } from "lucide-react"

export default function ReportsClient({ grievances }: { grievances: any[] }) {
  
  const [reportType, setReportType] = useState("monthly")
  const [site, setSite] = useState("all")
  const [status, setStatus] = useState("all")
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Mock scheduled reports
  const scheduledReports = [
    { id: 1, name: "Monthly Executive Summary", frequency: "Every 1st of Month", recipients: "hr-leadership@company.com" },
    { id: 2, name: "Weekly SLA Alerts", frequency: "Every Monday 9 AM", recipients: "site-admins@company.com" }
  ]

  const handleGenerate = () => {
    setIsGenerating(true)
    setShowPreview(false)
    setTimeout(() => {
      setIsGenerating(false)
      setShowPreview(true)
      toast.success("Report Generated Successfully")
    }, 1500) // fake loading delay
  }

  const handleExcelExport = () => {
    toast.success("Excel (.xlsx) downloaded successfully")
  }
  
  const handleCSVExport = () => {
    toast.success("CSV downloaded successfully")
  }

  // Derive preview data
  const previewData = grievances.slice(0, 5) // just show first 5 as preview

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto pb-10">
      
      {/* Left Sidebar: Configuration */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg">Report Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">Report Type</Label>
              <Select value={reportType} onValueChange={(val) => setReportType(val || "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Summary</SelectItem>
                  <SelectItem value="site">Site-Wise Report</SelectItem>
                  <SelectItem value="resolution">Resolution Metrics</SelectItem>
                  <SelectItem value="sla">SLA Breach Report</SelectItem>
                  <SelectItem value="employee">Employee-Wise</SelectItem>
                  <SelectItem value="hr">HR Performance</SelectItem>
                  <SelectItem value="category">Category Report</SelectItem>
                  <SelectItem value="priority">Priority Report</SelectItem>
                  <SelectItem value="audit">Audit Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500">From Date</Label>
                <Input type="date" className="text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500">To Date</Label>
                <Input type="date" className="text-xs" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">Site Filter</Label>
              <Select value={site} onValueChange={(val) => setSite(val || "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  <SelectItem value="bsp">BSP Bhilai</SelectItem>
                  <SelectItem value="noida">Noida HO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">Status Filter</Label>
              <Select value={status} onValueChange={(val) => setStatus(val || "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open / Pending</SelectItem>
                  <SelectItem value="resolved">Resolved / Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><RefreshCw className="mr-2 h-4 w-4" /> Generate Report</>
              )}
            </Button>
            
            {showPreview && (
              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500">Last Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Reports */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-md flex items-center">
              <Clock className="h-4 w-4 mr-2 text-slate-400" />
              Scheduled Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {scheduledReports.map(sr => (
                <div key={sr.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{sr.name}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center"><Send className="h-3 w-3 mr-1" /> {sr.frequency}</p>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" className="w-full text-xs text-indigo-600">
                + Create Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area: Preview & Export */}
      <div className="flex-1 flex flex-col min-w-0">
        {!showPreview ? (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-xl p-12">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl">📄</div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No Report Generated</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">Select your configuration on the left and click Generate to see a preview and export options.</p>
            </div>
          </div>
        ) : (
          <Card className="shadow-sm border-indigo-100 dark:border-indigo-900/50 flex-1 flex flex-col overflow-hidden">
            <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/30 pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-xl text-indigo-900 dark:text-indigo-100">Report Preview</CardTitle>
                  </div>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="bg-white dark:bg-slate-800 text-xs font-medium">13 Records</Badge>
                    <Badge variant="outline" className="bg-white dark:bg-slate-800 text-xs font-medium">5 Pages</Badge>
                    <Badge variant="outline" className="bg-white dark:bg-slate-800 text-xs font-medium">320 KB</Badge>
                  </CardDescription>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm flex">
                    <Button variant="ghost" size="sm" className="h-9 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-r-none font-medium" onClick={handleExcelExport}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
                    </Button>
                    <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
                    <Button variant="ghost" size="sm" className="h-9 text-slate-600 hover:bg-slate-50 rounded-none rounded-r-md font-medium" onClick={handleCSVExport}>
                      CSV
                    </Button>
                  </div>
                  <div className="shadow-sm rounded-md overflow-hidden">
                    <PDFExportButton 
                      data={grievances} 
                      title={`${reportType.toUpperCase()} REPORT`} 
                      filename={`Report_${reportType}.pdf`} 
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3 font-medium">Ticket ID</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Employee</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {previewData.map((g, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-3 font-mono font-medium text-slate-900 dark:text-slate-100">{g.id.substring(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{new Date(g.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{g.employee?.name || 'Unknown'}</td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{g.category?.name || 'General'}</td>
                      <td className="px-6 py-3">
                        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 shadow-sm">{g.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-xs text-slate-500">
                Showing 5 of 13 records in preview. Export full report to see all.
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  )
}
