import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CloudSun,
  Calendar,
  MapPin,
  Settings,
  Plus,
  Trash2,
  AlertCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Maximize2,
  X,
  LayoutTemplate
} from 'lucide-react';

// --- MOCK DATA & CONSTANTS ---

const BRAND_COLOR = '#7652FF'; // Olami Purple

const INITIAL_EVENTS = [
  {
    id: 1,
    title: "Ханукальная Вечеринка",
    // Square image example to demonstrate new layout
    image: "https://images.unsplash.com/photo-1543092587-d8b8fe8327c9?auto=format&fit=crop&q=80&w=1000&h=1000",
    link: "https://olami.moscow/hanukkah",
    date: new Date(new Date().getTime() + 86400000).toISOString(), // Tomorrow
    duration: 120, // minutes
  },
  {
    id: 2,
    title: "Лекция: Бизнес и Тора",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1920",
    link: "https://olami.moscow/lecture",
    date: new Date(new Date().getTime() + 1000 * 60 * 30).toISOString(), // Starts in 30 mins
    duration: 60,
  }
];

const INITIAL_NEWS = [
  { id: 1, text: "Поздравляем Давида с помолвкой! Мазл Тов!", type: "normal" },
  { id: 2, text: "Внимание! Изменилось время начала Шаббата.", type: "urgent" },
  { id: 3, text: "Ищем волонтеров на упаковку подарков.", type: "normal" },
  { id: 4, text: "Забыт iPhone на ресепшн, просьба забрать.", type: "normal" }
];

// Placeholder for the new logo. Replace URL below when ready.
const OLAMI_LOGO = "https://static.tildacdn.com/tild3664-6533-4037-b864-376432303439/Vector.svg";

// --- UTILS ---

