'use client';

import { useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Review {
  id: string;
  vehicleId: string;
  vehicleTitle: string;
  guestName: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [confirmTarget, setConfirmTarget] = useState<{ vehicleId: string; reviewId: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/reviews')
      .then((r) => { if (!r.ok) throw new Error('Load failed'); return r.json(); })
      .then((data: Review[]) => { setReviews(data); setLoadError(false); setLoading(false); })
      .catch(() => { setLoadError(true); setLoading(false); });
  }, [loadAttempt]);

  async function handleDeleteConfirm() {
    if (!confirmTarget) return;
    const { vehicleId, reviewId } = confirmTarget;
    setConfirmTarget(null);
    const res = await fetch('/api/admin/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleId, reviewId }),
    });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    }
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog
        isOpen={!!confirmTarget}
        title="Delete review"
        message="This review will be permanently removed and cannot be recovered."
        confirmLabel="Delete"
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmTarget(null)}
      />
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">All customer reviews across your fleet.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading...</div>
        ) : loadError ? (
          <div className="p-12 text-center">
            <p className="text-sm text-red-600 mb-3">Failed to load reviews.</p>
            <button onClick={() => { setLoading(true); setLoadAttempt((a) => a + 1); }} className="text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-900">Retry</button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No reviews yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map((r) => (
              <div key={r.id} className="p-6 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-900">{r.guestName}</span>
                    <span className="text-xs text-gray-400">{r.vehicleTitle}</span>
                    <span className="flex items-center gap-0.5 text-sm font-medium text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      {r.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(r.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                </div>
                <button
                  onClick={() => setConfirmTarget({ vehicleId: r.vehicleId, reviewId: r.id })}
                  className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
