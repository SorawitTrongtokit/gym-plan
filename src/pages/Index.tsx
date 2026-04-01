import { useMemo } from 'react';
import { useWorkoutLogs, useTrainingWeeks } from '@/hooks/use-workouts';
import { getTodaysWorkout } from '@/lib/program-data';
import { getWeeklyVolume } from '@/lib/volume-calc';
import { getCoachInsights } from '@/lib/coach-engine';
import { getMuscleRecovery } from '@/lib/recovery';
import { VolumeChart } from '@/components/dashboard/VolumeChart';
import { AICoachPanel } from '@/components/dashboard/AICoachPanel';
import { RecoveryStatusPanel } from '@/components/dashboard/RecoveryStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Dumbbell, TrendingUp, Calendar, Flame } from 'lucide-react';

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

  if (logsLoading) {
    return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-3 gap-3">
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
      </div>

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
