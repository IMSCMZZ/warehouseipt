import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const StockLevels = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: products, error: prodErr } = await supabase.from('products').select('id, name, sku');
      const { data: warehouses, error: whErr } = await supabase.from('warehouses').select('id, name');
      const { data: stock, error: stockErr } = await supabase.from('stock').select('*');
      if (prodErr || whErr || stockErr) {
        setError(prodErr?.message || whErr?.message || stockErr?.message);
      } else {
        setProducts(products);
        setWarehouses(warehouses);
        setStock(stock);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Helper to get stock quantity for a product in a warehouse
  const getStockQty = (productId, warehouseId) => {
    const entry = stock.find(s => s.product_id === productId && s.warehouse_id === warehouseId);
    return entry ? entry.quantity : 0;
  };

  return (
    <div className="mb-4 p-6 border rounded-xl bg-white text-black shadow">
      <h2 className="text-2xl font-bold mb-4">Stock Levels</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Product</th>
                <th className="py-2 px-4 border">SKU</th>
                {warehouses.map(wh => (
                  <th key={wh.id} className="py-2 px-4 border">{wh.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td className="py-2 px-4 border">{product.name}</td>
                  <td className="py-2 px-4 border">{product.sku}</td>
                  {warehouses.map(wh => (
                    <td key={wh.id} className="py-2 px-4 border text-center">{getStockQty(product.id, wh.id)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}; 