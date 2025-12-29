import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'cosmic';
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const defaultIcon = (
    <svg
      className="w-16 h-16 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  if (variant === 'cosmic') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="relative">
          {/* Cosmic glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl scale-150" />
          
          <div className="relative w-32 h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center border border-slate-700">
            <div className="text-5xl">{icon || '🌌'}</div>
          </div>
          
          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full" />
          </div>
        </div>

        <h3 className="mt-8 text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-gray-400 text-center max-w-sm">{description}</p>

        {action && (
          <button
            onClick={action.onClick}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all shadow-lg shadow-cyan-500/25"
          >
            {action.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
        {icon || defaultIcon}
      </div>

      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-gray-400 text-center max-w-sm">{description}</p>

      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-6 py-2 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export const EmptyStates = {
  NoData: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="📊"
      title="No data yet"
      description="Start by connecting your data sources to see insights here."
      {...props}
    />
  ),
  
  NoResults: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="🔍"
      title="No results found"
      description="Try adjusting your search or filters to find what you're looking for."
      {...props}
    />
  ),
  
  NoNotifications: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="🔔"
      title="All caught up!"
      description="You have no new notifications. We'll let you know when something important happens."
      {...props}
    />
  ),
  
  NoMeetings: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="📅"
      title="No meetings scheduled"
      description="Your calendar is clear. Schedule a meeting to get started."
      {...props}
    />
  ),
  
  NoTasks: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="✅"
      title="No tasks pending"
      description="Great job! You've completed all your tasks."
      {...props}
    />
  ),
  
  NoDocuments: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="📁"
      title="No documents"
      description="Upload or create your first document to get started."
      {...props}
    />
  ),
  
  NoTeamMembers: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="👥"
      title="No team members"
      description="Invite your team to collaborate on NovaVerse."
      {...props}
    />
  ),
  
  Error: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="⚠️"
      title="Something went wrong"
      description="We encountered an error loading this content. Please try again."
      {...props}
    />
  ),
  
  ComingSoon: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon="🚀"
      title="Coming Soon"
      description="This feature is under development. Stay tuned for updates!"
      variant="cosmic"
      {...props}
    />
  ),
};
