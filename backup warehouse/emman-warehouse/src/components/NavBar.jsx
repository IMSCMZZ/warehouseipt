import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export const NavBar = () => {
  const { user, signOut, ROLES } = useAuth()
  const navigate = useNavigate()
  const role = user?.user_metadata?.role

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="flex items-center justify-between bg-gray-800 p-4 text-white mb-6">
      <div>
        <span className="font-bold">Warehouse App</span>
        {role === ROLES.ADMIN && (
          <button className="ml-4" onClick={() => navigate('/admin')}>Admin Dashboard</button>
        )}
        {role === ROLES.WAREHOUSE_MANAGER && (
          <button className="ml-4" onClick={() => navigate('/warehouse-manager')}>Manager Dashboard</button>
        )}
        {role === ROLES.STAFF && (
          <button className="ml-4" onClick={() => navigate('/staff')}>Staff Dashboard</button>
        )}
      </div>
      <div>
        <span className="mr-4">{user?.email} ({role})</span>
        <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
      </div>
    </nav>
  )
} 