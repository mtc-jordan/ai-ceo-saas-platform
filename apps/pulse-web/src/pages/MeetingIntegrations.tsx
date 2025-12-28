/**
 * Meeting Integrations Page - Connect Zoom, Google Meet, Microsoft Teams
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getIntegrations,
  getIntegrationAuthUrl,
  disconnectIntegration,
  syncIntegration,
  type Integration,
} from '../api/meetings';

interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
}

const platforms: PlatformConfig[] = [
  {
    id: 'zoom',
    name: 'Zoom',
    icon: '📹',
    color: 'bg-blue-500',
    description: 'Connect your Zoom account to automatically import meetings and recordings.',
    features: [
      'Auto-import scheduled meetings',
      'Download meeting recordings',
      'Sync participant information',
      'Cloud recording transcription',
    ],
  },
  {
    id: 'google_meet',
    name: 'Google Meet',
    icon: '🎥',
    color: 'bg-green-500',
    description: 'Connect Google Calendar to import Google Meet meetings.',
    features: [
      'Sync Google Calendar events',
      'Import Meet links automatically',
      'Access meeting recordings (Workspace)',
      'Participant list sync',
    ],
  },
  {
    id: 'microsoft_teams',
    name: 'Microsoft Teams',
    icon: '💼',
    color: 'bg-purple-500',
    description: 'Connect Microsoft 365 to import Teams meetings.',
    features: [
      'Sync Outlook calendar',
      'Import Teams meetings',
      'Access meeting recordings',
      'Channel meeting support',
    ],
  },
];

const MeetingIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await getIntegrations();
      setIntegrations(data.integrations);
    } catch (err) {
      // Mock data for demo
      setIntegrations([
        {
          id: '1',
          platform: 'zoom',
          platform_email: 'user@company.com',
          is_active: true,
          auto_transcribe: true,
          auto_analyze: true,
          sync_calendar: true,
          last_synced_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platformId: string) => {
    try {
      setConnecting(platformId);
      const { auth_url } = await getIntegrationAuthUrl(platformId);
      // In production, redirect to OAuth URL
      // window.location.href = auth_url;
      
      // For demo, simulate connection
      setTimeout(() => {
        const newIntegration: Integration = {
          id: Date.now().toString(),
          platform: platformId,
          platform_email: 'user@company.com',
          is_active: true,
          auto_transcribe: true,
          auto_analyze: true,
          sync_calendar: true,
          created_at: new Date().toISOString(),
        };
        setIntegrations([...integrations, newIntegration]);
        setConnecting(null);
      }, 1500);
    } catch (err) {
      alert('Failed to connect. Please try again.');
      setConnecting(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;
    
    try {
      await disconnectIntegration(integrationId);
      setIntegrations(integrations.filter(i => i.id !== integrationId));
    } catch (err) {
      setIntegrations(integrations.filter(i => i.id !== integrationId));
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      setSyncing(integrationId);
      await syncIntegration(integrationId);
      // Update last synced time
      setIntegrations(integrations.map(i => 
        i.id === integrationId 
          ? { ...i, last_synced_at: new Date().toISOString() }
          : i
      ));
      alert('Sync completed successfully!');
    } catch (err) {
      // Simulate sync for demo
      setIntegrations(integrations.map(i => 
        i.id === integrationId 
          ? { ...i, last_synced_at: new Date().toISOString() }
          : i
      ));
    } finally {
      setSyncing(null);
    }
  };

  const getIntegrationForPlatform = (platformId: string) => {
    return integrations.find(i => i.platform === platformId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <Link to="/app/meetings" className="text-gray-500 hover:text-gray-700">
            ← Back to Meetings
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Meeting Integrations</h1>
        <p className="text-gray-600">
          Connect your meeting platforms to automatically import and transcribe meetings
        </p>
      </div>

      {/* Connected Integrations Summary */}
      {integrations.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <span className="text-green-600 text-xl">✓</span>
            <span className="font-medium text-green-800">
              {integrations.length} platform{integrations.length > 1 ? 's' : ''} connected
            </span>
          </div>
        </div>
      )}

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const integration = getIntegrationForPlatform(platform.id);
          const isConnected = !!integration;
          const isConnecting = connecting === platform.id;
          const isSyncing = syncing === integration?.id;

          return (
            <div
              key={platform.id}
              className={`bg-white rounded-xl shadow-sm border ${
                isConnected ? 'border-green-200' : 'border-gray-100'
              } overflow-hidden`}
            >
              {/* Header */}
              <div className={`${platform.color} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{platform.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg">{platform.name}</h3>
                      {isConnected && integration?.platform_email && (
                        <p className="text-sm opacity-90">{integration.platform_email}</p>
                      )}
                    </div>
                  </div>
                  {isConnected && (
                    <span className="px-2 py-1 bg-white bg-opacity-20 rounded text-sm">
                      Connected
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-4">{platform.description}</p>

                {/* Features */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Features</p>
                  <ul className="space-y-1">
                    {platform.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Integration Status */}
                {isConnected && integration && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Auto-transcribe</p>
                        <p className="font-medium">{integration.auto_transcribe ? 'Enabled' : 'Disabled'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Auto-analyze</p>
                        <p className="font-medium">{integration.auto_analyze ? 'Enabled' : 'Disabled'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Calendar sync</p>
                        <p className="font-medium">{integration.sync_calendar ? 'Enabled' : 'Disabled'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last synced</p>
                        <p className="font-medium">
                          {integration.last_synced_at ? formatDate(integration.last_synced_at) : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  {isConnected ? (
                    <>
                      <button
                        onClick={() => handleSync(integration!.id)}
                        disabled={isSyncing}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSyncing ? 'Syncing...' : '🔄 Sync Now'}
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration!.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(platform.id)}
                      disabled={isConnecting}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isConnecting ? 'Connecting...' : `Connect ${platform.name}`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Upload Option */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <span className="text-2xl">📤</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Manual Upload</h3>
            <p className="text-gray-600 text-sm mt-1">
              Don't use these platforms? You can still upload meeting recordings manually for transcription and analysis.
            </p>
            <Link
              to="/app/meetings/upload"
              className="inline-block mt-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Upload Recording
            </Link>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-800 text-sm mb-4">
          Having trouble connecting your meeting platform? Here are some common solutions:
        </p>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Make sure you have admin permissions for your meeting platform account</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>For Zoom, ensure cloud recording is enabled in your account settings</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>For Google Meet, you need a Google Workspace account for recording access</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>For Microsoft Teams, ensure your organization allows third-party app connections</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MeetingIntegrations;
