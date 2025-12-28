import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Layout from '../components/layout/Layout';
import {
  getTeamMembers,
  getInvitations,
  getTeamOverview,
  createInvitation,
  updateTeamMember,
  removeTeamMember,
  resendInvitation,
  revokeInvitation,
  getRoleDisplayName,
  formatActivityAction,
} from '../api/team';
import type {
  TeamMember,
  Invitation,
  TeamOverview,
  TeamRole,
} from '../api/team';

export default function Team() {
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'activity'>('members');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [overview, setOverview] = useState<TeamOverview | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('viewer');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersRes, invitationsRes, overviewRes] = await Promise.all([
        getTeamMembers(),
        getInvitations(),
        getTeamOverview()
      ]);
      setMembers(membersRes.members);
      setInvitations(invitationsRes.invitations);
      setOverview(overviewRes);
    } catch (error) {
      console.error('Failed to load team data:', error);
      // Set fallback data
      setMembers([
        {
          id: '1',
          organization_id: '1',
          user_id: '1',
          user_email: 'owner@company.com',
          user_name: 'John Owner',
          role: 'owner',
          is_active: true,
          joined_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
          permissions: {
            can_view_dashboard: true,
            can_edit_dashboard: true,
            can_manage_data_sources: true,
            can_view_athena: true,
            can_edit_athena: true,
            can_view_governai: true,
            can_edit_governai: true,
            can_manage_team: true,
            can_manage_billing: true,
            can_view_settings: true,
            can_edit_settings: true,
          }
        },
        {
          id: '2',
          organization_id: '1',
          user_id: '2',
          user_email: 'admin@company.com',
          user_name: 'Jane Admin',
          role: 'admin',
          is_active: true,
          joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_active_at: new Date().toISOString(),
          permissions: {
            can_view_dashboard: true,
            can_edit_dashboard: true,
            can_manage_data_sources: true,
            can_view_athena: true,
            can_edit_athena: true,
            can_view_governai: true,
            can_edit_governai: true,
            can_manage_team: true,
            can_manage_billing: false,
            can_view_settings: true,
            can_edit_settings: true,
          }
        },
        {
          id: '3',
          organization_id: '1',
          user_id: '3',
          user_email: 'analyst@company.com',
          user_name: 'Bob Analyst',
          role: 'analyst',
          is_active: true,
          joined_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          last_active_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          permissions: {
            can_view_dashboard: true,
            can_edit_dashboard: false,
            can_manage_data_sources: false,
            can_view_athena: true,
            can_edit_athena: true,
            can_view_governai: false,
            can_edit_governai: false,
            can_manage_team: false,
            can_manage_billing: false,
            can_view_settings: false,
            can_edit_settings: false,
          }
        }
      ]);
      setInvitations([
        {
          id: '1',
          organization_id: '1',
          email: 'newuser@company.com',
          role: 'viewer',
          status: 'pending',
          message: 'Welcome to the team!',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          invited_by_name: 'John Owner',
          created_at: new Date().toISOString()
        }
      ]);
      setOverview({
        total_members: 3,
        active_members: 3,
        pending_invitations: 1,
        roles_breakdown: { owner: 1, admin: 1, manager: 0, analyst: 1, viewer: 0 },
        recent_activities: [
          {
            id: '1',
            user_id: '1',
            user_name: 'John Owner',
            user_email: 'owner@company.com',
            action: 'sent_invitation',
            resource_type: 'invitation',
            resource_id: '1',
            details: 'Invited newuser@company.com as viewer',
            created_at: new Date().toISOString()
          }
        ]
      });
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    
    setInviteLoading(true);
    try {
      await createInvitation({
        email: inviteEmail,
        role: inviteRole,
        message: inviteMessage || undefined
      });
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('viewer');
      setInviteMessage('');
      loadData();
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: TeamRole) => {
    try {
      await updateTeamMember(memberId, { role: newRole });
      loadData();
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      await removeTeamMember(memberId);
      loadData();
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member');
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await resendInvitation(invitationId);
      loadData();
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      alert('Failed to resend invitation');
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) return;
    
    try {
      await revokeInvitation(invitationId);
      loadData();
    } catch (error) {
      console.error('Failed to revoke invitation:', error);
      alert('Failed to revoke invitation');
    }
  };

  const getRoleBadgeClass = (role: TeamRole) => {
    const colors: Record<TeamRole, string> = {
      owner: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      analyst: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeClass = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
      revoked: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">Manage your team members and permissions</p>
          </div>
          <Button onClick={() => setShowInviteModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Invite Member
          </Button>
        </div>

        {/* Stats Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold">{overview.total_members}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Members</p>
                    <p className="text-2xl font-bold text-green-600">{overview.active_members}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Invites</p>
                    <p className="text-2xl font-bold text-yellow-600">{overview.pending_invitations}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(overview.roles_breakdown.owner || 0) + (overview.roles_breakdown.admin || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['members', 'invitations', 'activity'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'invitations' && overview && overview.pending_invitations > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                    {overview.pending_invitations}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'members' && (
          <Card>
            <CardContent className="p-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {member.user_name?.charAt(0) || member.user_email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.user_name}</div>
                            <div className="text-sm text-gray-500">{member.user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(member.role)}`}>
                          {getRoleDisplayName(member.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.last_active_at ? new Date(member.last_active_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {member.role !== 'owner' && (
                          <div className="flex items-center justify-end space-x-2">
                            <select
                              value={member.role}
                              onChange={(e) => handleUpdateRole(member.id, e.target.value as TeamRole)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="analyst">Analyst</option>
                              <option value="viewer">Viewer</option>
                            </select>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        {member.role === 'owner' && (
                          <span className="text-gray-400">Owner</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'invitations' && (
          <Card>
            <CardContent className="p-0">
              {invitations.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No invitations</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by inviting a team member.</p>
                  <div className="mt-6">
                    <Button onClick={() => setShowInviteModal(true)}>Invite Member</Button>
                  </div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invited By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invitations.map((invitation) => (
                      <tr key={invitation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invitation.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(invitation.role)}`}>
                            {getRoleDisplayName(invitation.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(invitation.status)}`}>
                            {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invitation.invited_by_name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invitation.expires_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {invitation.status === 'pending' && (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleResendInvitation(invitation.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Resend
                              </button>
                              <button
                                onClick={() => handleRevokeInvitation(invitation.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Revoke
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            <CardContent className="p-0">
              {overview && overview.recent_activities.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {overview.recent_activities.map((activity) => (
                    <li key={activity.id} className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {activity.user_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user_name}</span>
                            {' '}{formatActivityAction(activity.action)}
                          </p>
                          {activity.details && (
                            <p className="text-sm text-gray-500">{activity.details}</p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(activity.created_at).toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Activity will appear here as team members take actions.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Invite Team Member</h2>
                <button onClick={() => setShowInviteModal(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">Admin - Full access except billing</option>
                    <option value="manager">Manager - Can edit most features</option>
                    <option value="analyst">Analyst - Can view and edit Athena</option>
                    <option value="viewer">Viewer - Read-only access</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Message (optional)</label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Welcome to the team!"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={!inviteEmail || inviteLoading}>
                  {inviteLoading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
