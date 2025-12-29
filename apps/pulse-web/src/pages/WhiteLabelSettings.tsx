import React, { useState } from 'react';
import {
  PaletteIcon,
  GlobeIcon,
  UsersIcon,
  UploadIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CopyIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
  RefreshCwIcon
} from 'lucide-react';

// Mock data
const mockBranding = {
  company_name: "Acme Corporation",
  logo_url: "/assets/logo.png",
  colors: {
    primary: "#6366F1",
    secondary: "#8B5CF6",
    accent: "#F59E0B",
    background: "#FFFFFF",
    text: "#1F2937"
  },
  typography: {
    font_family: "Inter",
    heading_font: "Inter"
  },
  login: {
    welcome_text: "Welcome to Acme Portal"
  },
  footer: {
    text: "© 2024 Acme Corporation",
    show_powered_by: false
  }
};

const mockDomains = [
  {
    id: 1,
    domain: "app.acmecorp.com",
    ssl_enabled: true,
    ssl_expiry: "2025-06-15",
    dns_verified: true,
    is_active: true,
    is_primary: true
  }
];

const WhiteLabelSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'branding' | 'domains' | 'partner'>('branding');
  const [branding, setBranding] = useState(mockBranding);
  const [domains, setDomains] = useState(mockDomains);
  const [newDomain, setNewDomain] = useState('');
  const [showAddDomain, setShowAddDomain] = useState(false);

  const tabs = [
    { id: 'branding', label: 'Branding', icon: PaletteIcon },
    { id: 'domains', label: 'Custom Domains', icon: GlobeIcon },
    { id: 'partner', label: 'Partner Program', icon: UsersIcon }
  ];

  const handleColorChange = (colorKey: string, value: string) => {
    setBranding({
      ...branding,
      colors: { ...branding.colors, [colorKey]: value }
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">White-Label Settings</h1>
        <p className="text-gray-500">Customize branding, domains, and partner settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Logo & Identity</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={branding.company_name}
                  onChange={(e) => setBranding({ ...branding, company_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    {branding.logo_url ? (
                      <img src={branding.logo_url} alt="Logo" className="max-h-12" />
                    ) : (
                      <UploadIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <button className="px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">
                    Upload Logo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Brand Colors</h2>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(branding.colors).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{key}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Typography</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Body Font</label>
                <select
                  value={branding.typography.font_family}
                  onChange={(e) => setBranding({
                    ...branding,
                    typography: { ...branding.typography, font_family: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading Font</label>
                <select
                  value={branding.typography.heading_font || branding.typography.font_family}
                  onChange={(e) => setBranding({
                    ...branding,
                    typography: { ...branding.typography, heading_font: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Playfair Display">Playfair Display</option>
                </select>
              </div>
            </div>
          </div>

          {/* Login Page */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Login Page</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Text</label>
                <input
                  type="text"
                  value={branding.login.welcome_text || ''}
                  onChange={(e) => setBranding({
                    ...branding,
                    login: { ...branding.login, welcome_text: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
                <button className="px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">
                  Upload Background
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Footer</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
                <input
                  type="text"
                  value={branding.footer.text || ''}
                  onChange={(e) => setBranding({
                    ...branding,
                    footer: { ...branding.footer, text: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPoweredBy"
                  checked={branding.footer.show_powered_by}
                  onChange={(e) => setBranding({
                    ...branding,
                    footer: { ...branding.footer, show_powered_by: e.target.checked }
                  })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="showPoweredBy" className="text-sm text-gray-700">
                  Show "Powered by NovaVerse" badge
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <button className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Preview
            </button>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Domains Tab */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Custom Domains</h2>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                onClick={() => setShowAddDomain(true)}
              >
                <GlobeIcon className="w-4 h-4" />
                Add Domain
              </button>
            </div>
            
            {/* Add Domain Form */}
            {showAddDomain && (
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="app.yourdomain.com"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button 
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    onClick={() => {
                      setDomains([...domains, {
                        id: domains.length + 1,
                        domain: newDomain,
                        ssl_enabled: false,
                        dns_verified: false,
                        is_active: false,
                        is_primary: false
                      }]);
                      setNewDomain('');
                      setShowAddDomain(false);
                    }}
                  >
                    Add
                  </button>
                  <button 
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    onClick={() => setShowAddDomain(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Domains List */}
            <div className="divide-y divide-gray-200">
              {domains.map((domain) => (
                <div key={domain.id} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${domain.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <GlobeIcon className={`w-5 h-5 ${domain.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{domain.domain}</span>
                        {domain.is_primary && (
                          <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">Primary</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className={`flex items-center gap-1 ${domain.dns_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                          {domain.dns_verified ? <CheckCircleIcon className="w-4 h-4" /> : <AlertCircleIcon className="w-4 h-4" />}
                          {domain.dns_verified ? 'DNS Verified' : 'DNS Pending'}
                        </span>
                        <span className={`flex items-center gap-1 ${domain.ssl_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                          <ShieldCheckIcon className="w-4 h-4" />
                          {domain.ssl_enabled ? `SSL Active (expires ${domain.ssl_expiry})` : 'SSL Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!domain.dns_verified && (
                      <button className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg">
                        Verify DNS
                      </button>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <ExternalLinkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DNS Instructions */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h3 className="font-semibold text-blue-900 mb-2">DNS Configuration</h3>
            <p className="text-sm text-blue-700 mb-4">Add the following DNS records to your domain:</p>
            <div className="bg-white rounded-lg p-4 font-mono text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500">Type: CNAME</span>
                <button className="text-indigo-600 hover:text-indigo-700">
                  <CopyIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="text-gray-900">Name: app</div>
              <div className="text-gray-900">Value: custom.aiceo.com</div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Tab */}
      {activeTab === 'partner' && (
        <div className="space-y-6">
          {/* Partner Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="text-sm text-gray-500">Partner Tier</div>
              <div className="text-2xl font-bold text-yellow-600">Gold</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="text-sm text-gray-500">Commission Rate</div>
              <div className="text-2xl font-bold">25%</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="text-sm text-gray-500">Total Earnings</div>
              <div className="text-2xl font-bold text-green-600">$4,500</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="text-sm text-gray-500">Active Clients</div>
              <div className="text-2xl font-bold">15</div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Your Referral Link</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value="https://aiceo.com/signup?ref=TECHP2024"
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
              />
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <CopyIcon className="w-4 h-4" />
                Copy Link
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">Share this link to earn commissions on new signups</p>
          </div>

          {/* Client Organizations */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Client Organizations</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {[
                { name: "Acme Corp", plan: "Professional", users: 25, mrr: 499, status: "active" },
                { name: "TechStart Inc", plan: "Starter", users: 8, mrr: 99, status: "active" },
                { name: "NewCo Ltd", plan: "Enterprise", users: 50, mrr: 999, status: "active" }
              ].map((client, idx) => (
                <div key={idx} className="p-5 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.plan} • {client.users} users</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${client.mrr}/mo</div>
                    <div className="text-sm text-green-600">${(client.mrr * 0.25).toFixed(0)} commission</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhiteLabelSettings;
