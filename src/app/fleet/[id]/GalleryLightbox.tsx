'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Grid2x2 } from 'lucide-react';

interface GalleryLightboxProps {
  images: string[];
  imageBlurs?: string[];
  title: string;
}

export default function GalleryLightbox({ images, imageBlurs, title }: GalleryLightboxProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;
  const touchStartX = useRef<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null)),
    [images.length],
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i !== null ? (i + 1) % images.length : null)),
    [images.length],
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      delta < 0 ? next() : prev();
    }
    touchStartX.current = null;
  }, [next, prev]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, close, prev, next]);

  return (
    <>
      <div className="gallery-grid">
        {images.length > 0 ? (
          <div className="gallery-main" onClick={() => setOpenIndex(0)}>
            <Image
              src={images[0]}
              alt={title}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 60vw"
              placeholder={imageBlurs?.[0] ? 'blur' : 'empty'}
              blurDataURL={imageBlurs?.[0] || undefined}
              unoptimized={images[0]?.startsWith('/uploads/')}
            />
            <button
              className="gallery-show-all"
              onClick={(e) => { e.stopPropagation(); setOpenIndex(0); }}
              aria-label="Show all photos"
            >
              <Grid2x2 className="w-4 h-4" />
              Show all {images.length} photos
            </button>
          </div>
        ) : (
          <div className="gallery-main gallery-placeholder" />
        )}
        {images.slice(1, 5).map((image, index) => (
          <div key={image} className="gallery-thumb" onClick={() => setOpenIndex(index + 1)}>
            <Image
              src={image}
              alt={`${title} view ${index + 2}`}
              fill
              sizes="(max-width: 900px) 50vw, 20vw"
              placeholder={imageBlurs?.[index + 1] ? 'blur' : 'empty'}
              blurDataURL={imageBlurs?.[index + 1] || undefined}
              unoptimized={image?.startsWith('/uploads/')}
            />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={close}
          >
            <motion.div
              className="lightbox-content"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={openIndex}
                  className="lightbox-image-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {openIndex !== null && (
                    <Image
                      src={images[openIndex]}
                      alt={`${title} — photo ${openIndex + 1}`}
                      fill
                      sizes="(max-width: 700px) 100vw, 90vw"
                      className="object-contain"
                      priority
                      placeholder={imageBlurs?.[openIndex] ? 'blur' : 'empty'}
                      blurDataURL={imageBlurs?.[openIndex] || undefined}
                      unoptimized={images[openIndex]?.startsWith('/uploads/')}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <button className="lightbox-close" onClick={close} aria-label="Close lightbox">
                <X className="w-4 h-4" />
              </button>

              {images.length > 1 && (
                <>
                  <button className="lightbox-prev" onClick={prev} aria-label="Previous image">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="lightbox-next" onClick={next} aria-label="Next image">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <p className="lightbox-counter">
                {(openIndex ?? 0) + 1} / {images.length}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
