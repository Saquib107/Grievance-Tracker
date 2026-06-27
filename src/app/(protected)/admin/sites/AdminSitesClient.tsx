"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { MapPin, Plus, Edit2, Trash2, Search, Printer, Download, MoreHorizontal, Eye, UserPlus, Archive } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { createSite, updateSite, deleteSite } from "@/app/actions/sites"

export default function AdminSitesClient({ initialSites }: { initialSites: any[] }) {
  const [sites, setSites] = useState(initialSites)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [location, setLocation] = useState("")
  const [isActive, setIsActive] = useState(true)

  const [filterSearch, setFilterSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalSites = initialSites.length
  const activeSites = initialSites.filter(s => s.isActive).length
  const totalEmployees = initialSites.reduce((acc, s) => acc + s.totalEmployees, 0)
  const totalOpenCases = initialSites.reduce((acc, s) => acc + s.openCases, 0)

  const processedSites = useMemo(() => {
    let result = initialSites
    if (filterSearch) {
      const q = filterSearch.toLowerCase()
      result = result.filter(s => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q) || s.location?.toLowerCase().includes(q))
    }
    if (filterStatus !== "ALL") {
      if (filterStatus === "ACTIVE") result = result.filter(s => s.isActive)
      if (filterStatus === "CLOSED") result = result.filter(s => !s.isActive)
    }
    return result
  }, [initialSites, filterSearch, filterStatus])
  
  useMemo(() => { setCurrentPage(1) }, [filterSearch, filterStatus])

  const paginatedSites = processedSites.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(processedSites.length / itemsPerPage)

  const openNew = () => {
    setId(""); setName(""); setCode(""); setLocation("");
    setIsOpen(true)
  }

  const openEdit = (site: any) => {
    setId(site.id); setName(site.name); setCode(site.code); setLocation(site.location);
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    let res
    if (id) {
      res = await updateSite(id, { name, code, location })
    } else {
      res = await createSite({ name, code, location })
    }
    
    setLoading(false)
    if (res.success) {
      toast.success(`Site ${id ? 'updated' : 'created'} successfully!`)
      setIsOpen(false)
      router.refresh()
    } else {
      toast.error(res.error || "Failed to save site")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this site? This action cannot be undone.")) return
    const res = await deleteSite(id)
    if (res.success) {
      toast.success("Site deleted successfully!")
      router.refresh()
    } else {
      toast.error(res.error || "Failed to delete site")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Site Management</h2>
          <p className="text-sm text-slate-500">Manage all operational sites and strict dropdown codes.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700" onClick={openNew} />}>
            <Plus className="h-4 w-4 mr-2" /> Add Site
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{id ? 'Edit Site' : 'Create New Site'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Site Code (e.g. BSP)</Label>
                  <Input required value={code} onChange={e => setCode(e.target.value)} placeholder="BSP" />
                </div>
                <div className="space-y-2">
                  <Label>Site Name (Full)</Label>
                  <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Bhilai Steel Plant" />
                </div>
                <div className="space-y-2">
                  <Label>Location / City</Label>
                  <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Bhilai, Chhattisgarh" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>{id ? 'Save Changes' : 'Create Site'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Total Sites</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalSites}</div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
            <span className="text-emerald-600 font-medium">{activeSites} Active</span>
            <span className="text-rose-600 font-medium">{totalSites - activeSites} Closed</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Employees Across Sites</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalEmployees}</div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
            <span className="text-indigo-600 font-medium cursor-pointer hover:underline">View all</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Open Cases</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalOpenCases}</div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm">
            <span className="text-amber-600 font-medium cursor-pointer hover:underline">Requires resolution</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-center items-center border-dashed cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onClick={openNew}>
          <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-indigo-600">Add New Site</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row flex-wrap gap-4 items-end">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <Label className="text-xs font-semibold text-slate-500">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="🔍 Search Site Name, Code, or Location..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </div>
        <div className="space-y-1 w-full sm:w-[150px]">
          <Label className="text-xs font-semibold text-slate-500">Status</Label>
          <Select value={filterStatus} onValueChange={val => setFilterStatus(val || "")}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 bg-white" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button variant="outline" className="h-9 bg-white">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Site Name</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">HR Assigned</th>
                <th className="px-6 py-4 font-medium">Employees</th>
                <th className="px-6 py-4 font-medium">Open Cases</th>
                <th className="px-6 py-4 font-medium text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedSites.map((site) => (
                <tr key={site.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors h-[64px] border-l-4 border-transparent hover:border-indigo-400">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">{site.code}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{site.name}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 mr-1" />
                      {site.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {site.isActive ? (
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 font-semibold text-xs rounded-full shadow-sm">🟢 Active</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-rose-100 text-rose-700 border-none px-3 py-1 font-semibold text-xs rounded-full shadow-sm">🔴 Closed</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <div className="flex flex-wrap gap-1">
                      {site.hrAssignedList && site.hrAssignedList.length > 0 ? (
                        site.hrAssignedList.map((hr: string, i: number) => (
                          <span key={i} className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
                            {hr}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/employees?site=${site.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline text-lg">
                      {site.totalEmployees}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/cases?site=${site.id}`} className="text-rose-600 hover:text-rose-800 font-medium hover:underline text-lg">
                      {site.openCases}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none">
                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(site)}>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit Site
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="mr-2 h-4 w-4" /> Assign HR
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="mr-2 h-4 w-4" /> Archive Site
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => handleDelete(site.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Site
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {paginatedSites.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="text-4xl">🏢</div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Sites Found</h3>
                      <p className="text-slate-500">You haven't added any sites yet, or none match your filters.</p>
                      <Button variant="outline" className="mt-2" onClick={openNew}>Add New Site</Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="text-sm text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, processedSites.length)} of {processedSites.length}
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>&lt; Previous</Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button key={page} variant={currentPage === page ? "default" : "ghost"} size="sm" className="w-9" onClick={() => setCurrentPage(page)}>{page}</Button>
              ))}
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next &gt;</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
