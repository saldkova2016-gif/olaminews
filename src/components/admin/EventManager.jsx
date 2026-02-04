import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const EventManager = () => {
  const { events, addEvent, removeEvent } = useData();
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '',
    datetime: '',
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image || !formData.link || !formData.datetime) return;

    addEvent(formData);
    setFormData({ title: '', image: '', link: '', datetime: '' });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Events Manager</h2>

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image (1920x1080 recommended)</label>
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full"
            onChange={handleImageUpload}
            required
          />
          {formData.image && <img src={formData.image} alt="Preview" className="mt-2 h-32 object-cover rounded" />}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Registration Link (QR will be generated)</label>
          <input
            type="url"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={formData.link}
            onChange={e => setFormData({ ...formData, link: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Event Date & Time</label>
          <input
            type="datetime-local"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={formData.datetime}
            onChange={e => setFormData({ ...formData, datetime: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-brand text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition"
        >
          Add Event
        </button>
      </form>

      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="flex items-center justify-between bg-gray-50 p-4 rounded border">
            <div className="flex items-center gap-4">
              <img src={event.image} alt={event.title} className="w-16 h-16 object-cover rounded" />
              <div>
                <h3 className="font-bold">{event.title}</h3>
                <p className="text-sm text-gray-500">{new Date(event.datetime).toLocaleString()}</p>
                <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500">{event.link}</a>
              </div>
            </div>
            <button
              onClick={() => removeEvent(event.id)}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              Delete
            </button>
          </div>
        ))}
        {events.length === 0 && <p className="text-gray-500 text-center">No events added yet.</p>}
      </div>
    </div>
  );
};

export default EventManager;
