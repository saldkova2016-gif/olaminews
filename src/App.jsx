import React, { useState, useEffect } from 'react';
import { useStore } from './hooks/useStore';
import { QRCodeSVG } from 'qrcode.react';
import { PHOTO_URLS } from './data/photos';
import {
  Clock,
  CloudSun,
  Calendar,
  Settings as SettingsIcon,
  AlertCircle,
  Image as ImageIcon,
  LayoutTemplate,
  Cake,
  PartyPopper,
  Info,
  Loader2,
  X,
  Maximize2,
  Moon,
  Sun,
  ZoomIn,
  Presentation
} from 'lucide-react';

const BRAND_COLOR = '#7652FF'; // Olami Purple

const OLAMI_LOGO_LIGHT = "https://static.tildacdn.com/tild3664-6533-4037-b864-376432303439/Vector.svg";
const OLAMI_LOGO_DARK = "https://olami-moscow.umvert.dev/wp-content/uploads/2025/09/olami-logo-1.svg";

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

const ClockWidget = ({ theme }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex items-center gap-3 px-6 py-2 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <Clock className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
      <span className={`text-3xl font-bold font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} data-testid="clock-time">
        {time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

const Header = ({ toggleSettings, theme }) => {
  const [weather, setWeather] = useState(null);

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

  const logoSrc = theme === 'dark' ? OLAMI_LOGO_DARK : OLAMI_LOGO_LIGHT;
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-700';
  const bgColor = theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';

  return (
    <header className={`h-24 border-b flex items-center justify-between px-10 shadow-sm z-50 relative ${bgColor}`}>
      <div className="flex items-center gap-6">
        <img src={logoSrc} alt="Olami" className="h-16 w-auto object-contain" />
        <div className="h-10 w-px bg-gray-300 mx-2 opacity-30"></div>
      </div>

      <div className={`flex items-center gap-10 ${textColor}`}>
        <div className="flex items-center gap-3">
          <CloudSun className="w-8 h-8" style={{ color: BRAND_COLOR }} />
          <span className="text-2xl font-medium">
            {weather !== null ? (weather > 0 ? `+${weather}` : weather) : '...'}°C
          </span>
        </div>

        <ClockWidget theme={theme} />

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: BRAND_COLOR }}></div>
          <span className={`text-xl font-medium ${textColor}`}>{getShabbatTimer()}</span>
        </div>

        <button onClick={toggleSettings} className="opacity-30 hover:opacity-100 transition-opacity p-2">
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export const ProgressBar = ({ duration, color = BRAND_COLOR }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const step = 100 / (duration / 100);

    const timer = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) return 100;
            return prev + step;
        });
    }, 100);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <div className="absolute bottom-0 left-0 h-3 bg-black/20 w-full z-50">
        <div
          className="h-full transition-all duration-100 ease-linear"
          style={{
              width: `${progress}%`,
              backgroundColor: color
          }}
        ></div>
    </div>
  );
};

export const PhotoSlideshow = () => {
  const [index, setIndex] = useState(0);
  const DURATION = 8000;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % PHOTO_URLS.length);
    }, DURATION);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
        {PHOTO_URLS.map((url, i) => (
            <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'}`}
            >
                <div
                    className={`w-full h-full transition-transform duration-[10000ms] ease-linear ${i === index ? 'scale-110' : 'scale-100'}`}
                    style={{
                        backgroundImage: `url(${url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
        ))}
    </div>
  );
};

export const BackgroundLayer = ({ theme, slideshowMode, events, currentEventIndex }) => {
    if (slideshowMode) {
        return (
            <div
                className="w-full h-full transition-colors duration-300"
                style={{ backgroundColor: theme === 'dark' ? '#000' : '#fff' }}
            />
        );
    }

    const event = events[currentEventIndex];
    if (event) {
        return (
            <div
                className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-110 transition-all duration-1000"
                style={{ backgroundImage: `url(${event.image})` }}
            ></div>
        );
    }

    // Default solid background if no event or loading
    return (
        <div
            className="w-full h-full transition-colors duration-300"
            style={{ backgroundColor: theme === 'dark' ? '#000' : '#fff' }}
        />
    );
};

export const MainStage = ({ events, theme, mode = 'standard', currentEventIndex }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Map 'sidebar' mode to the internal concept of 'compact' for layout reuse
  const isCompact = mode === 'sidebar';

  // Use prop index to determine event
  const event = events[currentEventIndex];

  useEffect(() => {
      // Simulate loading state on index change if needed for transition effects
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
  }, [currentEventIndex]);

  if (events.length === 0) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
        <div className="text-center">
          <ImageIcon className="w-24 h-24 mx-auto mb-6 opacity-50" />
          <p className="text-3xl">Нет активных событий</p>
        </div>
      </div>
    );
  }

  if (!event) return null;

  // Status Logic
  const eventDate = new Date(event.date);
  const now = new Date();
  const diffMinutes = Math.floor((eventDate - now) / (1000 * 60));

  let statusBadge = null;
  if (diffMinutes <= 60 && diffMinutes > 0) {
    statusBadge = (
      <div
        className={`absolute top-4 left-4 text-white rounded-lg shadow-lg z-20 animate-bounce ${isCompact ? 'px-3 py-1 text-sm' : 'px-6 py-3 text-2xl border-2 border-white/20'}`}
        style={{ backgroundColor: BRAND_COLOR }}
      >
        <span className="font-bold uppercase tracking-wider">Начало через {diffMinutes} мин</span>
      </div>
    );
  } else if (diffMinutes <= 0 && diffMinutes > -event.duration) {
     statusBadge = (
      <div className={`absolute top-4 left-4 bg-green-600 text-white rounded-lg shadow-lg z-20 ${isCompact ? 'px-3 py-1 text-sm' : 'px-6 py-3 text-2xl'}`}>
        <span className="font-bold uppercase animate-pulse tracking-wider">ПРЯМО СЕЙЧАС</span>
      </div>
    );
  }

  // Use explicit dark/light text logic.
  // In Standard Mode, the background is the event image (dark/colorful), so text is white.
  // In Sidebar/Compact Mode, we force a dark background, so text is white.
  // We effectively always want white text for readability.
  const textColor = 'text-white';
  const dateColor = 'text-gray-200';

  return (
    <div className={`relative w-full h-full overflow-hidden flex bg-transparent`}>
      {isCompact ? (
        // Sidebar / Compact View
        // Centered Vertical Layout for the Right Column
        // Order: Title -> Large Image -> Date -> Large QR
        <div className="w-full h-full flex flex-col items-center justify-between p-6 py-8 animate-fade-in text-center overflow-y-auto scrollbar-hide">
             {/* 1. Title */}
             <h2 className="text-3xl font-bold text-white leading-tight line-clamp-3 mb-4">
                {event.title}
             </h2>

             {/* 2. Large Image */}
             <div className="w-full aspect-[4/3] bg-white/10 rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative group mb-4 flex-shrink-0">
                <img
                    src={event.image}
                    alt=""
                    className="w-full h-full object-cover"
                />
                {statusBadge && <div className="absolute top-2 left-2 scale-75 origin-top-left">{statusBadge}</div>}
             </div>

             {/* 3. Date */}
             <div className="flex items-center gap-2 text-xl text-gray-300 bg-white/10 px-6 py-3 rounded-xl mb-4 flex-shrink-0">
                 <Calendar className="w-6 h-6 text-[#7652FF]" />
                 <span className="font-medium">{formatDate(event.date)}</span>
             </div>

             {/* 4. Large QR */}
             <div className="bg-white p-4 rounded-3xl shadow-xl flex-shrink-0">
                <QRCodeSVG
                    value={getQRCodeValue(event.link)}
                    size={220}
                    level="M"
                    includeMargin={false}
                />
             </div>
        </div>
      ) : (
        // Standard Full View
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

            <div className="flex-1 flex flex-col items-start pt-4 overflow-hidden">
                <h2 className={`text-5xl lg:text-7xl font-bold leading-tight mb-4 drop-shadow-lg ${textColor}`}>
                    {event.title}
                </h2>

                {event.description && (
                <p className="text-xl lg:text-3xl text-gray-200 mb-8 leading-relaxed opacity-90 font-light border-l-4 pl-4 drop-shadow-md" style={{ borderColor: BRAND_COLOR }}>
                    {event.description}
                </p>
                )}

                <div className={`flex items-center gap-4 text-2xl mb-10 bg-white/10 px-6 py-3 rounded-xl backdrop-blur-md border border-white/20 w-fit shadow-lg ${dateColor}`}>
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
      )}

      {events.length > 1 && !isCompact && (
        <ProgressBar duration={60000} key={currentEventIndex} />
      )}
    </div>
  );
};

const NewsFeed = ({ news, theme, compact = false }) => {
  const [currentPage, setCurrentPage] = useState(0);
  // Compact mode shows fewer items to fit height
  const ITEMS_PER_PAGE = compact ? 2 : 3;

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
  }, [news.length, ITEMS_PER_PAGE]);

  const visibleNews = news.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  const getIcon = (type) => {
    const size = compact ? 'w-6 h-6' : 'w-8 h-8';
    switch (type) {
      case 'birthday': return <Cake className={`${size} text-pink-500 flex-shrink-0`} />;
      case 'holiday': return <PartyPopper className={`${size} text-yellow-500 flex-shrink-0`} />;
      case 'urgent': return <AlertCircle className={`${size} text-red-600 flex-shrink-0`} />;
      default: return <Info className={`${size} text-blue-500 flex-shrink-0`} />;
    }
  };

  const getContainerStyles = (type) => {
    const isDark = theme === 'dark';

    if (type === 'urgent') {
        return {
            background: isDark ? 'bg-red-900/20' : 'bg-red-50',
            border: 'border-l-8 border-red-600',
            shadow: isDark ? 'shadow-none' : 'shadow-md shadow-red-100',
            text: isDark ? 'text-red-100' : 'text-gray-900'
        };
    }

    const borderColor = type === 'birthday' ? '#EC4899' : type === 'holiday' ? '#EAB308' : BRAND_COLOR;
    return {
        background: isDark ? 'bg-gray-800' : 'bg-white',
        border: '',
        borderColor: borderColor,
        shadow: 'shadow-sm',
        text: isDark ? 'text-gray-200' : 'text-gray-700'
    };
  };

  const containerBg = 'bg-transparent';
  const headerBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className={`h-full border-l flex flex-col ${containerBg}`}>
      <div className={`shadow-sm z-10 flex justify-between items-center ${headerBg} ${compact ? 'p-4' : 'p-8 border-b'}`}>
        <h3
          className={`${compact ? 'text-lg' : 'text-2xl'} font-bold uppercase tracking-wider flex items-center gap-3`}
          style={{ color: BRAND_COLOR }}
        >
          <LayoutTemplate className={`${compact ? 'w-5 h-5' : 'w-7 h-7'}`} />
          Дайджест
        </h3>
        {news.length > ITEMS_PER_PAGE && (
            <span className="text-sm text-gray-400">Стр {currentPage + 1}/{Math.ceil(news.length / ITEMS_PER_PAGE)}</span>
        )}
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 space-y-6 ${compact ? 'p-4 space-y-4' : 'p-8'}`}>
          {visibleNews.map((item) => {
             const styles = getContainerStyles(item.type);
             return (
                <div
                key={item.id}
                className={`rounded-2xl border transition-all hover:shadow-lg animate-fade-in ${styles.background} ${styles.border} ${styles.shadow} ${compact ? 'p-4' : 'p-6'}`}
                style={item.type !== 'urgent' ? { borderLeftWidth: '8px', borderLeftColor: styles.borderColor } : {}}
                >
                <div className={`flex items-center gap-3 ${compact ? 'mb-2' : 'mb-3'}`}>
                    {getIcon(item.type)}
                    {item.type === 'urgent' && <span className={`${compact ? 'text-sm' : 'text-lg'} font-extrabold uppercase tracking-wide text-red-600`}>ВАЖНО</span>}
                    {item.type === 'birthday' && <span className="text-sm font-bold uppercase tracking-wide text-pink-600">День Рождения</span>}
                    {item.type === 'holiday' && <span className="text-sm font-bold uppercase tracking-wide text-yellow-600">Праздник</span>}
                </div>

                <p className={`leading-normal ${styles.text} ${item.type === 'urgent' ? 'font-bold' : ''} ${compact ? 'text-lg line-clamp-3' : 'text-2xl'}`}>
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

const SettingsPanel = ({ onClose, theme, setTheme, scale, setScale, slideshowMode, setSlideshowMode }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-gray-500" />
            Настройки экрана
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
             <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-8 space-y-8">
            {/* Theme Toggle */}
            <div>
                <label className="block text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Тема оформления</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setTheme('light')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition font-medium ${theme === 'light' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Sun className="w-5 h-5" /> Светлая
                    </button>
                    <button
                         onClick={() => setTheme('dark')}
                         className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition font-medium ${theme === 'dark' ? 'bg-gray-800 shadow-sm text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Moon className="w-5 h-5" /> Темная
                    </button>
                </div>
            </div>

            {/* Slideshow Mode Toggle */}
            <div>
                <label className="block text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Режим отображения</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setSlideshowMode(false)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition font-medium ${!slideshowMode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LayoutTemplate className="w-5 h-5" /> Стандарт
                    </button>
                    <button
                         onClick={() => setSlideshowMode(true)}
                         className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition font-medium ${slideshowMode ? 'bg-gray-800 shadow-sm text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Presentation className="w-5 h-5" /> Слайд-шоу
                    </button>
                </div>
            </div>

            {/* Scale Slider */}
            <div>
                 <label className="block text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider flex justify-between">
                    <span>Масштаб интерфейса</span>
                    <span className="text-gray-900 font-bold">{Math.round(scale * 100)}%</span>
                 </label>
                 <div className="flex items-center gap-4">
                    <ZoomIn className="w-5 h-5 text-gray-400" />
                    <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#7652FF]"
                    />
                 </div>
                 <p className="text-xs text-gray-400 mt-2">Регулируйте размер элементов для оптимального отображения на ТВ.</p>
            </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
             <button
                onClick={onClose}
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg"
             >
                Применить настройки
             </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('olami_theme') || 'dark');
  const [scale, setScale] = useState(() => parseFloat(localStorage.getItem('olami_scale')) || 1);
  const [slideshowMode, setSlideshowMode] = useState(() => localStorage.getItem('olami_slideshow_mode') === 'true');

  const store = useStore();

  // Lift MainStage slider state to App to sync BackgroundLayer
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const INTERVAL_MS = 60000;

  useEffect(() => {
    if (store.events.length <= 1) return;
    const slideTimer = setInterval(() => {
        setCurrentEventIndex((prev) => (prev + 1) % store.events.length);
    }, INTERVAL_MS);
    return () => clearInterval(slideTimer);
  }, [store.events.length]);


  useEffect(() => {
    localStorage.setItem('olami_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('olami_scale', scale);
  }, [scale]);

  useEffect(() => {
    localStorage.setItem('olami_slideshow_mode', slideshowMode);
  }, [slideshowMode]);

  return (
    <div
        className="h-screen w-screen overflow-hidden relative font-sans transition-colors duration-300 bg-black"
    >
      {/*
        LAYER 0: BACKGROUND (Unscaled)
        This layer stays 100% viewport size regardless of scale setting.
        It contains the visual "substrate" (Theme Color, Blur Image, or Slideshow).
      */}
      <div className="absolute inset-0 z-0">
          <BackgroundLayer
            theme={theme}
            slideshowMode={slideshowMode}
            events={store.events}
            currentEventIndex={currentEventIndex}
          />
      </div>

      {/* Settings Modal (Fixed on top, not scaled) */}
      {showSettings && (
        <SettingsPanel
            onClose={() => setShowSettings(false)}
            theme={theme}
            setTheme={setTheme}
            scale={scale}
            setScale={setScale}
            slideshowMode={slideshowMode}
            setSlideshowMode={setSlideshowMode}
        />
      )}

      {/*
        LAYER 1: CONTENT (Scaled)
        This contains the UI elements (Text, Cards, QR) which float *over* the background.
        The wrapper itself compensates size so 100% inside matches visual viewport.
      */}
      <div
        className="absolute inset-0 z-10 overflow-hidden"
      >
        <div
            className="w-full h-full flex flex-col origin-top-left transition-transform duration-200"
            style={{
                transform: `scale(${scale})`,
                width: `${100 / scale}%`,
                height: `${100 / scale}%`
            }}
        >
            <div className="w-full">
                <Header toggleSettings={() => setShowSettings(true)} theme={theme} />
            </div>

            {/* Content Grid: 2 Columns */}
            <div className="flex-1 w-full h-[calc(100%-96px)] grid grid-cols-[3fr_1fr]">

                {/* Left Column (Main) */}
                <div className="relative w-full h-full flex flex-col overflow-hidden rounded-r-2xl">
                    {/* Standard Mode: MainStage */}
                    {!slideshowMode && (
                        <MainStage
                            events={store.events}
                            theme={theme}
                            mode="standard"
                            currentEventIndex={currentEventIndex}
                        />
                    )}

                    {/* Slideshow Mode: Photos + Progress Bar */}
                    {slideshowMode && (
                        <>
                            <div className="absolute inset-0 z-0">
                                <PhotoSlideshow />
                            </div>
                            <ProgressBar duration={60000} key={currentEventIndex} />
                        </>
                    )}
                </div>

                {/* Right Column (News or Sidebar Event) */}
                <div
                    className={`h-full overflow-hidden border-l ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}
                    style={{
                        backgroundColor: slideshowMode
                            ? (theme === 'dark' ? 'rgba(17, 24, 39, 1)' : 'rgba(0, 0, 0, 1)') // Force dark sidebar in slideshow mode
                            : (theme === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(249, 250, 251, 0.9)')
                    }}
                >
                    {slideshowMode ? (
                        <MainStage
                            events={store.events}
                            theme={theme}
                            mode="sidebar"
                            currentEventIndex={currentEventIndex}
                        />
                    ) : (
                        <NewsFeed news={store.news} theme={theme} />
                    )}
                </div>
            </div>
        </div>
      </div>

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
        input[type=range] {
           accent-color: #7652FF;
        }
      `}</style>
    </div>
  );
}
