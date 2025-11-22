import Customers from './components/Customers'
import Orders from './components/Orders'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      <div className="relative min-h-screen p-8">
        <header className="max-w-6xl mx-auto py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/flame-icon.svg" alt="Flames" className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold text-white">Transactional CRUD Demo</h1>
              <p className="text-blue-200/80 text-sm">Customers, Orders, and Items with totals, statuses, and discounts</p>
            </div>
          </div>
          <a href="/test" className="text-sm bg-slate-700 hover:bg-slate-600 text-white rounded px-3 py-2">Check Backend</a>
        </header>

        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-white font-semibold mb-3">Customers</h2>
            <Customers />
          </section>
          <section>
            <h2 className="text-white font-semibold mb-3">Orders</h2>
            <Orders />
          </section>
        </main>

        <footer className="max-w-6xl mx-auto py-8 text-center text-blue-300/60 text-sm">
          Built to illustrate a transactional CRUD system
        </footer>
      </div>
    </div>
  )
}

export default App
