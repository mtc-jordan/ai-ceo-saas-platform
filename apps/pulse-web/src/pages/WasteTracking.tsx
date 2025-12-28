import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getWasteItems, createWasteItem, updateWasteItem, getWasteSummary, type WasteItem } from '../api/leansixsigma';

const WASTE_TYPES = [
  { id: 'transportation', name: 'Transportation', icon: '🚚', description: 'Unnecessary movement of materials' },
  { id: 'inventory', name: 'Inventory', icon: '📦', description: 'Excess products or materials' },
  { id: 'motion', name: 'Motion', icon: '🏃', description: 'Unnecessary movement of people' },
  { id: 'waiting', name: 'Waiting', icon: '⏳', description: 'Idle time waiting for next step' },
  { id: 'overproduction', name: 'Overproduction', icon: '🏭', description: 'Making more than needed' },
  { id: 'overprocessing', name: 'Over-processing', icon: '⚙️', description: 'More work than required' },
  { id: 'defects', name: 'Defects', icon: '❌', description: 'Products that require rework' },
  { id: 'skills', name: 'Skills (Unused)', icon: '🧠', description: 'Underutilized talent' },
];

const STATUS_COLORS: Record<string, string> = {
  identified: 'bg-red-100 text-red-800',
  analyzing: 'bg-yellow-100 text-yellow-800',
  implementing: 'bg-blue-100 text-blue-800',
  eliminated: 'bg-green-100 text-green-800',
};

