import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const OrderFulfillment = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [form, setForm] = useState({
    customer_name: '',
    product_id: '',
    warehouse_id: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch orders, products, warehouses
  const fetchData = async () => {
    setLoading(true);
    const { data: products } = await supabase.from('products').select('id, name');
    const { data: warehouses } = await supabase.from('warehouses').select('id, name');
    const { data: orders, error: orderErr } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setProducts(products || []);
    setWarehouses(warehouses || []);
    setOrders(orders || []);
    if (orderErr) setError(orderErr.message);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add item to orderItems list
  const handleAddItem = () => {
    if (!form.product_id || !form.warehouse_id || !form.quantity) return;
    setOrderItems([...orderItems, {
      product_id: form.product_id,
      warehouse_id: form.warehouse_id,
      quantity: Number(form.quantity),
      product_name: products.find(p => p.id === form.product_id)?.name || '',
      warehouse_name: warehouses.find(w => w.id === form.warehouse_id)?.name || '',
    }]);
    setForm({ ...form, product_id: '', warehouse_id: '', quantity: '' });
  };

  // Create order and reserve stock
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!form.customer_name || orderItems.length === 0) {
      setError('Customer name and at least one item are required.');
      setLoading(false);
      return;
    }
    // Check stock for each item
    let backordered = false;
    for (const item of orderItems) {
      const { data: stockRows } = await supabase
        .from('stock')
        .select('quantity')
        .eq('product_id', item.product_id)
        .eq('warehouse_id', item.warehouse_id);
      const available = stockRows?.[0]?.quantity || 0;
      if (item.quantity > available) backordered = true;
    }
    // Create order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert([{ customer_name: form.customer_name, status: backordered ? 'Backordered' : 'Reserved' }])
      .select()
      .single();
    if (orderErr) {
      setError(orderErr.message);
      setLoading(false);
      return;
    }
    // Add order items
    for (const item of orderItems) {
      await supabase.from('order_items').insert([
        {
          order_id: order.id,
          product_id: item.product_id,
          warehouse_id: item.warehouse_id,
          quantity: item.quantity,
        },
      ]);
    }
    setOrderItems([]);
    setForm({ customer_name: '', product_id: '', warehouse_id: '', quantity: '' });
    fetchData();
    setLoading(false);
  };

  // Ship order: deduct stock and update status
  const handleShip = async (orderId) => {
    setLoading(true);
    // Get order items
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    // Deduct stock for each item
    for (const item of items) {
      // Get current stock
      const { data: stockRows } = await supabase
        .from('stock')
        .select('id, quantity')
        .eq('product_id', item.product_id)
        .eq('warehouse_id', item.warehouse_id);
      if (stockRows && stockRows.length > 0) {
        const stockId = stockRows[0].id;
        const newQty = Math.max(0, stockRows[0].quantity - item.quantity);
        await supabase.from('stock').update({ quantity: newQty }).eq('id', stockId);
      }
    }
    // Update order status
    await supabase.from('orders').update({ status: 'Shipped' }).eq('id', orderId);
    fetchData();
    setLoading(false);
  };

  // Helper to get order items
  const getOrderItems = async (orderId) => {
    const { data } = await supabase.from('order_items').select('*, products(name), warehouses(name)').eq('order_id', orderId);
    return data || [];
  };

  return (
    <div className="mb-4 p-6 border rounded-xl bg-white text-black shadow">
      <h2 className="text-2xl font-bold mb-4">Order Fulfillment</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
          <input name="customer_name" value={form.customer_name} onChange={handleChange} placeholder="Customer Name" className="p-2 border rounded" required />
          <select name="product_id" value={form.product_id} onChange={handleChange} className="p-2 border rounded">
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select name="warehouse_id" value={form.warehouse_id} onChange={handleChange} className="p-2 border rounded">
            <option value="">Select Warehouse</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="Quantity" type="number" className="p-2 border rounded" />
        </div>
        <button type="button" onClick={handleAddItem} className="bg-gray-500 text-white rounded px-4 py-2 mr-2">Add Item</button>
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Create Order</button>
      </form>
      {orderItems.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Order Items:</h3>
          <ul className="list-disc ml-6">
            {orderItems.map((item, idx) => (
              <li key={idx}>{item.product_name} ({item.quantity}) from {item.warehouse_name}</li>
            ))}
          </ul>
        </div>
      )}
      <h3 className="font-semibold mb-2">Orders</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Customer</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Created</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="py-2 px-4 border">{order.customer_name}</td>
                  <td className="py-2 px-4 border">{order.status}</td>
                  <td className="py-2 px-4 border">{order.created_at ? order.created_at.split('T')[0] : ''}</td>
                  <td className="py-2 px-4 border flex gap-2">
                    {order.status === 'Reserved' && (
                      <button onClick={() => handleShip(order.id)} className="bg-green-500 text-white px-2 py-1 rounded">Ship</button>
                    )}
                    {order.status === 'Backordered' && <span className="text-red-500">Backordered</span>}
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