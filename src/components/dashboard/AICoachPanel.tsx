import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CoachInsight } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AICoachPanelProps {
  insights: CoachInsight[];
}

export function AICoachPanel({ insights }: AICoachPanelProps) {
  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">🧠 AI Coach</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Start logging workouts to get personalized insights.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">🧠 AI Coach</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.slice(0, 5).map(insight => (
          <div
            key={insight.id}
            className={cn(
              'p-3 rounded-lg text-sm flex items-start gap-2',
              insight.type === 'warning' && 'bg-destructive/10',
              insight.type === 'suggestion' && 'bg-accent/10',
              insight.type === 'positive' && 'bg-primary/10',
            )}
          >
            <span className="text-base shrink-0">{insight.icon}</span>
            <span className="text-foreground/90">{insight.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
