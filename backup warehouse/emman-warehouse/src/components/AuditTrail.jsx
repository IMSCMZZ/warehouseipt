import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data } = await supabase.from('audit_trail').select('*').order('created_at', { ascending: false });
      setLogs(data || []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="mb-4 p-6 border rounded-xl bg-white text-black shadow">
      <h2 className="text-2xl font-bold mb-4">Audit Trail</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border">User ID</th>
                <th className="py-2 px-4 border">Action</th>
                <th className="py-2 px-4 border">Details</th>
                <th className="py-2 px-4 border">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-2 px-4 border">{log.user_id}</td>
                  <td className="py-2 px-4 border">{log.action}</td>
                  <td className="py-2 px-4 border">{log.details}</td>
                  <td className="py-2 px-4 border">{log.created_at ? log.created_at.split('T')[0] : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}; 