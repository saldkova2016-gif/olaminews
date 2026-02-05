import React, { useState, useEffect, useRef } from 'react';
import { useStore } from './hooks/useStore';
import { QRCodeSVG } from 'qrcode.react';
import {
  Clock,
  CloudSun,
  Calendar,
  Settings,
  Plus,
  Trash2,
  AlertCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Maximize2,
  X,
  LayoutTemplate,
  Cake,
  PartyPopper,
  Info,
  Loader2,
  Edit2,
  FileText,
  Type,
  Cloud,
  CloudOff
} from 'lucide-react';

const BRAND_COLOR = '#7652FF'; // Olami Purple

const PRESET_TITLES = [
  "Урок для юношей",
  "Урок для девушек",
  "Общее занятие",
  "Шаббат"
];

const OLAMI_LOGO = "https://static.tildacdn.com/tild3664-6533-4037-b864-376432303439/Vector.svg";

// --- UTILS ---

const getQRCodeValue = (link) => {
  try {
    const url = new URL(link.startsWith('http') ? link : `https://${link}`);
    url.searchParams.set('utm_source', 'dashboard');
    return url.toString();
  } catch (e) {
    return link;
  }
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
};

// --- COMPONENTS ---

const Header = ({ toggleAdmin }) => {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=55.7558&longitude=37.6173&current=temperature_2m&timezone=Europe%2FMoscow'
        );
        const data = await response.json();
        if (data.current) {
          setWeather(Math.round(data.current.temperature_2m));
        }
      } catch (error) {
        console.error("Weather fetch failed", error);
        setWeather(-5);
      }
    };

    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 60000 * 30);
    return () => clearInterval(weatherInterval);
  }, []);

  const getShabbatTimer = () => {
    const now = new Date();
    const day = now.getDay();
    if (day === 5) {
      return "Шаббат через 4ч 20мин";
    }
    return "Шаббат: Пт, 18:42";
  };

  return (
    <header className="h-24 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm z-50 relative">
      <div className="flex items-center gap-6">
        <img src={OLAMI_LOGO} alt="Olami" className="h-16 w-auto object-contain" />
        <div className="h-10 w-px bg-gray-300 mx-2"></div>
      </div>

      <div className="flex items-center gap-10 text-gray-700">
        <div className="flex items-center gap-3">
          <CloudSun className="w-8 h-8" style={{ color: BRAND_COLOR }} />
          <span className="text-2xl font-medium">
            {weather !== null ? (weather > 0 ? `+${weather}` : weather) : '...'}°C
          </span>
        </div>

        <div className="flex items-center gap-3 bg-gray-100 px-6 py-2 rounded-full">
          <Clock className="w-6 h-6 text-gray-500" />
          <span className="text-3xl font-bold font-mono text-gray-800">
            {time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: BRAND_COLOR }}></div>
          <span className="text-xl font-medium text-gray-800">{getShabbatTimer()}</span>
        </div>

        <button onClick={toggleAdmin} className="opacity-10 hover:opacity-100 transition-opacity p-2">
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

