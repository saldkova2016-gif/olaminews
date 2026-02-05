import { DateTime } from 'luxon';

// Simple CSV parser that handles quoted fields
const parseCSV = (text) => {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentField.trim());
        if (currentRow.length > 0 && (currentRow.length > 1 || currentRow[0] !== '')) {
             rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        if (char === '\r' && nextChar === '\n') i++; // Skip \n after \r
      } else {
        currentField += char;
      }
    }
  }

  // Push last field/row if exists
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.length > 0) rows.push(currentRow);
  }

  return rows;
};

export const parseEvents = (csvText) => {
  const rows = parseCSV(csvText);
  // Skip header
  const dataRows = rows.slice(1);

  return dataRows.map((row, index) => {
    // Columns: 0:Title, 1:Desc, 2:Image, 3:Link, 4:Date, 5:Time
    const title = row[0];
    const description = row[1];
    const image = row[2];
    const link = row[3];
    const dateStr = row[4];
    const timeStr = row[5];

    let isoDate = null;

    if (dateStr) {
      try {
        const [day, month, year] = dateStr.split('.').map(Number);
        let hour = 0, minute = 0;

        if (timeStr) {
          const parts = timeStr.split(':');
          if (parts.length >= 2) {
             hour = parseInt(parts[0], 10);
             minute = parseInt(parts[1], 10);
          }
        }

        const dt = DateTime.fromObject({ year, month, day, hour, minute }, { zone: 'Europe/Moscow' });
        if (dt.isValid) {
          isoDate = dt.toISO();
        }
      } catch (e) {
        console.error("Date parse error", e);
      }
    }

    if (!title) return null;

    return {
      id: `sheet_event_${index}_${Date.now()}`,
      title,
      description,
      image,
      link,
      date: isoDate,
      duration: 120 // Default duration
    };
  }).filter(e => e !== null);
};

export const parseNews = (csvText) => {
  const rows = parseCSV(csvText);
  // Skip header
  const dataRows = rows.slice(1);

  return dataRows.map((row, index) => {
    // Columns: 0:Text, 1:Type
    const text = row[0];
    const type = row[1] ? row[1].toLowerCase() : 'normal';

    if (!text) return null;

    return {
      id: `sheet_news_${index}_${Date.now()}`,
      text,
      type
    };
  }).filter(n => n !== null);
};
