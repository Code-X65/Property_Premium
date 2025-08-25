// hooks/useNewsletter.js
import { useState, useCallback } from 'react';
import newsletterService from './NewsletterService';

export const useNewsletter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Subscribe to newsletter
  const subscribe = useCallback(async (email, source = 'website') => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await newsletterService.subscribe(email, source);
      setSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Unsubscribe from newsletter
  const unsubscribe = useCallback(async (email, reason) => {
    setLoading(true);
    setError(null);

    try {
      const result = await newsletterService.unsubscribe(email, reason);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (email, preferences) => {
    setLoading(true);
    setError(null);

    try {
      const result = await newsletterService.updatePreferences(email, preferences);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear success
  const clearSuccess = useCallback(() => {
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    subscribe,
    unsubscribe,
    updatePreferences,
    clearError,
    clearSuccess
  };
};

// Hook specifically for newsletter statistics (for admin use)
export const useNewsletterStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await newsletterService.getNewsletterStats();
      setStats(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats
  };
};