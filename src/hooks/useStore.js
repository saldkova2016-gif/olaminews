import { useState, useEffect } from 'react';
import { STATIC_EVENTS, STATIC_NEWS } from '../data/staticData';

export const useStore = () => {
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Data Effect
  useEffect(() => {
    const initializeData = () => {
      // Check if we have already seeded the data
      const isSeeded = localStorage.getItem('olami_data_seeded_v3');

      if (!isSeeded) {
        // First run or reset: Load static data
        setEvents(STATIC_EVENTS);
        setNews(STATIC_NEWS);
        localStorage.setItem('olami_events', JSON.stringify(STATIC_EVENTS));
        localStorage.setItem('olami_news', JSON.stringify(STATIC_NEWS));
        localStorage.setItem('olami_data_seeded_v3', 'true');
      } else {
        // Subsequent runs: Load from LocalStorage
        const savedEvents = localStorage.getItem('olami_events');
        if (savedEvents) {
          setEvents(JSON.parse(savedEvents));
        } else {
          setEvents(STATIC_EVENTS); // Fallback
        }

        const savedNews = localStorage.getItem('olami_news');
        if (savedNews) {
          setNews(JSON.parse(savedNews));
        } else {
          setNews(STATIC_NEWS); // Fallback
        }
      }

      setLoading(false);
    };

    initializeData();

    // Listen for storage events (Cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'olami_events') {
        setEvents(e.newValue ? JSON.parse(e.newValue) : []);
      }
      if (e.key === 'olami_news') {
        setNews(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Sync Local Logic
  useEffect(() => {
      if (!loading && events.length > 0) {
        localStorage.setItem('olami_events', JSON.stringify(events));
      }
  }, [events, loading]);

  useEffect(() => {
      if (!loading && news.length > 0) {
        localStorage.setItem('olami_news', JSON.stringify(news));
      }
  }, [news, loading]);

  // Actions (Local Storage Mode)
  const addEvent = async (event) => {
    const newEvents = [...events, { ...event, id: Date.now().toString() }];
    setEvents(newEvents);
  };

  const updateEvent = async (id, updatedData) => {
    const newEvents = events.map(e => e.id === id ? { ...e, ...updatedData } : e);
    setEvents(newEvents);
  };

  const deleteEvent = async (id) => {
    const newEvents = events.filter(e => e.id !== id);
    setEvents(newEvents);
  };

  const addNews = async (item) => {
    const newNews = [...news, { ...item, id: Date.now().toString() }];
    setNews(newNews);
  };

  const updateNews = async (id, updatedData) => {
    const newNews = news.map(n => n.id === id ? { ...n, ...updatedData } : n);
    setNews(newNews);
  };

  const deleteNews = async (id) => {
    const newNews = news.filter(n => n.id !== id);
    setNews(newNews);
  };

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
