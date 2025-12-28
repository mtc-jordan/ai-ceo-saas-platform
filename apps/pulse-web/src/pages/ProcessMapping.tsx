import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  createSIPOC,
  getSIPOCDiagrams,
  createVSM,
  getVSMs,
  createProcessFlow,
  getProcessFlows,
} from '../api/leanAnalytics';
import type {
  SIPOCDiagram,
  ValueStreamMap,
  ProcessFlowDiagram
} from '../api/leanAnalytics';

type MappingTab = 'sipoc' | 'vsm' | 'process-flow';

export default function ProcessMapping() {
  const [activeTab, setActiveTab] = useState<MappingTab>('sipoc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SIPOC State
  const [sipocs, setSipocs] = useState<SIPOCDiagram[]>([]);
  const [showSipocForm, setShowSipocForm] = useState(false);
  const [sipocName, setSipocName] = useState('');
  const [sipocDescription, setSipocDescription] = useState('');
  const [sipocOwner, setSipocOwner] = useState('');
  const [suppliers, setSuppliers] = useState('');
  const [inputs, setInputs] = useState('');
  const [processSteps, setProcessSteps] = useState('');
  const [outputs, setOutputs] = useState('');
  const [customers, setCustomers] = useState('');
  const [selectedSipoc, setSelectedSipoc] = useState<SIPOCDiagram | null>(null);

  // VSM State
  const [vsms, setVsms] = useState<ValueStreamMap[]>([]);
  const [showVsmForm, setShowVsmForm] = useState(false);
  const [vsmName, setVsmName] = useState('');
  const [vsmDescription, setVsmDescription] = useState('');
  const [productFamily, setProductFamily] = useState('');
  const [customerDemand, setCustomerDemand] = useState('');
  const [vsmSteps, setVsmSteps] = useState('');
  const [selectedVsm, setSelectedVsm] = useState<ValueStreamMap | null>(null);

  // Process Flow State
  const [processFlows, setProcessFlows] = useState<ProcessFlowDiagram[]>([]);
  const [showFlowForm, setShowFlowForm] = useState(false);
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [flowType, setFlowType] = useState('manufacturing');
  const [flowNodes, setFlowNodes] = useState('');
  const [selectedFlow, setSelectedFlow] = useState<ProcessFlowDiagram | null>(null);

  const tabs = [
    { id: 'sipoc', label: 'SIPOC Diagrams', icon: '📋' },
    { id: 'vsm', label: 'Value Stream Maps', icon: '🔄' },
    { id: 'process-flow', label: 'Process Flow', icon: '📊' },
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'sipoc') {
        const data = await getSIPOCDiagrams();
        setSipocs(data);
      } else if (activeTab === 'vsm') {
        const data = await getVSMs();
        setVsms(data);
      } else {
        const data = await getProcessFlows();
        setProcessFlows(data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSipoc = async () => {
    setLoading(true);
    setError(null);
    try {
      const sipocData = {
        name: sipocName,
        description: sipocDescription,
        process_owner: sipocOwner,
        suppliers: suppliers.split('\n').filter(s => s.trim()).map(s => ({ name: s.trim() })),
        inputs: inputs.split('\n').filter(s => s.trim()).map(s => ({ name: s.trim() })),
        process_steps: processSteps.split('\n').filter(s => s.trim()).map((s, i) => ({ 
          step_number: i + 1, 
          name: s.trim() 
        })),
        outputs: outputs.split('\n').filter(s => s.trim()).map(s => ({ name: s.trim() })),
        customers: customers.split('\n').filter(s => s.trim()).map(s => ({ name: s.trim() }))
      };

      await createSIPOC(sipocData);
      setShowSipocForm(false);
      resetSipocForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create SIPOC');
    } finally {
      setLoading(false);
    }
  };

  const resetSipocForm = () => {
    setSipocName('');
    setSipocDescription('');
    setSipocOwner('');
    setSuppliers('');
    setInputs('');
    setProcessSteps('');
    setOutputs('');
    setCustomers('');
  };

  const handleCreateVsm = async () => {
    setLoading(true);
    setError(null);
    try {
      const steps = vsmSteps.split('\n').filter(s => s.trim()).map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          name: parts[0] || '',
          cycle_time: parseFloat(parts[1]) || 0,
          wait_time: parseFloat(parts[2]) || 0,
          value_added: parts[3]?.toLowerCase() === 'true' || parts[3]?.toLowerCase() === 'yes',
          inventory: parseFloat(parts[4]) || 0,
          operators: parseInt(parts[5]) || 1
        };
      });

      const vsmData = {
        name: vsmName,
        description: vsmDescription,
        product_family: productFamily,
        customer_demand: customerDemand ? parseFloat(customerDemand) : undefined,
        process_steps: steps
      };

      await createVSM(vsmData);
      setShowVsmForm(false);
      resetVsmForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create VSM');
    } finally {
      setLoading(false);
    }
  };

  const resetVsmForm = () => {
    setVsmName('');
    setVsmDescription('');
    setProductFamily('');
    setCustomerDemand('');
    setVsmSteps('');
  };

  const handleCreateProcessFlow = async () => {
    setLoading(true);
    setError(null);
    try {
      const nodes = flowNodes.split('\n').filter(s => s.trim()).map((line, i) => {
        const parts = line.split(',').map(p => p.trim());
        return {
          id: `node_${i + 1}`,
          type: parts[0] || 'operation',
          name: parts[1] || '',
          description: parts[2] || '',
          time: parseFloat(parts[3]) || 0,
          distance: parseFloat(parts[4]) || 0,
          value_added: parts[5]?.toLowerCase() === 'true' || parts[5]?.toLowerCase() === 'yes'
        };
      });

      const flowData = {
        name: flowName,
        description: flowDescription,
        process_type: flowType,
        nodes
      };

      await createProcessFlow(flowData);
      setShowFlowForm(false);
      resetFlowForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create process flow');
    } finally {
      setLoading(false);
    }
  };

  const resetFlowForm = () => {
    setFlowName('');
    setFlowDescription('');
    setFlowType('manufacturing');
    setFlowNodes('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Process Mapping</h1>
          <p className="text-gray-400">SIPOC diagrams, Value Stream Maps, and Process Flow analysis</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-700 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as MappingTab);
              setSelectedSipoc(null);
              setSelectedVsm(null);
              setSelectedFlow(null);
            }}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* SIPOC Tab */}
      {activeTab === 'sipoc' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">SIPOC Diagrams</h2>
            <Button onClick={() => setShowSipocForm(true)}>+ Create SIPOC</Button>
          </div>

          {showSipocForm && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create SIPOC Diagram</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Process Name</label>
                    <input
                      type="text"
                      value={sipocName}
                      onChange={(e) => setSipocName(e.target.value)}
                      placeholder="Enter process name"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea
                      value={sipocDescription}
                      onChange={(e) => setSipocDescription(e.target.value)}
                      placeholder="Process description"
                      rows={2}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Process Owner</label>
                    <input
                      type="text"
                      value={sipocOwner}
                      onChange={(e) => setSipocOwner(e.target.value)}
                      placeholder="Owner name"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Suppliers (one per line)</label>
                    <textarea
                      value={suppliers}
                      onChange={(e) => setSuppliers(e.target.value)}
                      placeholder="Supplier 1&#10;Supplier 2&#10;..."
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Inputs (one per line)</label>
                    <textarea
                      value={inputs}
                      onChange={(e) => setInputs(e.target.value)}
                      placeholder="Input 1&#10;Input 2&#10;..."
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Process Steps (one per line)</label>
                    <textarea
                      value={processSteps}
                      onChange={(e) => setProcessSteps(e.target.value)}
                      placeholder="Step 1: Receive order&#10;Step 2: Process order&#10;Step 3: Ship order&#10;..."
                      rows={4}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Outputs (one per line)</label>
                    <textarea
                      value={outputs}
                      onChange={(e) => setOutputs(e.target.value)}
                      placeholder="Output 1&#10;Output 2&#10;..."
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Customers (one per line)</label>
                    <textarea
                      value={customers}
                      onChange={(e) => setCustomers(e.target.value)}
                      placeholder="Customer 1&#10;Customer 2&#10;..."
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateSipoc} disabled={loading}>
                      {loading ? 'Creating...' : 'Create SIPOC'}
                    </Button>
                    <Button variant="secondary" onClick={() => { setShowSipocForm(false); resetSipocForm(); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {selectedSipoc ? (
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedSipoc.name}</h3>
                  <p className="text-gray-400">{selectedSipoc.description}</p>
                </div>
                <Button variant="secondary" onClick={() => setSelectedSipoc(null)}>Back to List</Button>
              </div>

              <div className="mb-4">
                <span className={`text-sm ${getScoreColor(selectedSipoc.analysis?.completeness_score || 0)}`}>
                  Completeness Score: {selectedSipoc.analysis?.completeness_score || 0}%
                </span>
                {selectedSipoc.analysis?.issues?.length > 0 && (
                  <div className="mt-2 bg-yellow-900/30 p-2 rounded">
                    {selectedSipoc.analysis.issues.map((issue, i) => (
                      <p key={i} className="text-sm text-yellow-300">⚠ {issue}</p>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div className="bg-blue-900/30 p-4 rounded">
                  <h4 className="text-blue-400 font-medium mb-2">Suppliers</h4>
                  <ul className="space-y-1">
                    {selectedSipoc.suppliers?.map((s, i) => (
                      <li key={i} className="text-sm text-gray-300">• {s.name}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-green-900/30 p-4 rounded">
                  <h4 className="text-green-400 font-medium mb-2">Inputs</h4>
                  <ul className="space-y-1">
                    {selectedSipoc.inputs?.map((inp, i) => (
                      <li key={i} className="text-sm text-gray-300">• {inp.name}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-purple-900/30 p-4 rounded">
                  <h4 className="text-purple-400 font-medium mb-2">Process</h4>
                  <ol className="space-y-1">
                    {selectedSipoc.process_steps?.map((step, i) => (
                      <li key={i} className="text-sm text-gray-300">{step.step_number}. {step.name}</li>
                    ))}
                  </ol>
                </div>
                <div className="bg-yellow-900/30 p-4 rounded">
                  <h4 className="text-yellow-400 font-medium mb-2">Outputs</h4>
                  <ul className="space-y-1">
                    {selectedSipoc.outputs?.map((out, i) => (
                      <li key={i} className="text-sm text-gray-300">• {out.name}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-900/30 p-4 rounded">
                  <h4 className="text-red-400 font-medium mb-2">Customers</h4>
                  <ul className="space-y-1">
                    {selectedSipoc.customers?.map((c, i) => (
                      <li key={i} className="text-sm text-gray-300">• {c.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sipocs.map(sipoc => (
                <Card 
                  key={sipoc.id} 
                  className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => setSelectedSipoc(sipoc)}
                >
                  <h3 className="text-white font-medium">{sipoc.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{sipoc.description || 'No description'}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className={`text-sm ${getScoreColor(sipoc.analysis?.completeness_score || 0)}`}>
                      {sipoc.analysis?.completeness_score || 0}% Complete
                    </span>
                    <span className="text-xs text-gray-500">
                      {sipoc.process_steps?.length || 0} steps
                    </span>
                  </div>
                </Card>
              ))}
              {sipocs.length === 0 && !loading && (
                <p className="text-gray-400 col-span-3">No SIPOC diagrams yet. Create one to get started.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* VSM Tab */}
      {activeTab === 'vsm' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Value Stream Maps</h2>
            <Button onClick={() => setShowVsmForm(true)}>+ Create VSM</Button>
          </div>

          {showVsmForm && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create Value Stream Map</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">VSM Name</label>
                    <input
                      type="text"
                      value={vsmName}
                      onChange={(e) => setVsmName(e.target.value)}
                      placeholder="Enter VSM name"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea
                      value={vsmDescription}
                      onChange={(e) => setVsmDescription(e.target.value)}
                      placeholder="VSM description"
                      rows={2}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Product Family</label>
                    <input
                      type="text"
                      value={productFamily}
                      onChange={(e) => setProductFamily(e.target.value)}
                      placeholder="Product family name"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Customer Demand (units/day)</label>
                    <input
                      type="number"
                      value={customerDemand}
                      onChange={(e) => setCustomerDemand(e.target.value)}
                      placeholder="e.g., 100"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Process Steps (name, cycle_time, wait_time, value_added, inventory, operators per line)
                    </label>
                    <textarea
                      value={vsmSteps}
                      onChange={(e) => setVsmSteps(e.target.value)}
                      placeholder="Receiving, 30, 60, false, 100, 2&#10;Assembly, 120, 30, true, 50, 4&#10;Testing, 45, 15, true, 20, 1&#10;Shipping, 20, 120, false, 30, 2"
                      rows={8}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono text-sm"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateVsm} disabled={loading}>
                      {loading ? 'Creating...' : 'Create VSM'}
                    </Button>
                    <Button variant="secondary" onClick={() => { setShowVsmForm(false); resetVsmForm(); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {selectedVsm ? (
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedVsm.name}</h3>
                  <p className="text-gray-400">{selectedVsm.description}</p>
                </div>
                <Button variant="secondary" onClick={() => setSelectedVsm(null)}>Back to List</Button>
              </div>

              {/* Metrics Summary */}
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-gray-800 p-3 rounded text-center">
                  <p className="text-2xl font-bold text-white">{selectedVsm.current_state?.metrics?.total_lead_time || 0}</p>
                  <p className="text-xs text-gray-400">Lead Time (s)</p>
                </div>
                <div className="bg-gray-800 p-3 rounded text-center">
                  <p className="text-2xl font-bold text-white">{selectedVsm.current_state?.metrics?.total_cycle_time || 0}</p>
                  <p className="text-xs text-gray-400">Cycle Time (s)</p>
                </div>
                <div className="bg-gray-800 p-3 rounded text-center">
                  <p className="text-2xl font-bold text-white">{selectedVsm.current_state?.metrics?.total_wait_time || 0}</p>
                  <p className="text-xs text-gray-400">Wait Time (s)</p>
                </div>
                <div className="bg-gray-800 p-3 rounded text-center">
                  <p className="text-2xl font-bold text-green-400">{selectedVsm.current_state?.metrics?.value_added_time || 0}</p>
                  <p className="text-xs text-gray-400">VA Time (s)</p>
                </div>
                <div className="bg-gray-800 p-3 rounded text-center">
                  <p className="text-2xl font-bold text-red-400">{selectedVsm.current_state?.metrics?.non_value_added_time || 0}</p>
                  <p className="text-xs text-gray-400">NVA Time (s)</p>
                </div>
                <div className="bg-gray-800 p-3 rounded text-center">
                  <p className={`text-2xl font-bold ${
                    (selectedVsm.current_state?.metrics?.process_cycle_efficiency || 0) >= 25 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {selectedVsm.current_state?.metrics?.process_cycle_efficiency || 0}%
                  </p>
                  <p className="text-xs text-gray-400">PCE</p>
                </div>
              </div>

              {/* Process Steps */}
              <div className="mb-6">
                <h4 className="text-white font-medium mb-3">Process Steps</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left py-2">Step</th>
                        <th className="text-right py-2">Cycle Time</th>
                        <th className="text-right py-2">Wait Time</th>
                        <th className="text-center py-2">Value Added</th>
                        <th className="text-right py-2">Inventory</th>
                        <th className="text-right py-2">Operators</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVsm.current_state?.process_steps?.map((step, i) => (
                        <tr key={i} className="border-b border-gray-800">
                          <td className="py-2 text-white">{step.name}</td>
                          <td className="py-2 text-right text-gray-300">{step.cycle_time}s</td>
                          <td className="py-2 text-right text-gray-300">{step.wait_time || 0}s</td>
                          <td className="py-2 text-center">
                            {step.value_added ? (
                              <span className="text-green-400">✓ VA</span>
                            ) : (
                              <span className="text-red-400">✗ NVA</span>
                            )}
                          </td>
                          <td className="py-2 text-right text-gray-300">{step.inventory || 0}</td>
                          <td className="py-2 text-right text-gray-300">{step.operators || 1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Improvement Opportunities */}
              {selectedVsm.improvement_opportunities?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">Improvement Opportunities</h4>
                  <div className="space-y-2">
                    {selectedVsm.improvement_opportunities.map((opp, i) => (
                      <div key={i} className={`p-3 rounded ${
                        opp.priority === 'high' ? 'bg-red-900/30' : 
                        opp.priority === 'medium' ? 'bg-yellow-900/30' : 'bg-gray-800'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              opp.priority === 'high' ? 'bg-red-600' : 
                              opp.priority === 'medium' ? 'bg-yellow-600' : 'bg-gray-600'
                            } text-white`}>
                              {opp.priority.toUpperCase()}
                            </span>
                            <span className="text-gray-400 text-xs ml-2">{opp.type}</span>
                            {opp.step && <span className="text-gray-400 text-xs ml-2">@ {opp.step}</span>}
                          </div>
                        </div>
                        <p className="text-white mt-2">{opp.description}</p>
                        <p className="text-gray-400 text-sm mt-1">💡 {opp.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vsms.map(vsm => (
                <Card 
                  key={vsm.id} 
                  className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => setSelectedVsm(vsm)}
                >
                  <h3 className="text-white font-medium">{vsm.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{vsm.product_family || 'No product family'}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-800 p-2 rounded">
                      <p className="text-gray-400">Lead Time</p>
                      <p className="text-white font-medium">{vsm.current_state?.metrics?.total_lead_time || 0}s</p>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <p className="text-gray-400">PCE</p>
                      <p className={`font-medium ${
                        (vsm.current_state?.metrics?.process_cycle_efficiency || 0) >= 25 ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {vsm.current_state?.metrics?.process_cycle_efficiency || 0}%
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              {vsms.length === 0 && !loading && (
                <p className="text-gray-400 col-span-3">No Value Stream Maps yet. Create one to get started.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Process Flow Tab */}
      {activeTab === 'process-flow' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Process Flow Diagrams</h2>
            <Button onClick={() => setShowFlowForm(true)}>+ Create Flow</Button>
          </div>

          {showFlowForm && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Create Process Flow Diagram</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Flow Name</label>
                    <input
                      type="text"
                      value={flowName}
                      onChange={(e) => setFlowName(e.target.value)}
                      placeholder="Enter flow name"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea
                      value={flowDescription}
                      onChange={(e) => setFlowDescription(e.target.value)}
                      placeholder="Flow description"
                      rows={2}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Process Type</label>
                    <select
                      value={flowType}
                      onChange={(e) => setFlowType(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="manufacturing">Manufacturing</option>
                      <option value="service">Service</option>
                      <option value="administrative">Administrative</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Nodes (type, name, description, time, distance, value_added per line)
                    </label>
                    <textarea
                      value={flowNodes}
                      onChange={(e) => setFlowNodes(e.target.value)}
                      placeholder="operation, Receive Order, Customer order received, 5, 0, true&#10;transport, Move to Station, , 2, 50, false&#10;operation, Process Order, , 30, 0, true&#10;inspection, Quality Check, , 10, 0, true&#10;delay, Wait for Shipping, , 60, 0, false"
                      rows={8}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Types: operation, transport, inspection, delay, storage, decision
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateProcessFlow} disabled={loading}>
                      {loading ? 'Creating...' : 'Create Flow'}
                    </Button>
                    <Button variant="secondary" onClick={() => { setShowFlowForm(false); resetFlowForm(); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {selectedFlow ? (
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedFlow.name}</h3>
                  <p className="text-gray-400">{selectedFlow.description}</p>
                </div>
                <Button variant="secondary" onClick={() => setSelectedFlow(null)}>Back to List</Button>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
                <div className="bg-blue-900/30 p-3 rounded text-center">
                  <p className="text-xl font-bold text-blue-400">{selectedFlow.summary?.total_operations || 0}</p>
                  <p className="text-xs text-gray-400">Operations</p>
                </div>
                <div className="bg-yellow-900/30 p-3 rounded text-center">
                  <p className="text-xl font-bold text-yellow-400">{selectedFlow.summary?.total_decisions || 0}</p>
                  <p className="text-xs text-gray-400">Decisions</p>
                </div>
                <div className="bg-red-900/30 p-3 rounded text-center">
                  <p className="text-xl font-bold text-red-400">{selectedFlow.summary?.total_delays || 0}</p>
                  <p className="text-xs text-gray-400">Delays</p>
                </div>
                <div className="bg-purple-900/30 p-3 rounded text-center">
                  <p className="text-xl font-bold text-purple-400">{selectedFlow.summary?.total_transports || 0}</p>
                  <p className="text-xs text-gray-400">Transports</p>
                </div>
                <div className="bg-green-900/30 p-3 rounded text-center">
                  <p className="text-xl font-bold text-green-400">{selectedFlow.summary?.total_inspections || 0}</p>
                  <p className="text-xs text-gray-400">Inspections</p>
                </div>
                <div className="bg-gray-800 p-3 rounded text-center">
                  <p className="text-xl font-bold text-gray-300">{selectedFlow.summary?.total_storage || 0}</p>
                  <p className="text-xs text-gray-400">Storage</p>
                </div>
                <div className="bg-gray-800 p-3 rounded text-center">
                  <p className="text-xl font-bold text-white">{selectedFlow.summary?.total_time || 0}</p>
                  <p className="text-xs text-gray-400">Total Time</p>
                </div>
                <div className="bg-gray-800 p-3 rounded text-center">
                  <p className={`text-xl font-bold ${
                    (selectedFlow.summary?.value_added_ratio || 0) >= 50 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {selectedFlow.summary?.value_added_ratio || 0}%
                  </p>
                  <p className="text-xs text-gray-400">VA Ratio</p>
                </div>
              </div>

              {/* Nodes List */}
              <div>
                <h4 className="text-white font-medium mb-3">Process Steps</h4>
                <div className="space-y-2">
                  {selectedFlow.nodes?.map((node, i) => (
                    <div key={i} className={`p-3 rounded flex items-center justify-between ${
                      node.type === 'operation' ? 'bg-blue-900/20' :
                      node.type === 'transport' ? 'bg-purple-900/20' :
                      node.type === 'inspection' ? 'bg-green-900/20' :
                      node.type === 'delay' ? 'bg-red-900/20' :
                      node.type === 'storage' ? 'bg-gray-800' :
                      'bg-yellow-900/20'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {node.type === 'operation' ? '⚙️' :
                           node.type === 'transport' ? '🚚' :
                           node.type === 'inspection' ? '🔍' :
                           node.type === 'delay' ? '⏳' :
                           node.type === 'storage' ? '📦' :
                           '❓'}
                        </span>
                        <div>
                          <p className="text-white font-medium">{node.name}</p>
                          <p className="text-gray-400 text-sm">{node.description || node.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        {node.time !== undefined && (
                          <span className="text-gray-300">{node.time} min</span>
                        )}
                        {node.distance !== undefined && node.distance > 0 && (
                          <span className="text-gray-300">{node.distance} m</span>
                        )}
                        {node.value_added ? (
                          <span className="text-green-400 text-xs px-2 py-1 bg-green-900/30 rounded">VA</span>
                        ) : (
                          <span className="text-red-400 text-xs px-2 py-1 bg-red-900/30 rounded">NVA</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processFlows.map(flow => (
                <Card 
                  key={flow.id} 
                  className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
                  onClick={() => setSelectedFlow(flow)}
                >
                  <h3 className="text-white font-medium">{flow.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{flow.process_type}</p>
                  <div className="mt-3 flex justify-between items-center text-xs">
                    <span className="text-gray-400">{flow.nodes?.length || 0} steps</span>
                    <span className={`${
                      (flow.summary?.value_added_ratio || 0) >= 50 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {flow.summary?.value_added_ratio || 0}% VA
                    </span>
                  </div>
                </Card>
              ))}
              {processFlows.length === 0 && !loading && (
                <p className="text-gray-400 col-span-3">No Process Flow Diagrams yet. Create one to get started.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
