import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { cn, formatNumber, formatPercentage } from '../../lib/utils';

interface KPICardProps {
  title: string;
  value: number;
  change?: number;
  changePeriod?: string;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
}

export default function KPICard({
  title,
  value,
  change,
  changePeriod = 'vs last period',
  prefix = '',
  suffix = '',
  icon,
}: KPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const isNeutral = !change || change === 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {prefix}{formatNumber(value)}{suffix}
            </p>
            {change !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                {isPositive && (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
                {isNegative && (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                {isNeutral && (
                  <Minus className="h-4 w-4 text-slate-400" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    isPositive && 'text-green-600',
                    isNegative && 'text-red-600',
                    isNeutral && 'text-slate-500'
                  )}
                >
                  {formatPercentage(change)}
                </span>
                <span className="text-sm text-slate-400">{changePeriod}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
