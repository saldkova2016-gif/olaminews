import { DateTime } from 'luxon';

const MONTHS = {
  'января': 1, 'февраля': 2, 'марта': 3, 'апреля': 4, 'мая': 5, 'июня': 6,
  'июля': 7, 'августа': 8, 'сентября': 9, 'октября': 10, 'ноября': 11, 'декабря': 12
};

const WEEKDAYS = {
  'понедельник': 1, 'вторник': 2, 'среда': 3, 'четверг': 4, 'пятница': 5, 'суббота': 6, 'воскресенье': 7
};

export const parseAfisha = (htmlContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const products = doc.querySelectorAll('.t778__product-full');
  const events = [];

  products.forEach(product => {
    try {
      const id = product.getAttribute('data-product-lid') || Date.now().toString();

      const titleEl = product.querySelector('.t778__title');
      const title = titleEl ? titleEl.textContent.trim() : 'Без названия';

      const imgEl = product.querySelector('.t-slds__bgimg');
      const image = imgEl ? imgEl.getAttribute('data-original') : '';

      // The description with details is usually in the right column
      const rightCol = product.querySelector('.t778__col_right');
      const descEl = product.querySelector('.t778__descr');
      const fullDescEl = rightCol ? rightCol.querySelector('.t778__descr') : descEl;

      const description = fullDescEl ? fullDescEl.textContent.trim() : '';

      // Clean description for display (remove "Информация о мероприятии:..." part)
      const shortDesc = description.split('Информация о мероприятии:')[0].trim();

      // Extract Date and Time
      let dateIso = null;
      let rawDate = null;
      let rawTime = null;

      const dateMatch = description.match(/📆\s*(\d{1,2})\s+([а-яА-Яё]+)/i);
      const weeklyMatch = description.match(/📆\s*Кажд[а-я]+\s+([а-яА-Яё\s,]+)/i);
      const timeMatch = description.match(/⏰\s*(\d{1,2}:\d{2})/);

      if (timeMatch) rawTime = timeMatch[1];

      let eventDateTime = null;
      const now = DateTime.now().setZone('Europe/Moscow');

      if (dateMatch && timeMatch) {
        rawDate = dateMatch[0];
        const day = parseInt(dateMatch[1], 10);
        const monthStr = dateMatch[2].toLowerCase();
        const month = MONTHS[monthStr];

        if (month) {
          const [hour, minute] = timeMatch[1].split(':').map(Number);
          let year = now.year;

          let dt = DateTime.fromObject({ year, month, day, hour, minute }, { zone: 'Europe/Moscow' });

          // If the date is significantly in the past (e.g. > 1 month ago), assume next year.
          if (dt < now.minus({ months: 1 })) {
            dt = dt.plus({ years: 1 });
          }
          eventDateTime = dt;
        }
      } else if (weeklyMatch && timeMatch) {
        rawDate = weeklyMatch[0];
        const daysStr = weeklyMatch[1].toLowerCase();
        const [hour, minute] = timeMatch[1].split(':').map(Number);

        const targetWeekdays = [];
        for (const [name, val] of Object.entries(WEEKDAYS)) {
          if (daysStr.includes(name)) {
            targetWeekdays.push(val);
          }
        }

        if (targetWeekdays.length > 0) {
          let bestDate = null;

          for (const weekday of targetWeekdays) {
            let dt = now.set({ hour, minute, second: 0, millisecond: 0 });
            let diff = weekday - dt.weekday;
            if (diff < 0) diff += 7;
            if (diff === 0 && dt < now) diff += 7; // If today, but time passed, next week

            const nextDt = dt.plus({ days: diff });

            if (!bestDate || nextDt < bestDate) {
              bestDate = nextDt;
            }
          }
          eventDateTime = bestDate;
        }
      }

      if (eventDateTime) {
        dateIso = eventDateTime.toISO();
      }

      if (title) {
          events.push({
            id,
            title,
            description: shortDesc || description,
            image,
            date: dateIso,
            duration: 120,
            link: `https://olami.moscow/afisha#prodpopup`,
            rawDate,
            rawTime
          });
      }
    } catch (err) {
      console.error('Error parsing event:', err);
    }
  });

  return events;
};
