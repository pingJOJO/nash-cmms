import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="w-full z-50 transition-all duration-300">
      {!isOnline ? (
        <div className="bg-amber-500/90 backdrop-blur text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 animate-pulse text-amber-950" />
            <span>
              <strong>Offline Mode Active:</strong> Low network connectivity detected. Checklist updates and task progress are safely stored locally in browser cache and will auto-sync when online.
            </span>
          </div>
          <span className="bg-amber-900/20 px-2 py-0.5 rounded text-[11px] font-mono uppercase">
            Auto-Sync Ready
          </span>
        </div>
      ) : (
        <div className="bg-emerald-600/95 backdrop-blur text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span>
              Internet connection restored! All local operational records have been synchronized with the main server.
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] opacity-90">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Synced</span>
          </div>
        </div>
      )}
    </div>
  );
};
