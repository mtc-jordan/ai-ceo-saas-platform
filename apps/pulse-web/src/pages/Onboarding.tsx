import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to NovaVerse',
    description: 'Your AI-powered command center for executive excellence',
    icon: '🚀',
  },
  {
    id: 2,
    title: 'Connect Your Data',
    description: 'Link your business tools and data sources',
    icon: '🔗',
  },
  {
    id: 3,
    title: 'Set Your Goals',
    description: 'Define OKRs and key metrics to track',
    icon: '🎯',
  },
  {
    id: 4,
    title: 'Explore Your Universe',
    description: 'Discover AI-powered insights and recommendations',
    icon: '✨',
  },
];

const integrations = [
  { name: 'Salesforce', icon: '☁️', connected: false },
  { name: 'HubSpot', icon: '🧡', connected: false },
  { name: 'Slack', icon: '💬', connected: false },
  { name: 'Google Workspace', icon: '📧', connected: false },
  { name: 'Microsoft 365', icon: '📊', connected: false },
  { name: 'Jira', icon: '📋', connected: false },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  const goalOptions = [
    'Increase Revenue',
    'Improve Customer Satisfaction',
    'Reduce Operational Costs',
    'Accelerate Growth',
    'Enhance Team Productivity',
    'Better Decision Making',
  ];

  const toggleIntegration = (name: string) => {
    setSelectedIntegrations((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      localStorage.setItem('onboarding_complete', 'true');
      navigate('/app/dashboard');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_complete', 'true');
    navigate('/app/dashboard');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🌌</div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome, Explorer!</h2>
              <p className="text-gray-400">Let's set up your NovaVerse command center</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corporation"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select your industry</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance & Banking</option>
                <option value="healthcare">Healthcare</option>
                <option value="retail">Retail & E-commerce</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="services">Professional Services</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Team Size
              </label>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select team size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔗</div>
              <h2 className="text-3xl font-bold text-white mb-2">Connect Your Tools</h2>
              <p className="text-gray-400">Select the tools you'd like to integrate</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <button
                  key={integration.name}
                  onClick={() => toggleIntegration(integration.name)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedIntegrations.includes(integration.name)
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className="text-3xl mb-2">{integration.icon}</div>
                  <div className="text-white font-medium">{integration.name}</div>
                  {selectedIntegrations.includes(integration.name) && (
                    <div className="text-cyan-400 text-sm mt-1">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>

            <p className="text-gray-500 text-sm text-center">
              You can always add more integrations later in Settings
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-white mb-2">Set Your Goals</h2>
              <p className="text-gray-400">What do you want to achieve with NovaVerse?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {goalOptions.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    goals.includes(goal)
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className="text-white font-medium">{goal}</div>
                  {goals.includes(goal) && (
                    <div className="text-purple-400 text-sm mt-1">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-3xl font-bold text-white mb-2">You're All Set!</h2>
              <p className="text-gray-400">Your NovaVerse is ready to explore</p>
            </div>

            <div className="bg-slate-700/30 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Your Setup Summary</h3>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Company</span>
                <span className="text-white">{companyName || 'Not set'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Industry</span>
                <span className="text-white">{industry || 'Not set'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Team Size</span>
                <span className="text-white">{teamSize || 'Not set'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Integrations</span>
                <span className="text-white">{selectedIntegrations.length} selected</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Goals</span>
                <span className="text-white">{goals.length} selected</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-6 border border-cyan-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">🤖 AI Tip</h3>
              <p className="text-gray-300 text-sm">
                Based on your setup, we'll personalize your dashboard with relevant KPIs, 
                insights, and recommendations tailored to your industry and goals.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 ${
                  step.id <= currentStep ? 'text-cyan-400' : 'text-gray-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step.id < currentStep
                      ? 'bg-cyan-500 text-white'
                      : step.id === currentStep
                      ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                      : 'bg-slate-700 text-gray-500'
                  }`}
                >
                  {step.id < currentStep ? '✓' : step.id}
                </div>
              </div>
            ))}
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleSkip}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Skip for now
            </button>
            
            <div className="flex gap-4">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-8 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all"
              >
                {currentStep === 4 ? 'Launch NovaVerse' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
