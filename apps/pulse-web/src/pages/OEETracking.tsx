import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getOEERecords, createOEERecord, type OEERecord } from '../api/leansixsigma';

const OEE_THRESHOLDS = {
  worldClass: 85,
  good: 70,
  average: 60,
};

export default function OEETracking() {
  const [records, setRecords] = useState<OEERecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [newRecord, setNewRecord] = useState({
    equipment_name: '',
    equipment_id: '',
    shift: 'day',
    planned_production_time: 480,
    actual_run_time: 0,
    ideal_cycle_time: 0,
    total_units_produced: 0,
    good_units: 0,
    downtime_losses: [{ reason: '', duration: 0 }],
  });

  useEffect(() => {
    fetchRecords();
  }, [selectedEquipment]);

  const fetchRecords = async () => {
    try {
      const data = await getOEERecords(selectedEquipment || undefined);
      setRecords(data);
    } catch (error) {
      // Use fallback data
      setRecords([
        {
          id: '1',
          equipment_name: 'CNC Machine 1',
          equipment_id: 'CNC-001',
          record_date: new Date().toISOString().split('T')[0],
          shift: 'day',
          availability: 87.5,
          performance: 92.3,
          quality: 98.1,
          oee: 79.2,
          total_units_produced: 450,
          good_units: 441,
          defective_units: 9,
          downtime_losses: [
            { reason: 'Setup/Changeover', duration: 30 },
            { reason: 'Minor Stops', duration: 15 },
          ],
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          equipment_name: 'Assembly Line A',
          equipment_id: 'ASM-001',
          record_date: new Date().toISOString().split('T')[0],
          shift: 'day',
          availability: 91.2,
          performance: 88.5,
          quality: 96.8,
          oee: 78.1,
          total_units_produced: 1200,
          good_units: 1162,
          defective_units: 38,
          downtime_losses: [
            { reason: 'Material Shortage', duration: 25 },
            { reason: 'Equipment Failure', duration: 10 },
          ],
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          equipment_name: 'Packaging Line 1',
          equipment_id: 'PKG-001',
          record_date: new Date().toISOString().split('T')[0],
          shift: 'night',
          availability: 95.0,
          performance: 94.2,
          quality: 99.1,
          oee: 88.7,
          total_units_produced: 2500,
          good_units: 2478,
          defective_units: 22,
          downtime_losses: [
            { reason: 'Planned Maintenance', duration: 20 },
          ],
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async () => {
    try {
      await createOEERecord(newRecord);
      setShowModal(false);
      setNewRecord({
        equipment_name: '',
        equipment_id: '',
        shift: 'day',
        planned_production_time: 480,
        actual_run_time: 0,
        ideal_cycle_time: 0,
        total_units_produced: 0,
        good_units: 0,
        downtime_losses: [{ reason: '', duration: 0 }],
      });
      fetchRecords();
    } catch (error) {
      console.error('Failed to create OEE record:', error);
    }
  };

  const getOEEColor = (oee: number) => {
    if (oee >= OEE_THRESHOLDS.worldClass) return 'text-green-600';
    if (oee >= OEE_THRESHOLDS.good) return 'text-blue-600';
    if (oee >= OEE_THRESHOLDS.average) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOEEBgColor = (oee: number) => {
    if (oee >= OEE_THRESHOLDS.worldClass) return 'bg-green-100';
    if (oee >= OEE_THRESHOLDS.good) return 'bg-blue-100';
    if (oee >= OEE_THRESHOLDS.average) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getOEELabel = (oee: number) => {
    if (oee >= OEE_THRESHOLDS.worldClass) return 'World Class';
    if (oee >= OEE_THRESHOLDS.good) return 'Good';
    if (oee >= OEE_THRESHOLDS.average) return 'Average';
    return 'Needs Improvement';
  };

  const addDowntimeLoss = () => {
    setNewRecord({
      ...newRecord,
      downtime_losses: [...newRecord.downtime_losses, { reason: '', duration: 0 }],
    });
  };

  const updateDowntimeLoss = (index: number, field: string, value: string | number) => {
    const updated = [...newRecord.downtime_losses];
    updated[index] = { ...updated[index], [field]: value };
    setNewRecord({ ...newRecord, downtime_losses: updated });
  };

  // Calculate averages
  const avgOEE = records.length > 0 ? records.reduce((sum, r) => sum + r.oee, 0) / records.length : 0;
  const avgAvailability = records.length > 0 ? records.reduce((sum, r) => sum + r.availability, 0) / records.length : 0;
  const avgPerformance = records.length > 0 ? records.reduce((sum, r) => sum + r.performance, 0) / records.length : 0;
  const avgQuality = records.length > 0 ? records.reduce((sum, r) => sum + r.quality, 0) / records.length : 0;

  const uniqueEquipment = [...new Set(records.map(r => r.equipment_name))];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">OEE Tracking</h1>
            <p className="text-gray-600">Overall Equipment Effectiveness</p>
          </div>
          <Button onClick={() => setShowModal(true)}>+ Log OEE</Button>
        </div>

        {/* OEE Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={getOEEBgColor(avgOEE)}>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600">Average OEE</p>
              <p className={`text-4xl font-bold ${getOEEColor(avgOEE)}`}>{avgOEE.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">{getOEELabel(avgOEE)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600">Availability</p>
              <p className="text-3xl font-bold text-blue-600">{avgAvailability.toFixed(1)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${avgAvailability}%` }}></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600">Performance</p>
              <p className="text-3xl font-bold text-purple-600">{avgPerformance.toFixed(1)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${avgPerformance}%` }}></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600">Quality</p>
              <p className="text-3xl font-bold text-green-600">{avgQuality.toFixed(1)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${avgQuality}%` }}></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* OEE Formula */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <span className="font-medium">OEE Formula:</span>
              <span className="px-3 py-1 bg-blue-100 rounded">Availability</span>
              <span>×</span>
              <span className="px-3 py-1 bg-purple-100 rounded">Performance</span>
              <span>×</span>
              <span className="px-3 py-1 bg-green-100 rounded">Quality</span>
              <span>=</span>
              <span className="px-3 py-1 bg-gray-100 rounded font-bold">OEE</span>
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <select
                className="px-3 py-2 border rounded-lg"
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
              >
                <option value="">All Equipment</option>
                {uniqueEquipment.map((eq) => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No OEE records yet</p>
              <Button onClick={() => setShowModal(true)}>Log Your First OEE Record</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold">{record.equipment_name}</h3>
                        <span className="text-sm text-gray-500">({record.equipment_id})</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{record.shift} shift</span>
                        <span className="text-sm text-gray-500">{record.record_date}</span>
                      </div>

                      {/* OEE Breakdown */}
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Availability</p>
                          <p className="text-xl font-bold text-blue-600">{record.availability.toFixed(1)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Performance</p>
                          <p className="text-xl font-bold text-purple-600">{record.performance.toFixed(1)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Quality</p>
                          <p className="text-xl font-bold text-green-600">{record.quality.toFixed(1)}%</p>
                        </div>
                        <div className={`text-center p-2 rounded ${getOEEBgColor(record.oee)}`}>
                          <p className="text-xs text-gray-500">OEE</p>
                          <p className={`text-xl font-bold ${getOEEColor(record.oee)}`}>{record.oee.toFixed(1)}%</p>
                        </div>
                      </div>

                      {/* Production Stats */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span>📦 Produced: {record.total_units_produced}</span>
                        <span className="text-green-600">✓ Good: {record.good_units}</span>
                        <span className="text-red-600">✗ Defects: {record.defective_units}</span>
                      </div>

                      {/* Downtime Losses */}
                      {record.downtime_losses && record.downtime_losses.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-1">Downtime Losses:</p>
                          <div className="flex flex-wrap gap-2">
                            {record.downtime_losses.map((loss, idx) => (
                              <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                                {loss.reason}: {loss.duration} min
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create OEE Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Log OEE Record</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Equipment Name *</label>
                    <Input
                      value={newRecord.equipment_name}
                      onChange={(e) => setNewRecord({ ...newRecord, equipment_name: e.target.value })}
                      placeholder="e.g., CNC Machine 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Equipment ID</label>
                    <Input
                      value={newRecord.equipment_id}
                      onChange={(e) => setNewRecord({ ...newRecord, equipment_id: e.target.value })}
                      placeholder="e.g., CNC-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Shift</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={newRecord.shift}
                      onChange={(e) => setNewRecord({ ...newRecord, shift: e.target.value })}
                    >
                      <option value="day">Day</option>
                      <option value="night">Night</option>
                      <option value="swing">Swing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Planned Production Time (min)</label>
                    <Input
                      type="number"
                      value={newRecord.planned_production_time}
                      onChange={(e) => setNewRecord({ ...newRecord, planned_production_time: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Actual Run Time (min)</label>
                    <Input
                      type="number"
                      value={newRecord.actual_run_time}
                      onChange={(e) => setNewRecord({ ...newRecord, actual_run_time: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ideal Cycle Time (sec/unit)</label>
                    <Input
                      type="number"
                      value={newRecord.ideal_cycle_time}
                      onChange={(e) => setNewRecord({ ...newRecord, ideal_cycle_time: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Units Produced</label>
                    <Input
                      type="number"
                      value={newRecord.total_units_produced}
                      onChange={(e) => setNewRecord({ ...newRecord, total_units_produced: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Good Units</label>
                    <Input
                      type="number"
                      value={newRecord.good_units}
                      onChange={(e) => setNewRecord({ ...newRecord, good_units: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Downtime Losses */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Downtime Losses</label>
                    <Button variant="outline" size="sm" onClick={addDowntimeLoss}>+ Add</Button>
                  </div>
                  {newRecord.downtime_losses.map((loss, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2 mb-2">
                      <Input
                        placeholder="Reason"
                        value={loss.reason}
                        onChange={(e) => updateDowntimeLoss(idx, 'reason', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Duration (min)"
                        value={loss.duration}
                        onChange={(e) => updateDowntimeLoss(idx, 'duration', parseFloat(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleCreateRecord} disabled={!newRecord.equipment_name}>
                  Log Record
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
