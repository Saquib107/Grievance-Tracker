"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Building2, Inbox, CheckCircle2, Clock, AlertCircle, FileText, Plus, BarChart3 } from "lucide-react"
import Link from "next/link"

const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#64748b']

export default function AdminDashboardClient({ 
  metrics, 
  siteData, 
  categoryData, 
  monthlyData 
}: { 
  metrics: any, 
  siteData: any[], 
  categoryData: any[], 
  monthlyData: any[] 
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">High-level view of system performance and metrics.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/employees" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-md bg-white border border-slate-200 text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-2" /> Employee
          </Link>
          <Link href="/admin/users" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-md bg-white border border-slate-200 text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-2" /> HR
          </Link>
          <Link href="/admin/sites" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-md bg-white border border-slate-200 text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-2" /> Site
          </Link>
          <Link href="/public/submit" target="_blank" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">
            <Plus className="h-4 w-4 mr-2" /> Grievance
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Grievances</CardTitle>
            <Inbox className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalGrievances}</div>
            <p className="text-xs text-slate-500 mt-1">All time records</p>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Open Cases</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-500">{metrics.openCases}</div>
            <p className="text-xs text-slate-500 mt-1">Pending resolution</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Resolved Cases</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{metrics.resolvedCases}</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">{metrics.totalGrievances > 0 ? Math.round((metrics.resolvedCases / metrics.totalGrievances) * 100) : 0}% Resolution Rate</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-500">Overdue SLA</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-500">{metrics.overdueCases}</div>
            <p className="text-xs text-red-500 mt-1 font-medium">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2"><Users className="h-4 w-4"/> Total Employees</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2"><Users className="h-4 w-4"/> Total HR Users</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{metrics.totalHR}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2"><Building2 className="h-4 w-4"/> Total Sites</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{metrics.totalSites}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2"><FileText className="h-4 w-4"/> Submitted Today</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-indigo-600">{metrics.submittedToday}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4" /> Monthly Grievances Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dx={-10} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Site-wise Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={siteData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {siteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {siteData.slice(0, 5).map((entry, i) => (
                <div key={i} className="flex items-center text-xs">
                  <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-slate-600 dark:text-slate-400">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
