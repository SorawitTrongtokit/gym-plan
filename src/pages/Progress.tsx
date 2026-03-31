import { useMemo, useState } from 'react';
import { useWorkoutStore } from '@/stores/workout-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy } from 'lucide-react';

const ALL_EXERCISES = [
  { id: 'db-floor-press', name: 'Dumbbell Floor Press' },
  { id: 'db-row', name: 'One-Arm Dumbbell Row' },
  { id: 'db-ohp', name: 'Dumbbell Overhead Press' },
  { id: 'db-lateral-raise', name: 'Dumbbell Lateral Raise' },
  { id: 'db-rear-delt-fly', name: 'Dumbbell Rear Delt Fly' },
  { id: 'bicep-curl', name: 'Bicep Curl' },
  { id: 'tricep-extension', name: 'Tricep Extension' },
  { id: 'goblet-squat', name: 'Goblet Squat' },
  { id: 'rdl', name: 'Romanian Deadlift' },
  { id: 'hip-thrust', name: 'Hip Thrust' },
  { id: 'walking-lunges', name: 'Walking Lunges' },
  { id: 'calf-raises', name: 'Calf Raises' },
  { id: 'core', name: 'Core (Plank / Leg Raises)' },
];

const ProgressPage = () => {
  const { logs } = useWorkoutStore();
  const [selectedExercise, setSelectedExercise] = useState(ALL_EXERCISES[0].id);

  const chartData = useMemo(() => {
    return logs
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .flatMap(log =>
        log.exercises
          .filter(e => e.exerciseId === selectedExercise)
          .map(e => {
            const completedSets = e.sets.filter(s => s.completed);
            if (completedSets.length === 0) return null;
            const maxWeight = Math.max(...completedSets.map(s => s.weight));
            const avgReps = Math.round(completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length);
            return {
              date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              weight: maxWeight,
              reps: avgReps,
            };
          })
      )
      .filter(Boolean);
  }, [logs, selectedExercise]);

  const personalBests = useMemo(() => {
    return ALL_EXERCISES.map(ex => {
      let maxWeight = 0;
      let maxReps = 0;
      logs.forEach(log => {
        log.exercises.filter(e => e.exerciseId === ex.id).forEach(e => {
          e.sets.filter(s => s.completed).forEach(s => {
            if (s.weight > maxWeight) maxWeight = s.weight;
            if (s.reps > maxReps) maxReps = s.reps;
          });
        });
      });
      return { ...ex, maxWeight, maxReps };
    }).filter(e => e.maxWeight > 0);
  }, [logs]);

  const selectedName = ALL_EXERCISES.find(e => e.id === selectedExercise)?.name;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
        <p className="text-sm text-muted-foreground">Track your strength gains over time</p>
      </div>

      {/* Exercise selector + chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weight Progression</CardTitle>
          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_EXERCISES.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              No data for {selectedName} yet. Complete a workout to see progress.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} name="Weight (kg)" />
                  <Line type="monotone" dataKey="reps" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }} name="Avg Reps" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Bests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Personal Bests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {personalBests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No records yet. Start training!</p>
          ) : (
            <div className="space-y-2">
              {personalBests.map(pb => (
                <div key={pb.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <span className="text-sm font-medium">{pb.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{pb.maxWeight}kg</Badge>
                    <Badge variant="secondary">{pb.maxReps} reps</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressPage;
