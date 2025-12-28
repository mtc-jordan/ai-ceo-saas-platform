import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { listAuditLogs } from '../api/admin';

interface AuditLog {
  id: number;
  timestamp: string;
  action_type: string;
  actor_id: string;
  actor_email: string;
  actor_ip: string;
  target_type: string;
  target_id: string;
  description: string;
  metadata: Record<string, any>;
  organization_id: string;
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const actionTypes = [
    'user_login', 'user_logout', 'user_created', 'user_updated', 'user_deleted',
    'subscription_created', 'subscription_updated', 'subscription_cancelled',
    'payment_received', 'payment_failed', 'settings_updated', 'feature_flag_updated',
    'api_key_created', 'api_key_revoked', 'data_exported', 'admin_action'
  ];

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await listAuditLogs({
        page,
        per_page: 50,
        action_type: actionFilter || undefined,
        actor_email: emailFilter || undefined
      });
      setLogs(data || []);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      // Demo data
      const demoLogs: AuditLog[] = [];
      const actions = [
        { type: 'user_login', desc: 'User logged in', target: 'user' },
        { type: 'settings_updated', desc: 'Updated organization settings', target: 'organization' },
        { type: 'subscription_created', desc: 'Subscribed to Pro plan', target: 'subscription' },
        { type: 'user_created', desc: 'New user registered', target: 'user' },
        { type: 'feature_flag_updated', desc: "Updated feature flag 'ai_briefings_v2'", target: 'feature_flag' },
        { type: 'payment_received', desc: 'Payment of $99.00 received', target: 'payment' },
        { type: 'api_key_created', desc: 'Created new API key', target: 'api_key' },
        { type: 'data_exported', desc: 'Exported dashboard data', target: 'export' },
      ];
      for (let i = 0; i < 50; i++) {
        const action = actions[i % actions.length];
        demoLogs.push({
          id: i + 1,
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          action_type: action.type,
          actor_id: `user_${i % 10}`,
          actor_email: `user${i % 10}@example.com`,
          actor_ip: `192.168.1.${i % 255}`,
          target_type: action.target,
          target_id: `${action.target}_${i}`,
          description: action.desc,
          metadata: { browser: 'Chrome', os: 'MacOS' },
          organization_id: `org_${i % 5}`
        });
      }
      setLogs(demoLogs);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('login') || action.includes('logout')) return 'bg-blue-100 text-blue-800';
    if (action.includes('created')) return 'bg-green-100 text-green-800';
    if (action.includes('updated')) return 'bg-yellow-100 text-yellow-800';
    if (action.includes('deleted') || action.includes('revoked')) return 'bg-red-100 text-red-800';
    if (action.includes('payment')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Track all platform activities and changes</p>
        </div>
        <Button>Export Logs</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Filter by email..."
                value={emailFilter}
                onChange={(e: any) => setEmailFilter(e.target.value)}
                onKeyDown={(e: any) => e.key === 'Enter' && loadLogs()}
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={actionFilter}
              onChange={(e: any) => setActionFilter(e.target.value)}
            >
              <option value="">All Actions</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <Button onClick={loadLogs}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Timestamp</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">IP</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getActionBadgeColor(log.action_type)}`}>
                          {log.action_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900">{log.actor_email}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{log.description}</td>
                      <td className="py-3 px-4 text-sm text-gray-500 font-mono">{log.actor_ip}</td>
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {((page - 1) * 50) + 1} to {page * 50} logs
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Log Details</h2>
              <button onClick={() => setSelectedLog(null)} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Timestamp</p>
                  <p className="font-medium">{formatTimestamp(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Action</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${getActionBadgeColor(selectedLog.action_type)}`}>
                    {selectedLog.action_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Actor</p>
                  <p className="font-medium">{selectedLog.actor_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">IP Address</p>
                  <p className="font-medium font-mono">{selectedLog.actor_ip}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Target Type</p>
                  <p className="font-medium">{selectedLog.target_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Target ID</p>
                  <p className="font-medium font-mono">{selectedLog.target_id}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-medium">{selectedLog.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Metadata</p>
                <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
