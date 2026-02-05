import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
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
    if (db) {
      setIsCloudEnabled(true);

      // Real-time Listeners
      const qEvents = query(collection(db, "events"), orderBy("date"));
      const unsubscribeEvents = onSnapshot(qEvents, (snapshot) => {
        const cloudEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(cloudEvents);
        if (cloudEvents.length === 0) setLoading(false); // Only stop loading if empty, else data load handles it
      }, (error) => {
          console.error("Cloud Events Error:", error);
          loadFromLocal('olami_events', INITIAL_EVENTS, setEvents);
      });

      const qNews = query(collection(db, "news"), orderBy("id", "desc")); // Order by ID timestamp approx
      const unsubscribeNews = onSnapshot(qNews, (snapshot) => {
        const cloudNews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNews(cloudNews);
        setLoading(false);
      }, (error) => {
          console.error("Cloud News Error:", error);
          loadFromLocal('olami_news', INITIAL_NEWS, setNews);
      });

      return () => {
        unsubscribeEvents();
        unsubscribeNews();
      };
    } else {
      // Local Fallback
      loadFromLocal('olami_events', INITIAL_EVENTS, setEvents);
      loadFromLocal('olami_news', INITIAL_NEWS, setNews);
      setLoading(false);
    }
  }, [db]); // Added dependency on db to re-run if it initializes late

  // Helper to load local storage
  const loadFromLocal = (key, initial, setter) => {
    const saved = localStorage.getItem(key);
    setter(saved ? JSON.parse(saved) : initial);
  };

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
      await addDoc(collection(db, "events"), event);
    } else {
      setEvents(prev => [...prev, { ...event, id: Date.now() }]);
    }
  };

  const updateEvent = async (id, updatedFields) => {
    if (isCloudEnabled) {
      const eventRef = doc(db, "events", id);
      await updateDoc(eventRef, updatedFields);
    } else {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updatedFields } : e));
    }
  };

  const deleteEvent = async (id) => {
    if (isCloudEnabled) {
      await deleteDoc(doc(db, "events", id));
    } else {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const addNews = async (item) => {
    if (isCloudEnabled) {
      await addDoc(collection(db, "news"), { ...item, id: Date.now() }); // Use timestamp as order
    } else {
      setNews(prev => [{ ...item, id: Date.now() }, ...prev]);
    }
  };

  const updateNews = async (id, updatedFields) => {
    if (isCloudEnabled) {
      const newsRef = doc(db, "news", id);
      await updateDoc(newsRef, updatedFields);
    } else {
      setNews(prev => prev.map(n => n.id === id ? { ...n, ...updatedFields } : n));
    }
  };

  const deleteNews = async (id) => {
    if (isCloudEnabled) {
      await deleteDoc(doc(db, "news", id));
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
