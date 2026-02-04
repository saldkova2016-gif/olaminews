import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { Cloud, Clock, Sun } from 'lucide-react';

const Header = () => {
  const [time, setTime] = useState(DateTime.now());
  const [shabbatTime, setShabbatTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(DateTime.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Calculate time until next Friday 18:00 (approximate sunset for demo)
    const calculateShabbatTimer = () => {
      const now = DateTime.now();
      let nextFriday = now.set({ weekday: 5, hour: 18, minute: 0, second: 0 });
      if (now > nextFriday) {
        nextFriday = nextFriday.plus({ weeks: 1 });
      }
      const diff = nextFriday.diff(now, ['days', 'hours', 'minutes']);
      setShabbatTime(`${diff.days}d ${diff.hours}h ${Math.floor(diff.minutes)}m`);
    };

    calculateShabbatTimer();
    const timer = setInterval(calculateShabbatTimer, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 h-20 px-8 flex items-center justify-between shadow-sm">
      {/* Time */}
      <div className="flex items-center gap-3 text-brand">
        <Clock size={32} />
        <span className="text-4xl font-bold tracking-widest">
          {time.toFormat('HH:mm')}
        </span>
        <span className="text-xl text-gray-500 font-medium">
          {time.toFormat('EEE, MMM dd')}
        </span>
      </div>

      {/* Shabbat Timer */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">До Шаббата</span>
        <span className="text-2xl font-bold text-gray-800">{shabbatTime}</span>
      </div>

      {/* Weather (Mock) */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">-5°C</div>
          <div className="text-xs text-gray-500">Москва</div>
        </div>
        <Cloud size={32} className="text-gray-400" />
      </div>
    </div>
  );
};

export default Header;
