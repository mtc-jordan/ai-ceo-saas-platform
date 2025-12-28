import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getKaizenEvents, createKaizenEvent, updateKaizenEvent, type KaizenEvent } from '../api/leansixsigma';

const EVENT_TYPES = [
  { id: 'kaizen_blitz', name: 'Kaizen Blitz', duration: '3-5 days', description: 'Intensive rapid improvement' },
  { id: 'gemba_walk', name: 'Gemba Walk', duration: '1-2 hours', description: 'Go and see the actual work' },
  { id: 'value_stream', name: 'Value Stream Mapping', duration: '2-3 days', description: 'Map the entire process flow' },
  { id: '5s_event', name: '5S Event', duration: '1-2 days', description: 'Sort, Set, Shine, Standardize, Sustain' },
  { id: 'standard_work', name: 'Standard Work', duration: '1-3 days', description: 'Document best practices' },
  { id: 'smed', name: 'SMED', duration: '2-4 days', description: 'Single Minute Exchange of Die' },
];

const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function KaizenEvents() {
  const [events, setEvents] = useState<KaizenEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    event_type: 'kaizen_blitz',
    focus_area: '',
    target_process: '',
    start_date: '',
    end_date: '',
    goals: [{ metric: '', baseline: 0, target: 0 }],
  });

  useEffect(() => {
    fetchEvents();
  }, [filterStatus, filterType]);

  const fetchEvents = async () => {
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.event_type = filterType;
      const data = await getKaizenEvents(params);
      setEvents(data);
    } catch (error) {
      // Use fallback data
      setEvents([
        {
          id: '1',
          name: 'Assembly Line A Optimization',
          description: 'Reduce cycle time and improve quality',
          event_type: 'kaizen_blitz',
          focus_area: 'Manufacturing',
          target_process: 'Product Assembly',
          team_members: [],
          start_date: '2024-01-15',
          end_date: '2024-01-19',
          goals: [
            { metric: 'Cycle Time', baseline: 45, target: 30, actual: 32 },
            { metric: 'Defect Rate', baseline: 3.5, target: 1.5, actual: 1.8 },
          ],
          improvements_identified: ['Reorganize workstation layout', 'Implement visual management'],
          improvements_implemented: ['Shadow boards installed', 'Work instructions updated'],
          savings_achieved: 75000,
          status: 'completed',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Warehouse 5S Implementation',
          description: 'Organize warehouse for efficiency',
          event_type: '5s_event',
          focus_area: 'Logistics',
          target_process: 'Inventory Management',
          team_members: [],
          start_date: '2024-02-01',
          end_date: '2024-02-02',
          goals: [
            { metric: 'Search Time', baseline: 15, target: 5 },
            { metric: 'Space Utilization', baseline: 60, target: 85 },
          ],
          improvements_identified: [],
          improvements_implemented: [],
          savings_achieved: 0,
          status: 'in_progress',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      await createKaizenEvent(newEvent);
      setShowModal(false);
      setNewEvent({
        name: '',
        description: '',
        event_type: 'kaizen_blitz',
        focus_area: '',
        target_process: '',
        start_date: '',
        end_date: '',
        goals: [{ metric: '', baseline: 0, target: 0 }],
      });
      fetchEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleUpdateStatus = async (eventId: string, newStatus: string) => {
    try {
      await updateKaizenEvent(eventId, { status: newStatus });
      fetchEvents();
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const addGoal = () => {
    setNewEvent({
      ...newEvent,
      goals: [...newEvent.goals, { metric: '', baseline: 0, target: 0 }],
    });
  };

  const updateGoal = (index: number, field: string, value: string | number) => {
    const updatedGoals = [...newEvent.goals];
    updatedGoals[index] = { ...updatedGoals[index], [field]: value };
    setNewEvent({ ...newEvent, goals: updatedGoals });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const totalSavings = events.reduce((sum, event) => sum + event.savings_achieved, 0);
  const completedEvents = events.filter(e => e.status === 'completed').length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kaizen Events</h1>
            <p className="text-gray-600">Continuous Improvement Initiatives</p>
          </div>
          <Button onClick={() => setShowModal(true)}>+ Schedule Event</Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-3xl font-bold text-blue-600">{events.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedEvents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-orange-600">{events.filter(e => e.status === 'in_progress').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600">Total Savings</p>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(totalSavings)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Event Types */}
        <Card>
          <CardHeader>
            <CardTitle>Event Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {EVENT_TYPES.map((type) => (
                <div
                  key={type.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    filterType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFilterType(filterType === type.id ? '' : type.id)}
                >
                  <h4 className="font-medium text-sm">{type.name}</h4>
                  <p className="text-xs text-gray-500">{type.duration}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <select
                className="px-3 py-2 border rounded-lg"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              {filterType && (
                <Button variant="outline" size="sm" onClick={() => setFilterType('')}>
                  Clear: {EVENT_TYPES.find(t => t.id === filterType)?.name}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No Kaizen events scheduled yet</p>
              <Button onClick={() => setShowModal(true)}>Schedule Your First Event</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const eventType = EVENT_TYPES.find(t => t.id === event.event_type);
              return (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{event.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[event.status]}`}>
                            {event.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            {eventType?.name}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          {event.focus_area && <span>📍 {event.focus_area}</span>}
                          {event.target_process && <span>🎯 {event.target_process}</span>}
                          {event.start_date && <span>📅 {event.start_date} - {event.end_date}</span>}
                        </div>

                        {/* Goals */}
                        {event.goals && event.goals.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium mb-2">Goals:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              {event.goals.map((goal, idx) => (
                                <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
                                  <span className="font-medium">{goal.metric}:</span>
                                  <span className="text-gray-600"> {goal.baseline} → {goal.target}</span>
                                  {goal.actual !== undefined && (
                                    <span className={goal.actual <= goal.target ? 'text-green-600' : 'text-red-600'}>
                                      {' '}(Actual: {goal.actual})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {event.savings_achieved > 0 && (
                          <p className="text-green-600 font-medium">
                            💰 Savings Achieved: {formatCurrency(event.savings_achieved)}
                          </p>
                        )}
                      </div>
                      <div>
                        <select
                          className="px-3 py-2 border rounded-lg text-sm"
                          value={event.status}
                          onChange={(e) => handleUpdateStatus(event.id, e.target.value)}
                        >
                          <option value="planned">Planned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Event Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Schedule Kaizen Event</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Name *</label>
                  <Input
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    placeholder="e.g., Assembly Line A Optimization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Event Type</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={newEvent.event_type}
                      onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                    >
                      {EVENT_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Focus Area</label>
                    <Input
                      value={newEvent.focus_area}
                      onChange={(e) => setNewEvent({ ...newEvent, focus_area: e.target.value })}
                      placeholder="e.g., Manufacturing"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Target Process</label>
                  <Input
                    value={newEvent.target_process}
                    onChange={(e) => setNewEvent({ ...newEvent, target_process: e.target.value })}
                    placeholder="e.g., Product Assembly"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={newEvent.start_date}
                      onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <Input
                      type="date"
                      value={newEvent.end_date}
                      onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                    />
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Goals</label>
                    <Button variant="outline" size="sm" onClick={addGoal}>+ Add Goal</Button>
                  </div>
                  {newEvent.goals.map((goal, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                      <Input
                        placeholder="Metric name"
                        value={goal.metric}
                        onChange={(e) => updateGoal(idx, 'metric', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Baseline"
                        value={goal.baseline}
                        onChange={(e) => updateGoal(idx, 'baseline', parseFloat(e.target.value))}
                      />
                      <Input
                        type="number"
                        placeholder="Target"
                        value={goal.target}
                        onChange={(e) => updateGoal(idx, 'target', parseFloat(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleCreateEvent} disabled={!newEvent.name}>
                  Schedule Event
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
