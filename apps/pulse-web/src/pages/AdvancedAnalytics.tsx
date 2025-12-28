import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  createXBarRChart,
  createIndividualsChart,
  performParetoAnalysis,
  performCapabilityAnalysis,
  predictOEETrend,
  identifyBottlenecks,
  calculateTaktTime,
  exportCapabilityPDF,
  exportCapabilityExcel,
  downloadBlob,
} from '../api/leanAnalytics';
import type {
  XBarRChartResult,
  ParetoResult,
  CapabilityResult,
  OEETrendResult,
  BottleneckResult,
  TaktTimeResult
} from '../api/leanAnalytics';

type AnalysisTab = 'control-charts' | 'pareto' | 'capability' | 'predictive';

export default function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('control-charts');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Control Chart State
  const [chartType, setChartType] = useState<'xbar-r' | 'i-mr'>('xbar-r');
  const [chartName, setChartName] = useState('');
  const [chartData, setChartData] = useState('');
  const [subgroupSize, setSubgroupSize] = useState(5);
  const [chartResult, setChartResult] = useState<XBarRChartResult | null>(null);

  // Pareto State
  const [paretoCategories, setParetoCategories] = useState('');
  const [paretoValues, setParetoValues] = useState('');
  const [paretoResult, setParetoResult] = useState<ParetoResult | null>(null);

  // Capability State
  const [capabilityName, setCapabilityName] = useState('');
  const [capabilityData, setCapabilityData] = useState('');
  const [usl, setUsl] = useState('');
  const [lsl, setLsl] = useState('');
  const [target, setTarget] = useState('');
  const [capabilityResult, setCapabilityResult] = useState<CapabilityResult | null>(null);

  // Predictive State
  const [oeeHistory, setOeeHistory] = useState('');
  const [forecastDays, setForecastDays] = useState(30);
  const [oeeResult, setOeeResult] = useState<OEETrendResult | null>(null);
  const [bottleneckData, setBottleneckData] = useState('');
  const [bottleneckResult, setBottleneckResult] = useState<BottleneckResult | null>(null);
  const [availableTime, setAvailableTime] = useState('');
  const [demandUnits, setDemandUnits] = useState('');
  const [taktResult, setTaktResult] = useState<TaktTimeResult | null>(null);

  const tabs = [
    { id: 'control-charts', label: 'Control Charts', icon: '📊' },
    { id: 'pareto', label: 'Pareto Analysis', icon: '📈' },
    { id: 'capability', label: 'Capability Analysis', icon: '🎯' },
    { id: 'predictive', label: 'Predictive Analytics', icon: '🔮' },
  ];

  const handleControlChartAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const lines = chartData.trim().split('\n');
      
      if (chartType === 'xbar-r') {
        const data = lines.map(line => 
          line.split(',').map(v => parseFloat(v.trim()))
        );
        const result = await createXBarRChart({
          name: chartName || 'Control Chart',
          subgroup_size: subgroupSize,
          data
        });
        setChartResult(result);
      } else {
        const data = lines.map(line => parseFloat(line.trim()));
        const result = await createIndividualsChart({
          name: chartName || 'I-MR Chart',
          data
        });
        setChartResult(result as any);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleParetoAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const categories = paretoCategories.split(',').map(c => c.trim());
      const values = paretoValues.split(',').map(v => parseFloat(v.trim()));
      
      const result = await performParetoAnalysis({ categories, values });
      setParetoResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCapabilityAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = capabilityData.split(',').map(v => parseFloat(v.trim()));
      
      const result = await performCapabilityAnalysis({
        name: capabilityName || 'Capability Study',
        process_name: 'Process',
        characteristic: 'Measurement',
        data,
        usl: parseFloat(usl),
        lsl: parseFloat(lsl),
        target: target ? parseFloat(target) : undefined
      });
      setCapabilityResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOEEPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const history = oeeHistory.split(',').map(v => ({ oee: parseFloat(v.trim()) }));
      const result = await predictOEETrend({ oee_history: history, forecast_days: forecastDays });
      setOeeResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBottleneckAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const lines = bottleneckData.trim().split('\n');
      const process_data = lines.map(line => {
        const [name, cycle_time, takt_time, wait_time, utilization] = line.split(',').map(v => v.trim());
        return {
          name,
          cycle_time: parseFloat(cycle_time),
          takt_time: takt_time ? parseFloat(takt_time) : undefined,
          wait_time: wait_time ? parseFloat(wait_time) : undefined,
          utilization: utilization ? parseFloat(utilization) : undefined
        };
      });
      const result = await identifyBottlenecks({ process_data });
      setBottleneckResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTaktTimeCalculation = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await calculateTaktTime({
        available_time_minutes: parseFloat(availableTime),
        demand_units: parseInt(demandUnits)
      });
      setTaktResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!capabilityResult?.id) return;
    try {
      const blob = await exportCapabilityPDF(capabilityResult.id);
      downloadBlob(blob, `capability_study_${capabilityResult.id}.pdf`);
    } catch (err) {
      setError('Export failed');
    }
  };

  const handleExportExcel = async () => {
    if (!capabilityResult?.id) return;
    try {
      const blob = await exportCapabilityExcel(capabilityResult.id);
      downloadBlob(blob, `capability_study_${capabilityResult.id}.xlsx`);
    } catch (err) {
      setError('Export failed');
    }
  };

  const getCapabilityColor = (cpk: number) => {
    if (cpk >= 1.67) return 'text-green-400';
    if (cpk >= 1.33) return 'text-blue-400';
    if (cpk >= 1.0) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Analytics</h1>
          <p className="text-gray-400">Statistical analysis tools for process improvement</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-700 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AnalysisTab)}
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

      {/* Control Charts Tab */}
      {activeTab === 'control-charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Create Control Chart</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Chart Type</label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as 'xbar-r' | 'i-mr')}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="xbar-r">X-bar and R Chart</option>
                  <option value="i-mr">Individuals and Moving Range (I-MR)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Chart Name</label>
                <input
                  type="text"
                  value={chartName}
                  onChange={(e) => setChartName(e.target.value)}
                  placeholder="Enter chart name"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>

              {chartType === 'xbar-r' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Subgroup Size</label>
                  <input
                    type="number"
                    value={subgroupSize}
                    onChange={(e) => setSubgroupSize(parseInt(e.target.value))}
                    min={2}
                    max={10}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Data {chartType === 'xbar-r' ? '(comma-separated values per line, one subgroup per line)' : '(one value per line)'}
                </label>
                <textarea
                  value={chartData}
                  onChange={(e) => setChartData(e.target.value)}
                  placeholder={chartType === 'xbar-r' 
                    ? "10.2, 10.5, 10.3, 10.4, 10.1\n10.3, 10.4, 10.2, 10.5, 10.3\n..."
                    : "10.2\n10.5\n10.3\n..."}
                  rows={6}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono text-sm"
                />
              </div>

              <Button onClick={handleControlChartAnalysis} disabled={loading}>
                {loading ? 'Analyzing...' : 'Generate Control Chart'}
              </Button>
            </div>
          </Card>

          {chartResult && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Control Chart Results</h2>
              
              <div className="space-y-4">
                <div className={`p-3 rounded ${chartResult.process_stable ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                  <span className={chartResult.process_stable ? 'text-green-400' : 'text-red-400'}>
                    {chartResult.process_stable ? '✓ Process is STABLE' : '⚠ Process is NOT STABLE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded">
                    <h3 className="text-sm text-gray-400 mb-2">X-bar Chart</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-white">UCL: {chartResult.xbar_chart?.ucl?.toFixed(4)}</p>
                      <p className="text-white">CL: {chartResult.xbar_chart?.center_line?.toFixed(4)}</p>
                      <p className="text-white">LCL: {chartResult.xbar_chart?.lcl?.toFixed(4)}</p>
                      {chartResult.xbar_chart?.out_of_control_points?.length > 0 && (
                        <p className="text-red-400">
                          OOC Points: {chartResult.xbar_chart.out_of_control_points.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded">
                    <h3 className="text-sm text-gray-400 mb-2">R Chart</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-white">UCL: {chartResult.r_chart?.ucl?.toFixed(4)}</p>
                      <p className="text-white">CL: {chartResult.r_chart?.center_line?.toFixed(4)}</p>
                      <p className="text-white">LCL: {chartResult.r_chart?.lcl?.toFixed(4)}</p>
                      {chartResult.r_chart?.out_of_control_points?.length > 0 && (
                        <p className="text-red-400">
                          OOC Points: {chartResult.r_chart.out_of_control_points.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {chartResult.patterns_detected?.length > 0 && (
                  <div className="bg-yellow-900/30 p-3 rounded">
                    <h3 className="text-yellow-400 font-medium mb-2">Patterns Detected</h3>
                    {chartResult.patterns_detected.map((pattern, i) => (
                      <p key={i} className="text-yellow-200 text-sm">{pattern.description}</p>
                    ))}
                  </div>
                )}

                <div className="bg-gray-800 p-4 rounded">
                  <h3 className="text-sm text-gray-400 mb-2">Recommendations</h3>
                  <ul className="space-y-1">
                    {chartResult.recommendations?.map((rec, i) => (
                      <li key={i} className="text-sm text-gray-300">• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Pareto Analysis Tab */}
      {activeTab === 'pareto' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Pareto Analysis (80/20 Rule)</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Categories (comma-separated)</label>
                <input
                  type="text"
                  value={paretoCategories}
                  onChange={(e) => setParetoCategories(e.target.value)}
                  placeholder="Defect A, Defect B, Defect C, Defect D"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Values (comma-separated)</label>
                <input
                  type="text"
                  value={paretoValues}
                  onChange={(e) => setParetoValues(e.target.value)}
                  placeholder="45, 30, 15, 10"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>

              <Button onClick={handleParetoAnalysis} disabled={loading}>
                {loading ? 'Analyzing...' : 'Run Pareto Analysis'}
              </Button>
            </div>
          </Card>

          {paretoResult && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Pareto Results</h2>
              
              <div className="space-y-4">
                <div className="bg-blue-900/30 p-3 rounded">
                  <p className="text-blue-300">{paretoResult.recommendation}</p>
                </div>

                <div className="bg-gray-800 p-4 rounded">
                  <h3 className="text-green-400 font-medium mb-2">
                    Vital Few ({paretoResult.vital_few_count} items = {paretoResult.vital_few_percentage}%)
                  </h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400">
                        <th className="text-left py-1">Category</th>
                        <th className="text-right py-1">Value</th>
                        <th className="text-right py-1">%</th>
                        <th className="text-right py-1">Cum %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paretoResult.vital_few.map((item, i) => (
                        <tr key={i} className="text-white">
                          <td className="py-1">{item.category}</td>
                          <td className="text-right py-1">{item.value}</td>
                          <td className="text-right py-1">{item.percentage}%</td>
                          <td className="text-right py-1">{item.cumulative}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {paretoResult.trivial_many.length > 0 && (
                  <div className="bg-gray-800 p-4 rounded">
                    <h3 className="text-gray-400 font-medium mb-2">Trivial Many</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400">
                          <th className="text-left py-1">Category</th>
                          <th className="text-right py-1">Value</th>
                          <th className="text-right py-1">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paretoResult.trivial_many.map((item, i) => (
                          <tr key={i} className="text-gray-300">
                            <td className="py-1">{item.category}</td>
                            <td className="text-right py-1">{item.value}</td>
                            <td className="text-right py-1">{item.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Capability Analysis Tab */}
      {activeTab === 'capability' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Process Capability Analysis</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Study Name</label>
                <input
                  type="text"
                  value={capabilityName}
                  onChange={(e) => setCapabilityName(e.target.value)}
                  placeholder="Enter study name"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">USL</label>
                  <input
                    type="number"
                    value={usl}
                    onChange={(e) => setUsl(e.target.value)}
                    placeholder="Upper Spec"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">LSL</label>
                  <input
                    type="number"
                    value={lsl}
                    onChange={(e) => setLsl(e.target.value)}
                    placeholder="Lower Spec"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Target (optional)</label>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Target"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Measurement Data (comma-separated)</label>
                <textarea
                  value={capabilityData}
                  onChange={(e) => setCapabilityData(e.target.value)}
                  placeholder="10.2, 10.5, 10.3, 10.4, 10.1, 10.3, 10.4, 10.2, 10.5, 10.3..."
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono text-sm"
                />
              </div>

              <Button onClick={handleCapabilityAnalysis} disabled={loading}>
                {loading ? 'Analyzing...' : 'Calculate Capability'}
              </Button>
            </div>
          </Card>

          {capabilityResult && (
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-white">Capability Results</h2>
                <div className="space-x-2">
                  <Button variant="secondary" size="sm" onClick={handleExportPDF}>
                    Export PDF
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleExportExcel}>
                    Export Excel
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded ${
                  capabilityResult.interpretation.cpk_color === 'green' ? 'bg-green-900/30' :
                  capabilityResult.interpretation.cpk_color === 'blue' ? 'bg-blue-900/30' :
                  capabilityResult.interpretation.cpk_color === 'yellow' ? 'bg-yellow-900/30' :
                  'bg-red-900/30'
                }`}>
                  <p className={`text-lg font-bold ${getCapabilityColor(capabilityResult.capability_indices.cpk)}`}>
                    {capabilityResult.interpretation.cpk_rating}
                  </p>
                  <p className="text-gray-300 text-sm">{capabilityResult.interpretation.centering}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded">
                    <h3 className="text-sm text-gray-400 mb-2">Capability Indices</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Cp</span>
                        <span className="text-white font-mono">{capabilityResult.capability_indices.cp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Cpk</span>
                        <span className={`font-mono ${getCapabilityColor(capabilityResult.capability_indices.cpk)}`}>
                          {capabilityResult.capability_indices.cpk}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Cpu</span>
                        <span className="text-white font-mono">{capabilityResult.capability_indices.cpu}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Cpl</span>
                        <span className="text-white font-mono">{capabilityResult.capability_indices.cpl}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded">
                    <h3 className="text-sm text-gray-400 mb-2">Performance</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Sigma Level</span>
                        <span className="text-white font-mono">{capabilityResult.performance.sigma_level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">PPM (Defects)</span>
                        <span className="text-white font-mono">{capabilityResult.performance.ppm_total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Yield</span>
                        <span className="text-white font-mono">{capabilityResult.performance.yield_percent}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded">
                  <h3 className="text-sm text-gray-400 mb-2">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Mean:</span>
                      <span className="text-white ml-2">{capabilityResult.statistics.mean}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Std Dev:</span>
                      <span className="text-white ml-2">{capabilityResult.statistics.std_dev}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Sample Size:</span>
                      <span className="text-white ml-2">{capabilityResult.sample_size}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded">
                  <h3 className="text-sm text-gray-400 mb-2">Recommendations</h3>
                  <ul className="space-y-1">
                    {capabilityResult.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-gray-300">• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Predictive Analytics Tab */}
      {activeTab === 'predictive' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* OEE Trend Prediction */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">OEE Trend Prediction</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Historical OEE Values (comma-separated %)</label>
                <textarea
                  value={oeeHistory}
                  onChange={(e) => setOeeHistory(e.target.value)}
                  placeholder="75, 78, 76, 80, 82, 79, 81, 83, 85, 84..."
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Forecast Days</label>
                <input
                  type="number"
                  value={forecastDays}
                  onChange={(e) => setForecastDays(parseInt(e.target.value))}
                  min={7}
                  max={90}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>

              <Button onClick={handleOEEPrediction} disabled={loading}>
                {loading ? 'Predicting...' : 'Predict OEE Trend'}
              </Button>

              {oeeResult && (
                <div className="mt-4 space-y-3">
                  <div className={`p-3 rounded ${
                    oeeResult.trend.direction === 'improving' ? 'bg-green-900/30' :
                    oeeResult.trend.direction === 'declining' ? 'bg-red-900/30' :
                    'bg-gray-800'
                  }`}>
                    <p className="text-white">
                      Trend: <span className={
                        oeeResult.trend.direction === 'improving' ? 'text-green-400' :
                        oeeResult.trend.direction === 'declining' ? 'text-red-400' :
                        'text-gray-400'
                      }>{oeeResult.trend.direction.toUpperCase()}</span>
                    </p>
                    <p className="text-sm text-gray-300">
                      Current Avg: {oeeResult.current_average}% → 30-day Forecast: {oeeResult.forecast_30_day_oee}%
                    </p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <p className="text-sm text-gray-400">Recommendations:</p>
                    {oeeResult.recommendations.map((rec, i) => (
                      <p key={i} className="text-sm text-gray-300">• {rec}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Bottleneck Analysis */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Bottleneck Analysis</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Process Data (name, cycle_time, takt_time, wait_time, utilization per line)
                </label>
                <textarea
                  value={bottleneckData}
                  onChange={(e) => setBottleneckData(e.target.value)}
                  placeholder="Assembly, 45, 40, 10, 85
Welding, 60, 40, 5, 95
Painting, 30, 40, 15, 70
Inspection, 20, 40, 5, 60"
                  rows={5}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono text-sm"
                />
              </div>

              <Button onClick={handleBottleneckAnalysis} disabled={loading}>
                {loading ? 'Analyzing...' : 'Identify Bottlenecks'}
              </Button>

              {bottleneckResult && (
                <div className="mt-4 space-y-3">
                  {bottleneckResult.primary_bottleneck && (
                    <div className="bg-red-900/30 p-3 rounded">
                      <p className="text-red-400 font-medium">
                        Primary Bottleneck: {bottleneckResult.primary_bottleneck.process}
                      </p>
                      <p className="text-sm text-gray-300">
                        Severity: {bottleneckResult.primary_bottleneck.severity}
                      </p>
                      <ul className="mt-2">
                        {bottleneckResult.primary_bottleneck.reasons.map((reason, i) => (
                          <li key={i} className="text-sm text-gray-300">• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="bg-gray-800 p-3 rounded">
                    <p className="text-sm text-gray-400">Recommendations:</p>
                    {bottleneckResult.recommendations.map((rec, i) => (
                      <p key={i} className="text-sm text-gray-300">• {rec}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Takt Time Calculator */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Takt Time Calculator</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Available Production Time (minutes)</label>
                <input
                  type="number"
                  value={availableTime}
                  onChange={(e) => setAvailableTime(e.target.value)}
                  placeholder="e.g., 480 (8 hours)"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Customer Demand (units)</label>
                <input
                  type="number"
                  value={demandUnits}
                  onChange={(e) => setDemandUnits(e.target.value)}
                  placeholder="e.g., 240"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>

              <Button onClick={handleTaktTimeCalculation} disabled={loading}>
                {loading ? 'Calculating...' : 'Calculate Takt Time'}
              </Button>

              {taktResult && (
                <div className="mt-4 bg-blue-900/30 p-4 rounded">
                  <p className="text-2xl font-bold text-blue-400">
                    {taktResult.takt_time_seconds} seconds
                  </p>
                  <p className="text-gray-300">({taktResult.takt_time_minutes} minutes)</p>
                  <p className="text-sm text-gray-400 mt-2">{taktResult.interpretation}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
