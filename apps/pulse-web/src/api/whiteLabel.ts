import axios from 'axios';

const API_BASE = '/api/v1/white-label';

// Types
export interface BrandingColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface OrganizationBranding {
  organization_id: number;
  company_name: string;
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
  colors: BrandingColors;
  typography: {
    font_family: string;
    heading_font?: string;
  };
  login: {
    background_url?: string;
    welcome_text?: string;
  };
  footer: {
    text?: string;
    show_powered_by: boolean;
  };
  email: {
    logo_url?: string;
    footer_text?: string;
  };
  custom_css?: string;
}

export interface CustomDomain {
  id: number;
  domain: string;
  subdomain?: string;
  ssl_enabled: boolean;
  ssl_expiry?: string;
  dns_verified: boolean;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
}

export interface Partner {
  id: number;
  name: string;
  code: string;
  tier: string;
  commission_rate: number;
  organizations: number;
  mrr_generated: number;
  status: string;
}

// API functions
export const whiteLabelApi = {
  // Branding
  getBranding: async (): Promise<OrganizationBranding> => {
    const response = await axios.get(`${API_BASE}/branding`);
    return response.data;
  },

  updateBranding: async (branding: Partial<OrganizationBranding>) => {
    const response = await axios.put(`${API_BASE}/branding`, branding);
    return response.data;
  },

  uploadLogo: async (fileType: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE}/branding/logo?file_type=${fileType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  previewBranding: async (branding: Partial<OrganizationBranding>) => {
    const response = await axios.post(`${API_BASE}/branding/preview`, branding);
    return response.data;
  },

  // Domains
  listDomains: async (): Promise<{ domains: CustomDomain[] }> => {
    const response = await axios.get(`${API_BASE}/domains`);
    return response.data;
  },

  addDomain: async (domain: string) => {
    const response = await axios.post(`${API_BASE}/domains`, { domain });
    return response.data;
  },

  verifyDomain: async (domainId: number) => {
    const response = await axios.post(`${API_BASE}/domains/${domainId}/verify`);
    return response.data;
  },

  provisionSSL: async (domainId: number) => {
    const response = await axios.post(`${API_BASE}/domains/${domainId}/ssl`);
    return response.data;
  },

  deleteDomain: async (domainId: number) => {
    const response = await axios.delete(`${API_BASE}/domains/${domainId}`);
    return response.data;
  },

  // Partner
  getPartnerDashboard: async () => {
    const response = await axios.get(`${API_BASE}/partner/dashboard`);
    return response.data;
  },

  getReferralLink: async () => {
    const response = await axios.get(`${API_BASE}/partner/referral-link`);
    return response.data;
  },

  getCommissions: async (startDate: string, endDate: string) => {
    const response = await axios.get(`${API_BASE}/partner/commissions`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  // Admin
  listPartners: async (): Promise<{ partners: Partner[] }> => {
    const response = await axios.get(`${API_BASE}/admin/partners`);
    return response.data;
  },

  createPartner: async (partnerData: {
    partner_name: string;
    contact_email: string;
    contact_phone?: string;
    partner_type?: string;
    commission_rate?: number;
  }) => {
    const response = await axios.post(`${API_BASE}/partners`, partnerData);
    return response.data;
  },

  approvePartner: async (partnerId: number) => {
    const response = await axios.post(`${API_BASE}/admin/partners/${partnerId}/approve`);
    return response.data;
  }
};

export default whiteLabelApi;
