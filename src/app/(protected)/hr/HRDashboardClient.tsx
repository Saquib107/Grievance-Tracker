"use client"

import React, { useState } from 'react'
import { 
  ShieldAlert, Users, Activity, AlertCircle, TrendingUp, Bell, ArrowRight
} from "lucide-react"
import Link from 'next/link'

interface DashboardData {
  user: { name: string; siteName: string; dateStr: string };
  kpis: {
    pendingApproval: number; pendingNewToday: number;
    assignedToMe: number;
    inProgress: number;
    overdueSLA: number;
  };
  urgentCases: { id: string; ticketNumber: string; category: string; department: string; urgency: string; message: string; color: string }[];
  recentActivity: { time: string; text: string }[];
  notifications: { grievances: number; slaAlerts: number; escalations: number };
}

export default function HRDashboardClient({ data }: { data: DashboardData }) {
  


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
            <div className="text-xs font-medium text-slate-500 flex flex-wrap justify-end md:justify-center items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-md border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending {data.kpis.pendingApproval}</span>
              <span className="hidden md:block w-px h-3 bg-slate-300 dark:bg-slate-700"></span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Assigned {data.kpis.assignedToMe}</span>
              <span className="hidden md:block w-px h-3 bg-slate-300 dark:bg-slate-700"></span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Overdue {data.kpis.overdueSLA}</span>
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


    </div>
  )
}
