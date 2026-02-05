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

const INITIAL_EVENTS = [
  {
    id: 1,
    title: "Ханукальная Вечеринка",
    description: "Зажигание свечей, пончики и музыкальный вечер для всех желающих.",
    image: "https://images.unsplash.com/photo-1543092587-d8b8fe8327c9?auto=format&fit=crop&q=80&w=1000&h=1000",
    link: "https://olami.moscow/hanukkah",
    date: new Date(new Date().getTime() + 86400000).toISOString(),
    duration: 120,
  },
  {
    id: 2,
    title: "Лекция: Бизнес и Тора",
    description: "Специальный гость: Раввин Алекс Артовский. Обсудим этику бизнеса.",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1920",
    link: "https://olami.moscow/lecture",
    date: new Date(new Date().getTime() + 1000 * 60 * 30).toISOString(),
    duration: 60,
  }
];

const INITIAL_NEWS = [
  { id: 1, text: "Поздравляем Давида с помолвкой! Мазл Тов!", type: "normal" },
  { id: 2, text: "Внимание! Изменилось время начала Шаббата.", type: "urgent" },
  { id: 3, text: "Сегодня день рождения у Сары! Поздравляем!", type: "birthday" },
  { id: 4, text: "Ханука Самеах! Зажигаем свечи в 18:00.", type: "holiday" },
  { id: 5, text: "Забыт iPhone на ресепшн, просьба забрать.", type: "normal" }
];

export const useStore = () => {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [news, setNews] = useState(INITIAL_NEWS);
  const [isCloudEnabled, setIsCloudEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeEvents = () => {};
    let unsubscribeNews = () => {};

    const initializeCloud = async () => {
      if (db && auth) {
        try {
          await signInAnonymously(auth);
          console.log("Signed in anonymously");
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
          console.error("Auth or Cloud Init Error:", error);
          handleCloudError();
        }
      } else {
        handleCloudError();
      }
    };

    const handleCloudError = () => {
      console.log("Falling back to local mode");
      setIsCloudEnabled(false);
      loadFromLocal('olami_events', INITIAL_EVENTS, setEvents);
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
