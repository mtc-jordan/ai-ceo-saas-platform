import { Sparkles, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatDate } from '../../lib/utils';
import type { Briefing } from '../../types';

interface BriefingCardProps {
  briefing: Briefing | null;
  isLoading?: boolean;
}

export default function BriefingCard({ briefing, isLoading }: BriefingCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Daily Briefing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!briefing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Daily Briefing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No briefing available yet</p>
            <p className="text-sm mt-1">Connect your data sources to generate AI briefings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Daily Briefing
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            {formatDate(briefing.date)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Highlights */}
        {briefing.highlights && briefing.highlights.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Key Highlights</h4>
            <ul className="space-y-2">
              {briefing.highlights.map((highlight, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></span>
                  {highlight.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full Content */}
        <div className="prose prose-sm prose-slate max-w-none">
          <div
            className="text-slate-600"
            dangerouslySetInnerHTML={{ __html: briefing.content.replace(/\n/g, '<br/>') }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
