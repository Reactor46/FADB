import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ListFirearms() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get('/api/firearms').then(r => setItems(r.data)).catch(err => console.error(err));
  }, []);

  return (
    <section>
      <h2>Your firearms</h2>
      {items.length === 0 && <div>No firearms yet.</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(it => (
          <li key={it.FirearmId} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
            <div style={{ width: 120, height: 90, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {it.ThumbnailFileName ? (
                <img src={`/images/${it.ThumbnailFileName}`} alt="thumb" style={{ maxWidth: '100%', maxHeight: '100%' }} />
              ) : (
                it.PhotoFileName ? <img src={`/images/${it.PhotoFileName}`} alt="photo" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <span>No image</span>
              )}
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>{it.ModelName}</div>
              <div>Serial: {it.SerialNumber || '—'}</div>
              <div>Caliber: {it.Caliber || '—'}</div>
              <div>Notes: {it.Notes || '—'}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
