import React, { useState } from 'react';
import {
  GlobeIcon,
  LanguagesIcon,
  DollarSignIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  RefreshCwIcon
} from 'lucide-react';

// Mock data
const mockLanguages = [
  { code: "en", name: "English", native: "English", flag: "🇺🇸", progress: 100, active: true },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸", progress: 95, active: true },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷", progress: 90, active: true },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪", progress: 88, active: true },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷", progress: 85, active: false },
  { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳", progress: 82, active: false },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵", progress: 78, active: false },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦", progress: 70, active: false }
];

const mockCurrencies = [
  { code: "USD", name: "US Dollar", symbol: "$", rate: 1.0, active: true },
  { code: "EUR", name: "Euro", symbol: "€", rate: 0.92, active: true },
  { code: "GBP", name: "British Pound", symbol: "£", rate: 0.79, active: true },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 149.50, active: false },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", rate: 7.24, active: false },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 1.36, active: false }
];

const mockTimezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" }
];

const LocalizationSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'languages' | 'currencies' | 'translate'>('preferences');
  const [userLocale, setUserLocale] = useState({
    language: "en",
    currency: "USD",
    timezone: "America/New_York",
    date_format: "MM/DD/YYYY",
    time_format: "12h"
  });
  const [translateText, setTranslateText] = useState('');
  const [translateFrom, setTranslateFrom] = useState('en');
  const [translateTo, setTranslateTo] = useState('es');
  const [translatedResult, setTranslatedResult] = useState('');

  const tabs = [
    { id: 'preferences', label: 'My Preferences', icon: GlobeIcon },
    { id: 'languages', label: 'Languages', icon: LanguagesIcon },
    { id: 'currencies', label: 'Currencies', icon: DollarSignIcon },
    { id: 'translate', label: 'AI Translate', icon: SparklesIcon }
  ];

  const handleTranslate = () => {
    // Mock translation
    const translations: Record<string, string> = {
      'Hello, how are you?': '¡Hola, cómo estás?',
      'Welcome to the platform': 'Bienvenido a la plataforma',
      'Thank you for your business': 'Gracias por su negocio'
    };
    setTranslatedResult(translations[translateText] || `[Translated to ${translateTo}]: ${translateText}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Language & Region</h1>
        <p className="text-gray-500">Manage language preferences, currencies, and regional settings</p>
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

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-6">Regional Preferences</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Language</label>
                <select
                  value={userLocale.language}
                  onChange={(e) => setUserLocale({ ...userLocale, language: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {mockLanguages.filter(l => l.active).map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name} ({lang.native})
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={userLocale.currency}
                  onChange={(e) => setUserLocale({ ...userLocale, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {mockCurrencies.filter(c => c.active).map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.name} ({curr.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={userLocale.timezone}
                  onChange={(e) => setUserLocale({ ...userLocale, timezone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {mockTimezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>

              {/* Date Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                <select
                  value={userLocale.date_format}
                  onChange={(e) => setUserLocale({ ...userLocale, date_format: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY (12/24/2024)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (24/12/2024)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-24)</option>
                </select>
              </div>

              {/* Time Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                <select
                  value={userLocale.time_format}
                  onChange={(e) => setUserLocale({ ...userLocale, time_format: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="12h">12-hour (2:30 PM)</option>
                  <option value="24h">24-hour (14:30)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Save Preferences
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Preview</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Date:</span>
                <span className="ml-2 font-medium">12/24/2024</span>
              </div>
              <div>
                <span className="text-gray-500">Time:</span>
                <span className="ml-2 font-medium">2:30 PM</span>
              </div>
              <div>
                <span className="text-gray-500">Currency:</span>
                <span className="ml-2 font-medium">$1,234.56</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Languages Tab */}
      {activeTab === 'languages' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Available Languages</h2>
              <p className="text-sm text-gray-500">Enable languages for your organization</p>
            </div>
            <div className="divide-y divide-gray-200">
              {mockLanguages.map((lang) => (
                <div key={lang.code} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <div className="font-medium">{lang.name}</div>
                      <div className="text-sm text-gray-500">{lang.native}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-32">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Translated</span>
                        <span className="font-medium">{lang.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`rounded-full h-2 ${lang.progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                          style={{ width: `${lang.progress}%` }}
                        />
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lang.active}
                        className="sr-only peer"
                        onChange={() => {}}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Currencies Tab */}
      {activeTab === 'currencies' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Available Currencies</h2>
                <p className="text-sm text-gray-500">Exchange rates updated daily</p>
              </div>
              <button className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
                <RefreshCwIcon className="w-4 h-4" />
                Update Rates
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {mockCurrencies.map((curr) => (
                <div key={curr.code} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                      {curr.symbol}
                    </div>
                    <div>
                      <div className="font-medium">{curr.name}</div>
                      <div className="text-sm text-gray-500">{curr.code}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-medium">1 USD = {curr.rate} {curr.code}</div>
                      <div className="text-sm text-gray-500">Exchange rate</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={curr.active}
                        className="sr-only peer"
                        onChange={() => {}}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Currency Converter */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Quick Currency Converter</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  defaultValue={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
              <ArrowRightIcon className="w-5 h-5 text-gray-400" />
              <select className="px-4 py-2 border border-gray-300 rounded-lg">
                <option>EUR</option>
                <option>USD</option>
                <option>GBP</option>
              </select>
              <div className="flex-1">
                <input
                  type="text"
                  value="92.00"
                  readOnly
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Translate Tab */}
      {activeTab === 'translate' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-purple-900">AI-Powered Translation</h2>
            </div>
            <p className="text-sm text-purple-700">Translate text instantly using advanced AI models</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <select
                value={translateFrom}
                onChange={(e) => setTranslateFrom(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                {mockLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  const temp = translateFrom;
                  setTranslateFrom(translateTo);
                  setTranslateTo(temp);
                }}
              >
                <ArrowRightIcon className="w-5 h-5 text-gray-400" />
              </button>
              <select
                value={translateTo}
                onChange={(e) => setTranslateTo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                {mockLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Original Text</label>
                <textarea
                  value={translateText}
                  onChange={(e) => setTranslateText(e.target.value)}
                  placeholder="Enter text to translate..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Translation</label>
                <textarea
                  value={translatedResult}
                  readOnly
                  placeholder="Translation will appear here..."
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg resize-none"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <button 
                onClick={handleTranslate}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <SparklesIcon className="w-4 h-4" />
                Translate
              </button>
            </div>
          </div>

          {/* Document Translation */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Document Translation</h3>
            <p className="text-sm text-gray-500 mb-4">Translate entire documents with AI</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-2">
                <LanguagesIcon className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600 mb-4">Drag and drop a document here, or click to browse</p>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Select Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalizationSettings;
