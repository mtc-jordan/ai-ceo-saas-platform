import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  path: string;
}

const mockResults: SearchResult[] = [
  // Nova Pulse
  { id: '1', title: 'Dashboard', description: 'Main dashboard overview', category: 'Nova Pulse', icon: '📊', path: '/app/dashboard' },
  { id: '2', title: 'AI Insights', description: 'AI-powered business insights', category: 'Nova Pulse', icon: '🤖', path: '/app/ai-insights' },
  { id: '3', title: 'Data Sources', description: 'Manage connected data sources', category: 'Nova Pulse', icon: '🔗', path: '/app/data-sources' },
  
  // Nova Mind
  { id: '4', title: 'Scenarios', description: 'Strategic scenario planning', category: 'Nova Mind', icon: '🎯', path: '/app/athena/scenarios' },
  { id: '5', title: 'Competitors', description: 'Competitor analysis', category: 'Nova Mind', icon: '🏆', path: '/app/athena/competitors' },
  { id: '6', title: 'Market Intelligence', description: 'Market trends and insights', category: 'Nova Mind', icon: '📈', path: '/app/athena/intelligence' },
  
  // Nova Shield
  { id: '7', title: 'Board Meetings', description: 'Board meeting management', category: 'Nova Shield', icon: '👥', path: '/app/governai/meetings' },
  { id: '8', title: 'Compliance', description: 'Compliance tracking', category: 'Nova Shield', icon: '✅', path: '/app/governai/compliance' },
  { id: '9', title: 'ESG Metrics', description: 'ESG reporting and metrics', category: 'Nova Shield', icon: '🌱', path: '/app/governai/esg' },
  
  // Nova Forge
  { id: '10', title: 'DMAIC Projects', description: 'Six Sigma projects', category: 'Nova Forge', icon: '⚙️', path: '/app/lean/dmaic' },
  { id: '11', title: 'OEE Tracking', description: 'Overall Equipment Effectiveness', category: 'Nova Forge', icon: '📉', path: '/app/lean/oee' },
  { id: '12', title: 'Kaizen Events', description: 'Continuous improvement events', category: 'Nova Forge', icon: '🔄', path: '/app/lean/kaizen' },
  
  // Other
  { id: '13', title: 'Settings', description: 'Account and app settings', category: 'Settings', icon: '⚙️', path: '/app/settings' },
  { id: '14', title: 'Billing', description: 'Subscription and billing', category: 'Settings', icon: '💳', path: '/app/billing' },
  { id: '15', title: 'Team', description: 'Team management', category: 'Settings', icon: '👥', path: '/app/team' },
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const filtered = mockResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase()) ||
          result.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setSelectedIndex(0);
    } else {
      setResults(mockResults.slice(0, 6)); // Show recent/popular
    }
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          if (results[selectedIndex]) {
            navigate(results[selectedIndex].path);
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search modal */}
      <div className="relative min-h-screen flex items-start justify-center pt-[15vh] px-4">
        <div className="relative w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-4 p-4 border-b border-slate-700">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search NovaVerse..."
              className="flex-1 bg-transparent text-white text-lg placeholder-gray-400 focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs text-gray-400 bg-slate-700 rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {results.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-gray-400">No results found for "{query}"</p>
                <p className="text-gray-500 text-sm mt-2">
                  Try searching for pages, features, or settings
                </p>
              </div>
            ) : (
              Object.entries(groupedResults).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {category}
                  </div>
                  {items.map((result, index) => {
                    const globalIndex = results.findIndex((r) => r.id === result.id);
                    return (
                      <button
                        key={result.id}
                        onClick={() => {
                          navigate(result.path);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                          globalIndex === selectedIndex
                            ? 'bg-cyan-500/20 text-white'
                            : 'text-gray-300 hover:bg-slate-700'
                        }`}
                      >
                        <span className="text-2xl">{result.icon}</span>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{result.title}</div>
                          <div className="text-sm text-gray-400">
                            {result.description}
                          </div>
                        </div>
                        {globalIndex === selectedIndex && (
                          <kbd className="px-2 py-1 text-xs text-gray-400 bg-slate-700 rounded">
                            ↵
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">↵</kbd>
                to select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded">K</kbd>
              to open
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
