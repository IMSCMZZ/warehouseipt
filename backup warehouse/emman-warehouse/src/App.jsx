import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './components/Login'
import { SignUp } from './components/SignUp'
import { ROLES } from './lib/supabase'
import { AdminDashboard } from './components/AdminDashboard'
import { ManagerDashboard } from './components/ManagerDashboard'
import { StaffDashboard } from './components/StaffDashboard'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/warehouse-manager/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.WAREHOUSE_MANAGER, ROLES.ADMIN]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/staff/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.WAREHOUSE_MANAGER, ROLES.ADMIN]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 route */}
          <Route path="*" element={<div>404 - Not Found</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}
export default App

