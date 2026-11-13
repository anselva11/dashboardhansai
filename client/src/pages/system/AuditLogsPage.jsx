import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Badge from '../../components/common/Badge';
import { History, Search, Shield, Filter } from 'lucide-react';
import dayjs from 'dayjs';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (moduleFilter !== 'All') params.append('module', moduleFilter);
      if (actionFilter !== 'All') params.append('action', actionFilter);

      const res = await api.get(`/system/audit-logs?${params.toString()}`);
      if (res.data?.success) setLogs(res.data.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-ocean-600" /> Enterprise Audit Logs & Traceability
          </h1>
          <p className="text-xs text-slate-500">
            Immutable log trail of all user logins, financial transactions, vessel updates, and record mutations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="p-1.5 border rounded-lg bg-white text-slate-700 font-medium"
          >
            <option value="All">All Modules</option>
            <option value="Shipment">Shipment</option>
            <option value="Container">Container</option>
            <option value="Container Rental">Container Rental</option>
            <option value="Vessel Management">Vessel Management</option>
            <option value="Vessel Purchase">Vessel Purchase</option>
            <option value="Vessel Sale">Vessel Sale</option>
            <option value="Finance">Finance</option>
            <option value="Auth">Auth</option>
            <option value="System">System</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-1.5 border rounded-lg bg-white text-slate-700 font-medium"
          >
            <option value="All">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="RETURN">RETURN</option>
            <option value="RESET_DEMO">RESET_DEMO</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#102A43] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Record Ref</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">Loading audit history...</td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {dayjs(log.createdAt).format('DD MMM YYYY, HH:mm:ss')}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-800">{log.userName || 'System'}</td>
                  <td className="py-2.5 px-4">
                    <Badge
                      variant={
                        log.action === 'CREATE'
                          ? 'success'
                          : log.action === 'DELETE'
                          ? 'danger'
                          : log.action === 'UPDATE'
                          ? 'ocean'
                          : 'primary'
                      }
                      size="xs"
                    >
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">{log.module}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">{log.recordId || '-'}</td>
                  <td className="py-2.5 px-4 text-slate-700 max-w-xs truncate">{log.details}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400 text-[10px]">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

