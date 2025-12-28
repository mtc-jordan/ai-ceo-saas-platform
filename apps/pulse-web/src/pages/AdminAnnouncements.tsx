import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { listAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../api/admin';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  target_audience: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    target_audience: 'all',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await listAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Failed to load announcements:', error);
      // Demo data
      setAnnouncements([
        { id: 1, title: 'New Feature: AI Briefings V2', content: "We've upgraded our AI briefing engine with GPT-4 for more accurate insights.", type: 'info', target_audience: 'all', is_active: true, start_date: '2024-12-17', end_date: '2024-12-31', created_at: '2024-12-17' },
        { id: 2, title: 'Scheduled Maintenance', content: "We'll be performing scheduled maintenance on Dec 28, 2024 from 2-4 AM UTC.", type: 'maintenance', target_audience: 'all', is_active: true, start_date: '2024-12-24', end_date: '2024-12-28', created_at: '2024-12-23' },
        { id: 3, title: 'Holiday Promotion', content: 'Get 20% off annual plans with code HOLIDAY2024!', type: 'info', target_audience: 'free', is_active: true, start_date: '2024-12-21', end_date: '2025-01-03', created_at: '2024-12-21' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, formData);
      } else {
        await createAnnouncement(formData);
      }
      loadAnnouncements();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save announcement:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
        loadAnnouncements();
      } catch (error) {
        console.error('Failed to delete announcement:', error);
      }
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      await updateAnnouncement(announcement.id, { is_active: !announcement.is_active });
      setAnnouncements(announcements.map(a => 
        a.id === announcement.id ? { ...a, is_active: !a.is_active } : a
      ));
    } catch (error) {
      console.error('Failed to toggle announcement:', error);
    }
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      target_audience: announcement.target_audience,
      start_date: announcement.start_date?.split('T')[0] || '',
      end_date: announcement.end_date?.split('T')[0] || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      type: 'info',
      target_audience: 'all',
      start_date: '',
      end_date: ''
    });
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      case 'maintenance': return '🔧';
      default: return '📢';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Manage platform-wide announcements and notifications</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          Create Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Announcements</p>
            <p className="text-2xl font-bold">{announcements.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {announcements.filter(a => a.is_active).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600">
              {announcements.filter(a => new Date(a.start_date) > new Date()).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Expired</p>
            <p className="text-2xl font-bold text-gray-600">
              {announcements.filter(a => a.end_date && new Date(a.end_date) < new Date()).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className={`border rounded-lg p-4 ${!announcement.is_active ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{getTypeIcon(announcement.type)}</span>
                        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeBadgeColor(announcement.type)}`}>
                          {announcement.type}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                          {announcement.target_audience}
                        </span>
                        {!announcement.is_active && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{announcement.content}</p>
                      <p className="text-xs text-gray-500">
                        {announcement.start_date && `From: ${new Date(announcement.start_date).toLocaleDateString()}`}
                        {announcement.end_date && ` • To: ${new Date(announcement.end_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleActive(announcement)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          announcement.is_active ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            announcement.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <Button variant="outline" size="sm" onClick={() => openEditModal(announcement)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(announcement.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e: any) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Announcement content..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={formData.target_audience}
                    onChange={(e: any) => setFormData({ ...formData, target_audience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="free">Free Plan</option>
                    <option value="pro">Pro Plan</option>
                    <option value="enterprise">Enterprise Plan</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e: any) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e: any) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleSave}>
                  {editingAnnouncement ? 'Save Changes' : 'Create Announcement'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
