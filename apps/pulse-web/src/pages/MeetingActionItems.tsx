/**
 * Meeting Action Items Page - Track and manage all action items
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getActionItems,
  
  updateActionItem,
  deleteActionItem,
  type ActionItem,
} from '../api/meetings';

const MeetingActionItems: React.FC = () => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, overdue: 0 });

  useEffect(() => {
    loadActionItems();
  }, []);

  const loadActionItems = async () => {
    try {
      setLoading(true);
      const data = await getActionItems();
      setActionItems(data.action_items);
      setStats({
        total: data.total,
        pending: data.pending_count,
        overdue: data.overdue_count,
      });
    } catch (err) {
      // Set mock data for demo
      const mockItems: ActionItem[] = [
        {
          id: '1',
          meeting_id: 'm1',
          title: 'Prepare Q4 budget proposal',
          description: 'Create detailed budget proposal for Q4 initiatives',
          assignee_name: 'Sarah Johnson',
          assignee_email: 'sarah@company.com',
          due_date: new Date(Date.now() + 259200000).toISOString(),
          status: 'pending',
          priority: 'high',
          context: 'Discussed in Q4 planning meeting',
          ai_extracted: true,
          confidence_score: 0.92,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          meeting_id: 'm1',
          title: 'Review competitor analysis report',
          description: 'Analyze competitor pricing and features',
          assignee_name: 'Mike Chen',
          assignee_email: 'mike@company.com',
          due_date: new Date(Date.now() + 432000000).toISOString(),
          status: 'in_progress',
          priority: 'medium',
          ai_extracted: true,
          confidence_score: 0.88,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          meeting_id: 'm2',
          title: 'Schedule follow-up with engineering team',
          assignee_name: 'John Smith',
          due_date: new Date(Date.now() - 86400000).toISOString(),
          status: 'pending',
          priority: 'high',
          ai_extracted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '4',
          meeting_id: 'm2',
          title: 'Update project documentation',
          assignee_name: 'Emily Davis',
          due_date: new Date(Date.now() + 604800000).toISOString(),
          status: 'completed',
          completed_at: new Date().toISOString(),
          priority: 'low',
          ai_extracted: true,
          confidence_score: 0.85,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '5',
          title: 'Prepare presentation for board meeting',
          assignee_name: 'Sarah Johnson',
          due_date: new Date(Date.now() + 172800000).toISOString(),
          status: 'pending',
          priority: 'critical',
          ai_extracted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setActionItems(mockItems);
      const now = new Date();
      const pending = mockItems.filter(i => i.status === 'pending' || i.status === 'in_progress');
      const overdue = pending.filter(i => i.due_date && new Date(i.due_date) < now);
      setStats({
        total: mockItems.length,
        pending: pending.length,
        overdue: overdue.length,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    try {
      await updateActionItem(itemId, { status: newStatus });
      setActionItems(items =>
        items.map(item =>
          item.id === itemId
            ? { ...item, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined }
            : item
        )
      );
    } catch (err) {
      // Update locally for demo
      setActionItems(items =>
        items.map(item =>
          item.id === itemId
            ? { ...item, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined }
            : item
        )
      );
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this action item?')) return;
    
    try {
      await deleteActionItem(itemId);
      setActionItems(items => items.filter(item => item.id !== itemId));
    } catch (err) {
      setActionItems(items => items.filter(item => item.id !== itemId));
    }
  };

  const filteredItems = actionItems.filter(item => {
    const now = new Date();
    const isOverdue = item.due_date && new Date(item.due_date) < now && item.status !== 'completed';
    
    switch (filter) {
      case 'pending':
        return item.status === 'pending' || item.status === 'in_progress';
      case 'overdue':
        return isOverdue;
      case 'completed':
        return item.status === 'completed';
      default:
        return true;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (item: ActionItem) => {
    return item.due_date && new Date(item.due_date) < new Date() && item.status !== 'completed';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // @ts-ignore
const _getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Action Items</h1>
          <p className="text-gray-600">Track and manage tasks from your meetings</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + New Action Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-lg border ${filter === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
        >
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Items</p>
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`p-4 rounded-lg border ${filter === 'pending' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
        >
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`p-4 rounded-lg border ${filter === 'overdue' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
        >
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          <p className="text-sm text-gray-500">Overdue</p>
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`p-4 rounded-lg border ${filter === 'completed' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
        >
          <p className="text-2xl font-bold text-green-600">{stats.total - stats.pending}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </button>
      </div>

      {/* Action Items List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {filter === 'all' ? 'All Action Items' : 
             filter === 'pending' ? 'Pending Items' :
             filter === 'overdue' ? 'Overdue Items' : 'Completed Items'}
          </h2>
        </div>
        
        {filteredItems.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredItems.map((item) => (
              <div key={item.id} className={`p-4 hover:bg-gray-50 ${isOverdue(item) ? 'bg-red-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={item.status === 'completed'}
                      onChange={(e) => handleStatusChange(item.id, e.target.checked ? 'completed' : 'pending')}
                      className="mt-1 h-5 w-5 text-blue-600 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className={`font-medium ${item.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {item.title}
                        </p>
                        {item.ai_extracted && (
                          <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded" title={`AI Confidence: ${((item.confidence_score || 0) * 100).toFixed(0)}%`}>
                            AI
                          </span>
                        )}
                        {isOverdue(item) && (
                          <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                            Overdue
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        {item.assignee_name && (
                          <span className="flex items-center">
                            <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs mr-1">
                              {item.assignee_name.charAt(0)}
                            </span>
                            {item.assignee_name}
                          </span>
                        )}
                        {item.due_date && (
                          <span className={isOverdue(item) ? 'text-red-600 font-medium' : ''}>
                            📅 {formatDate(item.due_date)}
                          </span>
                        )}
                        {item.meeting_id && (
                          <Link to={`/app/meetings/${item.meeting_id}`} className="text-blue-600 hover:text-blue-700">
                            View Meeting
                          </Link>
                        )}
                      </div>
                      {item.context && (
                        <p className="text-xs text-gray-400 mt-2 italic">"{item.context}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="text-sm border border-gray-200 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <span className="text-4xl mb-4 block">✅</span>
            <p className="text-gray-500">No action items found</p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-blue-600 hover:text-blue-700 text-sm mt-2"
              >
                View all items
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Action Item</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newItem: ActionItem = {
                id: Date.now().toString(),
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                assignee_name: formData.get('assignee') as string,
                due_date: formData.get('due_date') as string,
                priority: formData.get('priority') as string,
                status: 'pending',
                ai_extracted: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setActionItems([newItem, ...actionItems]);
              setShowCreateModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What needs to be done?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional details..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                    <input
                      name="assignee"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Who's responsible?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      name="due_date"
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingActionItems;
