import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getESGMetrics, getESGScores, createESGMetric, generateESGReport } from '../api/governai';

interface ESGMetric {
  id: string;
  category: string;
  metric_name: string;
  current_value?: number;
  target_value?: number;
  unit?: string;
  trend?: string;
  last_updated?: string;
}

interface ESGScores {
  overall_score: number;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  industry_rank: string;
  strengths: string[];
  improvement_areas: string[];
}

export default function ESGMetrics() {
  const [metrics, setMetrics] = useState<ESGMetric[]>([]);
  const [scores, setScores] = useState<ESGScores | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'environmental' | 'social' | 'governance'>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [newMetric, setNewMetric] = useState({
    category: 'environmental',
    metric_name: '',
    current_value: '',
    target_value: '',
    unit: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metricsData, scoresData] = await Promise.all([
        getESGMetrics(),
        getESGScores()
      ]);
      setMetrics(metricsData);
      setScores(scoresData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createESGMetric({
        category: newMetric.category,
        metric_name: newMetric.metric_name,
        current_value: parseFloat(newMetric.current_value) || undefined,
        target_value: parseFloat(newMetric.target_value) || undefined,
        unit: newMetric.unit
      });
      setShowNewModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      await generateESGReport({
        title: 'ESG Report',
        reporting_period: 'Q4 2024',
        report_type: 'quarterly'
      });
      setShowReportModal(false);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'environmental': return 'text-green-400 bg-green-500/20';
      case 'social': return 'text-blue-400 bg-blue-500/20';
      case 'governance': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return <span className="text-green-400">↑</span>;
    if (trend === 'down') return <span className="text-red-400">↓</span>;
    return <span className="text-gray-400">→</span>;
  };

  const filteredMetrics = activeCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === activeCategory);

  const getProgress = (current?: number, target?: number) => {
    if (!current || !target) return 0;
    return Math.min(100, (current / target) * 100);
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
          <h1 className="text-2xl font-bold text-white">ESG Performance</h1>
          <p className="text-gray-400">Environmental, Social, and Governance metrics</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowReportModal(true)}>
            Generate Report
          </Button>
          <Button onClick={() => setShowNewModal(true)}>
            + Add Metric
          </Button>
        </div>
      </div>

      {/* ESG Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Overall Score */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <h3 className="text-gray-400 mb-4">Overall ESG Score</h3>
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#374151" strokeWidth="8" fill="none" />
                <circle 
                  cx="64" cy="64" r="56" 
                  stroke="#8B5CF6" 
                  strokeWidth="8" 
                  fill="none"
                  strokeDasharray={`${(scores?.overall_score || 0) * 3.52} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{scores?.overall_score}</span>
                <span className="text-xs text-gray-400">/ 100</span>
              </div>
            </div>
            <p className="text-purple-400 mt-4">{scores?.industry_rank}</p>
          </CardContent>
        </Card>

        {/* Category Scores */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-6">Category Breakdown</h3>
            <div className="grid grid-cols-3 gap-6">
              {/* Environmental */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 relative">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="35" stroke="#374151" strokeWidth="6" fill="none" />
                    <circle 
                      cx="40" cy="40" r="35" 
                      stroke="#22C55E" 
                      strokeWidth="6" 
                      fill="none"
                      strokeDasharray={`${(scores?.environmental_score || 0) * 2.2} 220`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                    {scores?.environmental_score}
                  </span>
                </div>
                <p className="text-green-400 font-medium">Environmental</p>
                <p className="text-gray-400 text-sm">Carbon, Energy, Waste</p>
              </div>

              {/* Social */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 relative">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="35" stroke="#374151" strokeWidth="6" fill="none" />
                    <circle 
                      cx="40" cy="40" r="35" 
                      stroke="#3B82F6" 
                      strokeWidth="6" 
                      fill="none"
                      strokeDasharray={`${(scores?.social_score || 0) * 2.2} 220`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                    {scores?.social_score}
                  </span>
                </div>
                <p className="text-blue-400 font-medium">Social</p>
                <p className="text-gray-400 text-sm">Diversity, Safety, Community</p>
              </div>

              {/* Governance */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 relative">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="35" stroke="#374151" strokeWidth="6" fill="none" />
                    <circle 
                      cx="40" cy="40" r="35" 
                      stroke="#8B5CF6" 
                      strokeWidth="6" 
                      fill="none"
                      strokeDasharray={`${(scores?.governance_score || 0) * 2.2} 220`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                    {scores?.governance_score}
                  </span>
                </div>
                <p className="text-purple-400 font-medium">Governance</p>
                <p className="text-gray-400 text-sm">Ethics, Board, Risk</p>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-700">
              <div>
                <h4 className="text-green-400 font-medium mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {scores?.strengths.map((s, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-center gap-2">
                      <span className="text-green-400">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-yellow-400 font-medium mb-2">Improvement Areas</h4>
                <ul className="space-y-1">
                  {scores?.improvement_areas.map((s, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-center gap-2">
                      <span className="text-yellow-400">!</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
        {['all', 'environmental', 'social', 'governance'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat as any)}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${
              activeCategory === cat
                ? cat === 'environmental' ? 'bg-green-500/20 text-green-400' :
                  cat === 'social' ? 'bg-blue-500/20 text-blue-400' :
                  cat === 'governance' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(metric.category)}`}>
                    {metric.category}
                  </span>
                  <h3 className="text-white font-semibold mt-2">{metric.metric_name}</h3>
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-bold text-white">{metric.current_value}</span>
                <span className="text-gray-400 text-sm mb-1">{metric.unit}</span>
              </div>

              {metric.target_value && (
                <>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress to target</span>
                    <span className="text-white">{metric.target_value} {metric.unit}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        metric.category === 'environmental' ? 'bg-green-500' :
                        metric.category === 'social' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${getProgress(metric.current_value, metric.target_value)}%` }}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Metric Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Add ESG Metric</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select
                    value={newMetric.category}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewMetric({ ...newMetric, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="environmental">Environmental</option>
                    <option value="social">Social</option>
                    <option value="governance">Governance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Metric Name</label>
                  <Input
                    value={newMetric.metric_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewMetric({ ...newMetric, metric_name: e.target.value })}
                    placeholder="Carbon Emissions"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Current Value</label>
                    <Input
                      type="number"
                      value={newMetric.current_value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewMetric({ ...newMetric, current_value: e.target.value })}
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Target Value</label>
                    <Input
                      type="number"
                      value={newMetric.target_value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewMetric({ ...newMetric, target_value: e.target.value })}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Unit</label>
                    <Input
                      value={newMetric.unit}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewMetric({ ...newMetric, unit: e.target.value })}
                      placeholder="tons CO2"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowNewModal(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Add Metric</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Generate ESG Report</h2>
              <p className="text-gray-400 mb-6">
                Generate a comprehensive ESG report based on your current metrics and performance data.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Report Type</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option value="quarterly">Quarterly Report</option>
                    <option value="annual">Annual Report</option>
                    <option value="custom">Custom Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Reporting Period</label>
                  <Input placeholder="Q4 2024" defaultValue="Q4 2024" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowReportModal(false)}>Cancel</Button>
                <Button onClick={handleGenerateReport} disabled={generatingReport}>
                  {generatingReport ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
