"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { MapPin, Plus, Edit2 } from "lucide-react"
import { createSite, updateSite } from "@/app/actions/sites"

export default function AdminSitesClient({ initialSites }: { initialSites: any[] }) {
  const [sites, setSites] = useState(initialSites)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [location, setLocation] = useState("")

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Site Management</h2>
          <p className="text-sm text-slate-500">Manage all operational sites and strict dropdown codes.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" /> Add Site
            </Button>
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

      <div className="bg-white rounded-lg border shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Site Name</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">HR Assigned</th>
                <th className="px-6 py-4 font-medium">Employees</th>
                <th className="px-6 py-4 font-medium">Total Cases</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {initialSites.map((site) => (
                <tr key={site.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{site.code}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" /> {site.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{site.location}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{site.hrAssigned}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{site.totalEmployees}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{site.totalCases}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(site)}>
                      <Edit2 className="h-4 w-4 text-slate-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
