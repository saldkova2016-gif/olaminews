import React from 'react';
import { useData } from '../../context/DataContext';

const NewsFeed = () => {
  const { news } = useData();
  const activeNews = news.filter(n => n.active);

  return (
    <div className="h-full bg-gray-50 border-l border-gray-200 flex flex-col">
      <div className="p-4 bg-white border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Новости Сообщества</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {activeNews.map(item => (
          <div
            key={item.id}
            className={`p-4 rounded-lg shadow-sm border ${
              item.type === 'urgent'
                ? 'bg-red-50 border-red-100 text-red-900'
                : 'bg-white border-gray-100 text-gray-800'
            }`}
          >
            {item.type === 'urgent' && (
              <span className="inline-block bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full mb-2 font-bold uppercase">
                Срочно
              </span>
            )}
            <p className="font-medium text-lg leading-snug">
              {item.text}
            </p>
          </div>
        ))}
        {activeNews.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            Нет новостей
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
