import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { cn, formatDateTime } from '../../lib/utils';
import type { Alert } from '../../types';

interface AlertListProps {
  alerts: Alert[];
  onMarkRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export default function AlertList({ alerts, onMarkRead, onDismiss }: AlertListProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-amber-500 bg-amber-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Info className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No alerts at this time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Alerts</span>
          <span className="text-sm font-normal text-slate-500">
            {alerts.filter(a => !a.is_read).length} unread
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'p-4 rounded-lg border-l-4 transition-colors',
              getSeverityStyles(alert.severity),
              alert.is_read && 'opacity-60'
            )}
            onClick={() => !alert.is_read && onMarkRead?.(alert.id)}
          >
            <div className="flex items-start gap-3">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">{alert.title}</h4>
                  {onDismiss && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss(alert.id);
                      }}
                      className="p-1 hover:bg-white/50 rounded"
                    >
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {formatDateTime(alert.created_at)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
