import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const LowStockAlerts = () => {
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: products, error: prodErr } = await supabase.from('products').select('id, name, sku, min_stock');
      const { data: stock, error: stockErr } = await supabase.from('stock').select('product_id, quantity');
      if (prodErr || stockErr) {
        setError(prodErr?.message || stockErr?.message);
      } else {
        setProducts(products);
        setStock(stock);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Helper: sum stock for a product
  const getTotalStock = (productId) => {
    return stock.filter(s => s.product_id === productId).reduce((sum, s) => sum + (s.quantity || 0), 0);
  };

  // Products below min_stock
  const lowStockProducts = products.filter(p => p.min_stock !== null && getTotalStock(p.id) < p.min_stock);

  return (
    <div className="mb-4 p-6 border rounded-xl bg-white text-black shadow">
      <h2 className="text-2xl font-bold mb-4">Low Stock Alerts</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : lowStockProducts.length === 0 ? (
        <div className="text-green-600">All products are above minimum stock levels.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Product</th>
                <th className="py-2 px-4 border">SKU</th>
                <th className="py-2 px-4 border">Current Stock</th>
                <th className="py-2 px-4 border">Min Stock</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((p) => (
                <tr key={p.id} className="bg-red-100">
                  <td className="py-2 px-4 border font-semibold">{p.name}</td>
                  <td className="py-2 px-4 border">{p.sku}</td>
                  <td className="py-2 px-4 border text-center">{getTotalStock(p.id)}</td>
                  <td className="py-2 px-4 border text-center">{p.min_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}; 