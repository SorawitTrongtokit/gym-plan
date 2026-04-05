import { useMemo } from 'react';
import { useWorkoutLogs, useTrainingWeeks } from '@/hooks/use-workouts';
import { getTodaysWorkout } from '@/lib/program-data';
import { getWeeklyVolume } from '@/lib/volume-calc';
import { getCoachInsights } from '@/lib/coach-engine';
import { getMuscleRecovery } from '@/lib/recovery';
import { VolumeChart } from '@/components/dashboard/VolumeChart';
import { AICoachPanel } from '@/components/dashboard/AICoachPanel';
import { RecoveryStatusPanel } from '@/components/dashboard/RecoveryStatus';
import { BodyWeightCard } from '@/components/dashboard/BodyWeightCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Dumbbell, TrendingUp, Calendar, Flame, Zap } from 'lucide-react';

function calculateStreak(logs: { date: string }[]): number {
  if (logs.length === 0) return 0;
  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const uniqueDays = [...new Set(sorted.map(l => new Date(l.date).toISOString().split('T')[0]))];
  
  let streak = 0;
  let checkDate = new Date();
  // Include today or yesterday as start
  const todayStr = checkDate.toISOString().split('T')[0];
  const yesterdayStr = new Date(checkDate.getTime() - 86400000).toISOString().split('T')[0];
  
  if (!uniqueDays.includes(todayStr) && !uniqueDays.includes(yesterdayStr)) return 0;
  if (!uniqueDays.includes(todayStr)) {
    checkDate = new Date(checkDate.getTime() - 86400000);
  }

  // Count consecutive weeks (training at least once per week)
  for (let w = 0; w < 52; w++) {
    const weekStart = new Date(checkDate.getTime() - (w * 7 + checkDate.getDay()) * 86400000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
    const hasWorkout = uniqueDays.some(d => {
      const date = new Date(d);
      return date >= weekStart && date < weekEnd;
    });
    if (hasWorkout) streak++;
    else break;
  }
  return streak;
}

const Dashboard = () => {
  const { data: logs = [], isLoading: logsLoading } = useWorkoutLogs();
  const { data: trainingWeeks = 1 } = useTrainingWeeks();

  const todaysWorkout = getTodaysWorkout();

  const volumes = useMemo(() => getWeeklyVolume(logs), [logs]);
  const insights = useMemo(() => getCoachInsights(logs, trainingWeeks), [logs, trainingWeeks]);
  const recovery = useMemo(() => getMuscleRecovery(logs), [logs]);

  const totalWorkouts = logs.length;
  const totalSets = useMemo(() => 
    logs.reduce((sum, l) => sum + l.exercises.reduce((s, e) => s + e.sets.filter(st => st.completed).length, 0), 0),
  [logs]);
  const streak = useMemo(() => calculateStreak(logs), [logs]);

  if (logsLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">Dashboard</h1></div>
        <div className="h-32 rounded-xl shimmer" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-xl shimmer" />
          ))}
        </div>
        <div className="h-40 rounded-xl shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">AI Workout System — Week {trainingWeeks}</p>
      </div>

      {/* Today's Workout Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Today's Workout</CardTitle>
            <Badge variant="outline" className="text-primary border-primary/30">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{todaysWorkout.label}</p>
              <p className="text-sm text-muted-foreground">
                {todaysWorkout.exercises.length > 0
                  ? `${todaysWorkout.exercises.length} exercises`
                  : 'Recovery day — rest up!'}
              </p>
            </div>
            {todaysWorkout.exercises.length > 0 && (
              <Button asChild>
                <Link to="/workout">
                  <Dumbbell className="h-4 w-4 mr-2" /> Start
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 stagger-in">
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{totalWorkouts}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Workouts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{totalSets}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Total Sets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{trainingWeeks}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Weeks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-5 w-5 mx-auto mb-1 text-amber-400" />
            <p className="text-xl font-bold">{streak}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Streak 🔥</p>
          </CardContent>
        </Card>
      </div>

      {/* Body Weight */}
      <BodyWeightCard />

      {/* AI Coach */}
      <AICoachPanel insights={insights} />

      {/* Volume & Recovery */}
      <div className="grid md:grid-cols-2 gap-4">
        <VolumeChart volumes={volumes} />
        <RecoveryStatusPanel recovery={recovery} />
      </div>
    </div>
  );
};

export default Dashboard;