export default function WasteTracking() {
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);
  const [summary, setSummary] = useState<Record<string, { count: number; total_cost: number; total_time: number }>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [newWaste, setNewWaste] = useState({
    waste_type: 'defects',
    description: '',
    location: '',
    frequency: 'daily',
    time_impact: 0,
    cost_impact: 0,
    quality_impact: '',
    root_cause: '',
    countermeasure: '',
  });

  useEffect(() => {
    fetchData();
  }, [filterType, filterStatus]);

  const fetchData = async () => {
    try {
      const params: Record<string, string> = {};
      if (filterType) params.waste_type = filterType;
      if (filterStatus) params.status = filterStatus;
      
      const [items, summaryData] = await Promise.all([
        getWasteItems(params),
        getWasteSummary(),
      ]);
      setWasteItems(items);
      setSummary(summaryData);
    } catch (error) {
      // Use fallback data
      setWasteItems([
        {
          id: '1',
          waste_type: 'waiting',
          description: 'Operators waiting for material delivery',
          location: 'Assembly Line A',
          frequency: 'daily',
          time_impact: 45,
          cost_impact: 2500,
          quality_impact: 'None',
          status: 'analyzing',
          root_cause: 'Supplier delivery schedule mismatch',
          identified_date: new Date().toISOString(),
        },
        {
          id: '2',
          waste_type: 'defects',
          description: 'Incorrect labels on packaging',
          location: 'Packaging Department',
          frequency: 'weekly',
          time_impact: 30,
          cost_impact: 1500,
          quality_impact: 'Customer complaints',
          status: 'identified',
          identified_date: new Date().toISOString(),
        },
        {
          id: '3',
          waste_type: 'motion',
          description: 'Workers walking to get tools',
          location: 'Workshop B',
          frequency: 'daily',
          time_impact: 60,
          cost_impact: 3000,
          quality_impact: 'None',
          status: 'eliminated',
          root_cause: 'Tools not organized at workstation',
          countermeasure: '5S implementation with shadow boards',
          identified_date: new Date().toISOString(),
        },
      ]);
      setSummary({
        waiting: { count: 5, total_cost: 12500, total_time: 225 },
        defects: { count: 8, total_cost: 18000, total_time: 240 },
        motion: { count: 3, total_cost: 9000, total_time: 180 },
        overproduction: { count: 2, total_cost: 15000, total_time: 120 },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWaste = async () => {
    try {
      await createWasteItem(newWaste);
      setShowModal(false);
      setNewWaste({
        waste_type: 'defects',
        description: '',
        location: '',
        frequency: 'daily',
        time_impact: 0,
        cost_impact: 0,
        quality_impact: '',
        root_cause: '',
        countermeasure: '',
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create waste item:', error);
    }
  };

  const handleUpdateStatus = async (wasteId: string, newStatus: string) => {
    try {
      await updateWasteItem(wasteId, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Failed to update waste item:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const totalCost = Object.values(summary).reduce((sum, item) => sum + item.total_cost, 0);
  const totalTime = Object.values(summary).reduce((sum, item) => sum + item.total_time, 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Waste Tracking (TIMWOODS)</h1>
            <p className="text-gray-600">Identify and eliminate the 8 wastes</p>
          </div>
          <Button onClick={() => setShowModal(true)}>+ Log Waste</Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Cost Impact</p>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(totalCost)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Time Impact</p>
                <p className="text-3xl font-bold text-orange-600">{totalTime} min/day</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Waste Items</p>
                <p className="text-3xl font-bold text-blue-600">{wasteItems.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TIMWOODS Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Waste by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {WASTE_TYPES.map((type) => {
                const data = summary[type.id] || { count: 0, total_cost: 0, total_time: 0 };
                return (
                  <div
                    key={type.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      filterType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFilterType(filterType === type.id ? '' : type.id)}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <h4 className="font-medium">{type.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{type.description}</p>
                    <div className="text-sm">
                      <span className="font-bold text-blue-600">{data.count}</span> items
                    </div>
                    <div className="text-xs text-red-600">{formatCurrency(data.total_cost)}</div>
                  </div>
                );
              })}
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
                <option value="identified">Identified</option>
                <option value="analyzing">Analyzing</option>
                <option value="implementing">Implementing</option>
                <option value="eliminated">Eliminated</option>
              </select>
              {filterType && (
                <Button variant="outline" size="sm" onClick={() => setFilterType('')}>
                  Clear Filter: {WASTE_TYPES.find(t => t.id === filterType)?.name}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Waste Items List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : wasteItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No waste items logged yet</p>
              <Button onClick={() => setShowModal(true)}>Log Your First Waste Item</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {wasteItems.map((item) => {
              const wasteType = WASTE_TYPES.find(t => t.id === item.waste_type);
              return (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{wasteType?.icon}</span>
                          <span className="font-medium">{wasteType?.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{item.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {item.location && <span>📍 {item.location}</span>}
                          {item.frequency && <span>🔄 {item.frequency}</span>}
                          {item.time_impact && <span>⏱️ {item.time_impact} min</span>}
                          {item.cost_impact && <span>💰 {formatCurrency(item.cost_impact)}</span>}
                        </div>
                        {item.root_cause && (
                          <p className="mt-2 text-sm"><strong>Root Cause:</strong> {item.root_cause}</p>
                        )}
                        {item.countermeasure && (
                          <p className="mt-1 text-sm text-green-700"><strong>Countermeasure:</strong> {item.countermeasure}</p>
                        )}
                      </div>
                      <div>
                        <select
                          className="px-3 py-2 border rounded-lg text-sm"
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        >
                          <option value="identified">Identified</option>
                          <option value="analyzing">Analyzing</option>
                          <option value="implementing">Implementing</option>
                          <option value="eliminated">Eliminated</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Waste Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Log Waste Item</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Waste Type *</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={newWaste.waste_type}
                    onChange={(e) => setNewWaste({ ...newWaste, waste_type: e.target.value })}
                  >
                    {WASTE_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    value={newWaste.description}
                    onChange={(e) => setNewWaste({ ...newWaste, description: e.target.value })}
                    placeholder="Describe the waste observed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <Input
                      value={newWaste.location}
                      onChange={(e) => setNewWaste({ ...newWaste, location: e.target.value })}
                      placeholder="e.g., Assembly Line A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Frequency</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={newWaste.frequency}
                      onChange={(e) => setNewWaste({ ...newWaste, frequency: e.target.value })}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="occasional">Occasional</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Time Impact (min)</label>
                    <Input
                      type="number"
                      value={newWaste.time_impact}
                      onChange={(e) => setNewWaste({ ...newWaste, time_impact: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cost Impact ($)</label>
                    <Input
                      type="number"
                      value={newWaste.cost_impact}
                      onChange={(e) => setNewWaste({ ...newWaste, cost_impact: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Root Cause (if known)</label>
                  <Input
                    value={newWaste.root_cause}
                    onChange={(e) => setNewWaste({ ...newWaste, root_cause: e.target.value })}
                    placeholder="What is causing this waste?"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleCreateWaste} disabled={!newWaste.description}>
                  Log Waste
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
