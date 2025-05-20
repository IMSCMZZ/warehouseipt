import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const ManageRoles = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roles] = useState(['admin', 'warehouse_manager', 'staff']);

  useEffect(() => {
    if (!user || user.user_metadata?.role !== 'admin') return;
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5001/admin/users');
        const data = await res.json();
        if (res.ok) setUsers(data);
        else setError(data.error || 'Failed to fetch users');
      } catch (err) {
        setError('Failed to connect to backend');
      }
      setLoading(false);
    };
    fetchUsers();
  }, [user]);

  const handleRoleChange = async (userObj, newRole) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5001/admin/users/${userObj.id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update role');
      } else {
        setUsers(users.map(u => u.id === userObj.id ? { ...u, user_metadata: { ...u.user_metadata, role: newRole } } : u));
      }
    } catch (err) {
      setError('Failed to connect to backend');
    }
    setLoading(false);
  };

  if (!user || user.user_metadata?.role !== 'admin') {
    return <div className="mb-4 p-6 border rounded-xl bg-white text-black shadow">User not allowed</div>;
  }

  return (
    <div className="mb-4 p-6 border rounded-xl bg-white text-black shadow">
      <h2 className="text-2xl font-bold mb-4">Manage Roles</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Current Role</th>
                <th className="py-2 px-4 border">Assign Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userObj) => (
                <tr key={userObj.id}>
                  <td className="py-2 px-4 border">{userObj.email}</td>
                  <td className="py-2 px-4 border">{userObj.user_metadata?.role || '-'}</td>
                  <td className="py-2 px-4 border">
                    <select
                      value={userObj.user_metadata?.role || ''}
                      onChange={e => handleRoleChange(userObj, e.target.value)}
                      className="p-1 border rounded"
                    >
                      <option value="">Select Role</option>
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}; 