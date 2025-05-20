import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ supplier_id: '', product_id: '', quantity: '', cost_price: '' });
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const { data: orders } = await supabase.from('purchase_orders').select('*').order('created_at', { ascending: false });
    const { data: suppliers } = await supabase.from('suppliers').select('id, name');
    const { data: products } = await supabase.from('products').select('id, name');
    setOrders(orders || []);
    setSuppliers(suppliers || []);
    setProducts(products || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddItem = () => {
    if (!form.product_id || !form.quantity) return;
    setItems([...items, {
      product_id: form.product_id,
      quantity: Number(form.quantity),
      cost_price: Number(form.cost_price),
      product_name: products.find(p => p.id === form.product_id)?.name || '',
    }]);
    setForm({ ...form, product_id: '', quantity: '', cost_price: '' });
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!form.supplier_id || items.length === 0) {
      setError('Supplier and at least one item are required.');
      setLoading(false);
      return;
    }
    // Create purchase order
    const { data: order, error: orderErr } = await supabase
      .from('purchase_orders')
      .insert([{ supplier_id: form.supplier_id, status: 'Ordered' }])
      .select()
      .single();
    if (orderErr) {
      setError(orderErr.message);
      setLoading(false);
      return;
    }
    // Add items
    for (const item of items) {
      await supabase.from('purchase_order_items').insert([
        {
          purchase_order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          cost_price: item.cost_price,
        },
      ]);
    }
    setItems([]);
    setForm({ supplier_id: '', product_id: '', quantity: '', cost_price: '' });
    fetchData();
    setLoading(false);
  };

  // Mark as received and update stock
  const handleReceive = async (orderId) => {
    setLoading(true);
    // Get items
    const { data: poItems } = await supabase.from('purchase_order_items').select('*').eq('purchase_order_id', orderId);
    for (const item of poItems) {
      // Check if stock exists for this product in any warehouse (for demo, just add to first warehouse)
      const { data: stockRows } = await supabase.from('stock').select('id, quantity, warehouse_id').eq('product_id', item.product_id);
      let warehouseId = stockRows?.[0]?.warehouse_id;
      if (!warehouseId) {
        // If no stock, pick any warehouse
        const { data: warehouses } = await supabase.from('warehouses').select('id');
        warehouseId = warehouses?.[0]?.id;
      }
      if (warehouseId) {
        // Update or insert stock
        if (stockRows && stockRows.length > 0) {
          const stockId = stockRows[0].id;
          const newQty = stockRows[0].quantity + item.quantity;
          await supabase.from('stock').update({ quantity: newQty }).eq('id', stockId);
        } else {
          await supabase.from('stock').insert([{ product_id: item.product_id, warehouse_id: warehouseId, quantity: item.quantity }]);
        }
      }
    }
    await supabase.from('purchase_orders').update({ status: 'Received', received_at: new Date().toISOString() }).eq('id', orderId);
    fetchData();
    setLoading(false);
  };

  return (
    <div className="mb-4 p-6 border rounded-xl bg-white text-black shadow">
      <h2 className="text-2xl font-bold mb-4">Purchase Orders</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleCreateOrder} className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <select name="supplier_id" value={form.supplier_id} onChange={handleChange} className="p-2 border rounded">
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select name="product_id" value={form.product_id} onChange={handleChange} className="p-2 border rounded">
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="Quantity" type="number" className="p-2 border rounded" />
          <input name="cost_price" value={form.cost_price} onChange={handleChange} placeholder="Cost Price" type="number" className="p-2 border rounded" />
        </div>
        <button type="button" onClick={handleAddItem} className="bg-gray-500 text-white rounded px-4 py-2 mr-2">Add Item</button>
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Create Purchase Order</button>
      </form>
      {items.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Order Items:</h3>
          <ul className="list-disc ml-6">
            {items.map((item, idx) => (
              <li key={idx}>{item.product_name} ({item.quantity}) @ {item.cost_price}</li>
            ))}
          </ul>
        </div>
      )}
      <h3 className="font-semibold mb-2">Purchase Orders</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Supplier</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Created</th>
                <th className="py-2 px-4 border">Received</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="py-2 px-4 border">{suppliers.find(s => s.id === order.supplier_id)?.name || '-'}</td>
                  <td className="py-2 px-4 border">{order.status}</td>
                  <td className="py-2 px-4 border">{order.created_at ? order.created_at.split('T')[0] : ''}</td>
                  <td className="py-2 px-4 border">{order.received_at ? order.received_at.split('T')[0] : '-'}</td>
                  <td className="py-2 px-4 border flex gap-2">
                    {order.status === 'Ordered' && (
                      <button onClick={() => handleReceive(order.id)} className="bg-green-500 text-white px-2 py-1 rounded">Mark Received</button>
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