const generateQRCodeUrl = (data) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=000000&margin=10`;
};

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
};

// --- COMPONENTS ---

// 1. HEADER ZONE (Zone V)
const Header = ({ toggleAdmin }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
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
    // TV OPTIMIZATION: Increased height (h-24), padding (px-10), and font sizes
    <header className="h-24 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm z-50 relative">
      <div className="flex items-center gap-6">
        <img src={OLAMI_LOGO} alt="Olami" className="h-16 w-auto object-contain" />
        <div className="h-10 w-px bg-gray-300 mx-2"></div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-gray-800 leading-none">MOSCOW</span>
          <span className="text-sm text-gray-500 tracking-wider font-semibold">SMART DASHBOARD</span>
        </div>
      </div>

      <div className="flex items-center gap-10 text-gray-700">
        <div className="flex items-center gap-3">
          <CloudSun className="w-8 h-8" style={{ color: BRAND_COLOR }} />
          <span className="text-2xl font-medium">+2°C</span>
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

// 2. MAIN STAGE (Zone A)
const MainStage = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (events.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [events]);

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
      // TV OPTIMIZATION: Larger badges and positioning (top-12, left-12)
      <div
        className="absolute top-12 left-12 text-white px-8 py-4 rounded-xl shadow-xl animate-bounce z-20 border-2 border-white/20"
        style={{ backgroundColor: BRAND_COLOR }}
      >
        <span className="text-3xl font-bold uppercase tracking-wider">Начало через {diffMinutes} мин</span>
      </div>
    );
  } else if (diffMinutes <= 0 && diffMinutes > -event.duration) {
     statusBadge = (
      <div className="absolute top-12 left-12 bg-green-600 text-white px-8 py-4 rounded-xl shadow-xl z-20">
        <span className="text-3xl font-bold uppercase animate-pulse tracking-wider">ПРЯМО СЕЙЧАС</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden group">
      {/* Layer 1: Blurred Background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-2xl opacity-60 scale-110 transition-all duration-1000"
        style={{ backgroundImage: `url(${event.image})` }}
      ></div>
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Layer 2: The Actual Poster */}
      {/* TV OPTIMIZATION: Increased bottom padding (pb-48) to lift image above text area */}
      <div className="absolute inset-0 flex items-center justify-center p-12 pb-48">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-auto object-contain shadow-2xl rounded-2xl max-w-full"
        />
      </div>

      {statusBadge}

      {/* Content Overlay */}
      {/* TV OPTIMIZATION: Increased padding (p-14) for TV Safe Area */}
      <div className="absolute bottom-0 left-0 right-0 p-14 flex items-end justify-between z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent">

        {/* Text Info */}
        <div className="text-white max-w-4xl">
          {/* TV OPTIMIZATION: Huge text (text-7xl) for readability from distance */}
          <h2 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl text-white">
            {event.title}
          </h2>
          <div className="flex items-center gap-6 text-2xl text-gray-100">
            <span className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-xl backdrop-blur-md border border-white/20">
              <Calendar className="w-8 h-8" /> {formatDate(event.date)}
            </span>
          </div>
        </div>

        {/* QR Code Container */}
        {/* TV OPTIMIZATION: Larger QR container (w-[240px]) for easier scanning */}
        <div className="bg-white p-4 rounded-2xl shadow-2xl transform transition-transform hover:scale-105 flex flex-col items-center gap-3 max-w-[240px]">
          <div className="relative w-[200px] h-[200px]">
            <img
              src={generateQRCodeUrl(event.link)}
              alt="QR Registration"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center w-full">
            <p
              className="font-bold text-lg uppercase tracking-wide"
              style={{ color: BRAND_COLOR }}
            >
              Регистрация
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-2 transition-all duration-1000"
           style={{ width: `${((currentIndex + 1) / events.length) * 100}%`, backgroundColor: BRAND_COLOR }}></div>
    </div>
  );
};

// 3. NEWS FEED (Zone B)
const NewsFeed = ({ news }) => {
  return (
    <div className="h-full bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* TV OPTIMIZATION: Larger Header padding */}
      <div className="p-8 bg-white border-b border-gray-200 shadow-sm z-10">
        <h3
          className="text-2xl font-bold uppercase tracking-wider flex items-center gap-3"
          style={{ color: BRAND_COLOR }}
        >
          <LayoutTemplate className="w-7 h-7" />
          Дайджест
        </h3>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto p-8 space-y-6 pb-24 scrollbar-hide">
          {news.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md bg-white`}
              style={{
                borderLeftWidth: '6px',
                borderLeftColor: item.type === 'urgent' ? '#EF4444' : BRAND_COLOR // Red for urgent, Brand for normal
              }}
            >
              {item.type === 'urgent' && (
                <div className="flex items-center gap-2 text-red-600 mb-3">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-wide">Важно</span>
                </div>
              )}
              {/* TV OPTIMIZATION: Larger text (text-2xl) and leading-normal for better reading */}
              <p className={`text-2xl leading-normal ${item.type === 'urgent' ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                {item.text}
              </p>
            </div>
          ))}

          <div className="sticky bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

// 4. ADMIN PANEL (CMS) - Mostly unchanged, just keeping consistent styles
const AdminPanel = ({ events, setEvents, news, setNews, onClose }) => {
  const [activeTab, setActiveTab] = useState('events');

  const [newEvent, setNewEvent] = useState({
    title: '', image: '', link: '', date: '', duration: 60
  });

  const [newNewsItem, setNewNewsItem] = useState({
    text: '', type: 'normal'
  });

  const handleAddEvent = (e) => {
    e.preventDefault();
    const event = {
      id: Date.now(),
      ...newEvent,
      date: newEvent.date || new Date().toISOString()
    };
    setEvents([...events, event]);
    setNewEvent({ title: '', image: '', link: '', date: '', duration: 60 });
  };

  const handleAddNews = (e) => {
    e.preventDefault();
    setNews([{ id: Date.now(), ...newNewsItem }, ...news]);
    setNewNewsItem({ text: '', type: 'normal' });
  };

  const deleteEvent = (id) => setEvents(events.filter(e => e.id !== id));
  const deleteNews = (id) => setNews(news.filter(n => n.id !== id));

  return (
    <div className="fixed inset-0 bg-gray-100 z-[100] overflow-y-auto font-sans">
      <div className="max-w-5xl mx-auto py-10 px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CMS Olami Dashboard</h1>
            <p className="text-gray-500">Управление контентом экрана</p>
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
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-4 text-center font-medium transition`}
              style={{
                color: activeTab === 'events' ? BRAND_COLOR : '#6B7280',
                borderBottom: activeTab === 'events' ? `2px solid ${BRAND_COLOR}` : 'none',
                backgroundColor: activeTab === 'events' ? `${BRAND_COLOR}10` : 'transparent' // 10% opacity
              }}
            >
              Афиши и Мероприятия
            </button>
            <button
              onClick={() => setActiveTab('news')}
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
                <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl h-fit">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color: BRAND_COLOR}}>
                    <Plus className="w-5 h-5" /> Добавить событие
                  </h3>
                  <form onSubmit={handleAddEvent} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                      <input
                        required
                        type="text"
                        value={newEvent.title}
                        onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none"
                        style={{ '--tw-ring-color': BRAND_COLOR }}
                        placeholder="Например: Шаббат"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на картинку (Квадрат или 16:9)</label>
                      <div className="flex gap-2">
                        <ImageIcon className="w-5 h-5 text-gray-400 mt-2" />
                        <input
                          required
                          type="url"
                          value={newEvent.image}
                          onChange={e => setNewEvent({...newEvent, image: e.target.value})}
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
                          value={newEvent.link}
                          onChange={e => setNewEvent({...newEvent, link: e.target.value})}
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
                        value={newEvent.date}
                        onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none"
                        style={{ '--tw-ring-color': BRAND_COLOR }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full text-white font-bold py-3 rounded-lg transition shadow-md hover:opacity-90"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      Создать слайд
                    </button>
                  </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                  {events.map(event => (
                    <div key={event.id} className="flex gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm items-center">
                      <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={event.image} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{event.title}</h4>
                        <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(event.date)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <img src={generateQRCodeUrl(event.link)} alt="qr" className="w-10 h-10 border" />
                         <button onClick={() => deleteEvent(event.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
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
                 <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl h-fit">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color: BRAND_COLOR}}>
                    <Plus className="w-5 h-5" /> Добавить новость
                  </h3>
                  <form onSubmit={handleAddNews} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Текст новости</label>
                      <textarea
                        required
                        maxLength={140}
                        rows={4}
                        value={newNewsItem.text}
                        onChange={e => setNewNewsItem({...newNewsItem, text: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none resize-none"
                        style={{ '--tw-ring-color': BRAND_COLOR }}
                        placeholder="Максимум 140 символов"
                      />
                      <div className="text-right text-xs text-gray-400">{newNewsItem.text.length}/140</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                      <select
                        value={newNewsItem.type}
                        onChange={e => setNewNewsItem({...newNewsItem, type: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 outline-none bg-white"
                        style={{ '--tw-ring-color': BRAND_COLOR }}
                      >
                        <option value="normal">Обычная</option>
                        <option value="urgent">Срочная (Важно)</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full text-white font-bold py-3 rounded-lg transition shadow-md hover:opacity-90"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      Опубликовать
                    </button>
                  </form>
                </div>

                {/* News List */}
                <div className="lg:col-span-2 space-y-3">
                  {news.map(item => (
                    <div key={item.id} className={`flex justify-between items-center p-4 rounded-xl border ${item.type === 'urgent' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                      <div className="flex-1 pr-4">
                         {item.type === 'urgent' && <span className="text-xs font-bold text-red-600 uppercase mb-1 block">Срочно</span>}
                         <p className="text-gray-800">{item.text}</p>
                      </div>
                      <button onClick={() => deleteNews(item.id)} className="text-gray-400 hover:text-red-500 p-2">
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

// 5. MAIN APP CONTAINER
export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  // Storage logic
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('olami_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [news, setNews] = useState(() => {
    const saved = localStorage.getItem('olami_news');
    return saved ? JSON.parse(saved) : INITIAL_NEWS;
  });

  useEffect(() => {
    localStorage.setItem('olami_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('olami_news', JSON.stringify(news));
  }, [news]);

  return (
    <div className="h-screen w-screen bg-white font-sans overflow-hidden flex flex-col text-gray-900">

      {/* View Switcher */}
      {isAdmin ? (
        <AdminPanel
          events={events}
          setEvents={setEvents}
          news={news}
          setNews={setNews}
          onClose={() => setIsAdmin(false)}
        />
      ) : (
        <>
          {/* Dashboard Grid Layout */}
          {/* TV OPTIMIZATION: Updated grid rows to accommodate larger header (96px/6rem) */}
          <div className="h-full w-full grid grid-rows-[96px_1fr] grid-cols-[3fr_1fr]">

            {/* Zone C: Header */}
            <div className="col-span-2">
              <Header toggleAdmin={() => setIsAdmin(true)} />
            </div>

            {/* Zone A: Main Stage */}
            <div className="bg-black relative">
              <MainStage events={events} />
            </div>

            {/* Zone B: News Feed */}
            <div className="bg-gray-50 h-full overflow-hidden">
              <NewsFeed news={news} />
            </div>

          </div>
        </>
      )}

      {/* Styles for Hide Scrollbar utility */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
