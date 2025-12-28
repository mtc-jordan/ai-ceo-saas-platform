import axios from 'axios';

const API_BASE = '/api/v1/localization';

// Types
export interface Language {
  code: string;
  name: string;
  native_name: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  translation_progress: number;
  is_active: boolean;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  symbol_position: 'before' | 'after';
  is_active: boolean;
}

export interface Timezone {
  value: string;
  label: string;
}

export interface UserLocale {
  user_id: number;
  language: string;
  currency: string;
  timezone: string;
  date_format: string;
  time_format: string;
  number_format: string;
}

// API functions
export const localizationApi = {
  // Languages
  getLanguages: async (): Promise<{ languages: Language[] }> => {
    const response = await axios.get(`${API_BASE}/languages`);
    return response.data;
  },

  getTranslations: async (languageCode: string, category?: string) => {
    const params = category ? { category } : {};
    const response = await axios.get(`${API_BASE}/translations/${languageCode}`, { params });
    return response.data;
  },

  translateText: async (text: string, sourceLanguage: string, targetLanguage: string) => {
    const response = await axios.post(`${API_BASE}/translate`, {
      text,
      source_language: sourceLanguage,
      target_language: targetLanguage
    });
    return response.data;
  },

  translateDocument: async (documentId: number, targetLanguage: string) => {
    const response = await axios.post(`${API_BASE}/documents/${documentId}/translate`, null, {
      params: { target_language: targetLanguage }
    });
    return response.data;
  },

  // Currencies
  getCurrencies: async (): Promise<{ currencies: Currency[] }> => {
    const response = await axios.get(`${API_BASE}/currencies`);
    return response.data;
  },

  convertCurrency: async (amount: number, fromCurrency: string, toCurrency: string) => {
    const response = await axios.post(`${API_BASE}/currencies/convert`, {
      amount,
      from_currency: fromCurrency,
      to_currency: toCurrency
    });
    return response.data;
  },

  formatCurrency: async (amount: number, currencyCode: string) => {
    const response = await axios.get(`${API_BASE}/currencies/${currencyCode}/format`, {
      params: { amount }
    });
    return response.data;
  },

  // Timezones
  getTimezones: async (): Promise<{ timezones: Timezone[] }> => {
    const response = await axios.get(`${API_BASE}/timezones`);
    return response.data;
  },

  // User Locale
  getUserLocale: async (): Promise<UserLocale> => {
    const response = await axios.get(`${API_BASE}/user/locale`);
    return response.data;
  },

  updateUserLocale: async (preferences: Partial<UserLocale>) => {
    const response = await axios.put(`${API_BASE}/user/locale`, preferences);
    return response.data;
  },

  // Organization Locale
  getOrganizationLocale: async () => {
    const response = await axios.get(`${API_BASE}/organization/locale`);
    return response.data;
  },

  updateOrganizationLocale: async (settings: {
    default_language?: string;
    default_currency?: string;
    default_timezone?: string;
    allowed_languages?: string[];
  }) => {
    const response = await axios.put(`${API_BASE}/organization/locale`, settings);
    return response.data;
  },

  // Admin
  listTranslationKeys: async (category?: string, search?: string) => {
    const params: any = {};
    if (category) params.category = category;
    if (search) params.search = search;
    const response = await axios.get(`${API_BASE}/admin/translation-keys`, { params });
    return response.data;
  },

  updateTranslation: async (key: string, languageCode: string, value: string) => {
    const response = await axios.put(`${API_BASE}/admin/translations/${key}`, null, {
      params: { language_code: languageCode, value }
    });
    return response.data;
  },

  importTranslations: async (languageCode: string, translations: Record<string, string>) => {
    const response = await axios.post(`${API_BASE}/admin/translations/import`, {
      language_code: languageCode,
      translations
    });
    return response.data;
  },

  exportTranslations: async (languageCode: string) => {
    const response = await axios.get(`${API_BASE}/admin/translations/export/${languageCode}`);
    return response.data;
  }
};

export default localizationApi;
