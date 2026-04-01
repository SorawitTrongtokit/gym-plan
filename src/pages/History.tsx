import { useState } from 'react';
import { useWorkoutLogs, useDeleteWorkoutMutation } from '@/hooks/use-workouts';
import { DAY_LABELS } from '@/lib/program-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar, ChevronDown, ChevronUp, Trash2, Dumbbell, Clock } from 'lucide-react';

const HistoryPage = () => {
  const { data: logs = [], isLoading } = useWorkoutLogs();
  const { mutate: deleteLog } = useDeleteWorkoutMutation();
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(l => l.dayType === filter);

  const dayTypes = [...new Set(logs.map(l => l.dayType))];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">History</h1></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workout History</h1>
        <p className="text-sm text-muted-foreground">{filteredLogs.length} workouts logged</p>
      </div>

      {/* Filter */}
      {dayTypes.length > 1 && (
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by day type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Workouts</SelectItem>
            {dayTypes.map(dt => (
              <SelectItem key={dt} value={dt}>{DAY_LABELS[dt] || dt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Timeline */}
      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No workouts yet. Start training to see your history!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map(log => {
            const isExpanded = expandedId === log.id;
            const totalSets = log.exercises.reduce((s, e) => s + e.sets.filter(st => st.completed).length, 0);
            const totalExercises = log.exercises.length;
            const logDate = new Date(log.date);
            const maxWeight = Math.max(0, ...log.exercises.flatMap(e => e.sets.filter(s => s.completed).map(s => s.weight)));

            return (
              <Card
                key={log.id}
                className="transition-all hover:border-primary/20"
              >
                <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : log.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">{DAY_LABELS[log.dayType] || log.dayType}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {logDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {log.completedAt && (
                            <span className="ml-2 inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(log.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">{totalExercises} ex</Badge>
                          <Badge variant="outline" className="text-[10px]">{totalSets} sets</Badge>
                        </div>
                        {maxWeight > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">Max: {maxWeight}kg</p>
                        )}
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 space-y-3">
                    {/* Exercise details */}
                    {log.exercises.map(ex => {
                      const completed = ex.sets.filter(s => s.completed);
                      if (completed.length === 0) return null;
                      return (
                        <div key={ex.exerciseId} className="p-3 rounded-lg bg-secondary/20">
                          <p className="text-sm font-medium mb-2">{ex.exerciseName}</p>
                          <div className="grid grid-cols-4 gap-1 text-[10px] text-muted-foreground uppercase font-medium mb-1 px-1">
                            <span>Set</span>
                            <span>Weight</span>
                            <span>Reps</span>
                            <span>RIR</span>
                          </div>
                          {completed.map(s => (
                            <div key={s.setNumber} className="grid grid-cols-4 gap-1 text-xs px-1 py-0.5">
                              <span className="text-muted-foreground">#{s.setNumber}</span>
                              <span className="font-medium">{s.weight}kg</span>
                              <span>{s.reps} reps</span>
                              <span className="text-muted-foreground">RIR {s.rir}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}

                    {/* Delete button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete this workout
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete workout?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the {DAY_LABELS[log.dayType]} workout from {logDate.toLocaleDateString()}. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                              deleteLog(log.id);
                              setExpandedId(null);
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
