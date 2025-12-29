import { useState, useEffect } from 'react';

interface ChartData {
  label: string;
  value: number;
  previousValue?: number;
  color?: string;
}

interface TimeSeriesData {
  date: string;
  value: number;
  predicted?: number;
}

interface InteractiveChartsProps {
  className?: string;
}

export default function InteractiveCharts({ className = '' }: InteractiveChartsProps) {
  const [activeChart, setActiveChart] = useState<'revenue' | 'users' | 'performance' | 'funnel'>('revenue');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animatedValues, setAnimatedValues] = useState<number[]>([]);

  // Revenue time series data
  const revenueData: TimeSeriesData[] = [
    { date: 'Jan', value: 1200000, predicted: 1150000 },
    { date: 'Feb', value: 1350000, predicted: 1280000 },
    { date: 'Mar', value: 1480000, predicted: 1420000 },
    { date: 'Apr', value: 1620000, predicted: 1580000 },
    { date: 'May', value: 1750000, predicted: 1720000 },
    { date: 'Jun', value: 1890000, predicted: 1850000 },
    { date: 'Jul', value: 2050000, predicted: 2000000 },
    { date: 'Aug', value: 2180000, predicted: 2150000 },
    { date: 'Sep', value: 2320000, predicted: 2280000 },
    { date: 'Oct', value: 2400000, predicted: 2380000 },
    { date: 'Nov', value: 2520000, predicted: 2500000 },
    { date: 'Dec', value: 2680000, predicted: 2650000 },
  ];

  // User growth data
  const userGrowthData: TimeSeriesData[] = [
    { date: 'Jan', value: 5200 },
    { date: 'Feb', value: 5800 },
    { date: 'Mar', value: 6500 },
    { date: 'Apr', value: 7200 },
    { date: 'May', value: 8100 },
    { date: 'Jun', value: 9000 },
    { date: 'Jul', value: 9800 },
    { date: 'Aug', value: 10500 },
    { date: 'Sep', value: 11200 },
    { date: 'Oct', value: 12000 },
    { date: 'Nov', value: 12800 },
    { date: 'Dec', value: 13500 },
  ];

  // Performance metrics
  const performanceData: ChartData[] = [
    { label: 'Revenue Growth', value: 87, previousValue: 72, color: 'from-green-500 to-emerald-500' },
    { label: 'Customer Retention', value: 94, previousValue: 91, color: 'from-blue-500 to-cyan-500' },
    { label: 'NPS Score', value: 72, previousValue: 68, color: 'from-purple-500 to-indigo-500' },
    { label: 'OEE Score', value: 85, previousValue: 82, color: 'from-amber-500 to-orange-500' },
    { label: 'Employee Satisfaction', value: 78, previousValue: 75, color: 'from-pink-500 to-rose-500' },
  ];

  // Funnel data
  const funnelData: ChartData[] = [
    { label: 'Visitors', value: 50000, color: 'bg-indigo-500' },
    { label: 'Sign Ups', value: 12500, color: 'bg-purple-500' },
    { label: 'Activated', value: 8750, color: 'bg-cyan-500' },
    { label: 'Converted', value: 4375, color: 'bg-green-500' },
    { label: 'Retained', value: 3500, color: 'bg-emerald-500' },
  ];

  // Animate values on mount
  useEffect(() => {
    const targetValues = performanceData.map(d => d.value);
    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      setAnimatedValues(targetValues.map(v => Math.round(v * easedProgress)));
      
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const maxRevenue = Math.max(...revenueData.map(d => d.value));
  const maxUsers = Math.max(...userGrowthData.map(d => d.value));
  const maxFunnel = Math.max(...funnelData.map(d => d.value));

  return (
    <div className={`bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <span>📊</span>
          <span>Analytics Dashboard</span>
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Chart Type Tabs */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'revenue', label: '💰 Revenue', icon: '💰' },
          { id: 'users', label: '👥 Users', icon: '👥' },
          { id: 'performance', label: '⚡ Performance', icon: '⚡' },
          { id: 'funnel', label: '🔄 Funnel', icon: '🔄' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveChart(tab.id as typeof activeChart)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeChart === tab.id
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Revenue Chart */}
      {activeChart === 'revenue' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm">Total Revenue (YTD)</p>
              <p className="text-3xl font-bold">{formatCurrency(revenueData.reduce((sum, d) => sum + d.value, 0))}</p>
            </div>
            <div className="text-right">
              <p className="text-green-400 text-sm">+23.5% vs last year</p>
              <p className="text-slate-500 text-xs">On track to exceed target</p>
            </div>
          </div>
          
          {/* Area Chart */}
          <div className="relative h-64 mt-8">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-slate-500">
              <span>{formatCurrency(maxRevenue)}</span>
              <span>{formatCurrency(maxRevenue * 0.75)}</span>
              <span>{formatCurrency(maxRevenue * 0.5)}</span>
              <span>{formatCurrency(maxRevenue * 0.25)}</span>
              <span>$0</span>
            </div>
            
            {/* Chart Area */}
            <div className="ml-16 h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="border-t border-slate-800/50"></div>
                ))}
              </div>
              
              {/* Bars */}
              <div className="absolute inset-0 flex items-end justify-between px-2 pb-8">
                {revenueData.map((data, index) => (
                  <div
                    key={index}
                    className="flex-1 mx-1 relative group"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Predicted bar (background) */}
                    {data.predicted && (
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-slate-700/30 rounded-t transition-all"
                        style={{ height: `${(data.predicted / maxRevenue) * 100}%` }}
                      ></div>
                    )}
                    {/* Actual bar */}
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all hover:from-indigo-500 hover:to-indigo-300"
                      style={{ height: `${(data.value / maxRevenue) * 100}%` }}
                    ></div>
                    
                    {/* Tooltip */}
                    {hoveredIndex === index && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 rounded-lg shadow-xl z-10 whitespace-nowrap">
                        <p className="text-xs text-slate-400">{data.date}</p>
                        <p className="font-semibold">{formatCurrency(data.value)}</p>
                        {data.predicted && (
                          <p className="text-xs text-slate-500">Predicted: {formatCurrency(data.predicted)}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-slate-500">
                {revenueData.map((data, index) => (
                  <span key={index} className="flex-1 text-center">{data.date}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-indigo-500 rounded"></div>
              <span className="text-slate-400">Actual Revenue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-slate-700/50 rounded"></div>
              <span className="text-slate-400">Predicted</span>
            </div>
          </div>
        </div>
      )}

      {/* Users Chart */}
      {activeChart === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm">Total Active Users</p>
              <p className="text-3xl font-bold">{formatNumber(userGrowthData[userGrowthData.length - 1].value)}</p>
            </div>
            <div className="text-right">
              <p className="text-green-400 text-sm">+159% growth YoY</p>
              <p className="text-slate-500 text-xs">Accelerating growth rate</p>
            </div>
          </div>
          
          {/* Line Chart */}
          <div className="relative h-64 mt-8">
            <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-slate-500">
              <span>{formatNumber(maxUsers)}</span>
              <span>{formatNumber(maxUsers * 0.75)}</span>
              <span>{formatNumber(maxUsers * 0.5)}</span>
              <span>{formatNumber(maxUsers * 0.25)}</span>
              <span>0</span>
            </div>
            
            <div className="ml-16 h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="border-t border-slate-800/50"></div>
                ))}
              </div>
              
              {/* SVG Line Chart */}
              <svg className="absolute inset-0 w-full h-[calc(100%-32px)]" preserveAspectRatio="none">
                {/* Gradient fill */}
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Area */}
                <path
                  d={`M 0 ${100 - (userGrowthData[0].value / maxUsers) * 100}% 
                      ${userGrowthData.map((d, i) => 
                        `L ${(i / (userGrowthData.length - 1)) * 100}% ${100 - (d.value / maxUsers) * 100}%`
                      ).join(' ')} 
                      L 100% 100% L 0 100% Z`}
                  fill="url(#userGradient)"
                />
                
                {/* Line */}
                <path
                  d={`M ${userGrowthData.map((d, i) => 
                    `${(i / (userGrowthData.length - 1)) * 100}% ${100 - (d.value / maxUsers) * 100}%`
                  ).join(' L ')}`}
                  fill="none"
                  stroke="rgb(34, 211, 238)"
                  strokeWidth="2"
                />
                
                {/* Data points */}
                {userGrowthData.map((d, i) => (
                  <circle
                    key={i}
                    cx={`${(i / (userGrowthData.length - 1)) * 100}%`}
                    cy={`${100 - (d.value / maxUsers) * 100}%`}
                    r="4"
                    fill="rgb(34, 211, 238)"
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                ))}
              </svg>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-500">
                {userGrowthData.map((data, index) => (
                  <span key={index}>{data.date}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Chart */}
      {activeChart === 'performance' && (
        <div>
          <div className="mb-6">
            <p className="text-slate-400 text-sm">Key Performance Indicators</p>
            <p className="text-lg">All metrics showing positive momentum</p>
          </div>
          
          <div className="space-y-6">
            {performanceData.map((metric, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">{animatedValues[index] || 0}%</span>
                    {metric.previousValue && (
                      <span className={`text-xs ${metric.value > metric.previousValue ? 'text-green-400' : 'text-red-400'}`}>
                        {metric.value > metric.previousValue ? '+' : ''}{metric.value - metric.previousValue}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${metric.color} transition-all duration-1000`}
                    style={{ width: `${animatedValues[index] || 0}%` }}
                  ></div>
                </div>
                {metric.previousValue && (
                  <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                    <span>Previous: {metric.previousValue}%</span>
                    <span>Target: 90%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Funnel Chart */}
      {activeChart === 'funnel' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-400 text-sm">Conversion Funnel</p>
              <p className="text-lg">Overall conversion: <span className="font-bold text-green-400">7%</span></p>
            </div>
          </div>
          
          <div className="space-y-3">
            {funnelData.map((stage, index) => {
              const width = (stage.value / maxFunnel) * 100;
              const conversionRate = index > 0 
                ? ((stage.value / funnelData[index - 1].value) * 100).toFixed(1)
                : '100';
              
              return (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{stage.label}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-slate-400">{formatNumber(stage.value)}</span>
                      {index > 0 && (
                        <span className="text-xs text-cyan-400">{conversionRate}% →</span>
                      )}
                    </div>
                  </div>
                  <div className="h-10 bg-slate-800 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full ${stage.color} rounded-lg transition-all duration-1000 flex items-center justify-end pr-3`}
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-xs font-medium text-white/80">{width.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Funnel Insights */}
          <div className="mt-6 p-4 bg-slate-800/30 rounded-xl">
            <h4 className="font-medium mb-2 flex items-center space-x-2">
              <span>💡</span>
              <span>Funnel Insights</span>
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start space-x-2">
                <span className="text-green-400">•</span>
                <span>Sign-up to activation rate (70%) is above industry average</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-amber-400">•</span>
                <span>Visitor to sign-up conversion (25%) has room for improvement</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400">•</span>
                <span>Retention rate (80%) indicates strong product-market fit</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
