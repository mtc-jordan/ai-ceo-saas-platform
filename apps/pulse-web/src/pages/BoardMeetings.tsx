import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getMeetings, createMeeting, getBoardMembers, getResolutions } from '../api/governai';

interface Meeting {
  id: string;
  title: string;
  meeting_type: string;
  status: string;
  scheduled_date: string;
  location?: string;
  is_virtual: boolean;
  virtual_link?: string;
  agenda_items_count?: number;
  attendees_confirmed?: number;
  attendees_total?: number;
}

interface BoardMember {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  role: string;
  company: string;
  is_independent: boolean;
  expertise: string[];
}

interface Resolution {
  id: string;
  resolution_number: string;
  title: string;
  status: string;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  voting_deadline?: string;
}

export default function BoardMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'meetings' | 'members' | 'resolutions'>('meetings');
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    meeting_type: 'board',
    scheduled_date: '',
    location: '',
    is_virtual: false,
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meetingsData, membersData, resolutionsData] = await Promise.all([
        getMeetings(),
        getBoardMembers(),
        getResolutions()
      ]);
      setMeetings(meetingsData);
      setMembers(membersData);
      setResolutions(resolutionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    try {
      await createMeeting({
        ...newMeeting,
        scheduled_date: new Date(newMeeting.scheduled_date).toISOString()
      });
      setShowNewMeetingModal(false);
      setNewMeeting({
        title: '',
        meeting_type: 'board',
        scheduled_date: '',
        location: '',
        is_virtual: false,
        description: ''
      });
      loadData();
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'voting': return 'bg-yellow-500/20 text-yellow-400';
      case 'passed': return 'bg-green-500/20 text-green-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Board Management</h1>
          <p className="text-gray-400">Manage meetings, members, and resolutions</p>
        </div>
        <Button onClick={() => setShowNewMeetingModal(true)}>
          + Schedule Meeting
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('meetings')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'meetings' 
              ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Meetings ({meetings.length})
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'members' 
              ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Board Members ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('resolutions')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'resolutions' 
              ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Resolutions ({resolutions.length})
        </button>
      </div>

      {/* Meetings Tab */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:border-purple-500/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-300">
                        {meeting.meeting_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(meeting.scheduled_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {meeting.is_virtual ? 'Virtual' : meeting.location}
                      </span>
                      {meeting.agenda_items_count && (
                        <span>{meeting.agenda_items_count} agenda items</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {meeting.attendees_confirmed !== undefined && (
                      <p className="text-sm text-gray-400">
                        {meeting.attendees_confirmed}/{meeting.attendees_total} confirmed
                      </p>
                    )}
                    <Button variant="outline" size="sm" className="mt-2">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Board Members Tab */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-400">
                      {member.first_name[0]}{member.last_name[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">
                      {member.first_name} {member.last_name}
                    </h3>
                    <p className="text-purple-400 text-sm">{member.title}</p>
                    <p className="text-gray-400 text-sm">{member.company}</p>
                    {member.is_independent && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        Independent
                      </span>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.expertise?.slice(0, 3).map((exp, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resolutions Tab */}
      {activeTab === 'resolutions' && (
        <div className="space-y-4">
          {resolutions.map((resolution) => (
            <Card key={resolution.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-gray-500 text-sm">{resolution.resolution_number}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(resolution.status)}`}>
                        {resolution.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{resolution.title}</h3>
                    {resolution.voting_deadline && (
                      <p className="text-sm text-gray-400 mt-1">
                        Voting deadline: {formatDate(resolution.voting_deadline)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-400">For: {resolution.votes_for}</span>
                      <span className="text-red-400">Against: {resolution.votes_against}</span>
                      <span className="text-gray-400">Abstain: {resolution.votes_abstain}</span>
                    </div>
                    {resolution.status === 'voting' && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">Vote For</Button>
                        <Button size="sm" variant="outline" className="border-red-500 text-red-400">Vote Against</Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Meeting Modal */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Schedule New Meeting</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Meeting Title</label>
                  <Input
                    value={newMeeting.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    placeholder="Q4 Board Meeting"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Meeting Type</label>
                  <select
                    value={newMeeting.meeting_type}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewMeeting({ ...newMeeting, meeting_type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="board">Board Meeting</option>
                    <option value="committee">Committee Meeting</option>
                    <option value="annual">Annual Meeting</option>
                    <option value="special">Special Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={newMeeting.scheduled_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewMeeting({ ...newMeeting, scheduled_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Location</label>
                  <Input
                    value={newMeeting.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                    placeholder="Conference Room A"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_virtual"
                    checked={newMeeting.is_virtual}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMeeting({ ...newMeeting, is_virtual: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_virtual" className="text-sm text-gray-400">Virtual Meeting</label>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={newMeeting.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                    placeholder="Meeting description..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white h-24"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowNewMeetingModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMeeting}>
                  Schedule Meeting
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
