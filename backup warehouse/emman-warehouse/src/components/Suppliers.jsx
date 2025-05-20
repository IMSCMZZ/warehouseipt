import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: '', contact_info: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSuppliers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('suppliers').select('*');
    if (error) setError(error.message);
    else setSuppliers(data);
    setLoading(false);
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (editingId) {
      const { error } = await supabase.from('suppliers').update(form).eq('id', editingId);
      if (error) setError(error.message);
      setEditingId(null);
    } else {
      const { error } = await supabase.from('suppliers').insert([form]);
      if (error) setError(error.message);
    }
    setForm({ name: '', contact_info: '' });
    fetchSuppliers();
    setLoading(false);
  };

  const handleEdit = (supplier) => {
    setForm({ name: supplier.name, contact_info: supplier.contact_info });
    setEditingId(supplier.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    setLoading(true);
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) setError(error.message);
    fetchSuppliers();
    setLoading(false);
  };

  return (
    <div className="mb-4 p-6 border rounded-xl bg-white text-black shadow">
      <h2 className="text-2xl font-bold mb-4">Suppliers</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Supplier Name" className="p-2 border rounded" required />
        <input name="contact_info" value={form.contact_info} onChange={handleChange} placeholder="Contact Info" className="p-2 border rounded" />
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 col-span-1 md:col-span-2 mt-2">
          {editingId ? 'Update Supplier' : 'Add Supplier'}
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
                <th className="py-2 px-4 border">Contact Info</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td className="py-2 px-4 border">{s.name}</td>
                  <td className="py-2 px-4 border">{s.contact_info}</td>
                  <td className="py-2 px-4 border flex gap-2">
                    <button onClick={() => handleEdit(s)} className="bg-yellow-400 px-2 py-1 rounded">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
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