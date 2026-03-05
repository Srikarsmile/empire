'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCard } from '@/components/animations/AnimatedCard';
import { FadeInUp } from '@/components/animations/MotionWrapper';
import type { DateRange } from '@/data/propertyMeta';
import { GENIE_APPLY_FILTERS_EVENT, type GenieApplyFiltersDetail } from '@/lib/genieEvents';

interface Property {
  id: string;
  title: string;
  price: number;
  description: string;
  amenities: string[];
  images: string[];
  location: string;
  rating: number;
  reviewCount: number;
  minNights: number;
  bookedRanges: DateRange[];
}

const AMENITIES = ['Free WiFi', 'Free parking on premises', 'Air conditioning'];
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating-desc', label: 'Rating: high to low' },
];

function keyToDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateToKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function getStayNights(checkIn: string, checkOut: string) {
  const nights: string[] = [];
  let cursor = keyToDate(checkIn);
  const end = keyToDate(checkOut);

  while (cursor < end) {
    nights.push(dateToKey(cursor));
    cursor = addDays(cursor, 1);
  }

  return nights;
}

function getBookedSet(ranges: DateRange[]) {
  const set = new Set<string>();

  ranges.forEach((range) => {
    let cursor = keyToDate(range.start);
    const end = keyToDate(range.end);

    while (cursor <= end) {
      set.add(dateToKey(cursor));
      cursor = addDays(cursor, 1);
    }
  });

  return set;
}

