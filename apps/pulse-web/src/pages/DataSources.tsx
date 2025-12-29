import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { pulseApi } from '../api/pulse';
import { cn, formatDateTime } from '../lib/utils';
import type { DataSource } from '../types';

const DATA_SOURCE_TYPES = [
  { id: 'stripe', name: 'Stripe', description: 'Payment and subscription data' },
  { id: 'hubspot', name: 'HubSpot', description: 'CRM and marketing data' },
  { id: 'google_analytics', name: 'Google Analytics', description: 'Website traffic and behavior' },
  { id: 'quickbooks', name: 'QuickBooks', description: 'Accounting and financial data' },
  { id: 'salesforce', name: 'Salesforce', description: 'Sales and customer data' },
  { id: 'shopify', name: 'Shopify', description: 'E-commerce data' },
];

export default function DataSources() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');

  const { data: dataSources = [], isLoading } = useQuery({
    queryKey: ['dataSources'],
    queryFn: pulseApi.getDataSources,
  });

  const createMutation = useMutation({
    mutationFn: pulseApi.createDataSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
      setShowAddModal(false);
      setSelectedType(null);
      setApiKey('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: pulseApi.deleteDataSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: pulseApi.syncDataSource,
  });

  const handleAddSource = () => {
    if (!selectedType) return;
    const sourceType = DATA_SOURCE_TYPES.find(t => t.id === selectedType);
    createMutation.mutate({
      name: sourceType?.name || selectedType,
      type: selectedType,
      credentials: apiKey ? { api_key: apiKey } : undefined,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      default:
        return 'Pending';
    }
  };

  return (
    <div>
      <Header />

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Connected Sources</h2>
            <p className="text-sm text-slate-500">Manage your data integrations</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Data Source
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dataSources.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No data sources connected</h3>
              <p className="text-slate-500 mb-4">Connect your first data source to start getting insights</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Data Source
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataSources.map((source: DataSource) => (
              <Card key={source.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{source.name}</h3>
                      <p className="text-sm text-slate-500 capitalize">{source.type.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(source.status)}
                      <span className={cn(
                        'text-sm font-medium',
                        source.status === 'connected' && 'text-green-600',
                        source.status === 'error' && 'text-red-600',
                        source.status === 'pending' && 'text-amber-600'
                      )}>
                        {getStatusText(source.status)}
                      </span>
                    </div>
                  </div>

                  {source.last_sync_at && (
                    <p className="text-xs text-slate-400 mb-4">
                      Last synced: {formatDateTime(source.last_sync_at)}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncMutation.mutate(source.id)}
                      disabled={syncMutation.isPending}
                    >
                      <RefreshCw className={cn('h-4 w-4 mr-1', syncMutation.isPending && 'animate-spin')} />
                      Sync
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(source.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Add Data Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {DATA_SOURCE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-colors',
                      selectedType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <p className="font-medium text-slate-900">{type.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                  </button>
                ))}
              </div>

              {selectedType && (
                <Input
                  label="API Key (optional)"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddSource}
                  disabled={!selectedType || createMutation.isPending}
                  isLoading={createMutation.isPending}
                >
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
