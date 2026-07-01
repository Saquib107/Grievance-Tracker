"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Inbox, CheckCircle, Clock, AlertTriangle, FileText, Plus, Activity, ArrowUpRight, TrendingUp, ChevronDown, UserPlus, Building2, MapPin } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#64748b']

export default function AdminDashboardClient({ 
  metrics, 
  siteData, 
  statusData, 
  priorityData,
  monthlyData,
  recentActivity
}: { 
  metrics: any, 
  siteData: any[], 
  statusData: any[],
  priorityData: any[],
  monthlyData: any[],
  recentActivity: any[]
}) {
  // State removed

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Good Morning, Admin 👋</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Here's what's happening across all grievance sites today.</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">
                Quick Actions <ChevronDown className="h-4 w-4 ml-2" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <Link href="/admin/employees"><DropdownMenuItem className="cursor-pointer"><UserPlus className="mr-2 h-4 w-4" /> Add Employee</DropdownMenuItem></Link>
              <Link href="/admin/sites"><DropdownMenuItem className="cursor-pointer"><Building2 className="mr-2 h-4 w-4" /> Add Site</DropdownMenuItem></Link>
              <Link href="/admin/users"><DropdownMenuItem className="cursor-pointer"><Users className="mr-2 h-4 w-4" /> Assign HR</DropdownMenuItem></Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Top Filters removed for performance */}

      {/* Primary KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/cases" className="block">
          <Card className="border-[#ECECEC] dark:border-slate-800 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200 bg-[#FFFFFF] dark:bg-slate-900 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Grievances</CardTitle>
              <Inbox className="h-5 w-5 text-indigo-500" strokeWidth={2} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.totalGrievances}</div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" /> {metrics.trendPercentage}% this month
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/cases?status=open" className="block">
          <Card className="border-[#ECECEC] dark:border-slate-800 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200 bg-[#FFFFFF] dark:bg-slate-900 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Open Cases</CardTitle>
              <Clock className="h-5 w-5 text-blue-500" strokeWidth={2} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{metrics.openCases}</div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                <span className="text-orange-500">{metrics.highPriorityCases} High Priority</span>
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/cases?status=resolved" className="block">
          <Card className="border-[#ECECEC] dark:border-slate-800 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200 bg-[#FFFFFF] dark:bg-slate-900 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Resolved Cases</CardTitle>
              <CheckCircle className="h-5 w-5 text-emerald-500" strokeWidth={2} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{metrics.resolvedCases}</div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Average Resolution: {metrics.averageResolutionTime} Days</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/cases?status=overdue" className="block">
          <Card className="border-[#ECECEC] dark:border-slate-800 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200 border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-500">Overdue SLA</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-500" strokeWidth={2} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-500">{metrics.overdueCases}</div>
              <p className="text-xs text-red-500 mt-2 font-semibold">Needs Immediate Attention</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Secondary Quick Statistics */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-[#ECECEC] dark:border-slate-800 shadow-sm bg-[#FFFFFF] dark:bg-slate-900">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">Average Resolution</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold">{metrics.averageResolutionTime} Days</div>
          </CardContent>
        </Card>
        <Card className="border-[#ECECEC] dark:border-slate-800 shadow-sm bg-[#FFFFFF] dark:bg-slate-900">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">High Priority Cases</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold">{metrics.highPriorityCases}</div>
          </CardContent>
        </Card>
        <Card className="border-[#ECECEC] dark:border-slate-800 shadow-sm bg-[#FFFFFF] dark:bg-slate-900">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">Anonymous Complaints</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold">{metrics.anonymousComplaints}</div>
          </CardContent>
        </Card>
        <Card className="border-[#ECECEC] dark:border-slate-800 shadow-sm bg-[#FFFFFF] dark:bg-slate-900">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">Submitted Today</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {metrics.submittedToday === 0 ? (
              <div className="text-xl font-bold text-slate-400">0 <span className="text-xs font-normal ml-2">No grievances today</span></div>
            ) : (
              <div className="text-xl font-bold text-indigo-600">{metrics.submittedToday}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-[#ECECEC] dark:border-slate-800 shadow-sm bg-[#FFFFFF] dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-5 w-5 text-indigo-500" /> Monthly Grievances Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.4 }} 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value} Grievances`, 'Total']}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#ECECEC] dark:border-slate-800 shadow-sm bg-[#FFFFFF] dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-5 w-5 text-indigo-500" /> Site Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] flex flex-col">
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={siteData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {siteData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    formatter={(value: any, name: any) => {
                      const total = siteData.reduce((acc, curr) => acc + curr.value, 0)
                      const percent = Math.round((value / total) * 100)
                      return [`${value} (${percent}%)`, name]
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 justify-center max-h-[80px] overflow-y-auto pt-2">
              {siteData.slice(0, 8).map((entry, i) => (
                <div key={i} className="flex items-center text-xs bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="font-medium text-slate-700 dark:text-slate-300 mr-1">{entry.name}</span>
                  <span className="text-slate-500">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section (3 columns on large screens) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-1 border-[#ECECEC] dark:border-slate-800 shadow-sm bg-[#FFFFFF] dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Activity className="h-5 w-5 text-indigo-500" /> Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="relative flex gap-4 pb-4">
                  {index !== recentActivity.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800"></div>
                  )}
                  <div className="mt-1 h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-white dark:border-slate-900 flex items-center justify-center shrink-0 z-10">
                    <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{activity.changedBy}</p>
                      <span className="text-xs text-slate-500">{activity.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{activity.details}</p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-slate-500 italic text-center py-4">No recent activity found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Priority Overview */}
        <Card className="border-[#ECECEC] dark:border-slate-800 shadow-sm bg-[#FFFFFF] dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-indigo-500" /> Priority Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['HIGH', 'CRITICAL', 'MEDIUM', 'LOW'].map(pLevel => {
                const count = priorityData.find(p => p.name === pLevel)?.value || 0
                const colorMap: any = {
                  'CRITICAL': 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400',
                  'HIGH': 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
                  'MEDIUM': 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
                  'LOW': 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400'
                }
                const dotMap: any = {
                  'CRITICAL': 'bg-red-500',
                  'HIGH': 'bg-orange-500',
                  'MEDIUM': 'bg-blue-500',
                  'LOW': 'bg-emerald-500'
                }
                
                return (
                  <div key={pLevel} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${dotMap[pLevel]}`}></div>
                      <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">{pLevel.toLowerCase()}</span>
                    </div>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${colorMap[pLevel]}`}>{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-[#ECECEC] dark:border-slate-800 shadow-sm bg-[#FFFFFF] dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-5 w-5 text-indigo-500" /> Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATION', 'ACTION_TAKEN', 'RESOLVED', 'REJECTED', 'CLOSED'].map(status => {
                const count = statusData.find(s => s.name === status)?.value || 0
                if (count === 0 && status !== 'SUBMITTED' && status !== 'RESOLVED') return null; // Hide empty less important ones
                
                return (
                  <div key={status} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400 capitalize">{status.replace('_', ' ').toLowerCase()}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