const MainStage = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const INTERVAL_MS = 60000;

  useEffect(() => {
    if (events.length <= 1) return;

    setProgress(0);
    const step = 100 / (INTERVAL_MS / 100);

    const progressTimer = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) return 100;
            return prev + step;
        });
    }, 100);

    const slideTimer = setInterval(() => {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % events.length);
        setIsLoading(false);
        setProgress(0);
      }, 500);
    }, INTERVAL_MS);

    return () => {
        clearInterval(progressTimer);
        clearInterval(slideTimer);
    };
  }, [events, currentIndex]);

  if (events.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
        <div className="text-center">
          <ImageIcon className="w-24 h-24 mx-auto mb-6 opacity-50" />
          <p className="text-3xl">Нет активных событий</p>
        </div>
      </div>
    );
  }

  const event = events[currentIndex];

  // Status Logic
  const eventDate = new Date(event.date);
  const now = new Date();
  const diffMinutes = Math.floor((eventDate - now) / (1000 * 60));

  let statusBadge = null;
  if (diffMinutes <= 60 && diffMinutes > 0) {
    statusBadge = (
      <div
        className="absolute top-6 left-6 text-white px-6 py-3 rounded-xl shadow-xl animate-bounce z-20 border-2 border-white/20"
        style={{ backgroundColor: BRAND_COLOR }}
      >
        <span className="text-2xl font-bold uppercase tracking-wider">Начало через {diffMinutes} мин</span>
      </div>
    );
  } else if (diffMinutes <= 0 && diffMinutes > -event.duration) {
     statusBadge = (
      <div className="absolute top-6 left-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-xl z-20">
        <span className="text-2xl font-bold uppercase animate-pulse tracking-wider">ПРЯМО СЕЙЧАС</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex">
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
          <Loader2 className="w-16 h-16 text-white animate-spin" />
        </div>
      )}

      <div
        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-110"
        style={{ backgroundImage: `url(${event.image})` }}
      ></div>

      <div className="relative z-10 w-full h-full flex p-6 gap-8 items-start">
         <div className="h-full w-2/3 flex-shrink-0 relative">
             <div className="relative w-full h-full">
                <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-contain object-left-top shadow-2xl rounded-2xl"
                />
                {statusBadge}
             </div>
         </div>

         <div className="flex-1 flex flex-col items-start pt-4">
             <h2 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-4">
                {event.title}
             </h2>

             {event.description && (
               <p className="text-xl lg:text-3xl text-gray-200 mb-8 leading-relaxed opacity-90 font-light border-l-4 pl-4" style={{ borderColor: BRAND_COLOR }}>
                 {event.description}
               </p>
             )}

             <div className="flex items-center gap-4 text-2xl text-gray-300 mb-10 bg-white/10 px-6 py-3 rounded-xl backdrop-blur-md border border-white/20 w-fit">
                 <Calendar className="w-8 h-8" />
                 <span>{formatDate(event.date)}</span>
             </div>

             <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
                <div className="relative w-[250px] h-[250px]">
                    <QRCodeSVG
                        value={getQRCodeValue(event.link)}
                        size={250}
                        level="M"
                        includeMargin={true}
                    />
                </div>
                <p
                    className="font-bold text-xl uppercase tracking-wide"
                    style={{ color: BRAND_COLOR }}
                >
                    Регистрация
                </p>
             </div>
         </div>
      </div>

      <div className="absolute bottom-0 left-0 h-3 bg-gray-800 w-full z-50">
          <div
            className="h-full transition-all duration-100 ease-linear"
            style={{
                width: `${progress}%`,
                backgroundColor: BRAND_COLOR
            }}
          ></div>
      </div>
    </div>
  );
};

