import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, X, RefreshCw } from 'lucide-react';

const SWUpdate = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useRegisterSW({
    onNeedRefresh() {
      setNeedRefresh(true);
    },
    onOfflineReady() {
      setOfflineReady(true);
    },
  });

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-2xl shadow-xl border border-border-light/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {needRefresh && (
            <>
              <RefreshCw className="text-brand-secondary animate-spin" size={20} />
              <span className="text-sm font-medium text-text-primary">New version available</span>
            </>
          )}
          {offlineReady && !needRefresh && (
            <>
              <Download className="text-brand-secondary" size={20} />
              <span className="text-sm font-medium text-text-primary">Ready for offline use</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {needRefresh && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-colors"
            >
              Update
            </button>
          )}
          {offlineReady && (
            <button
              onClick={() => setOfflineReady(false)}
              className="px-3 py-2 text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SWUpdate;