/**
 * Meeting Detail Page - View transcript, summary, and action items
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getMeeting,
  analyzeMeeting,
  uploadMeetingRecording,
  sendMeetingSummary,
  updateActionItem,
  type MeetingDetail as MeetingDetailType,
  type ActionItem,
} from '../api/meetings';

const MeetingDetail: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [meeting, setMeeting] = useState<MeetingDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'actions' | 'details'>('summary');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (meetingId) {
      loadMeeting();
    }
  }, [meetingId]);

  const loadMeeting = async () => {
    try {
      setLoading(true);
      const data = await getMeeting(meetingId!);
      setMeeting(data);
    } catch (err) {
      // Set mock data for demo
      setMeeting({
        id: meetingId!,
        title: 'Q4 Strategy Planning Session',
        description: 'Quarterly planning meeting to discuss goals and initiatives',
        platform: 'zoom',
        scheduled_start: new Date(Date.now() - 86400000).toISOString(),
        actual_start: new Date(Date.now() - 86400000).toISOString(),
        actual_end: new Date(Date.now() - 82800000).toISOString(),
        duration_minutes: 60,
        status: 'analyzed',
        has_transcript: true,
        has_summary: true,
        participants: [
          { name: 'John Smith', email: 'john@company.com', role: 'CEO' },
          { name: 'Sarah Johnson', email: 'sarah@company.com', role: 'CFO' },
          { name: 'Mike Chen', email: 'mike@company.com', role: 'CTO' },
        ],
        tags: ['strategy', 'q4', 'planning'],
        action_items_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        transcript: `**John Smith:** Good morning everyone. Let's get started with our Q4 planning session. Sarah, can you give us an update on the financials?

**Sarah Johnson:** Sure. We're tracking well against our Q3 targets. Revenue is up 15% year-over-year, and we're on track to hit our annual goals. However, I want to flag that our operational costs have increased by 8%.

**John Smith:** That's a concern. Mike, is that related to the infrastructure scaling?

**Mike Chen:** Partially, yes. We've had to scale up our cloud infrastructure to handle the increased load. But I have a proposal to optimize our costs by about 20% through better resource allocation.

**John Smith:** Great. Let's make that a priority for Q4. Sarah, can you work with Mike on the budget implications?

**Sarah Johnson:** Absolutely. I'll schedule a follow-up meeting for next week.

**John Smith:** Perfect. Now, let's discuss our product roadmap for Q4...`,
        transcript_segments: [
          { start_time: 0, end_time: 15, speaker: 'John Smith', text: 'Good morning everyone. Let\'s get started with our Q4 planning session.', confidence: 0.95 },
          { start_time: 15, end_time: 45, speaker: 'Sarah Johnson', text: 'Sure. We\'re tracking well against our Q3 targets. Revenue is up 15% year-over-year.', confidence: 0.92 },
        ],
        transcription_confidence: 0.94,
        summary: 'The Q4 planning session covered financial performance, infrastructure costs, and product roadmap. Key highlights include 15% YoY revenue growth, 8% increase in operational costs, and a proposal to optimize cloud costs by 20%. The team agreed to prioritize cost optimization and schedule follow-up meetings for budget planning.',
        key_points: [
          'Revenue up 15% year-over-year',
          'Operational costs increased by 8%',
          'Cloud infrastructure scaling driving cost increase',
          'Proposal to optimize costs by 20% through better resource allocation',
          'Q4 product roadmap discussion scheduled',
        ],
        decisions: [
          'Prioritize cloud cost optimization in Q4',
          'Sarah and Mike to collaborate on budget implications',
          'Schedule follow-up meeting for next week',
        ],
        topics: [
          { topic: 'Financial Update', summary: 'Q3 performance review and annual goal tracking' },
          { topic: 'Infrastructure Costs', summary: 'Discussion of cloud scaling costs and optimization' },
          { topic: 'Product Roadmap', summary: 'Q4 feature planning and priorities' },
        ],
        sentiment_analysis: {
          overall_sentiment: 'positive',
          sentiment_score: 0.65,
          tone: 'collaborative',
          engagement_level: 'high',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !meetingId) return;

    try {
      setUploading(true);
      await uploadMeetingRecording(meetingId, file);
      await loadMeeting();
    } catch (err) {
      setError('Failed to upload recording');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!meetingId) return;

    try {
      setAnalyzing(true);
      await analyzeMeeting(meetingId, {
        extract_action_items: true,
        generate_summary: true,
        identify_decisions: true,
        track_topics: true,
        analyze_sentiment: true,
      });
      await loadMeeting();
    } catch (err) {
      setError('Failed to analyze meeting');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendSummary = async () => {
    if (!meetingId) return;

    try {
      await sendMeetingSummary(meetingId);
      alert('Summary sent to participants!');
    } catch (err) {
      setError('Failed to send summary');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      transcribed: 'bg-purple-100 text-purple-800',
      analyzed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Meeting not found</p>
        <Link to="/app/meetings" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
          Back to Meetings
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Link to="/app/meetings" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(meeting.status)}`}>
              {meeting.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
          {meeting.description && (
            <p className="text-gray-600 mt-1">{meeting.description}</p>
          )}
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            {meeting.scheduled_start && (
              <span>📅 {formatDate(meeting.scheduled_start)}</span>
            )}
            {meeting.duration_minutes && (
              <span>⏱️ {formatDuration(meeting.duration_minutes)}</span>
            )}
            {meeting.participants && (
              <span>👥 {meeting.participants.length} participants</span>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          {meeting.has_summary && (
            <button
              onClick={handleSendSummary}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              📧 Send Summary
            </button>
          )}
          {meeting.has_transcript && !meeting.has_summary && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : '🔍 Analyze'}
            </button>
          )}
          {!meeting.has_transcript && (
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
              {uploading ? 'Uploading...' : '📤 Upload Recording'}
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['summary', 'transcript', 'actions', 'details'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'actions' ? 'Action Items' : tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {activeTab === 'summary' && (
          <div className="p-6 space-y-6">
            {meeting.has_summary ? (
              <>
                {/* Executive Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Executive Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{meeting.summary}</p>
                </div>

                {/* Key Points */}
                {meeting.key_points && meeting.key_points.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Points</h3>
                    <ul className="space-y-2">
                      {meeting.key_points.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Decisions */}
                {meeting.decisions && meeting.decisions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Decisions Made</h3>
                    <ul className="space-y-2">
                      {meeting.decisions.map((decision, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-700">{decision}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Topics */}
                {meeting.topics && meeting.topics.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Topics Discussed</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {meeting.topics.map((topic, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900">{topic.topic}</h4>
                          {topic.summary && (
                            <p className="text-sm text-gray-600 mt-1">{topic.summary}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sentiment */}
                {meeting.sentiment_analysis && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Meeting Sentiment</h3>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-2xl capitalize">{meeting.sentiment_analysis.overall_sentiment}</p>
                        <p className="text-sm text-gray-500">Overall</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl capitalize">{meeting.sentiment_analysis.tone}</p>
                        <p className="text-sm text-gray-500">Tone</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl capitalize">{meeting.sentiment_analysis.engagement_level}</p>
                        <p className="text-sm text-gray-500">Engagement</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">📝</span>
                <p className="text-gray-500">No summary available yet</p>
                {meeting.has_transcript ? (
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {analyzing ? 'Analyzing...' : 'Generate Summary'}
                  </button>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">Upload a recording to get started</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="p-6">
            {meeting.has_transcript && meeting.transcript ? (
              <div className="prose max-w-none">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Full Transcript</h3>
                  {meeting.transcription_confidence && (
                    <span className="text-sm text-gray-500">
                      Confidence: {(meeting.transcription_confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {meeting.transcript}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">🎙️</span>
                <p className="text-gray-500">No transcript available</p>
                <label className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block">
                  Upload Recording
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Action Items</h3>
              <span className="text-sm text-gray-500">{meeting.action_items_count} items</span>
            </div>
            {meeting.action_items_count > 0 ? (
              <div className="space-y-3">
                {/* Mock action items for demo */}
                {[
                  { id: '1', title: 'Prepare cloud cost optimization proposal', assignee: 'Mike Chen', due: '2024-01-15', status: 'pending', priority: 'high' },
                  { id: '2', title: 'Schedule budget review meeting', assignee: 'Sarah Johnson', due: '2024-01-10', status: 'completed', priority: 'medium' },
                  { id: '3', title: 'Review Q4 product roadmap', assignee: 'John Smith', due: '2024-01-12', status: 'in_progress', priority: 'high' },
                ].map((item) => (
                  <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={item.status === 'completed'}
                          onChange={() => {}}
                          className="mt-1 h-4 w-4 text-blue-600 rounded"
                        />
                        <div>
                          <p className={`font-medium ${item.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {item.title}
                          </p>
                          <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                            <span>👤 {item.assignee}</span>
                            <span>📅 {item.due}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">✅</span>
                <p className="text-gray-500">No action items extracted yet</p>
                {meeting.has_transcript && (
                  <button
                    onClick={handleAnalyze}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Extract Action Items
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="p-6 space-y-6">
            {/* Participants */}
            {meeting.participants && meeting.participants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Participants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meeting.participants.map((participant, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {participant.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{participant.name}</p>
                        {participant.role && (
                          <p className="text-sm text-gray-500">{participant.role}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {meeting.tags && meeting.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {meeting.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Meeting Information</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Platform</dt>
                  <dd className="font-medium text-gray-900 capitalize">{meeting.platform.replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd className="font-medium text-gray-900 capitalize">{meeting.status}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Created</dt>
                  <dd className="font-medium text-gray-900">{formatDate(meeting.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Last Updated</dt>
                  <dd className="font-medium text-gray-900">{formatDate(meeting.updated_at)}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingDetail;
