import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  getAIAnalysis,
  getAIRecommendations,
} from '../api/leanAnalytics';
import type { AIAnalysisResult } from '../api/leanAnalytics';

type InsightType = 'dmaic' | 'waste' | 'kaizen' | 'rca' | 'capability';

export default function AIInsights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<InsightType>('dmaic');
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [history, setHistory] = useState<AIAnalysisResult[]>([]);

  // Form states for different analysis types
  const [dmaicData, setDmaicData] = useState({
    name: '',
    current_phase: 'define',
    problem_statement: '',
    goal_statement: '',
    baseline_metrics: '',
    target_metrics: ''
  });

  const [wasteData, setWasteData] = useState('');
  const [kaizenData, setKaizenData] = useState({
    name: '',
    cycle_time: '',
    defect_rate: '',
    oee: '',
    pain_points: ''
  });

  const [rcaData, setRcaData] = useState({
    problem_statement: '',
    when: '',
    where: '',
    impact: ''
  });

  const [capabilityData, setCapabilityData] = useState({
    process_name: '',
    usl: '',
    lsl: '',
    mean: '',
    std_dev: '',
    sample_size: ''
  });

  const insightTypes = [
    { id: 'dmaic', label: 'DMAIC Project Analysis', icon: '📊', description: 'Get AI recommendations for your DMAIC project' },
    { id: 'waste', label: 'Waste Analysis', icon: '🗑️', description: 'Analyze waste data and get reduction strategies' },
    { id: 'kaizen', label: 'Kaizen Suggestions', icon: '💡', description: 'Get Kaizen improvement suggestions for a process' },
    { id: 'rca', label: 'Root Cause Analysis', icon: '🔍', description: 'AI-assisted root cause analysis with 5 Whys and Fishbone' },
    { id: 'capability', label: 'Capability Analysis', icon: '📈', description: 'Interpret process capability metrics' },
  ];

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getAIRecommendations();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let data: Record<string, any> = {};

      switch (selectedType) {
        case 'dmaic':
          data = {
            name: dmaicData.name,
            current_phase: dmaicData.current_phase,
            problem_statement: dmaicData.problem_statement,
            goal_statement: dmaicData.goal_statement,
            baseline_metrics: dmaicData.baseline_metrics ? JSON.parse(dmaicData.baseline_metrics) : {},
            target_metrics: dmaicData.target_metrics ? JSON.parse(dmaicData.target_metrics) : {},
            current_metrics: {}
          };
          break;
        case 'waste':
          const wasteItems = wasteData.split('\n').filter(l => l.trim()).map(line => {
            const [waste_type, description, estimated_cost, frequency] = line.split(',').map(s => s.trim());
            return { waste_type, description, estimated_cost: parseFloat(estimated_cost) || 0, frequency };
          });
          data = { waste_items: wasteItems };
          break;
        case 'kaizen':
          data = {
            name: kaizenData.name,
            cycle_time: parseFloat(kaizenData.cycle_time) || 0,
            defect_rate: parseFloat(kaizenData.defect_rate) || 0,
            oee: parseFloat(kaizenData.oee) || 0,
            pain_points: kaizenData.pain_points
          };
          break;
        case 'rca':
          data = {
            problem_statement: rcaData.problem_statement,
            when: rcaData.when,
            where: rcaData.where,
            impact: rcaData.impact
          };
          break;
        case 'capability':
          data = {
            process_name: capabilityData.process_name,
            usl: parseFloat(capabilityData.usl),
            lsl: parseFloat(capabilityData.lsl),
            mean: parseFloat(capabilityData.mean),
            std_dev: parseFloat(capabilityData.std_dev),
            sample_size: parseInt(capabilityData.sample_size)
          };
          break;
      }

      const response = await getAIAnalysis({
        analysis_type: selectedType,
        data
      });

      setResult(response);
      loadHistory();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (selectedType) {
      case 'dmaic':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Project Name</label>
                <input
                  type="text"
                  value={dmaicData.name}
                  onChange={(e) => setDmaicData({ ...dmaicData, name: e.target.value })}
                  placeholder="Enter project name"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Current Phase</label>
                <select
                  value={dmaicData.current_phase}
                  onChange={(e) => setDmaicData({ ...dmaicData, current_phase: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="define">Define</option>
                  <option value="measure">Measure</option>
                  <option value="analyze">Analyze</option>
                  <option value="improve">Improve</option>
                  <option value="control">Control</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Problem Statement</label>
              <textarea
                value={dmaicData.problem_statement}
                onChange={(e) => setDmaicData({ ...dmaicData, problem_statement: e.target.value })}
                placeholder="Describe the problem you're trying to solve..."
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Goal Statement</label>
              <textarea
                value={dmaicData.goal_statement}
                onChange={(e) => setDmaicData({ ...dmaicData, goal_statement: e.target.value })}
                placeholder="What is your target outcome?"
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Baseline Metrics (JSON)</label>
                <input
                  type="text"
                  value={dmaicData.baseline_metrics}
                  onChange={(e) => setDmaicData({ ...dmaicData, baseline_metrics: e.target.value })}
                  placeholder='{"defect_rate": 5, "cycle_time": 120}'
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Target Metrics (JSON)</label>
                <input
                  type="text"
                  value={dmaicData.target_metrics}
                  onChange={(e) => setDmaicData({ ...dmaicData, target_metrics: e.target.value })}
                  placeholder='{"defect_rate": 1, "cycle_time": 90}'
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono text-sm"
                />
              </div>
            </div>
          </div>
        );

      case 'waste':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Waste Items (waste_type, description, estimated_cost, frequency per line)
              </label>
              <textarea
                value={wasteData}
                onChange={(e) => setWasteData(e.target.value)}
                placeholder="Transportation, Moving parts between buildings, 5000, daily
Inventory, Excess raw materials, 15000, weekly
Waiting, Machine setup delays, 8000, daily
Defects, Rework on assembly line, 12000, daily"
                rows={6}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono text-sm"
              />
            </div>
          </div>
        );

      case 'kaizen':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Process Name</label>
              <input
                type="text"
                value={kaizenData.name}
                onChange={(e) => setKaizenData({ ...kaizenData, name: e.target.value })}
                placeholder="Enter process name"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Cycle Time (min)</label>
                <input
                  type="number"
                  value={kaizenData.cycle_time}
                  onChange={(e) => setKaizenData({ ...kaizenData, cycle_time: e.target.value })}
                  placeholder="e.g., 120"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Defect Rate (%)</label>
                <input
                  type="number"
                  value={kaizenData.defect_rate}
                  onChange={(e) => setKaizenData({ ...kaizenData, defect_rate: e.target.value })}
                  placeholder="e.g., 3.5"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Current OEE (%)</label>
                <input
                  type="number"
                  value={kaizenData.oee}
                  onChange={(e) => setKaizenData({ ...kaizenData, oee: e.target.value })}
                  placeholder="e.g., 72"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Pain Points</label>
              <textarea
                value={kaizenData.pain_points}
                onChange={(e) => setKaizenData({ ...kaizenData, pain_points: e.target.value })}
                placeholder="Describe the main issues and pain points with this process..."
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
        );

      case 'rca':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Problem Statement</label>
              <textarea
                value={rcaData.problem_statement}
                onChange={(e) => setRcaData({ ...rcaData, problem_statement: e.target.value })}
                placeholder="Clearly describe the problem..."
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">When does it occur?</label>
                <input
                  type="text"
                  value={rcaData.when}
                  onChange={(e) => setRcaData({ ...rcaData, when: e.target.value })}
                  placeholder="e.g., During shift change"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Where does it occur?</label>
                <input
                  type="text"
                  value={rcaData.where}
                  onChange={(e) => setRcaData({ ...rcaData, where: e.target.value })}
                  placeholder="e.g., Assembly Line 3"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Impact</label>
                <input
                  type="text"
                  value={rcaData.impact}
                  onChange={(e) => setRcaData({ ...rcaData, impact: e.target.value })}
                  placeholder="e.g., $5000/day, 2hr delay"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        );

      case 'capability':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Process Name</label>
              <input
                type="text"
                value={capabilityData.process_name}
                onChange={(e) => setCapabilityData({ ...capabilityData, process_name: e.target.value })}
                placeholder="Enter process name"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">USL (Upper Spec Limit)</label>
                <input
                  type="number"
                  value={capabilityData.usl}
                  onChange={(e) => setCapabilityData({ ...capabilityData, usl: e.target.value })}
                  placeholder="e.g., 10.5"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">LSL (Lower Spec Limit)</label>
                <input
                  type="number"
                  value={capabilityData.lsl}
                  onChange={(e) => setCapabilityData({ ...capabilityData, lsl: e.target.value })}
                  placeholder="e.g., 9.5"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Mean</label>
                <input
                  type="number"
                  value={capabilityData.mean}
                  onChange={(e) => setCapabilityData({ ...capabilityData, mean: e.target.value })}
                  placeholder="e.g., 10.0"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Standard Deviation</label>
                <input
                  type="number"
                  value={capabilityData.std_dev}
                  onChange={(e) => setCapabilityData({ ...capabilityData, std_dev: e.target.value })}
                  placeholder="e.g., 0.15"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Sample Size</label>
                <input
                  type="number"
                  value={capabilityData.sample_size}
                  onChange={(e) => setCapabilityData({ ...capabilityData, sample_size: e.target.value })}
                  placeholder="e.g., 100"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <Card className="p-6 mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI Analysis Results</h3>
        
        {result.analysis && (
          <div className="bg-gray-800 p-4 rounded mb-4">
            <h4 className="text-blue-400 font-medium mb-2">Analysis</h4>
            <div className="text-gray-300 whitespace-pre-wrap text-sm">{result.analysis}</div>
          </div>
        )}

        {result.recommendations && result.recommendations.length > 0 && (
          <div className="bg-gray-800 p-4 rounded mb-4">
            <h4 className="text-green-400 font-medium mb-2">Recommendations</h4>
            <ul className="space-y-1">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="text-gray-300 text-sm">• {rec}</li>
              ))}
            </ul>
          </div>
        )}

        {result.risk_level && (
          <div className={`inline-block px-3 py-1 rounded text-sm mr-2 ${
            result.risk_level === 'high' ? 'bg-red-900/50 text-red-300' :
            result.risk_level === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
            'bg-green-900/50 text-green-300'
          }`}>
            Risk Level: {result.risk_level.toUpperCase()}
          </div>
        )}

        {result.suggested_tools && result.suggested_tools.length > 0 && (
          <div className="bg-gray-800 p-4 rounded mt-4">
            <h4 className="text-purple-400 font-medium mb-2">Suggested Tools</h4>
            <div className="flex flex-wrap gap-2">
              {result.suggested_tools.map((tool, i) => (
                <span key={i} className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded text-sm">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.suggestions && (
          <div className="bg-gray-800 p-4 rounded mb-4">
            <h4 className="text-yellow-400 font-medium mb-2">Kaizen Suggestions</h4>
            <div className="text-gray-300 whitespace-pre-wrap text-sm">{result.suggestions}</div>
          </div>
        )}

        {result.estimated_improvement && (
          <div className="bg-gray-800 p-4 rounded mt-4">
            <h4 className="text-cyan-400 font-medium mb-2">Estimated Improvements</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.estimated_improvement).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-400">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.suggested_five_whys && (
          <div className="bg-gray-800 p-4 rounded mt-4">
            <h4 className="text-orange-400 font-medium mb-2">5 Whys Template</h4>
            <ol className="space-y-2">
              {result.suggested_five_whys.map((why, i) => (
                <li key={i} className="text-gray-300 text-sm">{i + 1}. {why}</li>
              ))}
            </ol>
          </div>
        )}

        {result.fishbone_categories && (
          <div className="bg-gray-800 p-4 rounded mt-4">
            <h4 className="text-pink-400 font-medium mb-2">Fishbone Categories (6M)</h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(result.fishbone_categories).map(([category, causes]) => (
                <div key={category} className="bg-gray-700/50 p-2 rounded">
                  <p className="text-white font-medium capitalize">{category}</p>
                  <ul className="mt-1">
                    {(causes as string[]).map((cause, i) => (
                      <li key={i} className="text-gray-400 text-xs">• {cause}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.metrics && (
          <div className="bg-gray-800 p-4 rounded mt-4">
            <h4 className="text-teal-400 font-medium mb-2">Calculated Metrics</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(result.metrics).map(([key, value]) => (
                <div key={key} className="text-center">
                  <p className="text-2xl font-bold text-white">{String(value)}</p>
                  <p className="text-gray-400 text-xs">{key.replace(/_/g, ' ').toUpperCase()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">AI-Powered Insights</h1>
          <p className="text-gray-400">Get intelligent recommendations for process improvement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Type Selection */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Analysis Type</h2>
            <div className="space-y-2">
              {insightTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id as InsightType);
                    setResult(null);
                  }}
                  className={`w-full text-left p-3 rounded transition-colors ${
                    selectedType === type.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{type.icon}</span>
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className={`text-xs ${selectedType === type.id ? 'text-blue-200' : 'text-gray-500'}`}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Recent History */}
          {history.length > 0 && (
            <Card className="p-4 mt-4">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Analyses</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.slice(0, 10).map((item, i) => (
                  <div 
                    key={i} 
                    className="bg-gray-800 p-2 rounded text-sm cursor-pointer hover:bg-gray-700"
                    onClick={() => setResult(item)}
                  >
                    <p className="text-white capitalize">{item.analysis_type}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(item.id?.split('_')[0] || '').toLocaleDateString() || 'Recent'}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Analysis Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              {insightTypes.find(t => t.id === selectedType)?.label}
            </h2>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {renderForm()}

            <div className="mt-6">
              <Button onClick={handleAnalysis} disabled={loading} className="w-full">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing with AI...
                  </span>
                ) : (
                  '🤖 Get AI Analysis'
                )}
              </Button>
            </div>

            {renderResult()}
          </Card>
        </div>
      </div>
    </div>
  );
}
