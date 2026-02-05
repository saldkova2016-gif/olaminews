import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import { QRCodeSVG } from 'qrcode.react';
import { useData } from '../../context/DataContext';
import { DateTime } from 'luxon';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const MainStage = () => {
  const { events } = useData();
  const sliderRef = useRef(null);
  const [urgentEventIndex, setUrgentEventIndex] = useState(-1);

  // Filter events that are valid (e.g., not in the past, or handled by "show dates")
  // For now, show all events sorted by date
  const sortedEvents = [...events].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  useEffect(() => {
    const checkUrgentEvent = () => {
      const now = DateTime.now();
      const index = sortedEvents.findIndex(event => {
        const eventTime = DateTime.fromISO(event.datetime);
        const diff = eventTime.diff(now, 'minutes').minutes;
        // Urgent if starts within 30 mins and hasn't finished (using actual duration or default 120m)
        const duration = event.duration || 120;
        return diff <= 30 && diff > -duration;
      });

      if (index !== -1) {
        setUrgentEventIndex(index);
        if (sliderRef.current) {
          sliderRef.current.slickGoTo(index);
        }
      } else {
        setUrgentEventIndex(-1);
      }
    };

    checkUrgentEvent();
    const interval = setInterval(checkUrgentEvent, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [sortedEvents]);

  const settings = {
    dots: false,
    infinite: sortedEvents.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: urgentEventIndex === -1, // Stop autoplay if urgent
    autoplaySpeed: 5000,
    arrows: false,
    fade: true,
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 text-gray-400">
        <p>No events to display.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-black overflow-hidden group">
      <Slider ref={sliderRef} {...settings} className="h-full">
        {sortedEvents.map((event, idx) => (
          <div key={event.id} className="h-full relative outline-none">
            {/* Poster Image */}
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${event.image})`, height: 'calc(100vh - 80px)' }} // Adjust for header height
            />

            {/* QR Code Overlay */}
            <div className="absolute bottom-12 right-12 bg-white p-4 rounded-lg shadow-xl flex flex-col items-center gap-2 transform transition-transform duration-500 hover:scale-105">
              <QRCodeSVG value={event.link} size={150} level="M" />
              <span className="text-black font-bold uppercase tracking-wide text-sm">Регистрация</span>
            </div>

            {/* "Right Now" / "Starting Soon" Overlay */}
            {urgentEventIndex === idx && (
              <div className="absolute top-12 left-12 bg-red-600 text-white px-8 py-4 rounded-r-full shadow-lg animate-pulse">
                <span className="text-4xl font-extrabold uppercase tracking-widest">ПРЯМО СЕЙЧАС</span>
              </div>
            )}

             {/* "Starts In" Overlay (if not Right Now but soon) */}
             {urgentEventIndex !== idx && (
               (() => {
                 const diff = DateTime.fromISO(event.datetime).diffNow('minutes').minutes;
                 if (diff > 0 && diff < 120) {
                    return (
                        <div className="absolute top-12 right-12 bg-brand text-white px-6 py-2 rounded-lg shadow-lg">
                            <span className="font-bold">Начало через {Math.ceil(diff)} мин</span>
                        </div>
                    )
                 }
               })()
             )}

          </div>
        ))}
      </Slider>
    </div>
  );
};

export default MainStage;
