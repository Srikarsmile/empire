'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedCard } from '@/components/animations/AnimatedCard';
import { FadeInUp } from '@/components/animations/MotionWrapper';
import { SlidersHorizontal, X as XIcon, Car, Search } from 'lucide-react';
import type { DateRange } from '@/data/vehicleMeta';

interface Vehicle {
  id: string;
  title: string;
  price: number;
  capacity: number;
  description: string;
  amenities: string[];
  images: string[];
  location: string;
  rating: number;
  reviewCount: number;
  minNights: number;
  bookedRanges: DateRange[];
}

const AMENITIES = ['Airport pickup', 'Automatic', 'Unlimited mileage', 'Child seat available'];
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating-desc', label: 'Top rated' },
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

function FleetCard({
  vehicle,
  isFav,
  onToggleFavorite,
  index,
}: {
  vehicle: Vehicle;
  isFav: boolean;
  onToggleFavorite: (id: string) => void;
  index: number;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <AnimatedCard
      className="group relative flex flex-col bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-colors duration-200 overflow-hidden"
      index={index}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--surface-soft)] border-b border-[var(--border)]">
        <span
          className={`skeleton absolute inset-0 z-10 transition-opacity duration-500 ${imgLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        />
        <Image
          src={vehicle.images[0]}
          alt={vehicle.title}
          fill
          priority={index < 2}
          sizes="(max-width: 1100px) 100vw, (max-width: 1400px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onLoad={() => setImgLoaded(true)}
        />
        <button
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--surface)] border border-[var(--border)] transition cursor-pointer hover:bg-[var(--surface-soft)]"
          onClick={(event) => {
            event.preventDefault();
            onToggleFavorite(vehicle.id);
          }}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className={`w-5 h-5 ${isFav ? 'fill-[var(--accent-strong)]' : 'fill-none stroke-[var(--ink-900)] stroke-2'}`}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-col flex-grow p-5">
        <div className="flex justify-between items-start gap-4 mb-1">
          <h3 className="text-lg font-bold text-[var(--ink-900)] leading-tight">{vehicle.title}</h3>
          <div className="flex items-center gap-1 text-sm font-bold bg-[var(--accent-surface)] text-[var(--accent-strong)] px-2 py-1 rounded">
            ★ {vehicle.rating.toFixed(1)}
          </div>
        </div>

        <div className="text-sm font-medium text-[var(--ink-500)] mb-4">
          {vehicle.location} • {vehicle.capacity} seats
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <strong className="text-2xl font-bold text-[var(--ink-900)]">${vehicle.price}</strong>
            <span className="text-[var(--ink-500)] font-medium text-sm ml-1">/ day</span>
          </div>
          <Link
            href={`/fleet/${vehicle.id}`}
            className="inline-flex items-center justify-center h-10 px-6 text-sm font-bold text-white transition bg-[var(--accent)] rounded-xl hover:bg-[var(--accent-light)] active:bg-[var(--accent-strong)]"
          >
            Book
          </Link>
        </div>
      </div>
    </AnimatedCard>
  );
}

export default function FleetExplorer({ vehicles }: { vehicles: Vehicle[] }) {
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [checkIn, setCheckIn] = useState(() => searchParams.get('checkIn') ?? '');
  const [checkOut, setCheckOut] = useState(() => searchParams.get('checkOut') ?? '');
  const [guests, setGuests] = useState(2);
  const [maxPrice, setMaxPrice] = useState(160);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('favorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
    setMaxPrice(160);
    setSelectedAmenities([]);
    setSortBy('recommended');
    setFavoritesOnly(false);
    setMobileFiltersOpen(false);
  };

  const filteredVehicles = useMemo(() => {
    let result = [...vehicles];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (vehicle) =>
          vehicle.title.toLowerCase().includes(query) ||
          vehicle.location.toLowerCase().includes(query) ||
          vehicle.description.toLowerCase().includes(query),
      );
    }

    result = result.filter((vehicle) => vehicle.price <= maxPrice);
    result = result.filter((vehicle) => vehicle.capacity >= guests);

    if (selectedAmenities.length > 0) {
      result = result.filter((vehicle) => selectedAmenities.every((item) => vehicle.amenities.includes(item)));
    }

    if (checkIn && checkOut && checkOut > checkIn) {
      const nights = getStayNights(checkIn, checkOut);

      result = result.filter((vehicle) => {
        if (nights.length < vehicle.minNights) return false;
        const bookedSet = getBookedSet(vehicle.bookedRanges);
        return !nights.some((day) => bookedSet.has(day));
      });
    }

    if (favoritesOnly) {
      result = result.filter((vehicle) => favorites.includes(vehicle.id));
    }

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating-desc') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [checkIn, checkOut, favorites, favoritesOnly, guests, maxPrice, vehicles, searchQuery, selectedAmenities, sortBy]);

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileFiltersOpen]);

  const activeFilterCount =
    selectedAmenities.length +
    (maxPrice < 160 ? 1 : 0) +
    (checkIn ? 1 : 0) +
    (favoritesOnly ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <section className="explorer-section">
      <div className="shell mt-4">
        <FadeInUp>
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-500)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, location, or feature…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-10 pr-10 text-sm text-[var(--ink-900)] placeholder:text-[var(--ink-500)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-500)] hover:text-[var(--ink-700)]"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-8 pb-8 border-b border-[var(--border)]">
              <span className="text-sm font-bold tracking-widest uppercase text-[var(--ink-500)] md:mr-4">Filters</span>
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
              <button className="chip ghost hover:bg-[var(--surface-soft)] ml-auto" onClick={clearFilters} type="button">
                Clear
              </button>
          </div>
        </FadeInUp>

        <div className="explorer-layout">
          <button
            type="button"
            className="mobile-filter-toggle"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters & Sort
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[11px] font-bold leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.button
                type="button"
                className="mobile-filter-overlay"
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            )}
          </AnimatePresence>

          <aside className={`filter-rail ${mobileFiltersOpen ? 'open' : ''}`}>
            <div className="filter-mobile-head">
              <h3>Filters</h3>
              <button type="button" onClick={() => setMobileFiltersOpen(false)}>
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="filter-box">
              <div className="filter-title-row">
                <h3>Daily budget</h3>
                <span>Up to ${maxPrice}/day</span>
              </div>
              <input
                type="range"
                min={40}
                max={160}
                step={5}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="range-slider"
              />
            </div>

            <div className="filter-box">
              <h3>Must-have options</h3>
              <div className="checkbox-list">
                {AMENITIES.map((amenity) => (
                  <label key={amenity}>
                    <input
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
                <p className="muted-label">Available fleet</p>
                <h2>
                  {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'} found
                </h2>
              </div>

              <label className="sort-select">
                <span>Sort by</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <AnimatePresence initial={false} mode="sync">
              {filteredVehicles.length === 0 ? (
                <motion.div
                  className="no-results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Car className="w-10 h-10 mx-auto text-[var(--ink-500)]" />
                  <h3>No vehicles match these filters</h3>
                  <p>Try widening your budget, lowering passengers, or removing one option filter.</p>
                  <button className="btn-primary" onClick={clearFilters}>
                    Clear all filters
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
                  initial={{ opacity: 0.92 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.98 }}
                  transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                >
                  {filteredVehicles.map((vehicle, index) => (
                    <FleetCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      isFav={favorites.includes(vehicle.id)}
                      onToggleFavorite={toggleFavorite}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
