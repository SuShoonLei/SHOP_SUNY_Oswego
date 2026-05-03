import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

function RootLayout() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout
