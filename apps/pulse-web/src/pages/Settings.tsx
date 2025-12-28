import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Database, Brain, Check, X, Loader2, Eye, EyeOff } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import type { OrganizationSettingsResponse, OrganizationSettingsUpdate } from '../api/settings';
import { settingsApi } from '../api/settings';

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  configured: boolean;
  enabled: boolean;
  onConfigure: () => void;
  onToggle: (enabled: boolean) => void;
}

function IntegrationCard({ title, description, icon, configured, enabled, onConfigure, onToggle }: IntegrationCardProps) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {configured ? (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <Check className="h-3 w-3" /> Configured
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              <X className="h-3 w-3" /> Not configured
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onConfigure}>
          {configured ? 'Update' : 'Configure'}
        </Button>
        {configured && (
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-slate-600">Enabled</span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onToggle(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
          </label>
        )}
      </div>
    </div>
  );
}

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function ConfigModal({ isOpen, onClose, title, children }: ConfigModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<OrganizationSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Form states
  const [deepseekKey, setDeepseekKey] = useState('');
  const [stripeKey, setStripeKey] = useState('');
  const [hubspotKey, setHubspotKey] = useState('');
  const [gaCredentials, setGaCredentials] = useState('');
  const [gaPropertyId, setGaPropertyId] = useState('');
  
  // Show/hide password states
  const [showDeepseek, setShowDeepseek] = useState(false);
  const [showStripe, setShowStripe] = useState(false);
  const [showHubspot, setShowHubspot] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsApi.getSettings();
      setSettings(data);
      if (data.google_analytics_property_id) {
        setGaPropertyId(data.google_analytics_property_id);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (sourceType: string, apiKey?: string, credentialsJson?: string, propertyId?: string) => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await settingsApi.testConnection({
        source_type: sourceType,
        api_key: apiKey,
        credentials_json: credentialsJson,
        property_id: propertyId,
      });
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveSettings = async (update: OrganizationSettingsUpdate) => {
    setSaving(true);
    try {
      const updated = await settingsApi.updateSettings(update);
      setSettings(updated);
      setActiveModal(null);
      setTestResult(null);
      // Clear form fields
      setDeepseekKey('');
      setStripeKey('');
      setHubspotKey('');
      setGaCredentials('');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (type: string, enabled: boolean) => {
    const update: OrganizationSettingsUpdate = {};
    switch (type) {
      case 'deepseek':
        update.deepseek = { enabled };
        break;
      case 'stripe':
        update.stripe = { enabled };
        break;
      case 'hubspot':
        update.hubspot = { enabled };
        break;
      case 'google_analytics':
        update.google_analytics = { enabled };
        break;
    }
    await handleSaveSettings(update);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">Manage your integrations and API configurations</p>
        </div>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI Configuration
            </CardTitle>
            <CardDescription>Configure your AI provider for generating briefings and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <IntegrationCard
              title="DeepSeek AI"
              description="Power your AI briefings with DeepSeek's language model"
              icon={<Brain className="h-5 w-5" />}
              configured={settings?.deepseek_configured || false}
              enabled={settings?.deepseek_enabled || false}
              onConfigure={() => setActiveModal('deepseek')}
              onToggle={(enabled) => handleToggle('deepseek', enabled)}
            />
          </CardContent>
        </Card>

        {/* Data Source Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Data Source Integrations
            </CardTitle>
            <CardDescription>Connect your business tools to get real-time metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <IntegrationCard
              title="Stripe"
              description="Payment and subscription data"
              icon={<Key className="h-5 w-5" />}
              configured={settings?.stripe_configured || false}
              enabled={settings?.stripe_enabled || false}
              onConfigure={() => setActiveModal('stripe')}
              onToggle={(enabled) => handleToggle('stripe', enabled)}
            />
            <IntegrationCard
              title="Google Analytics"
              description="Website traffic and user behavior"
              icon={<SettingsIcon className="h-5 w-5" />}
              configured={settings?.google_analytics_configured || false}
              enabled={settings?.google_analytics_enabled || false}
              onConfigure={() => setActiveModal('google_analytics')}
              onToggle={(enabled) => handleToggle('google_analytics', enabled)}
            />
            <IntegrationCard
              title="HubSpot"
              description="CRM and marketing data"
              icon={<Database className="h-5 w-5" />}
              configured={settings?.hubspot_configured || false}
              enabled={settings?.hubspot_enabled || false}
              onConfigure={() => setActiveModal('hubspot')}
              onToggle={(enabled) => handleToggle('hubspot', enabled)}
            />
          </CardContent>
        </Card>

        {/* Briefing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Briefing Schedule</CardTitle>
            <CardDescription>Configure when to generate AI briefings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                <select
                  value={settings?.briefing_frequency || 'daily'}
                  onChange={(e) => handleSaveSettings({ briefing: { frequency: e.target.value, time: settings?.briefing_time || '08:00' } })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="realtime">Real-time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                <input
                  type="time"
                  value={settings?.briefing_time || '08:00'}
                  onChange={(e) => handleSaveSettings({ briefing: { frequency: settings?.briefing_frequency || 'daily', time: e.target.value } })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DeepSeek Configuration Modal */}
      <ConfigModal
        isOpen={activeModal === 'deepseek'}
        onClose={() => { setActiveModal(null); setTestResult(null); }}
        title="Configure DeepSeek AI"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
            <div className="relative">
              <input
                type={showDeepseek ? 'text' : 'password'}
                value={deepseekKey}
                onChange={(e) => setDeepseekKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowDeepseek(!showDeepseek)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showDeepseek ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Get your API key from <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">platform.deepseek.com</a>
            </p>
          </div>
          
          {testResult && (
            <div className={`p-3 rounded-lg text-sm ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult.message}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleTestConnection('deepseek', deepseekKey)}
              disabled={!deepseekKey || testing}
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Connection
            </Button>
            <Button
              onClick={() => handleSaveSettings({ deepseek: { api_key: deepseekKey, enabled: true } })}
              disabled={!deepseekKey || saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </div>
        </div>
      </ConfigModal>

      {/* Stripe Configuration Modal */}
      <ConfigModal
        isOpen={activeModal === 'stripe'}
        onClose={() => { setActiveModal(null); setTestResult(null); }}
        title="Configure Stripe"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Secret API Key</label>
            <div className="relative">
              <input
                type={showStripe ? 'text' : 'password'}
                value={stripeKey}
                onChange={(e) => setStripeKey(e.target.value)}
                placeholder="sk_live_..."
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowStripe(!showStripe)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showStripe ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Get your API key from <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Stripe Dashboard</a>
            </p>
          </div>
          
          {testResult && (
            <div className={`p-3 rounded-lg text-sm ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult.message}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleTestConnection('stripe', stripeKey)}
              disabled={!stripeKey || testing}
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Connection
            </Button>
            <Button
              onClick={() => handleSaveSettings({ stripe: { api_key: stripeKey, enabled: true } })}
              disabled={!stripeKey || saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </div>
        </div>
      </ConfigModal>

      {/* HubSpot Configuration Modal */}
      <ConfigModal
        isOpen={activeModal === 'hubspot'}
        onClose={() => { setActiveModal(null); setTestResult(null); }}
        title="Configure HubSpot"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Private App Access Token</label>
            <div className="relative">
              <input
                type={showHubspot ? 'text' : 'password'}
                value={hubspotKey}
                onChange={(e) => setHubspotKey(e.target.value)}
                placeholder="pat-..."
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowHubspot(!showHubspot)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showHubspot ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Create a private app in <a href="https://app.hubspot.com/private-apps" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">HubSpot Settings</a>
            </p>
          </div>
          
          {testResult && (
            <div className={`p-3 rounded-lg text-sm ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult.message}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleTestConnection('hubspot', hubspotKey)}
              disabled={!hubspotKey || testing}
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Connection
            </Button>
            <Button
              onClick={() => handleSaveSettings({ hubspot: { api_key: hubspotKey, enabled: true } })}
              disabled={!hubspotKey || saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </div>
        </div>
      </ConfigModal>

      {/* Google Analytics Configuration Modal */}
      <ConfigModal
        isOpen={activeModal === 'google_analytics'}
        onClose={() => { setActiveModal(null); setTestResult(null); }}
        title="Configure Google Analytics"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">GA4 Property ID</label>
            <input
              type="text"
              value={gaPropertyId}
              onChange={(e) => setGaPropertyId(e.target.value)}
              placeholder="properties/123456789"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Account Credentials (JSON)</label>
            <textarea
              value={gaCredentials}
              onChange={(e) => setGaCredentials(e.target.value)}
              placeholder='{"type": "service_account", ...}'
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Create a service account in <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Cloud Console</a>
            </p>
          </div>
          
          {testResult && (
            <div className={`p-3 rounded-lg text-sm ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult.message}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleTestConnection('google_analytics', undefined, gaCredentials, gaPropertyId)}
              disabled={!gaCredentials || !gaPropertyId || testing}
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Connection
            </Button>
            <Button
              onClick={() => handleSaveSettings({ google_analytics: { credentials_json: gaCredentials, property_id: gaPropertyId, enabled: true } })}
              disabled={!gaCredentials || !gaPropertyId || saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </div>
        </div>
      </ConfigModal>
    </Layout>
  );
}
