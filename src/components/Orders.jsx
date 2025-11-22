import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function LineEditor({ line, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <input className="col-span-5 bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2 text-white" placeholder="Item name" value={line.product_name} onChange={e=>onChange({ ...line, product_name: e.target.value })} />
      <input type="number" step="0.01" className="col-span-2 bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2 text-white" placeholder="Unit price" value={line.unit_price} onChange={e=>onChange({ ...line, unit_price: parseFloat(e.target.value||0) })} />
      <input type="number" className="col-span-2 bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2 text-white" placeholder="Qty" value={line.quantity} onChange={e=>onChange({ ...line, quantity: parseInt(e.target.value||1) })} />
      <div className="col-span-2 text-right text-blue-200">{(Number(line.unit_price)*Number(line.quantity)).toFixed(2)}</div>
      <button onClick={onRemove} className="col-span-1 bg-red-600 hover:bg-red-500 text-white rounded px-2 py-1">✕</button>
    </div>
  )
}

export default function Orders() {
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    customer_id: '',
    status: 'draft',
    items: [],
    discount_type: 'amount',
    discount_value: 0,
  })

  const subtotal = useMemo(() => form.items.reduce((s, i) => s + (Number(i.unit_price)||0)*(Number(i.quantity)||0), 0), [form.items])
  const discount = useMemo(() => form.discount_type === 'amount' ? Math.min(form.discount_value, subtotal) : Math.min(subtotal * (form.discount_value/100), subtotal), [form.discount_type, form.discount_value, subtotal])
  const total = useMemo(() => Math.max(subtotal - discount, 0), [subtotal, discount])

  const fetchCustomers = async () => {
    const res = await fetch(`${API_BASE}/api/customers`)
    setCustomers(await res.json())
  }

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/orders`)
      const data = await res.json()
      setOrders(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
    fetchOrders()
  }, [])

  const addLine = () => setForm({ ...form, items: [...form.items, { product_name: '', unit_price: 0, quantity: 1 }] })
  const updateLine = (idx, val) => setForm({ ...form, items: form.items.map((l,i)=> i===idx? val : l) })
  const removeLine = (idx) => setForm({ ...form, items: form.items.filter((_,i)=> i!==idx) })

  const createOrder = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form }
      const res = await fetch(`${API_BASE}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        const er = await res.json().catch(()=>({}))
        throw new Error(er.detail || 'Failed to create order')
      }
      setForm({ customer_id: '', status: 'draft', items: [], discount_type: 'amount', discount_value: 0 })
      await fetchOrders()
    } catch (e) { setError(e.message) }
  }

  const updateOrder = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
      if (!res.ok) throw new Error('Update failed')
      await fetchOrders()
    } catch (e) { setError(e.message) }
  }

  const deleteOrder = async (id) => {
    if (!confirm('Delete this order?')) return
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      await fetchOrders()
    } catch (e) { setError(e.message) }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createOrder} className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select value={form.customer_id} onChange={e=>setForm({ ...form, customer_id: e.target.value })} className="bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2 text-white" required>
            <option value="">Select customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={form.status} onChange={e=>setForm({ ...form, status: e.target.value })} className="bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2 text-white">
            <option>draft</option>
            <option>pending</option>
            <option>paid</option>
            <option>shipped</option>
            <option>cancelled</option>
          </select>
          <div className="flex items-center gap-2">
            <select value={form.discount_type} onChange={e=>setForm({ ...form, discount_type: e.target.value })} className="bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2 text-white">
              <option value="amount">$</option>
              <option value="percent">%</option>
            </select>
            <input type="number" step="0.01" value={form.discount_value} onChange={e=>setForm({ ...form, discount_value: parseFloat(e.target.value||0) })} className="flex-1 bg-slate-900/60 border border-slate-700 rounded-md px-3 py-2 text-white" placeholder="Discount" />
          </div>
          <button type="button" onClick={addLine} className="bg-slate-700 hover:bg-slate-600 text-white rounded px-3 py-2">Add line</button>
        </div>
        <div className="space-y-2">
          {form.items.length === 0 && <div className="text-blue-200">No items yet. Add a line.</div>}
          {form.items.map((l, idx) => (
            <LineEditor key={idx} line={l} onChange={(v)=>updateLine(idx, v)} onRemove={()=>removeLine(idx)} />
          ))}
        </div>
        <div className="flex items-center justify-end gap-6 text-blue-200">
          <div>Subtotal: <span className="font-semibold text-white">{subtotal.toFixed(2)}</span></div>
          <div>Discount: <span className="font-semibold text-white">{discount.toFixed(2)}</span></div>
          <div>Total: <span className="font-semibold text-white">{total.toFixed(2)}</span></div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded px-4 py-2">Create Order</button>
        </div>
      </form>

      {error && <div className="text-red-300 bg-red-900/20 border border-red-700 rounded-md px-3 py-2">{error}</div>}

      <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-white font-semibold">Orders</h3>
          <button onClick={fetchOrders} className="text-sm bg-slate-700 hover:bg-slate-600 text-white rounded px-3 py-1">Refresh</button>
        </div>
        <div className="divide-y divide-slate-700">
          {loading ? (
            <div className="p-4 text-blue-200">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="p-4 text-blue-200">No orders yet.</div>
          ) : (
            orders.map(o => (
              <div key={o.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-white font-medium">{customers.find(c=>c.id===o.customer_id)?.name || 'Unknown Customer'}</div>
                  <div className="text-blue-300">Total: ${o.total?.toFixed ? o.total.toFixed(2) : Number(o.total).toFixed(2)}</div>
                </div>
                <div className="text-blue-300/80 text-sm">Status: {o.status} · Items: {o.items?.length || 0}</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <select value={o.status} onChange={e=>updateOrder(o.id, { status: e.target.value })} className="bg-slate-900/60 border border-slate-700 text-white rounded px-2 py-1">
                    <option>draft</option>
                    <option>pending</option>
                    <option>paid</option>
                    <option>shipped</option>
                    <option>cancelled</option>
                  </select>
                  <button onClick={()=>deleteOrder(o.id)} className="bg-red-600 hover:bg-red-500 text-white rounded px-3 py-1">Delete</button>
                </div>
                {o.items && o.items.length>0 && (
                  <div className="pt-2 border-t border-slate-700 text-blue-200 text-sm">
                    {o.items.map((i,idx)=> (
                      <div key={idx} className="flex justify-between">
                        <div>{i.product_name} × {i.quantity}</div>
                        <div>${(i.unit_price * i.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
