import React, { useState } from 'react';
import {
  TargetIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BuildingIcon,
  UsersIcon,
  UserIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  LinkIcon
} from 'lucide-react';

// Mock alignment data
const mockAlignmentTree = {
  company: {
    id: 1,
    title: "Achieve $2M ARR",
    progress: 85,
    status: "on_track",
    owner: "John Smith",
    children: [
      {
        id: 4,
        title: "Sales: Close $500K in new deals",
        level: "department",
        progress: 88,
        status: "on_track",
        owner: "Mike Johnson",
        children: [
          {
            id: 10,
            title: "Enterprise Team: 20 new accounts",
            level: "team",
            progress: 90,
            status: "on_track",
            owner: "Sarah Chen",
            children: []
          },
          {
            id: 11,
            title: "SMB Team: 100 new accounts",
            level: "team",
            progress: 75,
            status: "on_track",
            owner: "Tom Wilson",
            children: []
          }
        ]
      },
      {
        id: 5,
        title: "Marketing: Generate 200 qualified leads",
        level: "department",
        progress: 72,
        status: "on_track",
        owner: "Emily Davis",
        children: [
          {
            id: 12,
            title: "Content: Publish 20 blog posts",
            level: "team",
            progress: 85,
            status: "on_track",
            owner: "Alex Brown",
            children: []
          },
          {
            id: 13,
            title: "Paid Ads: 500 MQLs from campaigns",
            level: "team",
            progress: 60,
            status: "at_risk",
            owner: "Chris Lee",
            children: []
          }
        ]
      },
      {
        id: 6,
        title: "Customer Success: Reduce churn to 3%",
        level: "department",
        progress: 100,
        status: "completed",
        owner: "Lisa Wang",
        children: []
      }
    ]
  },
  unaligned_goals: [
    {
      id: 20,
      title: "Improve team collaboration",
      level: "team",
      progress: 45,
      status: "at_risk",
      owner: "Various"
    },
    {
      id: 21,
      title: "Upgrade office equipment",
      level: "team",
      progress: 30,
      status: "behind",
      owner: "Operations"
    }
  ]
};

interface GoalNode {
  id: number;
  title: string;
  level?: string;
  progress: number;
  status: string;
  owner?: string;
  children?: GoalNode[];
}

const GoalAlignment: React.FC = () => {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1, 4, 5]));
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  const toggleNode = (id: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-500';
      case 'at_risk': return 'bg-yellow-500';
      case 'behind': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-700 bg-green-100';
      case 'at_risk': return 'text-yellow-700 bg-yellow-100';
      case 'behind': return 'text-red-700 bg-red-100';
      case 'completed': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getLevelIcon = (level?: string) => {
    switch (level) {
      case 'department': return <UsersIcon className="w-4 h-4" />;
      case 'team': return <UserIcon className="w-4 h-4" />;
      default: return <BuildingIcon className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'department': return 'bg-blue-100 text-blue-600';
      case 'team': return 'bg-green-100 text-green-600';
      default: return 'bg-purple-100 text-purple-600';
    }
  };

  const renderGoalNode = (goal: GoalNode, depth: number = 0) => {
    const hasChildren = goal.children && goal.children.length > 0;
    const isExpanded = expandedNodes.has(goal.id);

    return (
      <div key={goal.id} className="relative">
        {/* Connector line */}
        {depth > 0 && (
          <div 
            className="absolute left-0 top-0 w-6 border-l-2 border-b-2 border-gray-300 rounded-bl-lg"
            style={{ height: '24px', marginLeft: `${(depth - 1) * 40 + 20}px` }}
          />
        )}
        
        <div 
          className={`flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors`}
          style={{ marginLeft: `${depth * 40}px` }}
          onClick={() => hasChildren && toggleNode(goal.id)}
        >
          {/* Expand/Collapse */}
          <div className="w-6 flex-shrink-0">
            {hasChildren && (
              isExpanded ? 
                <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : 
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {/* Level Icon */}
          <div className={`p-2 rounded-lg ${getLevelColor(goal.level)}`}>
            {getLevelIcon(goal.level)}
          </div>

          {/* Goal Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 truncate">{goal.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(goal.status)}`}>
                {goal.status.replace('_', ' ')}
              </span>
            </div>
            {goal.owner && (
              <p className="text-sm text-gray-500">Owner: {goal.owner}</p>
            )}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-32">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium">{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`rounded-full h-2 transition-all duration-500 ${getStatusColor(goal.status)}`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {goal.children!.map((child) => renderGoalNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goal Alignment</h1>
          <p className="text-gray-500">Visualize how goals cascade across your organization</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'tree' ? 'bg-white shadow' : 'text-gray-600'}`}
              onClick={() => setViewMode('tree')}
            >
              Tree View
            </button>
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600'}`}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 rounded">
            <BuildingIcon className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-gray-600">Company</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded">
            <UsersIcon className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-gray-600">Department</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-100 rounded">
            <UserIcon className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-gray-600">Team</span>
        </div>
        <div className="border-l border-gray-300 h-6 mx-2" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600">On Track</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-gray-600">At Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-600">Behind</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-600">Completed</span>
        </div>
      </div>

      {/* Alignment Tree */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Aligned Goals</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <LinkIcon className="w-4 h-4" />
            <span>Click to expand/collapse</span>
          </div>
        </div>
        <div className="p-4">
          {renderGoalNode(mockAlignmentTree.company)}
        </div>
      </div>

      {/* Unaligned Goals */}
      {mockAlignmentTree.unaligned_goals.length > 0 && (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="p-5 border-b border-yellow-200 flex items-center gap-2">
            <AlertTriangleIcon className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-yellow-800">Unaligned Goals</h2>
            <span className="text-sm text-yellow-600 ml-2">
              These goals are not connected to any company objective
            </span>
          </div>
          <div className="p-4 space-y-3">
            {mockAlignmentTree.unaligned_goals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-yellow-200">
                <div className={`p-2 rounded-lg ${getLevelColor(goal.level)}`}>
                  {getLevelIcon(goal.level)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{goal.title}</h3>
                  <p className="text-sm text-gray-500">Owner: {goal.owner}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                  <span className="font-medium">{goal.progress}%</span>
                  <button className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    Link to Objective
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
          <div className="text-3xl font-bold text-purple-600">1</div>
          <div className="text-sm text-gray-500">Company Objective</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
          <div className="text-3xl font-bold text-blue-600">3</div>
          <div className="text-sm text-gray-500">Department Goals</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
          <div className="text-3xl font-bold text-green-600">4</div>
          <div className="text-sm text-gray-500">Team Goals</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
          <div className="text-3xl font-bold text-yellow-600">2</div>
          <div className="text-sm text-gray-500">Unaligned Goals</div>
        </div>
      </div>
    </div>
  );
};

export default GoalAlignment;