const NewsFeed = ({ news }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    if (news.length <= ITEMS_PER_PAGE) {
        setCurrentPage(0);
        return;
    }
    const interval = setInterval(() => {
      setCurrentPage(prev => {
        const totalPages = Math.ceil(news.length / ITEMS_PER_PAGE);
        return (prev + 1) % totalPages;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [news.length]);

  const visibleNews = news.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  const getIcon = (type) => {
    switch (type) {
      case 'birthday': return <Cake className="w-8 h-8 text-pink-500 flex-shrink-0" />;
      case 'holiday': return <PartyPopper className="w-8 h-8 text-yellow-500 flex-shrink-0" />;
      case 'urgent': return <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />;
      default: return <Info className="w-8 h-8 text-blue-500 flex-shrink-0" />;
    }
  };

  const getContainerStyles = (type) => {
    if (type === 'urgent') {
        return {
            background: 'bg-red-50',
            border: 'border-l-8 border-red-600',
            shadow: 'shadow-md shadow-red-100'
        };
    }
    const color = type === 'birthday' ? '#EC4899' : type === 'holiday' ? '#EAB308' : BRAND_COLOR;
    return {
        background: 'bg-white',
        border: '',
        borderColor: color,
        shadow: 'shadow-sm'
    };
  };

  return (
    <div className="h-full bg-gray-50 border-l border-gray-200 flex flex-col">
      <div className="p-8 bg-white border-b border-gray-200 shadow-sm z-10 flex justify-between items-center">
        <h3
          className="text-2xl font-bold uppercase tracking-wider flex items-center gap-3"
          style={{ color: BRAND_COLOR }}
        >
          <LayoutTemplate className="w-7 h-7" />
          Дайджест
        </h3>
        {news.length > ITEMS_PER_PAGE && (
            <span className="text-sm text-gray-400">Стр {currentPage + 1}/{Math.ceil(news.length / ITEMS_PER_PAGE)}</span>
        )}
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 p-8 space-y-6">
          {visibleNews.map((item) => {
             const styles = getContainerStyles(item.type);
             return (
                <div
                key={item.id}
                className={`p-6 rounded-2xl border transition-all hover:shadow-lg animate-fade-in ${styles.background} ${styles.border} ${styles.shadow}`}
                style={item.type !== 'urgent' ? { borderLeftWidth: '8px', borderLeftColor: styles.borderColor } : {}}
                >
                <div className="flex items-center gap-3 mb-3">
                    {getIcon(item.type)}
                    {item.type === 'urgent' && <span className="text-lg font-extrabold uppercase tracking-wide text-red-600">ВАЖНО</span>}
                    {item.type === 'birthday' && <span className="text-sm font-bold uppercase tracking-wide text-pink-600">День Рождения</span>}
                    {item.type === 'holiday' && <span className="text-sm font-bold uppercase tracking-wide text-yellow-600">Праздник</span>}
                </div>

                <p className={`text-2xl leading-normal ${item.type === 'urgent' ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                    {item.text}
                </p>
                </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({ store, onClose }) => {
  const { events, news, addEvent, updateEvent, deleteEvent, addNews, updateNews, deleteNews, isCloudEnabled } = store;
  const [activeTab, setActiveTab] = useState('events');
  const [editingId, setEditingId] = useState(null);

  const [eventForm, setEventForm] = useState({
    title: '', description: '', image: '', link: '', date: '', duration: 60
  });

  const [newsForm, setNewsForm] = useState({
    text: '', type: 'normal'
  });

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateEvent(editingId, eventForm);
        setEditingId(null);
      } else {
        await addEvent({
          ...eventForm,
          date: eventForm.date || new Date().toISOString()
        });
      }
      setEventForm({ title: '', description: '', image: '', link: '', date: '', duration: 60 });
    } catch (error) {
      alert("Не удалось сохранить событие. Проверьте подключение или права доступа.");
    }
  };

  const handleEditEvent = (event) => {
    setEditingId(event.id);
    const formattedDate = event.date ? new Date(event.date).toISOString().substring(0, 16) : '';
    setEventForm({
        title: event.title,
        description: event.description || '',
        image: event.image,
        link: event.link,
        date: formattedDate,
        duration: event.duration
    });
  };

  const handleSaveNews = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
          await updateNews(editingId, newsForm);
          setEditingId(null);
      } else {
          await addNews(newsForm);
      }
      setNewsForm({ text: '', type: 'normal' });
    } catch (error) {
      alert("Не удалось сохранить новость. Проверьте подключение или права доступа.");
    }
  };

  const handleEditNews = (item) => {
    setEditingId(item.id);
    setNewsForm({ text: item.text, type: item.type });
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id);
      if (editingId === id) {
          setEditingId(null);
          setEventForm({ title: '', description: '', image: '', link: '', date: '', duration: 60 });
      }
    } catch (error) {
      alert("Не удалось удалить событие.");
    }
  };

  const handleDeleteNews = async (id) => {
    try {
      await deleteNews(id);
      if (editingId === id) {
          setEditingId(null);
          setNewsForm({ text: '', type: 'normal' });
      }
    } catch (error) {
       alert("Не удалось удалить новость.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    if (activeTab === 'events') {
        setEventForm({ title: '', description: '', image: '', link: '', date: '', duration: 60 });
    } else {
        setNewsForm({ text: '', type: 'normal' });
    }
  };

  const getNewsIcon = (type) => {
    switch (type) {
        case 'birthday': return <Cake className="w-5 h-5 text-pink-500" />;
        case 'holiday': return <PartyPopper className="w-5 h-5 text-yellow-500" />;
        case 'urgent': return <AlertCircle className="w-5 h-5 text-red-500" />;
        default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-[100] overflow-y-auto font-sans">
      <div className="max-w-5xl mx-auto py-10 px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CMS Olami Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-500">Управление контентом экрана</p>
                {isCloudEnabled ? (
                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200">
                        <Cloud className="w-3 h-3" /> Облако
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full border border-gray-300">
                        <CloudOff className="w-3 h-3" /> Локально
                    </span>
                )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            <Maximize2 className="w-4 h-4" /> Вернуться на экран
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => { setActiveTab('events'); cancelEdit(); }}
              className={`flex-1 py-4 text-center font-medium transition`}
              style={{
                color: activeTab === 'events' ? BRAND_COLOR : '#6B7280',
                borderBottom: activeTab === 'events' ? `2px solid ${BRAND_COLOR}` : 'none',
                backgroundColor: activeTab === 'events' ? `${BRAND_COLOR}10` : 'transparent'
              }}
            >
              Афиши и Мероприятия
            </button>
            <button
              onClick={() => { setActiveTab('news'); cancelEdit(); }}
              className={`flex-1 py-4 text-center font-medium transition`}
              style={{
                color: activeTab === 'news' ? BRAND_COLOR : '#6B7280',
                borderBottom: activeTab === 'news' ? `2px solid ${BRAND_COLOR}` : 'none',
                backgroundColor: activeTab === 'news' ? `${BRAND_COLOR}10` : 'transparent'
              }}
            >
              Новости Сообщества
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'events' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl h-fit border-2 border-transparent transition-all" style={{ borderColor: editingId ? BRAND_COLOR : 'transparent' }}>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color: BRAND_COLOR}}>
                    {editingId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {editingId ? 'Редактировать событие' : 'Добавить событие'}
                  </h3>
                  <form onSubmit={handleSaveEvent} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                      <input
                        required
                        type="text"
                        value={eventForm.title}
                        onChange={e => setEventForm({...eventForm, title: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none"
                        style={{ '--tw-ring-color': BRAND_COLOR }}
                        placeholder="Например: Шаббат"
                      />
                      {/* Presets */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {PRESET_TITLES.map(preset => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setEventForm({...eventForm, title: preset})}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-full transition"
                            >
                                {preset}
                            </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Описание (опционально)</label>
                      <textarea
                        rows={2}
                        value={eventForm.description}
                        onChange={e => setEventForm({...eventForm, description: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none resize-none"
                        style={{ '--tw-ring-color': BRAND_COLOR }}
                        placeholder="Краткое описание события..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на картинку (Квадрат)</label>
                      <div className="flex gap-2">
                        <ImageIcon className="w-5 h-5 text-gray-400 mt-2" />
                        <input
                          required
                          type="url"
                          value={eventForm.image}
                          onChange={e => setEventForm({...eventForm, image: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none"
                          style={{ '--tw-ring-color': BRAND_COLOR }}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка для QR-кода</label>
                      <div className="flex gap-2">
                        <LinkIcon className="w-5 h-5 text-gray-400 mt-2" />
                        <input
                          required
                          type="text"
                          value={eventForm.link}
                          onChange={e => setEventForm({...eventForm, link: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none"
                          style={{ '--tw-ring-color': BRAND_COLOR }}
                          placeholder="olami.moscow/event"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Дата и время начала</label>
                      <input
                        required
                        type="datetime-local"
                        value={eventForm.date}
                        onChange={e => setEventForm({...eventForm, date: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none"
                        style={{ '--tw-ring-color': BRAND_COLOR }}
                      />
                    </div>
                    <div className="flex gap-2">
                        <button
                        type="submit"
                        className="flex-1 text-white font-bold py-3 rounded-lg transition shadow-md hover:opacity-90"
                        style={{ backgroundColor: BRAND_COLOR }}
                        >
                        {editingId ? 'Сохранить' : 'Создать'}
                        </button>
                        {editingId && (
                            <button
                            type="button"
                            onClick={cancelEdit}
                            className="bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300"
                            >
                            <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                  </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                  {events.map(event => (
                    <div
                        key={event.id}
                        onClick={() => handleEditEvent(event)}
                        className={`flex gap-4 p-4 border rounded-xl bg-white shadow-sm items-center cursor-pointer hover:border-purple-300 transition ${editingId === event.id ? 'ring-2 ring-purple-500 border-transparent' : 'border-gray-200'}`}
                    >
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                        <img src={event.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{event.title}</h4>
                        {event.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>}
                        <div className="text-sm text-gray-500 flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(event.date)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition z-10">
                           <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && <div className="text-center py-10 text-gray-400">Список пуст</div>}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* News Form */}
                 <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl h-fit border-2 border-transparent transition-all" style={{ borderColor: editingId ? BRAND_COLOR : 'transparent' }}>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color: BRAND_COLOR}}>
                    {editingId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {editingId ? 'Редактировать новость' : 'Добавить новость'}
                  </h3>
                  <form onSubmit={handleSaveNews} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Текст новости</label>
                      <textarea
                        required
                        maxLength={140}
                        rows={4}
                        value={newsForm.text}
                        onChange={e => setNewsForm({...newsForm, text: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none resize-none"
                        style={{ '--tw-ring-color': BRAND_COLOR }}
                        placeholder="Максимум 140 символов"
                      />
                      <div className="text-right text-xs text-gray-400">{newsForm.text.length}/140</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                      <select
                        value={newsForm.type}
                        onChange={e => setNewsForm({...newsForm, type: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none bg-white"
                        style={{ '--tw-ring-color': BRAND_COLOR }}
                      >
                        <option value="normal">Обычная (Информация)</option>
                        <option value="urgent">Срочная (Важно)</option>
                        <option value="birthday">День Рождения (Тортик)</option>
                        <option value="holiday">Праздник (Конфетти)</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                        type="submit"
                        className="flex-1 text-white font-bold py-3 rounded-lg transition shadow-md hover:opacity-90"
                        style={{ backgroundColor: BRAND_COLOR }}
                        >
                        {editingId ? 'Сохранить' : 'Опубликовать'}
                        </button>
                        {editingId && (
                            <button
                            type="button"
                            onClick={cancelEdit}
                            className="bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300"
                            >
                            <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                  </form>
                </div>

                {/* News List */}
                <div className="lg:col-span-2 space-y-3">
                  {news.map(item => (
                    <div
                        key={item.id}
                        onClick={() => handleEditNews(item)}
                        className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer hover:border-purple-300 transition ${editingId === item.id ? 'ring-2 ring-purple-500 border-transparent' : 'border-gray-200'} ${item.type === 'urgent' ? 'bg-red-50' : 'bg-white'}`}
                    >
                      <div className="flex-1 pr-4">
                         <div className="flex items-center gap-2 mb-1">
                            {getNewsIcon(item.type)}
                            {item.type === 'urgent' && <span className="text-xs font-bold text-red-600 uppercase">Срочно</span>}
                            {item.type === 'birthday' && <span className="text-xs font-bold text-pink-600 uppercase">День Рождения</span>}
                            {item.type === 'holiday' && <span className="text-xs font-bold text-yellow-600 uppercase">Праздник</span>}
                         </div>
                         <p className="text-gray-800">{item.text}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteNews(item.id); }} className="text-gray-400 hover:text-red-500 p-2 z-10">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const store = useStore();

  return (
    <div className="h-screen w-screen bg-white font-sans overflow-hidden flex flex-col text-gray-900">
      {isAdmin ? (
        <AdminPanel store={store} onClose={() => setIsAdmin(false)} />
      ) : (
        <>
          <div className="h-full w-full grid grid-rows-[96px_1fr] grid-cols-[3fr_1fr]">
            <div className="col-span-2">
              <Header toggleAdmin={() => setIsAdmin(true)} />
            </div>

            <div className="bg-black relative">
              <MainStage events={store.events} />
            </div>

            <div className="bg-gray-50 h-full overflow-hidden">
              <NewsFeed news={store.news} />
            </div>
          </div>
        </>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
