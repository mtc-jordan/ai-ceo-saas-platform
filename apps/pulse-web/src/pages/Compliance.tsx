import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getComplianceItems, getComplianceSummary, createComplianceItem } from '../api/governai';

interface ComplianceItem {
  id: string;
  title: string;
  category: string;
  regulation?: string;
  status: string;
  risk_level: string;
  due_date?: string;
  responsible_party?: string;
  last_review_date?: string;
}

interface ComplianceSummary {
  total_items: number;
  compliant: number;
  non_compliant: number;
  pending_review: number;
  remediation: number;
  compliance_rate: number;
  critical_items: number;
  by_category: Record<string, number>;
}

export default function Compliance() {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    category: 'regulatory',
    regulation: '',
    risk_level: 'medium',
    due_date: '',
    responsible_party: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itemsData, summaryData] = await Promise.all([
        getComplianceItems(),
        getComplianceSummary()
      ]);
      setItems(itemsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createComplianceItem({
        ...newItem,
        due_date: newItem.due_date ? new Date(newItem.due_date).toISOString() : undefined
      });
      setShowNewModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-500/20 text-green-400';
      case 'non_compliant': return 'bg-red-500/20 text-red-400';
      case 'pending_review': return 'bg-yellow-500/20 text-yellow-400';
      case 'remediation': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'critical': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.status === filter || item.category === filter);

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
          <h1 className="text-2xl font-bold text-white">Compliance Management</h1>
          <p className="text-gray-400">Track regulatory and governance compliance</p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          + Add Compliance Item
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{summary?.compliant}</p>
            <p className="text-gray-400 text-sm">Compliant</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{summary?.pending_review}</p>
            <p className="text-gray-400 text-sm">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-400">{summary?.remediation}</p>
            <p className="text-gray-400 text-sm">In Remediation</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-700/50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{summary?.non_compliant}</p>
            <p className="text-gray-400 text-sm">Non-Compliant</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">{summary?.compliance_rate}%</p>
            <p className="text-gray-400 text-sm">Compliance Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'compliant', 'pending_review', 'remediation', 'non_compliant'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === status
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Compliance Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:border-purple-500/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getRiskColor(item.risk_level)}`}>
                      {item.risk_level} risk
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {item.category}
                    </span>
                    {item.regulation && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {item.regulation}
                      </span>
                    )}
                    {item.responsible_party && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {item.responsible_party}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {item.due_date && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-400">Due Date</p>
                      <p className={`font-medium ${
                        new Date(item.due_date) < new Date() ? 'text-red-400' : 'text-white'
                      }`}>
                        {formatDate(item.due_date)}
                      </p>
                    </div>
                  )}
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Item Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Add Compliance Item</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <Input
                    value={newItem.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Annual SOX Compliance Audit"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewItem({ ...newItem, category: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="regulatory">Regulatory</option>
                      <option value="governance">Governance</option>
                      <option value="internal">Internal</option>
                      <option value="legal">Legal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Risk Level</label>
                    <select
                      value={newItem.risk_level}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewItem({ ...newItem, risk_level: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Regulation</label>
                  <Input
                    value={newItem.regulation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewItem({ ...newItem, regulation: e.target.value })}
                    placeholder="SOX Section 404, GDPR, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Due Date</label>
                  <Input
                    type="date"
                    value={newItem.due_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewItem({ ...newItem, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Responsible Party</label>
                  <Input
                    value={newItem.responsible_party}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewItem({ ...newItem, responsible_party: e.target.value })}
                    placeholder="Legal & Compliance"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowNewModal(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Add Item</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
