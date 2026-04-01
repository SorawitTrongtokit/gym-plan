import { useState } from 'react';
import { useBodyWeight, useSaveBodyWeightMutation } from '@/hooks/use-body-weight';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Scale, TrendingDown, TrendingUp, Minus, Plus } from 'lucide-react';

export function BodyWeightCard() {
  const { data: entries = [] } = useBodyWeight();
  const { mutate: save, isPending } = useSaveBodyWeightMutation();
  const [weight, setWeight] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const latest = entries[0];
  const previous = entries[1];
  const diff = latest && previous ? latest.body_weight - previous.body_weight : null;

  const chartData = [...entries]
    .reverse()
    .slice(-30)
    .map(e => ({
      date: new Date(e.measured_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: e.body_weight,
    }));

  const avgWeight = entries.length > 0
    ? entries.slice(0, 7).reduce((s, e) => s + e.body_weight, 0) / Math.min(7, entries.length)
    : 0;

  const handleSave = () => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return;
    save({ body_weight: w, measured_on: new Date().toISOString().split('T')[0] });
    setWeight('');
    setIsOpen(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            Body Weight
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Plus className="h-3 w-3" />
            Log
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quick entry */}
        {isOpen && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
            <Input
              type="number"
              step="0.1"
              placeholder="kg"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="h-8 w-24 text-center text-sm bg-background"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <span className="text-xs text-muted-foreground">kg</span>
            <Button size="sm" className="h-8 ml-auto" onClick={handleSave} disabled={isPending}>
              Save
            </Button>
          </div>
        )}

        {/* Current weight */}
        {latest ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{latest.body_weight}<span className="text-sm text-muted-foreground ml-1">kg</span></p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(latest.measured_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {diff !== null && diff !== 0 && (
                <Badge variant={diff > 0 ? 'secondary' : 'outline'} className="text-xs gap-1">
                  {diff > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {diff > 0 ? '+' : ''}{diff.toFixed(1)}kg
                </Badge>
              )}
              {diff === 0 && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Minus className="h-3 w-3" /> same
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No weight logged yet. Tap "Log" to start tracking.</p>
        )}

        {/* Mini chart */}
        {chartData.length > 1 && (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                {avgWeight > 0 && (
                  <ReferenceLine y={avgWeight} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label="" />
                )}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 2 }}
                  name="Weight (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
