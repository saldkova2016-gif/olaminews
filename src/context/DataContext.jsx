import React, { createContext, useState, useEffect, useContext } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('olami_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [news, setNews] = useState(() => {
    const saved = localStorage.getItem('olami_news');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('olami_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('olami_news', JSON.stringify(news));
  }, [news]);

  const addEvent = (event) => {
    setEvents(prev => [...prev, { ...event, id: Date.now() }]);
  };

  const removeEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const addNews = (item) => {
    setNews(prev => [...prev, { ...item, id: Date.now() }]);
  };

  const removeNews = (id) => {
    setNews(prev => prev.filter(n => n.id !== id));
  };

  const toggleNews = (id) => {
    setNews(prev => prev.map(n => n.id === id ? { ...n, active: !n.active } : n));
  };

  return (
    <DataContext.Provider value={{ events, news, addEvent, removeEvent, addNews, removeNews, toggleNews }}>
      {children}
    </DataContext.Provider>
  );
};
