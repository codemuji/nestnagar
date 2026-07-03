import { useState, useEffect, useCallback } from 'react';
import API from '../services/api';

const RECENT_SEARCHES_KEY = 'nestnagar_recent_searches';
const MAX_RECENT = 5;
const DEBOUNCE_MS = 250;

export const useLocalitySearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load recent searches:', e);
    }
  }, []);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await API.get('/listings/localities/autocomplete', {
          params: { q: debouncedQuery }
        });
        setSuggestions(response.data || []);
      } catch (err) {
        console.error('Failed to fetch localities:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Add to recent searches
  const addToRecent = useCallback((locality) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(l => l.toLowerCase() !== locality.toLowerCase());
      const updated = [locality, ...filtered].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save recent searches:', e);
      }
      return updated;
    });
  }, []);

  const handleSelect = useCallback((locality) => {
    setQuery(locality);
    addToRecent(locality);
    setShowDropdown(false);
  }, [addToRecent]);

  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      console.warn('Failed to clear recent searches:', e);
    }
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    recentSearches,
    loading,
    showDropdown,
    setShowDropdown,
    handleSelect,
    clearRecent,
    addToRecent,
  };
};