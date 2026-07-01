"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

// Dynamically import Recharts to reduce initial bundle size
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-md"></div> })
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false })
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false })
const RechartsTooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false })

const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false })
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false })
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false })

// Colors for charts
const priorityColors = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#94a3b8']
const statusColors = ['#f59e0b', '#a855f7', '#10b981', '#64748b', '#3b82f6', '#ef4444', '#ec4899']
const COLORS = ['#4f46e5', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center text-sm mb-1">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            <span className="text-slate-600 dark:text-slate-300 mr-4">{entry.name}:</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {entry.value} {entry.name === 'compliance' ? '%' : (entry.name === 'days' ? 'Days' : 'Cases')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

const AnalyticsDashboard = React.memo(function AnalyticsDashboard({ 
  stats,
  monthlyData = [],
  priorityData = [],
  statusData = []
}: { 
  stats: any,
  monthlyData?: any[],
  priorityData?: any[],
  statusData?: any[]
}) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time business intelligence and performance metrics.</p>
        </div>
        
        {/* Filters removed for performance */}
      </div>

      {/* KPI Cards (Drill-Down Links) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/cases" className="block">
          <Card className="border-l-4 border-l-blue-500 card-hover cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Grievances</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">{stats.total}</div>
              <p className="text-xs text-slate-500 mt-1">↑ 12% from last month</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/cases?status=IN_PROGRESS" className="block">
          <Card className="border-l-4 border-l-amber-500 card-hover cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Pending / In Progress</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white hover:text-amber-600 transition-colors">{stats.pending}</div>
              <p className="text-xs text-amber-600 mt-1 font-medium">Requires attention</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/cases?status=RESOLVED" className="block">
          <Card className="border-l-4 border-l-emerald-500 card-hover cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Resolved Cases</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors">{stats.resolved}</div>
              <p className="text-xs text-emerald-600 mt-1 font-medium">85% Resolution Rate</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/cases?status=OVERDUE" className="block">
          <Card className="border-l-4 border-l-red-500 card-hover cursor-pointer h-full bg-red-50/30 dark:bg-red-950/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-red-600">SLA Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-red-600 hover:text-red-700 transition-colors">{stats.overdue}</div>
              <p className="text-xs text-red-500 mt-1 font-semibold">Immediate action needed</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="card-hover lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Monthly Trend</CardTitle>
            <CardDescription>Volume of grievances filed vs resolved.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9', opacity: 0.4}} />
                <Bar dataKey="total" name="Total Filed" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>


        {/* Priority & Status Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-2">
          {/* Status Distribution */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-2 text-sm">
                {statusData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: statusColors[index % statusColors.length] }}></div>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={priorityColors[index % priorityColors.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-2 text-sm">
                {priorityData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: priorityColors[index % priorityColors.length] }}></div>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  )
})

export default AnalyticsDashboard;
