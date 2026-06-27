"use client"

import React, { useState } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, ComposedChart
} from 'recharts'
import { 
  ShieldAlert, Users, Clock, AlertCircle, CheckCircle2, TrendingUp, TrendingDown,
  Activity, Star, Bell, Calendar as CalendarIcon, ArrowRight, CheckSquare, 
  MessageSquare, FileText, UserPlus, FileOutput
} from "lucide-react"
import Link from 'next/link'

interface DashboardData {
  user: { name: string; siteName: string; dateStr: string };
  kpis: {
    pendingApproval: number; pendingNewToday: number;
    assignedToMe: number;
    inProgress: number;
    overdueSLA: number;
    closedToday: number;
    avgResolutionDays: number;
    slaCompliancePct: number;
    employeeSatisfaction: number;
  };
  urgentCases: { id: string; ticketNumber: string; category: string; department: string; urgency: string; message: string; color: string }[];
  recentActivity: { time: string; text: string }[];
  pipeline: { name: string; value: number }[];
  categories: { name: string; value: number }[];
  departments: { name: string; value: number }[];
  monthlyTrend: { month: string; cases: number }[];
  nearSLA: { id: string; ticketNumber: string; timeLeft: string }[];
  performance: { assigned: number; closed: number; avgRes: number; sla: number; rating: number };
  pendingResponse: { id: string; ticketNumber: string; reason: string; waitTime: string }[];
  workload: { assigned: number; recommended: number; status: "Healthy" | "Heavy Workload" };
  notifications: { grievances: number; slaAlerts: number; escalations: number };
  followups: { time: string; text: string }[];
}

