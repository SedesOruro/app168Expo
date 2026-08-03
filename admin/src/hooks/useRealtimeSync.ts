import { useEffect } from "react";

export const useRealtimeSync = (enabled: boolean, onSync: () => void, intervalMs = 30000): void => {
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(onSync, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs, onSync]);
};

