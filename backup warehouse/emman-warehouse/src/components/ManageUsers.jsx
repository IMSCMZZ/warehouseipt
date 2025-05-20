import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const ManageUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roles] = useState(['admin', 'warehouse_manager', 'staff']);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'staff' });

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

  const handleDelete = async (userObj) => {
    if (!window.confirm(`Delete user ${userObj.email}?`)) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5001/admin/users/${userObj.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete user');
      } else {
        setUsers(users.filter(u => u.id !== userObj.id));
      }
    } catch (err) {
      setError('Failed to connect to backend');
    }
    setLoading(false);
  };

  const handleNewUserChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5001/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add user');
      } else {
        setNewUser({ email: '', password: '', role: 'staff' });
        // Optionally refresh user list
        const usersRes = await fetch('http://localhost:5001/admin/users');
        setUsers(await usersRes.json());
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
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {/* Add User Form */}
      <form onSubmit={handleAddUser} className="flex flex-wrap gap-2 mb-4 items-end">
        <input
          type="email"
          name="email"
          value={newUser.email}
          onChange={handleNewUserChange}
          placeholder="User email"
          className="p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          value={newUser.password}
          onChange={handleNewUserChange}
          placeholder="Password"
          className="p-2 border rounded"
          required
        />
        <select
          name="role"
          value={newUser.role}
          onChange={handleNewUserChange}
          className="p-2 border rounded"
        >
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Add User</button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Role</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userObj) => (
                <tr key={userObj.id}>
                  <td className="py-2 px-4 border">{userObj.email}</td>
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
                  <td className="py-2 px-4 border">{userObj.confirmed_at ? 'Active' : 'Invited'}</td>
                  <td className="py-2 px-4 border flex gap-2">
                    <button onClick={() => handleDelete(userObj)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
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