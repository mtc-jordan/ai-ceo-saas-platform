import api from './client';

// Types
export interface TeamMember {
  id: string;
  organization_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  role: TeamRole;
  is_active: boolean;
  joined_at: string;
  last_active_at: string | null;
  permissions: Permissions;
}

export interface Permissions {
  can_view_dashboard: boolean;
  can_edit_dashboard: boolean;
  can_manage_data_sources: boolean;
  can_view_athena: boolean;
  can_edit_athena: boolean;
  can_view_governai: boolean;
  can_edit_governai: boolean;
  can_manage_team: boolean;
  can_manage_billing: boolean;
  can_view_settings: boolean;
  can_edit_settings: boolean;
}

export type TeamRole = 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer';

export interface TeamMemberListResponse {
  members: TeamMember[];
  total: number;
  owners: number;
  admins: number;
  managers: number;
  analysts: number;
  viewers: number;
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: TeamRole;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  message: string | null;
  expires_at: string;
  invited_by_name: string | null;
  created_at: string;
}

export interface InvitationListResponse {
  invitations: Invitation[];
  total: number;
  pending: number;
  accepted: number;
  expired: number;
}

export interface InvitationVerifyResponse {
  valid: boolean;
  email?: string;
  organization_name?: string;
  role?: TeamRole;
  invited_by?: string;
  expires_at?: string;
  user_exists: boolean;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: string | null;
  created_at: string;
}

export interface TeamOverview {
  total_members: number;
  active_members: number;
  pending_invitations: number;
  roles_breakdown: Record<string, number>;
  recent_activities: ActivityLog[];
}

export interface RoleInfo {
  role: TeamRole;
  name: string;
  description: string;
  permissions: Permissions;
}

// Team Members API
export const getTeamMembers = async (includeInactive = false): Promise<TeamMemberListResponse> => {
  const response = await api.get(`/team/members?include_inactive=${includeInactive}`);
  return response.data;
};

export const getTeamMember = async (memberId: string): Promise<TeamMember> => {
  const response = await api.get(`/team/members/${memberId}`);
  return response.data;
};

export const updateTeamMember = async (
  memberId: string,
  data: { role?: TeamRole; is_active?: boolean; permissions?: Partial<Permissions> }
): Promise<TeamMember> => {
  const response = await api.patch(`/team/members/${memberId}`, data);
  return response.data;
};

export const removeTeamMember = async (memberId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/team/members/${memberId}`);
  return response.data;
};

// Invitations API
export const createInvitation = async (data: {
  email: string;
  role: TeamRole;
  message?: string;
}): Promise<Invitation> => {
  const response = await api.post('/team/invitations', data);
  return response.data;
};

export const createBulkInvitations = async (invitations: {
  email: string;
  role: TeamRole;
  message?: string;
}[]): Promise<InvitationListResponse> => {
  const response = await api.post('/team/invitations/bulk', { invitations });
  return response.data;
};

export const getInvitations = async (status?: string): Promise<InvitationListResponse> => {
  const url = status ? `/team/invitations?status=${status}` : '/team/invitations';
  const response = await api.get(url);
  return response.data;
};

export const verifyInvitation = async (token: string): Promise<InvitationVerifyResponse> => {
  const response = await api.post('/team/invitations/verify', { token });
  return response.data;
};

export const acceptInvitation = async (data: {
  token: string;
  full_name?: string;
  password?: string;
}): Promise<{ success: boolean; user_id: string; organization_id: string }> => {
  const response = await api.post('/team/invitations/accept', data);
  return response.data;
};

export const resendInvitation = async (invitationId: string): Promise<{ success: boolean; message: string; expires_at: string }> => {
  const response = await api.post(`/team/invitations/${invitationId}/resend`);
  return response.data;
};

export const revokeInvitation = async (invitationId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/team/invitations/${invitationId}`);
  return response.data;
};

// Activity Logs API
export const getActivityLogs = async (limit = 50, userId?: string): Promise<{ activities: ActivityLog[]; total: number }> => {
  let url = `/team/activity?limit=${limit}`;
  if (userId) url += `&user_id=${userId}`;
  const response = await api.get(url);
  return response.data;
};

// Team Overview API
export const getTeamOverview = async (): Promise<TeamOverview> => {
  const response = await api.get('/team/overview');
  return response.data;
};

// Roles API
export const getRoles = async (): Promise<{ roles: RoleInfo[] }> => {
  const response = await api.get('/team/roles');
  return response.data;
};

// My Permissions API
export const getMyPermissions = async (): Promise<Permissions & { role: string }> => {
  const response = await api.get('/team/my-permissions');
  return response.data;
};

// Helper functions
export const getRoleDisplayName = (role: TeamRole): string => {
  const names: Record<TeamRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    manager: 'Manager',
    analyst: 'Analyst',
    viewer: 'Viewer'
  };
  return names[role] || role;
};

export const getRoleColor = (role: TeamRole): string => {
  const colors: Record<TeamRole, string> = {
    owner: 'purple',
    admin: 'red',
    manager: 'blue',
    analyst: 'green',
    viewer: 'gray'
  };
  return colors[role] || 'gray';
};

export const formatActivityAction = (action: string): string => {
  const actions: Record<string, string> = {
    sent_invitation: 'Sent an invitation',
    updated_team_member: 'Updated team member',
    removed_team_member: 'Removed team member',
    created_scenario: 'Created a scenario',
    updated_scenario: 'Updated a scenario',
    created_competitor: 'Added a competitor',
    generated_briefing: 'Generated a briefing'
  };
  return actions[action] || action.replace(/_/g, ' ');
};
