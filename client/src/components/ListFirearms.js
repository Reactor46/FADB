import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ListFirearms() {
  const [items, setItems] = useState([]);

  const fetch = () => axios.get('/api/firearms').then(r => setItems(r.data)).catch(err => console.error(err));
  useEffect(fetch, []);

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Your firearms</h2>
      {items.length === 0 && <div className="text-gray-500">No firearms yet.</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(it => (
          <div key={it.FirearmId} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-44 bg-gray-100 flex items-center justify-center">
              {it.ThumbnailFileName ? (
                <img src={`/images/${it.ThumbnailFileName}`} alt="thumb" className="object-contain h-full w-full" />
              ) : (it.PhotoFileName ? <img src={`/images/${it.PhotoFileName}`} alt="photo" className="object-contain h-full w-full" /> : <div className="text-sm text-gray-400">No image</div>)}
            </div>
            <div className="p-4">
              <div className="font-semibold text-lg">{it.ModelName}</div>
              <div className="text-sm text-gray-500">Serial: {it.SerialNumber || '—'}</div>
              <div className="mt-2 text-sm">Caliber: <span className="font-medium">{it.Caliber || '—'}</span></div>
              <div className="mt-2 text-sm text-gray-600">{it.Notes ? it.Notes.slice(0, 120) : 'No notes'}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
