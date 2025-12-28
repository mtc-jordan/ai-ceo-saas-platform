import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { listFeatureFlags, createFeatureFlag, updateFeatureFlag, deleteFeatureFlag } from '../api/admin';

interface FeatureFlag {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  enabled_for_plans: string[];
  enabled_for_organizations: string[];
  percentage_rollout: number;
  created_at: string;
  updated_at: string;
}

export default function AdminFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: false,
    enabled_for_plans: [] as string[],
    percentage_rollout: 100
  });

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const data = await listFeatureFlags();
      setFlags(data || []);
    } catch (error) {
      console.error('Failed to load feature flags:', error);
      // Demo data
      setFlags([
        { id: 1, name: 'ai_briefings_v2', description: 'New AI briefing generation with GPT-4', enabled: true, enabled_for_plans: ['pro', 'enterprise'], enabled_for_organizations: [], percentage_rollout: 100, created_at: '2024-11-24', updated_at: '2024-12-19' },
        { id: 2, name: 'scenario_planning', description: 'Advanced scenario planning with Monte Carlo simulations', enabled: true, enabled_for_plans: ['enterprise'], enabled_for_organizations: [], percentage_rollout: 50, created_at: '2024-10-24', updated_at: '2024-12-14' },
        { id: 3, name: 'real_time_alerts', description: 'Real-time push notifications for alerts', enabled: false, enabled_for_plans: [], enabled_for_organizations: [], percentage_rollout: 0, created_at: '2024-12-09', updated_at: '' },
        { id: 4, name: 'custom_dashboards', description: 'User-customizable dashboard layouts', enabled: true, enabled_for_plans: ['free', 'pro', 'enterprise'], enabled_for_organizations: [], percentage_rollout: 100, created_at: '2024-09-24', updated_at: '2024-12-23' },
        { id: 5, name: 'api_v2', description: 'New API version with GraphQL support', enabled: true, enabled_for_plans: ['enterprise'], enabled_for_organizations: [], percentage_rollout: 25, created_at: '2024-12-17', updated_at: '2024-12-24' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await updateFeatureFlag(flag.id, { enabled: !flag.enabled });
      setFlags(flags.map(f => f.id === flag.id ? { ...f, enabled: !f.enabled } : f));
    } catch (error) {
      console.error('Failed to toggle feature flag:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingFlag) {
        await updateFeatureFlag(editingFlag.id, formData);
      } else {
        await createFeatureFlag({
          ...formData,
          enabled_for_organizations: []
        });
      }
      loadFlags();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save feature flag:', error);
    }
  };

  const handleDelete = async (flagId: number) => {
    if (confirm('Are you sure you want to delete this feature flag?')) {
      try {
        await deleteFeatureFlag(flagId);
        loadFlags();
      } catch (error) {
        console.error('Failed to delete feature flag:', error);
      }
    }
  };

  const openEditModal = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setFormData({
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
      enabled_for_plans: flag.enabled_for_plans,
      percentage_rollout: flag.percentage_rollout
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingFlag(null);
    setFormData({
      name: '',
      description: '',
      enabled: false,
      enabled_for_plans: [],
      percentage_rollout: 100
    });
  };

  const togglePlan = (plan: string) => {
    setFormData(prev => ({
      ...prev,
      enabled_for_plans: prev.enabled_for_plans.includes(plan)
        ? prev.enabled_for_plans.filter(p => p !== plan)
        : [...prev.enabled_for_plans, plan]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
          <p className="text-gray-600">Control feature rollouts and experiments</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          Create Feature Flag
        </Button>
      </div>

      {/* Feature Flags List */}
      <Card>
        <CardHeader>
          <CardTitle>All Feature Flags ({flags.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {flags.map((flag) => (
                <div key={flag.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleToggle(flag)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          flag.enabled ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            flag.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <div>
                        <p className="font-medium text-gray-900 font-mono">{flag.name}</p>
                        <p className="text-sm text-gray-600">{flag.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex gap-1">
                          {flag.enabled_for_plans.map(plan => (
                            <span key={plan} className={`px-2 py-0.5 text-xs rounded-full ${
                              plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                              plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {plan}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {flag.percentage_rollout}% rollout
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(flag)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(flag.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flag Name</label>
                <Input
                  value={formData.name}
                  onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., new_feature_v2"
                  disabled={!!editingFlag}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this flag controls"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enabled for Plans</label>
                <div className="flex gap-2">
                  {['free', 'pro', 'enterprise'].map(plan => (
                    <button
                      key={plan}
                      onClick={() => togglePlan(plan)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        formData.enabled_for_plans.includes(plan)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rollout Percentage: {formData.percentage_rollout}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.percentage_rollout}
                  onChange={(e: any) => setFormData({ ...formData, percentage_rollout: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e: any) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="enabled" className="text-sm text-gray-700">Enable this feature flag</label>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSave}>
                  {editingFlag ? 'Save Changes' : 'Create Flag'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
