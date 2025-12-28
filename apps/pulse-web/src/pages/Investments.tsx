import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getInvestments, getPortfolioSummary, analyzeInvestment, createInvestment } from '../api/governai';

interface Investment {
  id: string;
  name: string;
  investment_type: string;
  status: string;
  target_company?: string;
  industry?: string;
  investment_amount?: number;
  current_value?: number;
  ownership_percentage?: number;
  expected_irr?: number;
  actual_irr?: number;
  risk_level: string;
  ai_score?: number;
  ai_recommendation?: string;
}

interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  total_return: number;
  active_investments: number;
  pending_investments: number;
  average_irr: number;
  portfolio_by_type: Record<string, number>;
  risk_distribution: Record<string, number>;
}

export default function Investments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    name: '',
    investment_type: 'venture',
    target_company: '',
    industry: '',
    investment_amount: '',
    ownership_percentage: '',
    expected_irr: '',
    risk_level: 'medium'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [investmentsData, portfolioData] = await Promise.all([
        getInvestments(),
        getPortfolioSummary()
      ]);
      setInvestments(investmentsData);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (investment: Investment) => {
    setSelectedInvestment(investment);
    setAnalyzing(true);
    try {
      const result = await analyzeInvestment(investment.id);
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createInvestment({
        name: newInvestment.name,
        investment_type: newInvestment.investment_type,
        target_company: newInvestment.target_company,
        industry: newInvestment.industry,
        investment_amount: parseFloat(newInvestment.investment_amount) || undefined,
        ownership_percentage: parseFloat(newInvestment.ownership_percentage) || undefined,
        expected_irr: parseFloat(newInvestment.expected_irr) || undefined,
        risk_level: newInvestment.risk_level
      });
      setShowNewModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'proposed': return 'bg-blue-500/20 text-blue-400';
      case 'under_review': return 'bg-yellow-500/20 text-yellow-400';
      case 'exited': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
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
          <h1 className="text-2xl font-bold text-white">Investment Portfolio</h1>
          <p className="text-gray-400">Track and analyze investments with AI insights</p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          + New Investment
        </Button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardContent className="p-6">
            <p className="text-gray-400 text-sm">Total Invested</p>
            <p className="text-2xl font-bold text-white mt-1">
              {formatCurrency(portfolio?.total_invested || 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
          <CardContent className="p-6">
            <p className="text-gray-400 text-sm">Current Value</p>
            <p className="text-2xl font-bold text-white mt-1">
              {formatCurrency(portfolio?.current_value || 0)}
            </p>
            <p className="text-green-400 text-sm">+{portfolio?.total_return}% return</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
          <CardContent className="p-6">
            <p className="text-gray-400 text-sm">Active Investments</p>
            <p className="text-2xl font-bold text-white mt-1">{portfolio?.active_investments}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50">
          <CardContent className="p-6">
            <p className="text-gray-400 text-sm">Average IRR</p>
            <p className="text-2xl font-bold text-white mt-1">{portfolio?.average_irr}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Investments List */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">All Investments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-3 font-medium">Investment</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Current Value</th>
                  <th className="pb-3 font-medium">IRR</th>
                  <th className="pb-3 font-medium">Risk</th>
                  <th className="pb-3 font-medium">AI Score</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-800">
                    <td className="py-4">
                      <div>
                        <p className="text-white font-medium">{inv.name}</p>
                        <p className="text-gray-400 text-sm">{inv.industry}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                        {inv.investment_type}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 text-white">
                      {inv.investment_amount ? formatCurrency(inv.investment_amount) : '-'}
                    </td>
                    <td className="py-4 text-white">
                      {inv.current_value ? formatCurrency(inv.current_value) : '-'}
                    </td>
                    <td className="py-4">
                      {inv.actual_irr ? (
                        <span className={inv.actual_irr >= (inv.expected_irr || 0) ? 'text-green-400' : 'text-yellow-400'}>
                          {inv.actual_irr}%
                        </span>
                      ) : (
                        <span className="text-gray-400">{inv.expected_irr}% exp</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs ${getRiskColor(inv.risk_level)}`}>
                        {inv.risk_level}
                      </span>
                    </td>
                    <td className="py-4">
                      {inv.ai_score && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${inv.ai_score}%` }}
                            />
                          </div>
                          <span className="text-white text-sm">{inv.ai_score}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAnalyze(inv)}
                      >
                        Analyze
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Modal */}
      {selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedInvestment.name}</h2>
                  <p className="text-gray-400">AI Investment Analysis</p>
                </div>
                <button 
                  onClick={() => { setSelectedInvestment(null); setAnalysis(null); }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {analyzing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <span className="ml-3 text-gray-400">Analyzing investment...</span>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  {/* Score and Recommendation */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full border-4 border-purple-500 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{analysis.score}</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">AI Score</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-white mb-2">
                        Recommendation: 
                        <span className={`ml-2 ${
                          analysis.recommendation === 'invest' ? 'text-green-400' :
                          analysis.recommendation === 'hold' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {analysis.recommendation?.toUpperCase()}
                        </span>
                      </p>
                      <p className="text-gray-300">{analysis.analysis}</p>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">Risk Assessment</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(analysis.risk_assessment || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-3 bg-gray-800 rounded">
                          <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                          <span className={`font-medium ${getRiskColor(value as string).replace('bg-', 'text-').replace('/20', '')}`}>
                            {(value as string).toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projections */}
                  {analysis.projections && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Value Projections</h3>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="p-3 bg-gray-800 rounded text-center">
                          <p className="text-gray-400 text-sm">Year 1</p>
                          <p className="text-white font-semibold">{formatCurrency(analysis.projections.year_1_value)}</p>
                        </div>
                        <div className="p-3 bg-gray-800 rounded text-center">
                          <p className="text-gray-400 text-sm">Year 3</p>
                          <p className="text-white font-semibold">{formatCurrency(analysis.projections.year_3_value)}</p>
                        </div>
                        <div className="p-3 bg-gray-800 rounded text-center">
                          <p className="text-gray-400 text-sm">Year 5</p>
                          <p className="text-white font-semibold">{formatCurrency(analysis.projections.year_5_value)}</p>
                        </div>
                        <div className="p-3 bg-gray-800 rounded text-center">
                          <p className="text-gray-400 text-sm">Exit Multiple</p>
                          <p className="text-green-400 font-semibold">{analysis.projections.expected_exit_multiple}x</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comparable Deals */}
                  {analysis.comparable_deals && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Comparable Deals</h3>
                      <div className="space-y-2">
                        {analysis.comparable_deals.map((deal: any, i: number) => (
                          <div key={i} className="flex justify-between p-3 bg-gray-800 rounded">
                            <span className="text-white">{deal.company}</span>
                            <span className="text-gray-400">{deal.outcome}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Investment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">New Investment</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Investment Name</label>
                  <Input
                    value={newInvestment.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                    placeholder="TechStart AI"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Type</label>
                    <select
                      value={newInvestment.investment_type}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewInvestment({ ...newInvestment, investment_type: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="venture">Venture Capital</option>
                      <option value="private_equity">Private Equity</option>
                      <option value="real_estate">Real Estate</option>
                      <option value="public_equity">Public Equity</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Risk Level</label>
                    <select
                      value={newInvestment.risk_level}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewInvestment({ ...newInvestment, risk_level: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Target Company</label>
                  <Input
                    value={newInvestment.target_company}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewInvestment({ ...newInvestment, target_company: e.target.value })}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Industry</label>
                  <Input
                    value={newInvestment.industry}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewInvestment({ ...newInvestment, industry: e.target.value })}
                    placeholder="Technology, Healthcare, etc."
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Amount ($)</label>
                    <Input
                      type="number"
                      value={newInvestment.investment_amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewInvestment({ ...newInvestment, investment_amount: e.target.value })}
                      placeholder="1000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Ownership %</label>
                    <Input
                      type="number"
                      value={newInvestment.ownership_percentage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewInvestment({ ...newInvestment, ownership_percentage: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Expected IRR %</label>
                    <Input
                      type="number"
                      value={newInvestment.expected_irr}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setNewInvestment({ ...newInvestment, expected_irr: e.target.value })}
                      placeholder="25"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowNewModal(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Create Investment</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
