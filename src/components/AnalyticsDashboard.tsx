"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react"

const monthlyData = [
  { name: 'Jan', total: 12, resolved: 10 },
  { name: 'Feb', total: 19, resolved: 15 },
  { name: 'Mar', total: 15, resolved: 13 },
  { name: 'Apr', total: 22, resolved: 18 },
  { name: 'May', total: 30, resolved: 22 },
  { name: 'Jun', total: 25, resolved: 10 }, // Current month, many pending
]

const siteData = [
  { name: 'Site A (BSP)', value: 45 },
  { name: 'Site B (Noida)', value: 25 },
  { name: 'Site C (Pune)', value: 30 },
]

const COLORS = ['#4f46e5', '#0ea5e9', '#f59e0b', '#ef4444']

export default function AnalyticsDashboard({ stats }: { stats: any }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics Dashboard</h2>
        <p className="text-slate-500 mt-1">Live metrics and SLA tracking across all sites.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Grievances</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending / In Progress</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.pending}</div>
            <p className="text-xs text-amber-600 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Resolved Cases</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.resolved}</div>
            <p className="text-xs text-emerald-600 mt-1">85% Resolution Rate</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-red-600">SLA Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-600">{stats.overdue}</div>
            <p className="text-xs text-red-500 mt-1 font-semibold">Breached timeframe</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="total" name="Total Filed" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Site Wise Breakdown */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Cases by Site Location</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={siteData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {siteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="absolute bottom-6 flex space-x-4 text-sm">
              {siteData.map((entry, index) => (
                <div key={entry.name} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-slate-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
