import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  interval?: number; // milliseconds
  enabled?: boolean;
}

export function useAutoSave({ 
  data, 
  onSave, 
  interval = 30000, // 30 seconds default
  enabled = true 
}: UseAutoSaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const dataRef = useRef(data);
  const savedDataRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update data ref when data changes
  useEffect(() => {
    const currentDataString = JSON.stringify(data);
    if (currentDataString !== savedDataRef.current) {
      setHasUnsavedChanges(true);
    }
    dataRef.current = data;
  }, [data]);

  const save = useCallback(async () => {
    if (!enabled || isSaving) return;
    
    const currentDataString = JSON.stringify(dataRef.current);
    if (currentDataString === savedDataRef.current) {
      setHasUnsavedChanges(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(dataRef.current);
      savedDataRef.current = currentDataString;
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, enabled, isSaving]);

  // Set up interval-based auto-save
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      if (hasUnsavedChanges) {
        save();
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, hasUnsavedChanges, save]);

  // Debounced save on data change
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      save();
    }, 5000); // 5 second debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, hasUnsavedChanges, save]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return {
    save,
    lastSaved,
    isSaving,
    hasUnsavedChanges,
  };
}
