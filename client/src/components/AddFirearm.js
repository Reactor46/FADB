import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';

// Resize image client-side to limit upload size
function resizeImage(file, maxSize = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxSize && height <= maxSize) {
        URL.revokeObjectURL(url);
        resolve(file);
        return;
      }
      const scale = Math.min(maxSize / width, maxSize / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        if (blob) resolve(new File([blob], file.name, { type: blob.type }));
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/jpeg', 0.85);
    };
    img.onerror = e => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export default function AddFirearm() {
  const { register, handleSubmit, reset } = useForm();
  const [manufacturers, setManufacturers] = useState([]);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);

  useEffect(() => {
    axios.get('/api/manufacturers').then(r => setManufacturers(r.data)).catch(() => setManufacturers([]));
  }, []);

  const onFileChange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const resized = await resizeImage(f, 1600);
      setFileBlob(resized);
      setPreview(URL.createObjectURL(resized));
    } catch (err) {
      console.error(err);
      setError('Failed to process image');
    }
  };

  const onSubmit = async (data) => {
    setError(null);
    setUploading(true);
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
    if (fileBlob) fd.append('photo', fileBlob, fileBlob.name);
    try {
      await axios.post('/api/firearms', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      reset();
      setPreview(null);
      setFileBlob(null);
    } catch (err) {
      console.error(err);
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Add firearm</h2>

      <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="md:col-span-2 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Model name</label>
            <input {...register('ModelName', { required: true })} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
              <select {...register('ManufacturerId')} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm">
                <option value="">— choose —</option>
                {manufacturers.map(m => <option key={m.ManufacturerId} value={m.ManufacturerId}>{m.Name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Serial number</label>
              <input {...register('SerialNumber')} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Caliber</label>
              <input {...register('Caliber')} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Action</label>
              <input {...register('ActionType')} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start year</label>
              <input {...register('ProductionStartYear')} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea {...register('Notes')} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm" rows={3}></textarea>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={uploading} className={clsx('inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white', uploading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700') }>
              {uploading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => { reset(); setPreview(null); setFileBlob(null); }} className="text-sm text-gray-600">Reset</button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Photo</label>
            <div className="mt-1 flex items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-md bg-gray-50">
              <input type="file" accept="image/*" capture="environment" onChange={onFileChange} className="w-full" />
            </div>
          </div>

          <div className="w-full h-56 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
            {preview ? <img src={preview} alt="preview" className="object-contain h-full w-full" /> : <div className="text-sm text-gray-400">No image selected</div>}
          </div>
        </div>
      </form>
    </section>
  );
}
