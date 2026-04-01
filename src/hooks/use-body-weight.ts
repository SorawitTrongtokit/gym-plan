import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { get, set } from 'idb-keyval';
import { toast } from 'sonner';

const IDB_KEY = 'hyper_trophy_forge_body_weight';

export interface BodyWeightEntry {
  id: string;
  body_weight: number;
  measured_on: string; // YYYY-MM-DD
  notes?: string;
}

const BODY_WEIGHT_KEYS = {
  all: ['body-weight'] as const,
};

async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function fetchBodyWeight(): Promise<BodyWeightEntry[]> {
  if (isSupabaseConfigured()) {
    const userId = await getCurrentUserId();
    if (!userId) return [];
    const { data, error } = await supabase
      .from('body_measurements')
      .select('id, body_weight, measured_on, notes')
      .eq('user_id', userId)
      .order('measured_on', { ascending: false })
      .limit(90);
    if (error) throw new Error(error.message);
    return (data || []).map(r => ({
      id: r.id,
      body_weight: Number(r.body_weight),
      measured_on: r.measured_on,
      notes: r.notes,
    }));
  }
  // Fallback to IDB
  const data = await get<BodyWeightEntry[]>(IDB_KEY);
  return data || [];
}

async function saveBodyWeight(entry: Omit<BodyWeightEntry, 'id'>): Promise<BodyWeightEntry> {
  const newEntry: BodyWeightEntry = {
    id: crypto.randomUUID(),
    ...entry,
  };

  if (isSupabaseConfigured()) {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('body_measurements')
      .upsert({
        id: newEntry.id,
        user_id: userId,
        body_weight: newEntry.body_weight,
        measured_on: newEntry.measured_on,
        notes: newEntry.notes || null,
      }, { onConflict: 'user_id,measured_on' });
    if (error) throw new Error(error.message);
  }

  // Also save to IDB cache
  const existing = await get<BodyWeightEntry[]>(IDB_KEY) || [];
  const updated = [newEntry, ...existing.filter(e => e.measured_on !== newEntry.measured_on)];
  updated.sort((a, b) => b.measured_on.localeCompare(a.measured_on));
  await set(IDB_KEY, updated);

  return newEntry;
}

async function deleteBodyWeight(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('body_measurements').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
  const existing = await get<BodyWeightEntry[]>(IDB_KEY) || [];
  await set(IDB_KEY, existing.filter(e => e.id !== id));
}

export function useBodyWeight() {
  return useQuery({
    queryKey: BODY_WEIGHT_KEYS.all,
    queryFn: fetchBodyWeight,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveBodyWeightMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: Omit<BodyWeightEntry, 'id'>) => saveBodyWeight(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BODY_WEIGHT_KEYS.all });
      toast.success('Body weight logged!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save');
    },
  });
}

export function useDeleteBodyWeightMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBodyWeight(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BODY_WEIGHT_KEYS.all });
      toast.success('Entry deleted');
    },
  });
}
