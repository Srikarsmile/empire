'use client';

import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';

interface ImageManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageManager({ images, onChange }: ImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  async function uploadFile(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        onChange([...images, url]);
      }
    } finally {
      setUploading(false);
    }
  }

  function addUrl() {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange([...images, trimmed]);
      setUrlInput('');
    }
  }

  function remove(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...images];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div>
        <span className="text-sm font-medium text-gray-700">Images</span>
        {images.length > 0 && (
          <span className="ml-2 text-xs text-gray-400">First image is the cover. Hover to reorder or remove.</span>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {i > 0 && (
                  <button type="button" onClick={() => move(i, -1)}
                    className="bg-black/60 hover:bg-black text-white text-xs w-6 h-6 rounded flex items-center justify-center">
                    ↑
                  </button>
                )}
                {i < images.length - 1 && (
                  <button type="button" onClick={() => move(i, 1)}
                    className="bg-black/60 hover:bg-black text-white text-xs w-6 h-6 rounded flex items-center justify-center">
                    ↓
                  </button>
                )}
                <button type="button" onClick={() => remove(i)}
                  className="bg-red-500/80 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload */}
      <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
        {uploading
          ? <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />
          : <Plus className="w-4 h-4 text-gray-400 shrink-0" />}
        <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload image'}</span>
        <input type="file" accept="image/*" className="hidden" disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
            e.target.value = '';
          }} />
      </label>

      {/* Paste URL */}
      <div className="flex gap-2">
        <input type="url" placeholder="Or paste image URL..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" />
        <button type="button" onClick={addUrl} disabled={!urlInput.trim()}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 disabled:opacity-40 transition-colors whitespace-nowrap">
          Add URL
        </button>
      </div>
    </div>
  );
}
