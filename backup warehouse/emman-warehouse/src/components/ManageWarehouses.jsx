import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const ManageWarehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({
    name: '',
    location: '',
    capacity: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch warehouses from Supabase
  const fetchWarehouses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('warehouses').select('*');
    if (error) setError(error.message);
    else setWarehouses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update warehouse
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (editingId) {
      // Update
      const { error } = await supabase
        .from('warehouses')
        .update(form)
        .eq('id', editingId);
      if (error) setError(error.message);
      setEditingId(null);
    } else {
      // Add
      const { error } = await supabase.from('warehouses').insert([form]);
      if (error) setError(error.message);
    }
    setForm({ name: '', location: '', capacity: '' });
    fetchWarehouses();
    setLoading(false);
  };

  // Edit warehouse
  const handleEdit = (warehouse) => {
    setForm({
      name: warehouse.name,
      location: warehouse.location,
      capacity: warehouse.capacity,
    });
    setEditingId(warehouse.id);
  };

  // Delete warehouse
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this warehouse?')) return;
    setLoading(true);
    const { error } = await supabase.from('warehouses').delete().eq('id', id);
    if (error) setError(error.message);
    fetchWarehouses();
    setLoading(false);
  };

  return (
    <div className="mb-4 p-6 border rounded-xl bg-white text-black shadow">
      <h2 className="text-2xl font-bold mb-4">Manage Warehouses</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Warehouse Name" className="p-2 border rounded" required />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="p-2 border rounded" />
        <input name="capacity" value={form.capacity} onChange={handleChange} placeholder="Capacity" type="number" className="p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 col-span-1 md:col-span-3 mt-2">
          {editingId ? 'Update Warehouse' : 'Add Warehouse'}
        </button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Location</th>
                <th className="py-2 px-4 border">Capacity</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((warehouse) => (
                <tr key={warehouse.id}>
                  <td className="py-2 px-4 border">{warehouse.name}</td>
                  <td className="py-2 px-4 border">{warehouse.location}</td>
                  <td className="py-2 px-4 border">{warehouse.capacity}</td>
                  <td className="py-2 px-4 border flex gap-2">
                    <button onClick={() => handleEdit(warehouse)} className="bg-yellow-400 px-2 py-1 rounded">Edit</button>
                    <button onClick={() => handleDelete(warehouse.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
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