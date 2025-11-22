import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
  })

  const resetForm = () => setForm({ name: '', email: '', phone: '', address: '', status: 'active' })

  const fetchCustomers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/customers`)
      const data = await res.json()
      setCustomers(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const createCustomer = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const er = await res.json().catch(() => ({}))
        throw new Error(er.detail || 'Failed to create customer')
      }
      resetForm()
      await fetchCustomers()
    } catch (e) {
      setError(e.message)
    }
  }

  const updateCustomer = async (id, updates) => {
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Update failed')
      await fetchCustomers()
    } catch (e) {
      setError(e.message)
    }
  }

  const deleteCustomer = async (id) => {
    if (!confirm('Delete this customer?')) return
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/customers/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const er = await res.json().catch(() => ({}))
        throw new Error(er.detail || 'Delete failed')
      }
      await fetchCustomers()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createCustomer} className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <input className="bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2 text-white md:col-span-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
        <input className="bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2 text-white md:col-span-2" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
        <input className="bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2 text-white" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
        <select className="bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2 text-white" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <input className="bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2 text-white md:col-span-5" placeholder="Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} />
        <div className="md:col-span-1 flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md px-4 py-2">Add</button>
          <button type="button" onClick={resetForm} className="px-3 py-2 rounded-md bg-slate-700 text-white">Reset</button>
        </div>
      </form>

      {error && <div className="text-red-300 bg-red-900/20 border border-red-700 rounded-md px-3 py-2">{error}</div>}

      <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-white font-semibold">Customers</h3>
          <button onClick={fetchCustomers} className="text-sm bg-slate-700 hover:bg-slate-600 text-white rounded px-3 py-1">Refresh</button>
        </div>
        <div className="divide-y divide-slate-700">
          {loading ? (
            <div className="p-4 text-blue-200">Loading...</div>
          ) : customers.length === 0 ? (
            <div className="p-4 text-blue-200">No customers yet.</div>
          ) : (
            customers.map(c => (
              <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{c.name}</div>
                  <div className="text-blue-300/80 text-sm truncate">{c.email} · {c.phone || '—'}</div>
                  <div className="text-blue-300/60 text-xs truncate">{c.address || 'No address'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={c.status} onChange={e=>updateCustomer(c.id, { status: e.target.value })} className="bg-slate-900/60 border border-slate-700 text-white rounded px-2 py-1">
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                  <button onClick={()=>deleteCustomer(c.id)} className="bg-red-600 hover:bg-red-500 text-white rounded px-3 py-1">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
