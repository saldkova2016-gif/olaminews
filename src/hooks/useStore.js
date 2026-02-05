import { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { signInAnonymously } from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { parseAfisha } from '../utils/afishaParser';

const INITIAL_EVENTS = [];

const INITIAL_NEWS = [];

export const useStore = () => {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [news, setNews] = useState(INITIAL_NEWS);
  const [isCloudEnabled, setIsCloudEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeEvents = () => {};
    let unsubscribeNews = () => {};

    const initializeCloud = async () => {
      if (db) {
        // Attempt Auth, but don't fail hard if it's not configured
        if (auth) {
          try {
            await signInAnonymously(auth);
            console.log("Signed in anonymously");
          } catch (error) {
            console.warn("Auth failed (likely not enabled in console), attempting Firestore anyway...", error);
          }
        }

        // Proceed to connect to Firestore regardless of Auth outcome
        try {
          setIsCloudEnabled(true);

          // Real-time Listeners
          const qEvents = query(collection(db, "events"), orderBy("date"));
          unsubscribeEvents = onSnapshot(qEvents, (snapshot) => {
            const cloudEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEvents(cloudEvents);
            if (cloudEvents.length === 0) setLoading(false);
          }, (error) => {
              console.error("Cloud Events Error:", error);
              handleCloudError();
          });

          const qNews = query(collection(db, "news"), orderBy("id", "desc"));
          unsubscribeNews = onSnapshot(qNews, (snapshot) => {
            const cloudNews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNews(cloudNews);
            setLoading(false);
          }, (error) => {
              console.error("Cloud News Error:", error);
              handleCloudError();
          });

        } catch (error) {
          console.error("Cloud Init Error:", error);
          handleCloudError();
        }
      } else {
        handleCloudError();
      }
    };

    const handleCloudError = async () => {
      console.log("Falling back to local mode");
      setIsCloudEnabled(false);

      // Try to load from local storage first
      const savedEvents = localStorage.getItem('olami_events');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      } else {
        // If no local data, fetch from web
        try {
          const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://olami.moscow/afisha')}`);
          if (response.ok) {
            const data = await response.json();
            const parsed = parseAfisha(data.contents);
            if (parsed.length > 0) {
              setEvents(parsed);
              localStorage.setItem('olami_events', JSON.stringify(parsed));
            }
          }
        } catch (e) {
          console.error("Web fetch error:", e);
        }
      }

      loadFromLocal('olami_news', INITIAL_NEWS, setNews);
      setLoading(false);
    };

    initializeCloud();

    return () => {
      unsubscribeEvents();
      unsubscribeNews();
    };
  }, []); // Run once on mount

  // Helper to load local storage
  const loadFromLocal = (key, initial, setter) => {
    const saved = localStorage.getItem(key);
    setter(saved ? JSON.parse(saved) : initial);
  };

  // Listen for storage events (Cross-tab sync in Local Mode)
  useEffect(() => {
    if (!isCloudEnabled) {
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
    }
  }, [isCloudEnabled]);

  // Sync Local Logic (for fallback)
  useEffect(() => {
    if (!isCloudEnabled) {
      localStorage.setItem('olami_events', JSON.stringify(events));
    }
  }, [events, isCloudEnabled]);

  useEffect(() => {
    if (!isCloudEnabled) {
      localStorage.setItem('olami_news', JSON.stringify(news));
    }
  }, [news, isCloudEnabled]);

  // Actions
  const addEvent = async (event) => {
    if (isCloudEnabled) {
      try {
        await addDoc(collection(db, "events"), event);
      } catch (error) {
        console.error("Error adding event:", error);
        throw error;
      }
    } else {
      setEvents(prev => [...prev, { ...event, id: Date.now() }]);
    }
  };

  const updateEvent = async (id, updatedFields) => {
    if (isCloudEnabled) {
      try {
        const eventRef = doc(db, "events", id);
        await updateDoc(eventRef, updatedFields);
      } catch (error) {
        console.error("Error updating event:", error);
        throw error;
      }
    } else {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updatedFields } : e));
    }
  };

  const deleteEvent = async (id) => {
    if (isCloudEnabled) {
      try {
        await deleteDoc(doc(db, "events", id));
      } catch (error) {
        console.error("Error deleting event:", error);
        throw error;
      }
    } else {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const addNews = async (item) => {
    if (isCloudEnabled) {
      try {
        await addDoc(collection(db, "news"), { ...item, id: Date.now() });
      } catch (error) {
        console.error("Error adding news:", error);
        throw error;
      }
    } else {
      setNews(prev => [{ ...item, id: Date.now() }, ...prev]);
    }
  };

  const updateNews = async (id, updatedFields) => {
    if (isCloudEnabled) {
      try {
        const newsRef = doc(db, "news", id);
        await updateDoc(newsRef, updatedFields);
      } catch (error) {
        console.error("Error updating news:", error);
        throw error;
      }
    } else {
      setNews(prev => prev.map(n => n.id === id ? { ...n, ...updatedFields } : n));
    }
  };

  const deleteNews = async (id) => {
    if (isCloudEnabled) {
      try {
        await deleteDoc(doc(db, "news", id));
      } catch (error) {
        console.error("Error deleting news:", error);
        throw error;
      }
    } else {
      setNews(prev => prev.filter(n => n.id !== id));
    }
  };

  return {
    events,
    news,
    loading,
    isCloudEnabled,
    addEvent,
    updateEvent,
    deleteEvent,
    addNews,
    updateNews,
    deleteNews
  };
};
