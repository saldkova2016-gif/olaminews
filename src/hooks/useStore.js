import { useState, useEffect } from 'react';
import { parseEvents, parseNews } from '../utils/sheetParser';

const INITIAL_EVENTS = [];
const INITIAL_NEWS = [];

export const useStore = () => {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [news, setNews] = useState(INITIAL_NEWS);
  const [loading, setLoading] = useState(true);

  // Load Data Effect
  useEffect(() => {
    const initializeData = async () => {
      // 1. Try to load cached data for instant display
      const savedEvents = localStorage.getItem('olami_events');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }

      const savedNews = localStorage.getItem('olami_news');
      if (savedNews) {
        setNews(JSON.parse(savedNews));
      }

      // 2. Fetch fresh data for Events
      try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/1DqIaneAToXiCosssPHoc-e5DHaodoKergJtW4_97WAw/gviz/tq?tqx=out:csv&sheet=%D0%90%D1%84%D0%B8%D1%88%D0%B0');
        if (response.ok) {
          const text = await response.text();
          const parsed = parseEvents(text);
          if (parsed.length > 0) {
            setEvents(parsed);
            localStorage.setItem('olami_events', JSON.stringify(parsed));
          }
        }
      } catch (e) {
        console.error("Events fetch error:", e);
      }

      // 3. Fetch fresh data for News
      try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/1DqIaneAToXiCosssPHoc-e5DHaodoKergJtW4_97WAw/gviz/tq?tqx=out:csv&sheet=%D0%9D%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D0%B8');
          if (response.ok) {
          const text = await response.text();
          const parsed = parseNews(text);
          if (parsed.length > 0) {
            setNews(parsed);
            localStorage.setItem('olami_news', JSON.stringify(parsed));
          }
        }
      } catch (e) {
        console.error("News fetch error:", e);
      }

      setLoading(false);
    };

    initializeData();

    // Listen for storage events (Cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'olami_events') {
        setEvents(e.newValue ? JSON.parse(e.newValue) : INITIAL_EVENTS);
      }
      if (e.key === 'olami_news') {
        setNews(e.newValue ? JSON.parse(e.newValue) : INITIAL_NEWS);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync Local Logic (Backup sync)
  useEffect(() => {
      localStorage.setItem('olami_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
      localStorage.setItem('olami_news', JSON.stringify(news));
  }, [news]);

  // Actions (ReadOnly in this mode)
  const addEvent = async () => console.warn("Read-only mode (Google Sheets)");
  const updateEvent = async () => console.warn("Read-only mode (Google Sheets)");
  const deleteEvent = async () => console.warn("Read-only mode (Google Sheets)");
  const addNews = async () => console.warn("Read-only mode (Google Sheets)");
  const updateNews = async () => console.warn("Read-only mode (Google Sheets)");
  const deleteNews = async () => console.warn("Read-only mode (Google Sheets)");

  return {
    events,
    news,
    loading,
    isCloudEnabled: false, // Always false as we are not using Firebase Cloud Store
    addEvent,
    updateEvent,
    deleteEvent,
    addNews,
    updateNews,
    deleteNews
  };
};
