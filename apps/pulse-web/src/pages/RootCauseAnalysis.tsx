import { useState } from 'react';
import { Search, Plus, FileText, GitBranch, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import type { RootCauseAnalysis as RCAType } from '../api/leansixsigma';
import { createRootCauseAnalysis, getRootCauseAnalyses } from '../api/leansixsigma';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function RootCauseAnalysis() {
  const [showModal, setShowModal] = useState(false);
  const [analysisType, setAnalysisType] = useState<'5whys' | 'fishbone'>('5whys');
  const queryClient = useQueryClient();

  const { data: analyses = [] } = useQuery({
    queryKey: ['root-cause-analyses'],
    queryFn: () => getRootCauseAnalyses(),
  });

  const createMutation = useMutation({
    mutationFn: createRootCauseAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['root-cause-analyses'] });
      setShowModal(false);
    },
  });

  const [newAnalysis, setNewAnalysis] = useState({
    problem_statement: '',
    analysis_type: '5whys' as string,
    five_whys: [
      { why_number: 1, question: 'Why did this happen?', answer: '' },
      { why_number: 2, question: 'Why?', answer: '' },
      { why_number: 3, question: 'Why?', answer: '' },
      { why_number: 4, question: 'Why?', answer: '' },
      { why_number: 5, question: 'Why? (Root Cause)', answer: '' },
    ],
    fishbone_data: {
      man: [{ cause: '', sub_causes: [] as string[] }],
      machine: [{ cause: '', sub_causes: [] as string[] }],
      method: [{ cause: '', sub_causes: [] as string[] }],
      material: [{ cause: '', sub_causes: [] as string[] }],
      measurement: [{ cause: '', sub_causes: [] as string[] }],
      environment: [{ cause: '', sub_causes: [] as string[] }],
    },
    root_causes: [''],
  });

  const handleSubmit = () => {
    createMutation.mutate({
      problem_statement: newAnalysis.problem_statement,
      analysis_type: analysisType,
      five_whys: analysisType === '5whys' ? newAnalysis.five_whys : [],
      fishbone_data: analysisType === 'fishbone' ? newAnalysis.fishbone_data : {},
      root_causes: newAnalysis.root_causes.filter(rc => rc.trim() !== ''),
    });
  };

  // Fallback data for demo
  const displayAnalyses: RCAType[] = analyses.length > 0 ? analyses : [
    {
      id: '1',
      problem_statement: 'Production line downtime increased by 25% in Q4',
      analysis_type: '5whys',
      five_whys: [
        { why_number: 1, question: 'Why did downtime increase?', answer: 'Machine failures increased' },
        { why_number: 2, question: 'Why did machine failures increase?', answer: 'Preventive maintenance was delayed' },
        { why_number: 3, question: 'Why was maintenance delayed?', answer: 'Maintenance team was understaffed' },
        { why_number: 4, question: 'Why was the team understaffed?', answer: 'Budget cuts reduced headcount' },
        { why_number: 5, question: 'Why were there budget cuts?', answer: 'Cost reduction initiative without impact analysis' },
      ],
      fishbone_data: {},
      root_causes: ['Inadequate impact analysis before cost reduction decisions'],
      verified: true,
      created_at: '2024-01-15',
    },
    {
      id: '2',
      problem_statement: 'Customer complaints about product quality increased',
      analysis_type: 'fishbone',
      five_whys: [],
      fishbone_data: {
        man: [{ cause: 'Insufficient training', sub_causes: ['New operators', 'Process changes'] }],
        machine: [{ cause: 'Equipment wear', sub_causes: ['Aging machinery', 'Calibration drift'] }],
        method: [{ cause: 'Outdated procedures', sub_causes: ['No recent updates', 'Missing steps'] }],
        material: [{ cause: 'Supplier quality issues', sub_causes: ['New supplier', 'Spec changes'] }],
        measurement: [{ cause: 'Inadequate inspection', sub_causes: ['Sampling rate', 'Gauge accuracy'] }],
        environment: [{ cause: 'Temperature variation', sub_causes: ['HVAC issues', 'Seasonal changes'] }],
      },
      root_causes: ['Multiple contributing factors identified - training and equipment are primary'],
      verified: false,
      created_at: '2024-01-10',
    },
  ];

  const fishboneCategories = ['man', 'machine', 'method', 'material', 'measurement', 'environment'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Root Cause Analysis</h1>
          <p className="text-slate-400 mt-1">5 Whys and Fishbone diagram analysis</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Search className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{displayAnalyses.length}</p>
                <p className="text-sm text-slate-400">Total Analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {displayAnalyses.filter(a => a.analysis_type === '5whys').length}
                </p>
                <p className="text-sm text-slate-400">5 Whys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <GitBranch className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {displayAnalyses.filter(a => a.analysis_type === 'fishbone').length}
                </p>
                <p className="text-sm text-slate-400">Fishbone</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {displayAnalyses.filter(a => a.verified).length}
                </p>
                <p className="text-sm text-slate-400">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyses List */}
      <Card>
        <CardHeader>
          <CardTitle>Root Cause Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        analysis.analysis_type === '5whys' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {analysis.analysis_type === '5whys' ? '5 Whys' : 'Fishbone'}
                      </span>
                      {analysis.verified ? (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-500/20 text-yellow-400">
                          Pending Verification
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-medium">{analysis.problem_statement}</h3>
                  </div>
                </div>

                {/* 5 Whys Display */}
                {analysis.analysis_type === '5whys' && analysis.five_whys && analysis.five_whys.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {analysis.five_whys.map((why, idx) => (
                      <div key={idx} className="flex gap-2 text-sm">
                        <span className="text-purple-400 font-medium min-w-[60px]">Why {why.why_number}:</span>
                        <span className="text-slate-300">{why.answer || why.question}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Fishbone Display */}
                {analysis.analysis_type === 'fishbone' && analysis.fishbone_data && Object.keys(analysis.fishbone_data).length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(analysis.fishbone_data).map(([category, causes]) => (
                      <div key={category} className="p-2 bg-slate-700/50 rounded">
                        <p className="text-xs font-medium text-amber-400 uppercase mb-1">{category}</p>
                        {Array.isArray(causes) && causes.map((causeItem, idx) => (
                          <p key={idx} className="text-xs text-slate-300">
                            • {typeof causeItem === 'object' ? causeItem.cause : causeItem}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Root Causes */}
                {analysis.root_causes && analysis.root_causes.length > 0 && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded">
                    <p className="text-xs font-medium text-red-400 uppercase mb-1">Root Cause(s)</p>
                    {analysis.root_causes.map((cause, idx) => (
                      <p key={idx} className="text-sm text-white">• {cause}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Analysis Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">New Root Cause Analysis</h2>

            {/* Analysis Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Analysis Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAnalysisType('5whys')}
                  className={`flex-1 p-3 rounded-lg border ${
                    analysisType === '5whys'
                      ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                      : 'border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <FileText className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-sm">5 Whys</span>
                </button>
                <button
                  onClick={() => setAnalysisType('fishbone')}
                  className={`flex-1 p-3 rounded-lg border ${
                    analysisType === 'fishbone'
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                      : 'border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <GitBranch className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-sm">Fishbone</span>
                </button>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Problem Statement</label>
              <textarea
                value={newAnalysis.problem_statement}
                onChange={(e) => setNewAnalysis({ ...newAnalysis, problem_statement: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                rows={3}
                placeholder="Describe the problem clearly and specifically..."
              />
            </div>

            {/* 5 Whys Form */}
            {analysisType === '5whys' && (
              <div className="mb-4 space-y-3">
                <label className="block text-sm font-medium text-slate-300">5 Whys Analysis</label>
                {newAnalysis.five_whys.map((why, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <span className="text-purple-400 font-medium min-w-[60px] pt-2">Why {why.why_number}:</span>
                    <input
                      type="text"
                      value={why.answer}
                      onChange={(e) => {
                        const updated = [...newAnalysis.five_whys];
                        updated[idx] = { ...updated[idx], answer: e.target.value };
                        setNewAnalysis({ ...newAnalysis, five_whys: updated });
                      }}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder={why.question}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Fishbone Form */}
            {analysisType === 'fishbone' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Fishbone Categories (6M)</label>
                <div className="grid grid-cols-2 gap-3">
                  {fishboneCategories.map((category) => (
                    <div key={category} className="p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-xs font-medium text-amber-400 uppercase mb-2">{category}</p>
                      <input
                        type="text"
                        placeholder={`${category} causes...`}
                        className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                        onChange={(e) => {
                          const updated = { ...newAnalysis.fishbone_data };
                          updated[category as keyof typeof updated] = [{ cause: e.target.value, sub_causes: [] }];
                          setNewAnalysis({ ...newAnalysis, fishbone_data: updated });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Root Cause */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Identified Root Cause(s)</label>
              <input
                type="text"
                value={newAnalysis.root_causes[0]}
                onChange={(e) => setNewAnalysis({ ...newAnalysis, root_causes: [e.target.value] })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                placeholder="Enter the root cause..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Analysis'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
