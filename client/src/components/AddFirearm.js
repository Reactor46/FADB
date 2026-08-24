import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddFirearm() {
  const [manufacturers, setManufacturers] = useState([]);
  const [form, setForm] = useState({
    ModelName: '',
    ManufacturerId: '',
    SerialNumber: '',
    Caliber: '',
    ActionType: '',
    ProductionStartYear: '',
    Notes: ''
  });
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    axios.get('/api/manufacturers').then(r => setManufacturers(r.data)).catch(() => setManufacturers([]));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = e => {
    if (e.target.files && e.target.files[0]) setPhoto(e.target.files[0]);
  };

  const submit = async e => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(form).forEach(k => { if (form[k]) fd.append(k, form[k]); });
    if (photo) fd.append('photo', photo);
    setStatus('Uploading...');
    try {
      const res = await axios.post('/api/firearms', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus('Saved.');
      setForm({ ModelName: '', ManufacturerId: '', SerialNumber: '', Caliber: '', ActionType: '', ProductionStartYear: '', Notes: '' });
      setPhoto(null);
    } catch (err) {
      console.error(err);
      setStatus('Failed to save');
    }
  };

  return (
    <section>
      <h2>Add firearm</h2>
      <form onSubmit={submit}>
        <div>
          <label>Model name<br />
            <input name="ModelName" value={form.ModelName} onChange={handleChange} required />
          </label>
        </div>
        <div>
          <label>Manufacturer<br />
            <select name="ManufacturerId" value={form.ManufacturerId} onChange={handleChange}>
              <option value="">-- choose --</option>
              {manufacturers.map(m => <option key={m.ManufacturerId} value={m.ManufacturerId}>{m.Name}</option>)}
            </select>
          </label>
        </div>
        <div>
          <label>Serial number<br />
            <input name="SerialNumber" value={form.SerialNumber} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>Caliber<br />
            <input name="Caliber" value={form.Caliber} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>Action<br />
            <input name="ActionType" value={form.ActionType} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>Production start year<br />
            <input name="ProductionStartYear" value={form.ProductionStartYear} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>Notes<br />
            <textarea name="Notes" value={form.Notes} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>Photo (camera friendly)<br />
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} />
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">Save</button>
          <span style={{ marginLeft: 8 }}>{status}</span>
        </div>
      </form>
    </section>
  );
}