export default function PropertyExplorer({ properties }: { properties: Property[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [maxPrice, setMaxPrice] = useState(500);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const onGenieApply = (event: Event) => {
      const custom = event as CustomEvent<GenieApplyFiltersDetail>;
      const detail = custom.detail;
      if (!detail) return;

      if (typeof detail.searchQuery === 'string') setSearchQuery(detail.searchQuery);
      if (typeof detail.maxPrice === 'number') setMaxPrice(detail.maxPrice);
      if (typeof detail.guests === 'number') setGuests(detail.guests);
      if (typeof detail.sortBy === 'string') setSortBy(detail.sortBy);
      if (Array.isArray(detail.selectedAmenities)) setSelectedAmenities(detail.selectedAmenities);
      if (typeof detail.checkIn === 'string') setCheckIn(detail.checkIn);
      if (typeof detail.checkOut === 'string') setCheckOut(detail.checkOut);

      setFavoritesOnly(false);
      setMobileFiltersOpen(false);

      if (detail.scrollToResults) {
        setTimeout(() => {
          rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    };

    window.addEventListener(GENIE_APPLY_FILTERS_EVENT, onGenieApply as EventListener);
    return () => window.removeEventListener(GENIE_APPLY_FILTERS_EVENT, onGenieApply as EventListener);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity],
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCheckIn('');
    setCheckOut('');
    setGuests(2);
    setMaxPrice(500);
    setSelectedAmenities([]);
    setSortBy('recommended');
    setFavoritesOnly(false);
    setMobileFiltersOpen(false);
  };

  const filteredProperties = useMemo(() => {
    let result = [...properties];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (property) =>
          property.title.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query) ||
          property.description.toLowerCase().includes(query),
      );
    }

    result = result.filter((property) => property.price <= maxPrice);

    if (selectedAmenities.length > 0) {
      result = result.filter((property) => selectedAmenities.every((item) => property.amenities.includes(item)));
    }

    if (checkIn && checkOut && checkOut > checkIn) {
      const nights = getStayNights(checkIn, checkOut);

      result = result.filter((property) => {
        if (nights.length < property.minNights) return false;
        const bookedSet = getBookedSet(property.bookedRanges);
        return !nights.some((day) => bookedSet.has(day));
      });
    }

    if (favoritesOnly) {
      result = result.filter((property) => favorites.includes(property.id));
    }

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating-desc') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [checkIn, checkOut, favorites, favoritesOnly, maxPrice, properties, searchQuery, selectedAmenities, sortBy]);

  return (
    <section className="explorer-section" ref={rootRef}>
      <div className="shell">
        <FadeInUp>
          <div className="search-panel">
            <div className="search-grid">
              <label className="field-block">
                <span>Where</span>
                <input
                  suppressHydrationWarning
                  type="text"
                  placeholder="Search destination"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </label>

              <label className="field-block">
                <span>Check in</span>
                <input suppressHydrationWarning type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </label>

              <label className="field-block">
                <span>Check out</span>
                <input
                  suppressHydrationWarning
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || undefined}
                />
              </label>

              <label className="field-block">
                <span>Guests</span>
                <input
                  suppressHydrationWarning
                  type="number"
                  min={1}
                  max={12}
                  value={guests}
                  onChange={(e) => setGuests(Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
                />
              </label>
            </div>

            <div className="amenity-chip-row">
              {AMENITIES.map((amenity) => (
                <button
                  key={amenity}
                  className={`chip ${selectedAmenities.includes(amenity) ? 'active' : ''}`}
                  onClick={() => toggleAmenity(amenity)}
                  type="button"
                >
                  {amenity}
                </button>
              ))}
              <button className="chip ghost" onClick={clearFilters} type="button">
                Reset filters
              </button>
            </div>
          </div>
        </FadeInUp>

        <div className="explorer-layout">
          <button
            type="button"
            className="mobile-filter-toggle"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <i className="ph ph-sliders-horizontal" />
            Filters & Sort
          </button>

          {mobileFiltersOpen ? (
            <button
              type="button"
              className="mobile-filter-overlay"
              aria-label="Close filters"
              onClick={() => setMobileFiltersOpen(false)}
            />
          ) : null}

          <aside className={`filter-rail ${mobileFiltersOpen ? 'open' : ''}`}>
            <div className="filter-mobile-head">
              <h3>Filters</h3>
              <button type="button" onClick={() => setMobileFiltersOpen(false)}>
                <i className="ph ph-x" />
              </button>
            </div>
            <div className="filter-box">
              <div className="filter-title-row">
                <h3>Budget</h3>
                <span>Up to ${maxPrice}/night</span>
              </div>
              <input
                suppressHydrationWarning
                type="range"
                min={50}
                max={500}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="range-slider"
              />
            </div>

            <div className="filter-box">
              <h3>Must-have amenities</h3>
              <div className="checkbox-list">
                {AMENITIES.map((amenity) => (
                  <label key={amenity}>
                    <input
                      suppressHydrationWarning
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={`favorite-filter ${favoritesOnly ? 'active' : ''}`}
              onClick={() => setFavoritesOnly((prev) => !prev)}
            >
              <i className={`ph${favoritesOnly ? '-fill' : ''} ph-heart`} />
              Show favorites only
            </button>
            <button
              type="button"
              className="btn-primary mobile-filter-apply"
              onClick={() => setMobileFiltersOpen(false)}
            >
              Apply filters
            </button>
          </aside>

          <div className="results-column">
            <div className="results-header">
              <div>
                <p className="muted-label">Available stays</p>
                <h2>
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'home' : 'homes'} found
                </h2>
              </div>

              <label className="sort-select">
                <span>Sort by</span>
                <select suppressHydrationWarning value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <AnimatePresence initial={false} mode="sync">
              {filteredProperties.length === 0 ? (
                <motion.div
                  className="no-results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                  <i className="ph ph-house-line" />
                  <h3>No stays match these filters</h3>
                  <p>Try widening budget or removing one amenity filter.</p>
                  <button className="btn-primary" onClick={clearFilters}>
                    Clear all filters
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  className="property-grid"
                  initial={{ opacity: 0.92 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.98 }}
                  transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                >
                  {filteredProperties.map((property, index) => {
                    const isFav = favorites.includes(property.id);

                    return (
                      <AnimatedCard key={property.id} className="property-card" index={index}>
                        <div className="property-media">
                          <Image
                            src={property.images[0]}
                            alt={property.title}
                            fill
                            priority={index < 2}
                            sizes="(max-width: 1100px) 100vw, 45vw"
                          />
                          <button
                            className={`favorite-btn ${isFav ? 'active' : ''}`}
                            onClick={(event) => {
                              event.preventDefault();
                              toggleFavorite(property.id);
                            }}
                            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <i className={`ph${isFav ? '-fill' : ''} ph-heart`} />
                          </button>
                          <span className="rating-pill">
                            <i className="ph-fill ph-star" />
                            {property.rating.toFixed(2)}
                          </span>
                        </div>

                        <div className="property-body">
                          <h3>{property.title}</h3>
                          <p className="property-location">
                            <i className="ph ph-map-pin" />
                            {property.location}
                          </p>
                          <p className="property-review-meta">{property.reviewCount} reviews</p>

                          <div className="property-amenities">
                            {property.amenities.slice(0, 3).map((amenity) => (
                              <span key={amenity}>{amenity}</span>
                            ))}
                          </div>

                          <div className="property-footer">
                            <div className="price-stack">
                              <strong>${property.price}</strong>
                              <span>per night</span>
                            </div>
                            <Link href={`/property/${property.id}`} className="btn-primary">
                              View stay
                            </Link>
                          </div>
                        </div>
                      </AnimatedCard>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
