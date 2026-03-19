'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';

export default function ReviewForm({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const [guestName, setGuestName] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim() || !comment.trim() || rating < 1) return;

    setStatus('submitting');
    setErrorMsg('');

    const res = await fetch(`/api/vehicles/${vehicleId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName, rating, comment }),
    });

    if (res.ok) {
      setGuestName('');
      setRating(0);
      setComment('');
      setStatus('success');
      router.refresh();
    } else {
      const data = await res.json();
      setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="review-submitted">
        <p>Thanks for your review!</p>
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Leave a review</h3>

      <label className="field-block">
        <span>Your name</span>
        <input
          type="text"
          placeholder="John Doe"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          required
        />
      </label>

      <div className="field-block">
        <span>Rating</span>
        <div className="star-picker">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hovered || rating)
                    ? 'fill-[var(--accent)] stroke-[var(--accent)]'
                    : 'fill-none stroke-[var(--ink-500)]'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <label className="field-block">
        <span>Comment</span>
        <textarea
          placeholder="Tell others about your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          required
        />
      </label>

      {status === 'error' && <p className="error-text">{errorMsg}</p>}

      <button
        type="submit"
        className="btn-primary"
        disabled={status === 'submitting' || !guestName.trim() || !comment.trim() || rating < 1}
      >
        {status === 'submitting' ? 'Submitting...' : 'Submit review'}
      </button>

      <p className="muted-label">Only customers who have booked this vehicle can leave a review.</p>
    </form>
  );
}
