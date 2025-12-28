import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  SpeakerWaveIcon,
  ClockIcon,
  MoonIcon,
  GlobeAltIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';

interface CategoryPreference {
  in_app: boolean;
  push: boolean;
  email: boolean;
}

interface NotificationPreferences {
  notifications_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  sound_enabled: boolean;
  email_digest_frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  digest_time: string;
  digest_timezone: string;
  category_preferences: Record<string, CategoryPreference>;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  dnd_enabled: boolean;
  dnd_until?: string;
}

const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    notifications_enabled: true,
    push_enabled: true,
    email_enabled: true,
    sound_enabled: true,
    email_digest_frequency: 'daily',
    digest_time: '09:00',
    digest_timezone: 'America/New_York',
    category_preferences: {
      system: { in_app: true, push: true, email: true },
      meeting: { in_app: true, push: true, email: true },
      okr: { in_app: true, push: true, email: false },
      document: { in_app: true, push: false, email: false },
      report: { in_app: true, push: false, email: true },
      alert: { in_app: true, push: true, email: true },
      reminder: { in_app: true, push: true, email: false },
      workflow: { in_app: true, push: true, email: false },
      integration: { in_app: true, push: false, email: false },
    },
    quiet_hours_enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    dnd_enabled: false,
    dnd_until: undefined,
  });
  const [saving, setSaving] = useState(false);
  const [testSending, setTestSending] = useState(false);

  const categories = [
    { key: 'system', label: 'System', description: 'Platform updates and announcements' },
    { key: 'meeting', label: 'Meetings', description: 'Meeting reminders and follow-ups' },
    { key: 'okr', label: 'OKRs', description: 'Goal updates and reminders' },
    { key: 'document', label: 'Documents', description: 'Document shares and updates' },
    { key: 'report', label: 'Reports', description: 'Report generation and delivery' },
    { key: 'alert', label: 'Alerts', description: 'Business alerts and anomalies' },
    { key: 'reminder', label: 'Reminders', description: 'Task and action item reminders' },
    { key: 'workflow', label: 'Workflows', description: 'Workflow execution updates' },
    { key: 'integration', label: 'Integrations', description: 'Integration status updates' },
  ];

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ];

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCategoryToggle = (category: string, channel: 'in_app' | 'push' | 'email') => {
    setPreferences(prev => ({
      ...prev,
      category_preferences: {
        ...prev.category_preferences,
        [category]: {
          ...prev.category_preferences[category],
          [channel]: !prev.category_preferences[category][channel],
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  const handleSendTest = async (channel: string) => {
    setTestSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestSending(false);
    alert(`Test ${channel} notification sent!`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BellIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Preferences</h1>
            <p className="text-gray-500">Manage how and when you receive notifications</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      {/* Global Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Enable Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications from the platform</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('notifications_enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.notifications_enabled ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive push notifications on your devices</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('push_enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.push_enabled ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.push_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('email_enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.email_enabled ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.email_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SpeakerWaveIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Sound</p>
                <p className="text-sm text-gray-500">Play sound for new notifications</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('sound_enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.sound_enabled ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.sound_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Email Digest Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Digest</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select
              value={preferences.email_digest_frequency}
              onChange={e =>
                setPreferences(prev => ({
                  ...prev,
                  email_digest_frequency: e.target.value as any,
                }))
              }
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="instant">Instant</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
            <input
              type="time"
              value={preferences.digest_time}
              onChange={e => setPreferences(prev => ({ ...prev, digest_time: e.target.value }))}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={preferences.digest_timezone}
              onChange={e => setPreferences(prev => ({ ...prev, digest_timezone: e.target.value }))}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>
                  {tz.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MoonIcon className="h-5 w-5 text-gray-400" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quiet Hours</h2>
              <p className="text-sm text-gray-500">Pause notifications during specific hours</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('quiet_hours_enabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.quiet_hours_enabled ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.quiet_hours_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {preferences.quiet_hours_enabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={preferences.quiet_hours_start}
                onChange={e =>
                  setPreferences(prev => ({ ...prev, quiet_hours_start: e.target.value }))
                }
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={preferences.quiet_hours_end}
                onChange={e =>
                  setPreferences(prev => ({ ...prev, quiet_hours_end: e.target.value }))
                }
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Preferences</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">In-App</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Push</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Email</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.key} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{category.label}</p>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </td>
                  <td className="text-center py-3 px-4">
                    <input
                      type="checkbox"
                      checked={preferences.category_preferences[category.key]?.in_app ?? true}
                      onChange={() => handleCategoryToggle(category.key, 'in_app')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="text-center py-3 px-4">
                    <input
                      type="checkbox"
                      checked={preferences.category_preferences[category.key]?.push ?? false}
                      onChange={() => handleCategoryToggle(category.key, 'push')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="text-center py-3 px-4">
                    <input
                      type="checkbox"
                      checked={preferences.category_preferences[category.key]?.email ?? false}
                      onChange={() => handleCategoryToggle(category.key, 'email')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BeakerIcon className="h-5 w-5 text-gray-400" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Test Notifications</h2>
            <p className="text-sm text-gray-500">Send a test notification to verify your settings</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSendTest('in-app')}
            disabled={testSending}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Test In-App
          </button>
          <button
            onClick={() => handleSendTest('push')}
            disabled={testSending}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Test Push
          </button>
          <button
            onClick={() => handleSendTest('email')}
            disabled={testSending}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Test Email
          </button>
          <button
            onClick={() => handleSendTest('all')}
            disabled={testSending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {testSending ? 'Sending...' : 'Test All Channels'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
