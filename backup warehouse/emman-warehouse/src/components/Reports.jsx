import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const REPORTS = [
  'Current Stock Levels',
  'Low-Stock Products',
  'Stock Movement History',
  'Inventory Value Analysis',
];

function exportToCSV(data, filename) {
  if (!data.length) return;
  const csvRows = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).map(v => `"${v ?? ''}"`).join(',')),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export const Reports = () => {
  const [selected, setSelected] = useState(REPORTS[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async (type) => {
    setLoading(true);
    setError('');
    let result = [];
    try {
      if (type === 'Current Stock Levels') {
        const { data: products } = await supabase.from('products').select('id, name, sku');
        const { data: warehouses } = await supabase.from('warehouses').select('id, name');
        const { data: stock } = await supabase.from('stock').select('*');
        result = [];
        products.forEach(product => {
          warehouses.forEach(warehouse => {
            const entry = stock.find(s => s.product_id === product.id && s.warehouse_id === warehouse.id);
            result.push({
              Product: product.name,
              SKU: product.sku,
              Warehouse: warehouse.name,
              Quantity: entry ? entry.quantity : 0,
            });
          });
        });
      } else if (type === 'Low-Stock Products') {
        const { data: products } = await supabase.from('products').select('id, name, sku, min_stock');
        const { data: stock } = await supabase.from('stock').select('product_id, quantity');
        result = products
          .map(p => ({
            Product: p.name,
            SKU: p.sku,
            'Current Stock': stock.filter(s => s.product_id === p.id).reduce((sum, s) => sum + (s.quantity || 0), 0),
            'Min Stock': p.min_stock,
          }))
          .filter(row => row['Current Stock'] < row['Min Stock']);
      } else if (type === 'Stock Movement History') {
        const { data: movements } = await supabase.from('stock_movements').select('*').order('transfer_date', { ascending: false });
        const { data: products } = await supabase.from('products').select('id, name');
        const { data: warehouses } = await supabase.from('warehouses').select('id, name');
        result = movements.map(m => ({
          Product: products.find(p => p.id === m.product_id)?.name || '-',
          Quantity: m.quantity,
          'From Warehouse': warehouses.find(w => w.id === m.from_warehouse)?.name || '-',
          'To Warehouse': warehouses.find(w => w.id === m.to_warehouse)?.name || '-',
          Date: m.transfer_date ? m.transfer_date.split('T')[0] : '',
          Status: m.status,
        }));
      } else if (type === 'Inventory Value Analysis') {
        const { data: products } = await supabase.from('products').select('id, name, sku, cost_price, selling_price');
        const { data: stock } = await supabase.from('stock').select('product_id, quantity');
        result = products.map(p => {
          const qty = stock.filter(s => s.product_id === p.id).reduce((sum, s) => sum + (s.quantity || 0), 0);
          return {
            Product: p.name,
            SKU: p.sku,
            Quantity: qty,
            'Cost Price': p.cost_price,
            'Selling Price': p.selling_price,
            'Total Cost Value': (qty * (p.cost_price || 0)).toFixed(2),
            'Total Selling Value': (qty * (p.selling_price || 0)).toFixed(2),
          };
        });
      }
    } catch (err) {
      setError('Failed to fetch report.');
    }
    setData(result);
    setLoading(false);
  };

  // Fetch report when selected changes
  React.useEffect(() => {
    fetchReport(selected);
    // eslint-disable-next-line
  }, [selected]);

  return (
    <div className="mb-4 p-6 border rounded-xl bg-white text-black shadow">
      <h2 className="text-2xl font-bold mb-4">Reports & Analytics</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {REPORTS.map(r => (
          <button
            key={r}
            className={`px-4 py-2 rounded ${selected === r ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
            onClick={() => setSelected(r)}
          >
            {r}
          </button>
        ))}
        <button
          className="ml-auto bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => exportToCSV(data, `${selected.replace(/ /g, '_')}.csv`)}
          disabled={!data.length}
        >
          Export CSV
        </button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          {data.length > 0 ? (
            <table className="min-w-full bg-white border rounded">
              <thead>
                <tr>
                  {Object.keys(data[0]).map((col) => (
                    <th key={col} className="py-2 px-4 border">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="py-2 px-4 border">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500">No data to display.</div>
          )}
        </div>
      )}
    </div>
  );
}; 