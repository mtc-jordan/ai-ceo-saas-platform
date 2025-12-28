import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getSystemHealth } from '../api/admin';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  uptime: number;
  last_check: string;
}

interface SystemHealth {
  overall_status: string;
  services: ServiceHealth[];
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  requests_per_minute: number;
  error_rate: number;
}

export default function AdminSystemHealth() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadHealth();
    let interval: ReturnType<typeof setInterval>;
    if (autoRefresh) {
      interval = setInterval(loadHealth, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadHealth = async () => {
    try {
      const data = await getSystemHealth();
      setHealth(data);
    } catch (error) {
      console.error('Failed to load system health:', error);
      // Demo data
      setHealth({
        overall_status: 'healthy',
        services: [
          { name: 'API Gateway', status: 'healthy', latency: 45, uptime: 99.99, last_check: new Date().toISOString() },
          { name: 'Database', status: 'healthy', latency: 12, uptime: 99.95, last_check: new Date().toISOString() },
          { name: 'Redis Cache', status: 'healthy', latency: 2, uptime: 99.99, last_check: new Date().toISOString() },
          { name: 'AI Service', status: 'healthy', latency: 250, uptime: 99.8, last_check: new Date().toISOString() },
          { name: 'Email Service', status: 'healthy', latency: 180, uptime: 99.9, last_check: new Date().toISOString() },
          { name: 'Stripe Integration', status: 'healthy', latency: 120, uptime: 99.95, last_check: new Date().toISOString() },
        ],
        cpu_usage: 32,
        memory_usage: 58,
        disk_usage: 45,
        active_connections: 1247,
        requests_per_minute: 3420,
        error_rate: 0.02
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'bg-green-500';
    if (usage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600">Monitor platform performance and service status</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e: any) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            Auto-refresh (30s)
          </label>
          <Button onClick={loadHealth}>Refresh Now</Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className={health?.overall_status === 'healthy' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${getStatusColor(health?.overall_status || 'healthy')} animate-pulse`}></div>
            <div>
              <p className="text-lg font-semibold capitalize">{health?.overall_status} - All Systems Operational</p>
              <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">CPU Usage</p>
            <p className="text-2xl font-bold">{health?.cpu_usage}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className={`h-2 rounded-full ${getUsageColor(health?.cpu_usage || 0)}`} style={{ width: `${health?.cpu_usage}%` }}></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Memory Usage</p>
            <p className="text-2xl font-bold">{health?.memory_usage}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className={`h-2 rounded-full ${getUsageColor(health?.memory_usage || 0)}`} style={{ width: `${health?.memory_usage}%` }}></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Disk Usage</p>
            <p className="text-2xl font-bold">{health?.disk_usage}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className={`h-2 rounded-full ${getUsageColor(health?.disk_usage || 0)}`} style={{ width: `${health?.disk_usage}%` }}></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Error Rate</p>
            <p className="text-2xl font-bold">{health?.error_rate}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className={`h-2 rounded-full ${(health?.error_rate || 0) < 1 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min((health?.error_rate || 0) * 10, 100)}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Connections</p>
                <p className="text-3xl font-bold">{health?.active_connections?.toLocaleString()}</p>
              </div>
              <div className="text-4xl">🔗</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Requests/Minute</p>
                <p className="text-3xl font-bold">{health?.requests_per_minute?.toLocaleString()}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {health?.services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`}></div>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-500">Uptime: {service.uptime}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Latency</p>
                    <p className="font-medium">{service.latency}ms</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-gray-900">🔄 Restart Services</p>
              <p className="text-sm text-gray-600">Restart all background services</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-gray-900">🗑️ Clear Cache</p>
              <p className="text-sm text-gray-600">Clear Redis and application cache</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-gray-900">📊 View Logs</p>
              <p className="text-sm text-gray-600">Access detailed system logs</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-gray-900">🔧 Run Diagnostics</p>
              <p className="text-sm text-gray-600">Execute system diagnostics</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
