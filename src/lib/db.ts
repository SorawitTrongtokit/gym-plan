import { WorkoutLog } from './types';
import { supabase, isSupabaseConfigured } from './supabase';
import { get, set } from 'idb-keyval';

// This is a Database Abstraction Layer.
// Connected to Supabase if ENV vars are present, otherwise falls back to IndexedDB.

const DB_KEY_LOGS = 'hyper_trophy_forge_logs_db';
const DB_KEY_WEEKS = 'hyper_trophy_forge_weeks_db';

// Automatic Migration from localStorage to IndexedDB
const migrateLocalStorageToIdb = async () => {
  try {
    const localLogs = localStorage.getItem(DB_KEY_LOGS);
    if (localLogs) {
      const logs = JSON.parse(localLogs);
      await set(DB_KEY_LOGS, logs);
      localStorage.removeItem(DB_KEY_LOGS);
      console.log('Successfully migrated logs from localStorage to IndexedDB');
    }
    const localWeeks = localStorage.getItem(DB_KEY_WEEKS);
    if (localWeeks) {
      await set(DB_KEY_WEEKS, Number(localWeeks));
      localStorage.removeItem(DB_KEY_WEEKS);
    }
  } catch (err) {
    console.error('Migration to IDB failed', err);
  }
};

let migrationRun = false;
const ensureMigrated = async () => {
  if (!migrationRun) {
    await migrateLocalStorageToIdb();
    migrationRun = true;
  }
};

// Helper to get current user id
const getCurrentUserId = async (): Promise<string | null> => {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
};

export const dbFetchLogs = async (): Promise<WorkoutLog[]> => {
  await ensureMigrated();

  if (isSupabaseConfigured()) {
    const userId = await getCurrentUserId();
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('user_logs')
      .select('log_payload')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      throw new Error(error.message);
    }
    return data.map(row => row.log_payload as WorkoutLog);
  }

  // Fallback to IndexedDB
  try {
    const data = await get<WorkoutLog[]>(DB_KEY_LOGS);
    return data || [];
  } catch (e) {
    console.error("Failed to parse logs from DB", e);
    return [];
  }
};

export const dbSaveWorkoutLog = async (workout: WorkoutLog): Promise<WorkoutLog> => {
  await ensureMigrated();
  const completed = { ...workout, completedAt: workout.completedAt || new Date().toISOString() };

  if (isSupabaseConfigured()) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_logs')
      .upsert({ 
        id: completed.id, 
        date: completed.date,
        log_payload: completed,
        user_id: userId,
      }, { onConflict: 'id' });

    if (error) {
       console.error('Supabase save error:', error);
       throw new Error(error.message);
    }
  }
  
  // IndexedDB Cache / Fallback
  let logs: WorkoutLog[] = [];
  try {
    const currentData = await get<WorkoutLog[]>(DB_KEY_LOGS);
    if (currentData) logs = currentData;
  } catch(e) {}
  
  // Remove existing if any, then add new one
  const updatedLogs = [...logs.filter(l => l.id !== completed.id), completed];
  updatedLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  await set(DB_KEY_LOGS, updatedLogs);
  
  // Update training weeks metric based on unique weeks logged
  const weeks = new Set(updatedLogs.map(l => {
    const d = new Date(l.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    return weekStart.toISOString().split('T')[0];
  }));
  await set(DB_KEY_WEEKS, weeks.size);

  return completed;
};

export const dbFetchTrainingWeeks = async (): Promise<number> => {
  await ensureMigrated();

  // Use IndexedDB cached value first (avoids refetching all logs)
  try {
    const data = await get<number>(DB_KEY_WEEKS);
    if (data !== undefined && data > 0) return data;
  } catch(e) {}

  // Compute from logs if no cached value
  const logs = await dbFetchLogs();
  const weeks = new Set(logs.map(l => {
    const d = new Date(l.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    return weekStart.toISOString().split('T')[0];
  }));
  const count = weeks.size > 0 ? weeks.size : 1;
  await set(DB_KEY_WEEKS, count);
  return count;
};

export const dbDeleteWorkoutLog = async (logId: string): Promise<boolean> => {
  await ensureMigrated();

  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from('user_logs')
      .delete()
      .eq('id', logId);

    if (error) {
       console.error('Supabase delete error:', error);
       throw new Error(error.message);
    }
  }

  try {
    const logs = await get<WorkoutLog[]>(DB_KEY_LOGS);
    if (logs) {
      const updatedLogs = logs.filter(l => l.id !== logId);
      await set(DB_KEY_LOGS, updatedLogs);
    }
  } catch (e) {
    console.error(e);
  }
  return true;
};