export default function HRDashboardClient({ data }: { data: DashboardData }) {
  
  // Custom Funnel/Pipeline rendering using basic divs for a horizontal funnel look
  const totalPipeline = Math.max(...data.pipeline.map(d => d.value), 1)

  // Custom Colors
  const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#eab308', '#22c55e']

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Good Morning, {data.user.name} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">{data.user.siteName}</p>
        </div>
        
        <div className="mt-4 md:mt-0 text-right flex flex-col md:items-end">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{data.user.dateStr}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="text-xs font-medium text-slate-500 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending {data.kpis.pendingApproval}</span>
              <span className="w-px h-3 bg-slate-300 dark:bg-slate-700 mx-1"></span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Assigned {data.kpis.assignedToMe}</span>
              <span className="w-px h-3 bg-slate-300 dark:bg-slate-700 mx-1"></span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Overdue {data.kpis.overdueSLA}</span>
              <span className="w-px h-3 bg-slate-300 dark:bg-slate-700 mx-1"></span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Closed Today {data.kpis.closedToday}</span>
            </div>
            
            <div className="flex gap-2">
              <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-50 dark:bg-slate-800 rounded-full">
                <Bell className="h-5 w-5" />
                {(data.notifications.grievances + data.notifications.slaAlerts + data.notifications.escalations) > 0 && (
                  <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending */}
        <div className="card-hover rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 border-t-4 border-t-amber-500">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500">Pending Approval</h3>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.kpis.pendingApproval}</div>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> {data.kpis.pendingNewToday} New Today
            </span>
          </div>
        </div>

        {/* Assigned */}
        <div className="card-hover rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 border-t-4 border-t-indigo-500">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500">Assigned to Me</h3>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.kpis.assignedToMe}</div>
          </div>
        </div>

        {/* In Progress */}
        <div className="card-hover rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 border-t-4 border-t-blue-500">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500">In Progress</h3>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.kpis.inProgress}</div>
          </div>
        </div>

        {/* Overdue */}
        <div className="card-hover rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 border-t-4 border-t-red-500">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500">Overdue SLA</h3>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.kpis.overdueSLA}</div>
            <span className="text-xs font-medium text-red-600 dark:text-red-400">Needs Action</span>
          </div>
        </div>

        {/* Closed Today */}
        <div className="card-hover rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 border-t-4 border-t-emerald-500">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500">Closed Today</h3>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.kpis.closedToday}</div>
          </div>
        </div>

        {/* Avg Resolution */}
        <div className="card-hover rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 border-t-4 border-t-cyan-500">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500">Avg Resolution Time</h3>
            <Clock className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.kpis.avgResolutionDays} <span className="text-sm font-medium text-slate-500">Days</span></div>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="card-hover rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 border-t-4 border-t-purple-500">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500">SLA Compliance</h3>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.kpis.slaCompliancePct}%</div>
            <span className={`text-xs font-medium flex items-center ${data.kpis.slaCompliancePct >= 95 ? 'text-emerald-600' : 'text-amber-600'}`}>
              Target 95%
            </span>
          </div>
        </div>

        {/* Satisfaction */}
        <div className="card-hover rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 border-t-4 border-t-pink-500">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-slate-500">Employee Satisfaction</h3>
            <Star className="h-4 w-4 text-pink-500 fill-pink-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.kpis.employeeSatisfaction}</div>
            <span className="text-sm font-medium text-slate-500">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Row 2: Urgent Cases + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Cases */}
        <div className="lg:col-span-2 rounded-xl border bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" /> Urgent Cases
            </h3>
            <Link href="/hr/cases" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">View All</Link>
          </div>
          <div className="p-0 flex-1">
            {data.urgentCases.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No urgent cases right now. Great job!</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.urgentCases.map((caseItem) => (
                  <div key={caseItem.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${caseItem.color === 'red' ? 'bg-red-500' : 'bg-amber-500'} shadow-[0_0_8px_rgba(0,0,0,0.2)] ${caseItem.color === 'red' ? 'shadow-red-500/50' : 'shadow-amber-500/50'}`}></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">{caseItem.ticketNumber}</span>
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">{caseItem.category}</span>
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">{caseItem.department}</span>
                        </div>
                        <p className={`text-sm mt-1 font-medium ${caseItem.color === 'red' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {caseItem.message}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-xl border bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col h-[400px]">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-400" /> Today's Activity
            </h3>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6">
              {data.recentActivity.length === 0 ? (
                <div className="text-sm text-slate-500 ml-4">No activity today yet.</div>
              ) : (
                data.recentActivity.map((act, i) => (
                  <div key={i} className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500"></span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 mb-0.5">{act.time}</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{act.text}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Pipeline & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investigation Pipeline */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Investigation Pipeline</h3>
          <div className="space-y-4">
            {data.pipeline.map((stage, index) => {
              const width = Math.max((stage.value / totalPipeline) * 100, 2)
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-slate-600 dark:text-slate-400 text-right">{stage.name}</div>
                  <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-r-md overflow-hidden flex items-center">
                    <div 
                      className="h-full bg-indigo-500 flex items-center px-2 transition-all duration-1000 ease-out" 
                      style={{ width: `${width}%`, backgroundColor: COLORS[index % COLORS.length] }}
                    >
                    </div>
                    <span className="ml-3 text-sm font-bold text-slate-700 dark:text-slate-300">{stage.value}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 h-[300px]">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.categories} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={100} />
              <RechartsTooltip 
                cursor={{fill: 'rgba(0,0,0,0.05)'}} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20}>
                {data.categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Department Heatmap & SLA Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Distribution */}
        <div className="lg:col-span-1 rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Department Heatmap</h3>
          <div className="space-y-3">
            {data.departments.map((dept, index) => {
              const maxVal = Math.max(...data.departments.map(d => d.value), 1)
              const pct = (dept.value / maxVal) * 100
              // Color intensity based on percentage
              const intensity = pct > 80 ? 'bg-rose-500' : pct > 50 ? 'bg-orange-400' : pct > 20 ? 'bg-amber-300' : 'bg-green-300'
              return (
                <div key={index}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{dept.name}</span>
                    <span className="text-slate-500">{dept.value}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${intensity}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="lg:col-span-2 rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Monthly Grievance Trend</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="cases" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 5: Quick Actions, Workload, Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SLA & Workload & Performance (Stacked) */}
        <div className="lg:col-span-1 space-y-6">
          {/* SLA Health Meter */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 text-center">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">SLA Health</h3>
            <div className="text-4xl font-black text-slate-900 dark:text-white my-4">{data.kpis.slaCompliancePct}%</div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full ${data.kpis.slaCompliancePct >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                style={{ width: `${data.kpis.slaCompliancePct}%` }}
              ></div>
            </div>
            <p className="text-xs font-medium text-slate-500">Target: 95%</p>
          </div>

          {/* Workload */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">My Workload</h3>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-500">Assigned</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{data.workload.assigned}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-sm text-slate-500">Recommended</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{data.workload.recommended}</span>
            </div>
            <div className={`text-center py-2 rounded-md font-semibold text-sm ${data.workload.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
              {data.workload.status === 'Healthy' ? 'Healthy' : '⚠ Heavy Workload'}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-2 rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/hr/cases" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group">
              <div className="bg-indigo-100 dark:bg-indigo-500/20 p-3 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <CheckSquare className="h-5 w-5" />
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">Assign Case</span>
            </Link>
            
            <Link href="/hr/cases" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all group">
              <div className="bg-blue-100 dark:bg-blue-500/20 p-3 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">Add Internal Note</span>
            </Link>
            
            <Link href="/hr/cases" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all group">
              <div className="bg-amber-100 dark:bg-amber-500/20 p-3 rounded-lg text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">Contact Employee</span>
            </Link>

            <Link href="/hr/reports" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group">
              <div className="bg-emerald-100 dark:bg-emerald-500/20 p-3 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <FileOutput className="h-5 w-5" />
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">Generate Report</span>
            </Link>
          </div>
        </div>

        {/* My Performance & Pending Response */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">My Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Assigned</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{data.performance.assigned}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Closed</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{data.performance.closed}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Avg Resolution</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{data.performance.avgRes} <span className="text-xs font-normal text-slate-400">Days</span></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Rating</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> {data.performance.rating}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
