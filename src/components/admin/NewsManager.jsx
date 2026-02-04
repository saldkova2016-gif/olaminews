import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const NewsManager = () => {
  const { news, addNews, removeNews, toggleNews } = useData();
  const [formData, setFormData] = useState({
    text: '',
    type: 'normal',
    active: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.text) return;

    addNews(formData);
    setFormData({ text: '', type: 'normal', active: true });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">News Manager</h2>

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">News Text (Max 140 chars)</label>
          <textarea
            maxLength={140}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={formData.text}
            onChange={e => setFormData({ ...formData, text: e.target.value })}
            required
          />
          <div className="text-right text-xs text-gray-500">{formData.text.length}/140</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-brand border-gray-300 rounded"
            checked={formData.active}
            onChange={e => setFormData({ ...formData, active: e.target.checked })}
          />
          <label className="ml-2 block text-sm text-gray-900">Active immediately</label>
        </div>

        <button
          type="submit"
          className="bg-brand text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition"
        >
          Add News
        </button>
      </form>

      <div className="space-y-4">
        {news.map(item => (
          <div key={item.id} className={`flex items-center justify-between p-4 rounded border ${item.type === 'urgent' ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
            <div className="flex-1">
              <p className="font-medium">{item.text}</p>
              <div className="flex gap-2 text-xs mt-1">
                <span className={`px-2 py-0.5 rounded ${item.type === 'urgent' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'}`}>
                  {item.type.toUpperCase()}
                </span>
                <span className={item.active ? 'text-green-600' : 'text-gray-400'}>
                  {item.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleNews(item.id)}
                className="text-blue-500 hover:text-blue-700 font-medium text-sm"
              >
                {item.active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => removeNews(item.id)}
                className="text-red-500 hover:text-red-700 font-medium text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {news.length === 0 && <p className="text-gray-500 text-center">No news items.</p>}
      </div>
    </div>
  );
};

export default NewsManager;
