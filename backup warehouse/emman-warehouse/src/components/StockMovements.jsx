import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({
    product_id: '',
    quantity: '',
    from_warehouse: '',
    to_warehouse: '',
    transfer_date: '',
    status: 'Pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch products, warehouses, and movements
  const fetchData = async () => {
    setLoading(true);
    const { data: products } = await supabase.from('products').select('id, name');
    const { data: warehouses } = await supabase.from('warehouses').select('id, name');
    const { data: movements, error: moveErr } = await supabase
      .from('stock_movements')
      .select('*')
      .order('transfer_date', { ascending: false });
    if (moveErr) setError(moveErr.message);
    setProducts(products || []);
    setWarehouses(warehouses || []);
    setMovements(movements || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new stock movement
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.from('stock_movements').insert([
      {
        ...form,
        quantity: Number(form.quantity),
        transfer_date: form.transfer_date || new Date().toISOString(),
      },
    ]);
    if (error) setError(error.message);
    setForm({ product_id: '', quantity: '', from_warehouse: '', to_warehouse: '', transfer_date: '', status: 'Pending' });
    fetchData();
    setLoading(false);
  };

  // Update status
  const handleStatusChange = async (id, status) => {
    setLoading(true);
    const { error } = await supabase.from('stock_movements').update({ status }).eq('id', id);
    if (error) setError(error.message);
    fetchData();
    setLoading(false);
  };

  // Helper to get product/warehouse name
  const getName = (arr, id) => arr.find((x) => x.id === id)?.name || '-';

  return (
    <div className="mb-4 p-6 border rounded-xl bg-white text-black shadow">
      <h2 className="text-2xl font-bold mb-4">Stock Movements</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select name="product_id" value={form.product_id} onChange={handleChange} className="p-2 border rounded" required>
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="Quantity" type="number" className="p-2 border rounded" required />
        <input name="transfer_date" value={form.transfer_date} onChange={handleChange} type="date" className="p-2 border rounded" />
        <select name="from_warehouse" value={form.from_warehouse} onChange={handleChange} className="p-2 border rounded" required>
          <option value="">From Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        <select name="to_warehouse" value={form.to_warehouse} onChange={handleChange} className="p-2 border rounded" required>
          <option value="">To Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        <select name="status" value={form.status} onChange={handleChange} className="p-2 border rounded">
          <option value="Pending">Pending</option>
          <option value="In Transit">In Transit</option>
          <option value="Received">Received</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 col-span-1 md:col-span-3 mt-2">
          Record Transfer
        </button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Product</th>
                <th className="py-2 px-4 border">Quantity</th>
                <th className="py-2 px-4 border">From</th>
                <th className="py-2 px-4 border">To</th>
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td className="py-2 px-4 border">{getName(products, m.product_id)}</td>
                  <td className="py-2 px-4 border">{m.quantity}</td>
                  <td className="py-2 px-4 border">{getName(warehouses, m.from_warehouse)}</td>
                  <td className="py-2 px-4 border">{getName(warehouses, m.to_warehouse)}</td>
                  <td className="py-2 px-4 border">{m.transfer_date ? m.transfer_date.split('T')[0] : ''}</td>
                  <td className="py-2 px-4 border">{m.status}</td>
                  <td className="py-2 px-4 border flex gap-2">
                    {['Pending', 'In Transit'].includes(m.status) && (
                      <>
                        <button onClick={() => handleStatusChange(m.id, 'In Transit')} className="bg-yellow-400 px-2 py-1 rounded">In Transit</button>
                        <button onClick={() => handleStatusChange(m.id, 'Received')} className="bg-green-500 text-white px-2 py-1 rounded">Received</button>
                      </>
                    )}
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