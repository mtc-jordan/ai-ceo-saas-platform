import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { listPlatformConfig, updatePlatformConfig } from '../api/admin';

interface ConfigItem {
  id: number;
  key: string;
  value: string;
  value_type: string;
  category: string;
  description: string;
  is_secret: boolean;
  updated_at: string;
}

export default function AdminConfig() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: 'All Settings' },
    { id: 'general', label: 'General' },
    { id: 'limits', label: 'Limits' },
    { id: 'email', label: 'Email' },
    { id: 'billing', label: 'Billing' },
    { id: 'security', label: 'Security' },
  ];

  useEffect(() => {
    loadConfigs();
  }, [activeCategory]);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const category = activeCategory === 'all' ? undefined : activeCategory;
      const data = await listPlatformConfig(category);
      setConfigs(data || []);
    } catch (error) {
      console.error('Failed to load configs:', error);
      // Demo data
      setConfigs([
        { id: 1, key: 'app_name', value: 'AI CEO Platform', value_type: 'string', category: 'general', description: 'Application name', is_secret: false, updated_at: '' },
        { id: 2, key: 'support_email', value: 'support@aiceo.com', value_type: 'string', category: 'general', description: 'Support email address', is_secret: false, updated_at: '' },
        { id: 3, key: 'max_team_members_free', value: '3', value_type: 'number', category: 'limits', description: 'Max team members for free plan', is_secret: false, updated_at: '' },
        { id: 4, key: 'max_team_members_pro', value: '10', value_type: 'number', category: 'limits', description: 'Max team members for pro plan', is_secret: false, updated_at: '' },
        { id: 5, key: 'sendgrid_api_key', value: 'SG.xxxxxxxxxxxx', value_type: 'string', category: 'email', description: 'SendGrid API key', is_secret: true, updated_at: '' },
        { id: 6, key: 'stripe_webhook_secret', value: 'whsec_xxxxxxxxxxxx', value_type: 'string', category: 'billing', description: 'Stripe webhook secret', is_secret: true, updated_at: '' },
        { id: 7, key: 'ai_rate_limit_free', value: '100', value_type: 'number', category: 'limits', description: 'AI requests per day for free plan', is_secret: false, updated_at: '' },
        { id: 8, key: 'ai_rate_limit_pro', value: '1000', value_type: 'number', category: 'limits', description: 'AI requests per day for pro plan', is_secret: false, updated_at: '' },
        { id: 9, key: 'maintenance_mode', value: 'false', value_type: 'boolean', category: 'general', description: 'Enable maintenance mode', is_secret: false, updated_at: '' },
        { id: 10, key: 'trial_days', value: '14', value_type: 'number', category: 'billing', description: 'Free trial duration in days', is_secret: false, updated_at: '' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string) => {
    try {
      await updatePlatformConfig(key, editValue);
      setConfigs(configs.map(c => c.key === key ? { ...c, value: editValue } : c));
      setEditingKey(null);
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  };

  const startEditing = (config: ConfigItem) => {
    setEditingKey(config.key);
    setEditValue(config.is_secret ? '' : config.value);
  };

  const filteredConfigs = activeCategory === 'all' 
    ? configs 
    : configs.filter(c => c.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return '⚙️';
      case 'limits': return '📊';
      case 'email': return '📧';
      case 'billing': return '💳';
      case 'security': return '🔒';
      default: return '📁';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Configuration</h1>
          <p className="text-gray-600">Manage global platform settings</p>
        </div>
        <Button onClick={loadConfigs}>Refresh</Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Config List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {categories.find(c => c.id === activeCategory)?.label} ({filteredConfigs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConfigs.map((config) => (
                <div key={config.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{getCategoryIcon(config.category)}</span>
                        <p className="font-medium text-gray-900 font-mono">{config.key}</p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          config.value_type === 'boolean' ? 'bg-purple-100 text-purple-800' :
                          config.value_type === 'number' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {config.value_type}
                        </span>
                        {config.is_secret && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                            secret
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {editingKey === config.key ? (
                        <>
                          {config.value_type === 'boolean' ? (
                            <select
                              value={editValue}
                              onChange={(e: any) => setEditValue(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="true">true</option>
                              <option value="false">false</option>
                            </select>
                          ) : (
                            <Input
                              type={config.is_secret ? 'password' : 'text'}
                              value={editValue}
                              onChange={(e: any) => setEditValue(e.target.value)}
                              placeholder={config.is_secret ? 'Enter new value' : ''}
                              className="w-48"
                            />
                          )}
                          <Button size="sm" onClick={() => handleSave(config.key)}>Save</Button>
                          <Button variant="outline" size="sm" onClick={() => setEditingKey(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            {config.is_secret ? (
                              <>
                                <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                                  {showSecrets[config.key] ? config.value : '••••••••'}
                                </code>
                                <button
                                  onClick={() => setShowSecrets(prev => ({ ...prev, [config.key]: !prev[config.key] }))}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  {showSecrets[config.key] ? '👁️' : '👁️‍🗨️'}
                                </button>
                              </>
                            ) : (
                              <code className="px-2 py-1 bg-gray-100 rounded text-sm">{config.value}</code>
                            )}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => startEditing(config)}>Edit</Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-gray-900">Clear Cache</p>
              <p className="text-sm text-gray-600">Clear all cached data</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-gray-900">Restart Services</p>
              <p className="text-sm text-gray-600">Restart background services</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <p className="font-medium text-gray-900">Export Config</p>
              <p className="text-sm text-gray-600">Download configuration backup</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
