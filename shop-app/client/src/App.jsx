import { Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import InventoryPage from './pages/InventoryPage.jsx'
import TransactionsPage from './pages/TransactionsPage.jsx'
import RequestsPage from './pages/RequestsPage.jsx'
import DonationsPage from './pages/DonationsPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import SchemaPage from './pages/SchemaPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="donations" element={<DonationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="schema" element={<SchemaPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
