import { DateTime } from 'luxon';

const now = DateTime.now().setZone('Europe/Moscow');

const getNextDayOfWeek = (dayIndex, hour, minute) => {
  let date = now.set({ hour, minute, second: 0, millisecond: 0 });
  if (date.weekday === dayIndex && date > now) return date.toISO();

  // Calculate days until next occurrence
  let daysUntil = (dayIndex - date.weekday + 7) % 7;
  if (daysUntil === 0) daysUntil = 7;

  return date.plus({ days: daysUntil }).toISO();
};

const getSpecificDate = (month, day, hour, minute) => {
    let date = now.set({ month, day, hour, minute, second: 0, millisecond: 0 });
    if (date < now) {
        // If the date has passed this year, assume next year?
        // Or just keep it as is if it's a past event on the page?
        // Let's keep it as is, or maybe add a year if it's very old?
        // For now, we trust the month/day provided.
        // If Feb 6 passed, showing it might be what they want if the page still has it.
    }
    return date.toISO();
};

export const STATIC_EVENTS = [
  {
    id: 'event_1',
    title: 'Мужской клуб Super Jew: Лига Предпринимателей',
    description: 'Только для юношей. Живой Q&A (вопрос-ответ) в непринуждённой, дружеской атмосфере уютной кальянной.',
    image: 'https://static.tildacdn.com/tild3839-3230-4837-b537-373430306536/_Super_Jew.png',
    date: getSpecificDate(2, 12, 19, 0), // Feb 12, 19:00
    duration: 120,
    link: 'https://olami.moscow/afisha#order'
  },
  {
    id: 'event_2',
    title: 'Шаббат «Ту Би Шват»',
    description: 'Для юношей и девушек. В этот особенный Шаббат мы приглашаем вас остановиться, вырваться из привычного ритма.',
    image: 'https://static.tildacdn.com/tild6435-3330-4762-a130-356335386561/___5.png',
    date: getSpecificDate(2, 6, 18, 30), // Feb 6, 18:30
    duration: 120,
    link: 'https://olami.moscow/afisha#order'
  },
  {
    id: 'event_3',
    title: 'Открыть свое сердце для благодарности Творцу',
    description: 'Только для девушек. Курс: «Самые важные отношения в моей жизни: 10 способов приблизиться к Творцу»',
    image: 'https://static.tildacdn.com/tild6366-3833-4638-b436-623131666435/__14.png',
    date: getNextDayOfWeek(7, 12, 0), // Sunday 12:00
    duration: 120,
    link: 'https://olami.moscow/afisha#order'
  },
  {
    id: 'event_4',
    title: 'Воскресенье с OLAMI',
    description: 'Для юношей и девушек. Увлекательное путешествие в мир еврейской жизни и традиций.',
    image: 'https://static.tildacdn.com/tild6466-3436-4434-b737-326265376533/file-001.png',
    date: getNextDayOfWeek(7, 13, 30), // Sunday 13:30
    duration: 120,
    link: 'https://olami.moscow/afisha#order'
  },
  {
    id: 'event_5',
    title: 'Вторник с OLAMI',
    description: 'Для юношей и девушек. Жить по Торе, что это значит?',
    image: 'https://static.tildacdn.com/tild3662-6631-4232-b063-333464343030/__4.png',
    date: getNextDayOfWeek(2, 19, 0), // Tuesday 19:00
    duration: 180, // 3 hours
    link: 'https://olami.moscow/afisha#order'
  },
  {
    id: 'event_6',
    title: '«Око за око» : Как возместить причиненный ущерб.',
    description: 'Для юношей и девушек. Рав Шрага и Ривки Армель',
    image: 'https://static.tildacdn.com/tild3939-6362-4661-a438-653039323865/___.png',
    date: getSpecificDate(2, 11, 19, 0), // Feb 11, 19:00
    duration: 120,
    link: 'https://olami.moscow/afisha#order'
  },
  {
    id: 'event_7',
    title: 'OLAM of Talents for Jewish Youth',
    description: 'Для юношей и девушек. Твоя навигация в мире профессий, талантов и целей',
    image: 'https://static.tildacdn.com/tild3430-3066-4934-b437-373934643133/Olam_of_Talents_for_.png',
    date: getNextDayOfWeek(1, 19, 0), // Monday 19:00
    duration: 120,
    link: 'https://olami.moscow/afisha#order'
  },
  {
    id: 'event_8',
    title: 'Клуб профессионалов OLAMI',
    description: 'Для парней и девушек 30-35 лет. Пришло время выйти за рамки рутины!',
    image: 'https://static.tildacdn.com/tild6338-3139-4035-a530-346532653634/5350630022559431603.jpg',
    date: getNextDayOfWeek(6, 19, 0), // Saturday? Placeholder
    duration: 120,
    link: 'https://olami.moscow/afisha#order'
  },
  {
    id: 'event_9',
    title: 'MENTORSHIP OLAMI',
    description: 'Для юношей и девушек. Личный друг и проводник в мир глубинных смыслов Торы',
    image: 'https://static.tildacdn.com/tild3630-6666-4637-b166-646666393230/5411128038537686442.jpg',
    date: getNextDayOfWeek(3, 19, 0), // Wednesday? Placeholder
    duration: 120,
    link: 'https://olami.moscow/afisha#order'
  },
  {
    id: 'event_10',
    title: 'Еврейские Знакомства',
    description: 'Для юношей и девушек. Обрести свою вторую половинку',
    image: 'https://static.tildacdn.com/tild6537-6531-4530-a632-326439373035/__1_1.png',
    date: getNextDayOfWeek(4, 19, 0), // Thursday? Placeholder
    duration: 120,
    link: 'https://olami.moscow/afisha#order'
  },
  {
    id: 'event_11',
    title: 'Семейный проект Бейтейну',
    description: 'Для юношей и девушек. Новый сезон для молодых еврейских пар!',
    image: 'https://static.tildacdn.com/tild6661-6337-4833-a137-333330656666/___5.png',
    date: getNextDayOfWeek(5, 19, 0), // Friday? Placeholder
    duration: 120,
    link: 'https://olami.moscow/afisha#order'
  },
  {
    id: 'event_12',
    title: 'Бейт Мидраш (Юноши)',
    description: 'Только для юношей. Изучение Торы и еврейской традиции.',
    image: 'https://static.tildacdn.com/tild3834-3238-4732-b938-346462313361/IMG_0127.png',
    date: getNextDayOfWeek(7, 19, 0), // Sunday 19:00
    duration: 180,
    link: 'https://olami.moscow/afisha#order'
  },
  {
    id: 'event_13',
    title: 'Бейт мидраш (Девушки)',
    description: 'Только для девушек. Изучение вопросов философии, этики и законов Торы.',
    image: 'https://static.tildacdn.com/tild6237-3438-4334-a334-306130643865/__5.png',
    date: getNextDayOfWeek(2, 20, 15), // Tuesday 20:15
    duration: 120,
    link: 'https://olami.moscow/afisha#order'
  }
];

export const STATIC_NEWS = [
    {
        id: 'news_1',
        text: 'Добро пожаловать в OLAMI Moscow!',
        type: 'normal'
    }
];
