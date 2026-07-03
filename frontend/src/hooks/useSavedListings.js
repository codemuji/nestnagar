import { useState, useEffect, useCallback } from 'react';

const SAVED_LISTINGS_KEY = 'nestnagar_saved_listings';

const getSaved = () => {
  try {
    const stored = localStorage.getItem(SAVED_LISTINGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn('Failed to load saved listings:', e);
    return [];
  }
};

export const useSavedListings = () => {
  const [savedIds, setSavedIds] = useState(getSaved);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === SAVED_LISTINGS_KEY) {
        setSavedIds(getSaved());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const toggleSave = useCallback((listingId) => {
    setSavedIds(prev => {
      const isSaved = prev.includes(listingId);
      const updated = isSaved
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId];

      try {
        localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save listing:', e);
      }

      return updated;
    });
  }, []);

  const isSaved = useCallback((listingId) => savedIds.includes(listingId), [savedIds]);

  return { savedIds, toggleSave, isSaved };
};