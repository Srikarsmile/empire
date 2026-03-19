'use client';

import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';

export interface ImageManagerProps {
  images: string[];
  imageBlurs: string[];
  onChange: (data: { images: string[]; imageBlurs: string[] }) => void;
}

type UploadItem = {
  id: string;
  name: string;
  status: 'compressing' | 'uploading' | 'done' | 'error';
  preview?: string;
};

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 1920;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
        'image/jpeg',
        0.85,
      );
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

export default function ImageManager({ images, imageBlurs, onChange }: ImageManagerProps) {
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  async function processFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);

    const items: UploadItem[] = fileArray.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      status: 'compressing' as const,
      preview: URL.createObjectURL(f),
    }));
    setQueue((prev) => [...prev, ...items]);

    const newUrls: string[] = [];
    const newBlurs: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const item = items[i];

      try {
        const blob = await compressImage(file);
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading' } : q)),
        );

        const fd = new FormData();
        fd.append('file', blob, file.name);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });

        if (res.ok) {
          const { url, blurDataURL } = await res.json();
          newUrls.push(url);
          newBlurs.push(blurDataURL ?? '');
          setQueue((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, status: 'done' } : q)),
          );
        } else {
          setQueue((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, status: 'error' } : q)),
          );
        }
      } catch {
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'error' } : q)),
        );
      }
    }

    if (newUrls.length > 0) {
      onChange({ images: [...images, ...newUrls], imageBlurs: [...imageBlurs, ...newBlurs] });
    }

    setTimeout(() => {
      setQueue((prev) => prev.filter((q) => q.status !== 'done'));
    }, 1500);
  }

  function addUrl() {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange({ images: [...images, trimmed], imageBlurs: [...imageBlurs, ''] });
      setUrlInput('');
    }
  }

  function remove(idx: number) {
    onChange({
      images: images.filter((_, i) => i !== idx),
      imageBlurs: imageBlurs.filter((_, i) => i !== idx),
    });
  }

  function move(idx: number, dir: -1 | 1) {
    const nextImgs = [...images];
    const nextBlurs = [...imageBlurs];
    const target = idx + dir;
    if (target < 0 || target >= nextImgs.length) return;
    [nextImgs[idx], nextImgs[target]] = [nextImgs[target], nextImgs[idx]];
    [nextBlurs[idx], nextBlurs[target]] = [nextBlurs[target], nextBlurs[idx]];
    onChange({ images: nextImgs, imageBlurs: nextBlurs });
  }

  const isUploading = queue.some((q) => q.status === 'compressing' || q.status === 'uploading');

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

      {/* Upload queue status */}
      {queue.length > 0 && (
        <div className="space-y-1.5">
          {queue.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
              {item.preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.preview} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
              )}
              <span className="truncate flex-1">{item.name}</span>
              {item.status === 'compressing' && <span className="text-xs text-gray-400 shrink-0">Compressing…</span>}
              {item.status === 'uploading' && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 shrink-0" />}
              {item.status === 'done' && <span className="text-xs text-green-600 shrink-0">Done</span>}
              {item.status === 'error' && <span className="text-xs text-red-500 shrink-0">Failed</span>}
            </div>
          ))}
        </div>
      )}

      {/* Upload drop zone */}
      <label
        className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          isDragOver ? 'border-black bg-black/5' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
        }}
      >
        {isUploading
          ? <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />
          : <Plus className="w-4 h-4 text-gray-400 shrink-0" />}
        <span className="text-sm text-gray-500">
          {isUploading ? 'Uploading…' : 'Drop images here, or click to select'}
        </span>
        <input type="file" accept="image/*" multiple className="hidden" disabled={isUploading}
          onChange={(e) => {
            if (e.target.files?.length) processFiles(e.target.files);
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
