import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getProjects, createProject, advanceProjectPhase, type DMAICProject } from '../api/leansixsigma';

const PHASE_COLORS: Record<string, string> = {
  define: 'bg-blue-100 text-blue-800',
  measure: 'bg-yellow-100 text-yellow-800',
  analyze: 'bg-orange-100 text-orange-800',
  improve: 'bg-green-100 text-green-800',
  control: 'bg-purple-100 text-purple-800',
  completed: 'bg-gray-100 text-gray-800',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const BELT_COLORS: Record<string, string> = {
  white: 'bg-gray-200 text-gray-800',
  yellow: 'bg-yellow-400 text-yellow-900',
  green: 'bg-green-500 text-white',
  black: 'bg-gray-900 text-white',
  master_black: 'bg-black text-white',
};

export default function DMAICProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DMAICProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterPhase, setFilterPhase] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    problem_statement: '',
    goal_statement: '',
    business_case: '',
    priority: 'medium',
    belt_level: 'green',
    metric_name: '',
    metric_unit: '',
    baseline_metric: 0,
    target_metric: 0,
    estimated_savings: 0,
  });

  useEffect(() => {
    fetchProjects();
  }, [filterPhase, filterStatus]);

  const fetchProjects = async () => {
    try {
      const params: Record<string, string> = {};
      if (filterPhase) params.phase = filterPhase;
      if (filterStatus) params.status = filterStatus;
      const data = await getProjects(params);
      setProjects(data);
    } catch (error) {
      // Use fallback data
      setProjects([
        {
          id: '1',
          name: 'Reduce Customer Complaint Resolution Time',
          description: 'Improve customer service response time',
          problem_statement: 'Current average resolution time is 48 hours',
          goal_statement: 'Reduce resolution time to under 24 hours',
          business_case: 'Improve customer satisfaction and retention',
          current_phase: 'measure',
          priority: 'high',
          belt_level: 'green',
          team_members: [],
          in_scope: [],
          out_of_scope: [],
          estimated_savings: 150000,
          actual_savings: 0,
          implementation_cost: 0,
          status: 'active',
          completion_percentage: 25,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Manufacturing Defect Reduction',
          description: 'Reduce defect rate in production line A',
          problem_statement: 'Current defect rate is 3.5%',
          goal_statement: 'Achieve defect rate below 1%',
          business_case: 'Reduce waste and improve quality',
          current_phase: 'analyze',
          priority: 'critical',
          belt_level: 'black',
          team_members: [],
          in_scope: [],
          out_of_scope: [],
          estimated_savings: 500000,
          actual_savings: 0,
          implementation_cost: 0,
          status: 'active',
          completion_percentage: 45,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      await createProject(newProject);
      setShowModal(false);
      setNewProject({
        name: '',
        description: '',
        problem_statement: '',
        goal_statement: '',
        business_case: '',
        priority: 'medium',
        belt_level: 'green',
        metric_name: '',
        metric_unit: '',
        baseline_metric: 0,
        target_metric: 0,
        estimated_savings: 0,
      });
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleAdvancePhase = async (projectId: string) => {
    try {
      await advanceProjectPhase(projectId);
      fetchProjects();
    } catch (error) {
      console.error('Failed to advance phase:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DMAIC Projects</h1>
            <p className="text-gray-600">Define, Measure, Analyze, Improve, Control</p>
          </div>
          <Button onClick={() => setShowModal(true)}>+ New Project</Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <select
                className="px-3 py-2 border rounded-lg"
                value={filterPhase}
                onChange={(e) => setFilterPhase(e.target.value)}
              >
                <option value="">All Phases</option>
                <option value="define">Define</option>
                <option value="measure">Measure</option>
                <option value="analyze">Analyze</option>
                <option value="improve">Improve</option>
                <option value="control">Control</option>
                <option value="completed">Completed</option>
              </select>
              <select
                className="px-3 py-2 border rounded-lg"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No DMAIC projects yet</p>
              <Button onClick={() => setShowModal(true)}>Create Your First Project</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{project.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PHASE_COLORS[project.current_phase]}`}>
                          {project.current_phase.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[project.priority]}`}>
                          {project.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${BELT_COLORS[project.belt_level]}`}>
                          {project.belt_level.replace('_', ' ').toUpperCase()} BELT
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{project.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{project.completion_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.completion_percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="flex space-x-6 text-sm">
                        <div>
                          <span className="text-gray-500">Est. Savings:</span>
                          <span className="ml-1 font-medium text-green-600">{formatCurrency(project.estimated_savings)}</span>
                        </div>
                        {project.baseline_metric && (
                          <div>
                            <span className="text-gray-500">Baseline:</span>
                            <span className="ml-1 font-medium">{project.baseline_metric} {project.metric_unit}</span>
                          </div>
                        )}
                        {project.target_metric && (
                          <div>
                            <span className="text-gray-500">Target:</span>
                            <span className="ml-1 font-medium">{project.target_metric} {project.metric_unit}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {project.current_phase !== 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdvancePhase(project.id)}
                        >
                          Advance Phase →
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/app/lean/projects/${project.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Create DMAIC Project</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Name *</label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="e.g., Reduce Customer Complaint Resolution Time"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Brief description of the project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Problem Statement *</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                    value={newProject.problem_statement}
                    onChange={(e) => setNewProject({ ...newProject, problem_statement: e.target.value })}
                    placeholder="What is the problem you're trying to solve?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Goal Statement *</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                    value={newProject.goal_statement}
                    onChange={(e) => setNewProject({ ...newProject, goal_statement: e.target.value })}
                    placeholder="What is the measurable goal?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Business Case</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                    value={newProject.business_case}
                    onChange={(e) => setNewProject({ ...newProject, business_case: e.target.value })}
                    placeholder="Why is this project important?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={newProject.priority}
                      onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Belt Level</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={newProject.belt_level}
                      onChange={(e) => setNewProject({ ...newProject, belt_level: e.target.value })}
                    >
                      <option value="white">White Belt</option>
                      <option value="yellow">Yellow Belt</option>
                      <option value="green">Green Belt</option>
                      <option value="black">Black Belt</option>
                      <option value="master_black">Master Black Belt</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Metric Name</label>
                    <Input
                      value={newProject.metric_name}
                      onChange={(e) => setNewProject({ ...newProject, metric_name: e.target.value })}
                      placeholder="e.g., Resolution Time"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Metric Unit</label>
                    <Input
                      value={newProject.metric_unit}
                      onChange={(e) => setNewProject({ ...newProject, metric_unit: e.target.value })}
                      placeholder="e.g., hours, %, defects"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Baseline</label>
                    <Input
                      type="number"
                      value={newProject.baseline_metric}
                      onChange={(e) => setNewProject({ ...newProject, baseline_metric: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Target</label>
                    <Input
                      type="number"
                      value={newProject.target_metric}
                      onChange={(e) => setNewProject({ ...newProject, target_metric: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Est. Savings ($)</label>
                    <Input
                      type="number"
                      value={newProject.estimated_savings}
                      onChange={(e) => setNewProject({ ...newProject, estimated_savings: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleCreateProject} disabled={!newProject.name || !newProject.problem_statement}>
                  Create Project
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
