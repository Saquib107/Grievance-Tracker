"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts'
import { Clock, TrendingUp } from 'lucide-react'

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b']

export default function AnalyticsCharts({ 
  categoryData, 
  departmentData, 
  statusData,
  trendsData,
  averageResolutionDays
}: { 
  categoryData: any[], 
  departmentData: any[], 
  statusData: any[],
  trendsData?: any[],
  averageResolutionDays?: number
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between opacity-90">
              Avg Resolution Time
              <Clock className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {averageResolutionDays ? averageResolutionDays.toFixed(1) : "0"} <span className="text-lg font-medium opacity-80">Days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Grievances by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      {trendsData && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Monthly Grievance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Department Distribution Heatmap / Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Department Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex flex-col gap-2 overflow-y-auto pr-2">
            {departmentData.sort((a, b) => b.value - a.value).map((dept, i) => {
              // Calculate intensity for heatmap coloring
              const maxVal = departmentData[0]?.value || 1;
              const intensity = dept.value / maxVal;
              const bgOpacity = Math.max(0.1, intensity);
              
              return (
                <div key={dept.name} className="flex items-center justify-between p-3 rounded-md border border-slate-100 dark:border-slate-800"
                     style={{ backgroundColor: `rgba(239, 68, 68, ${bgOpacity * 0.2})` }}>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{dept.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(dept.value / maxVal) * 100}%` }}></div>
                    </div>
                    <span className="font-bold w-6 text-right">{dept.value}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  )
}
