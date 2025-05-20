import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    supplier: '',
    cost_price: '',
    selling_price: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*');
    if (error) setError(error.message);
    else setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (editingId) {
      // Update
      const { error } = await supabase
        .from('products')
        .update(form)
        .eq('id', editingId);
      if (error) setError(error.message);
      setEditingId(null);
    } else {
      // Add
      const { error } = await supabase.from('products').insert([form]);
      if (error) setError(error.message);
    }
    setForm({ name: '', sku: '', category: '', supplier: '', cost_price: '', selling_price: '' });
    fetchProducts();
    setLoading(false);
  };

  // Edit product
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      supplier: product.supplier,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
    });
    setEditingId(product.id);
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setLoading(true);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) setError(error.message);
    fetchProducts();
    setLoading(false);
  };

  return (
    <div className="mb-4 p-6 border rounded-xl bg-white text-black shadow">
      <h2 className="text-2xl font-bold mb-4">Manage Products</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" className="p-2 border rounded" required />
        <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" className="p-2 border rounded" required />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="p-2 border rounded" required />
        <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier" className="p-2 border rounded" />
        <input name="cost_price" value={form.cost_price} onChange={handleChange} placeholder="Cost Price" type="number" className="p-2 border rounded" required />
        <input name="selling_price" value={form.selling_price} onChange={handleChange} placeholder="Selling Price" type="number" className="p-2 border rounded" required />
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 col-span-1 md:col-span-3 mt-2">
          {editingId ? 'Update Product' : 'Add Product'}
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
                <th className="py-2 px-4 border">SKU</th>
                <th className="py-2 px-4 border">Category</th>
                <th className="py-2 px-4 border">Supplier</th>
                <th className="py-2 px-4 border">Cost Price</th>
                <th className="py-2 px-4 border">Selling Price</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="py-2 px-4 border">{product.name}</td>
                  <td className="py-2 px-4 border">{product.sku}</td>
                  <td className="py-2 px-4 border">{product.category}</td>
                  <td className="py-2 px-4 border">{product.supplier}</td>
                  <td className="py-2 px-4 border">{product.cost_price}</td>
                  <td className="py-2 px-4 border">{product.selling_price}</td>
                  <td className="py-2 px-4 border flex gap-2">
                    <button onClick={() => handleEdit(product)} className="bg-yellow-400 px-2 py-1 rounded">Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
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