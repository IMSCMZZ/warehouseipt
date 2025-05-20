import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const ProductInfo = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: products, error: prodErr } = await supabase.from('products').select('*');
        const { data: warehouses, error: whErr } = await supabase.from('warehouses').select('*');
        if (prodErr || whErr) {
          setError(prodErr?.message || whErr?.message);
        } else {
          setProducts(products);
          setWarehouses(warehouses);
        }
      } catch (err) {
        setError('Failed to fetch data');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="mb-4 p-4 border rounded bg-white text-black">
      <h2 className="text-xl font-semibold mb-2">Product & Warehouse Info</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Products</h3>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Warehouses</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border">Name</th>
                    <th className="py-2 px-4 border">Location</th>
                    <th className="py-2 px-4 border">Capacity</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((wh) => (
                    <tr key={wh.id}>
                      <td className="py-2 px-4 border">{wh.name}</td>
                      <td className="py-2 px-4 border">{wh.location}</td>
                      <td className="py-2 px-4 border">{wh.capacity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 