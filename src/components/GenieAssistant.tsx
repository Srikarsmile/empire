'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { DateRange } from '@/data/propertyMeta';
import {
  GENIE_APPLY_FILTERS_EVENT,
  GENIE_PROMPT_EVENT,
  type GenieApplyFiltersDetail,
  type GeniePromptDetail,
} from '@/lib/genieEvents';

type Mood = 'relax' | 'work' | 'family' | 'adventure';
type Budget = 'value' | 'balanced' | 'premium';
type Group = 'solo-couple' | 'small-family' | 'group';
type TripLength = '2' | '4' | '7';
type Timing = 'soon' | 'month' | 'flexible';

interface GenieProperty {
  id: string;
  title: string;
  location: string;
  image: string;
  amenities: string[];
  price: number;
  rating: number;
  reviewCount: number;
  minNights: number;
  bookedRanges: DateRange[];
}

interface GenieAssistantProps {
  properties: GenieProperty[];
}

interface GeniePreferences {
  mood?: Mood;
  budget?: Budget;
  group?: Group;
  tripLength?: TripLength;
  timing?: Timing;
}

interface Recommendation {
  property: GenieProperty;
  reasons: string[];
  score: number;
}

const QUICK_PROMPTS = [
  'Family trip under $150 this month',
  'Best rated stay for 4 nights with parking',
  'Work trip with WiFi for 2 guests',
  'Weekend relaxing stay for couple',
];

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function keyToDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function nextWeekday(dayIndex: number) {
  const today = new Date();
  const day = today.getDay();
  const delta = (dayIndex + 7 - day) % 7 || 7;
  return addDays(today, delta);
}

function rangeDays(start: string, end: string) {
  const startDate = keyToDate(start);
  const endDate = keyToDate(end);
  const result: string[] = [];
  let cursor = new Date(startDate);
  while (cursor < endDate) {
    result.push(dateKey(cursor));
    cursor = addDays(cursor, 1);
  }
  return result;
}

function getBookedSet(ranges: DateRange[]) {
  const set = new Set<string>();

  ranges.forEach((range) => {
    const days = rangeDays(range.start, addDays(keyToDate(range.end), 1).toISOString().split('T')[0]);
    days.forEach((day) => set.add(day));
  });

  return set;
}

function parsePromptToFilters(prompt: string): GenieApplyFiltersDetail {
  const q = prompt.toLowerCase();
  const filters: GenieApplyFiltersDetail = {
    maxPrice: 500,
    selectedAmenities: [],
    sortBy: 'recommended',
    guests: 2,
    scrollToResults: true,
  };

  const budgetMatch = q.match(/(?:under|below|max|budget)\s*\$?(\d{2,4})/i) ?? q.match(/\$(\d{2,4})/);
  if (budgetMatch) filters.maxPrice = Math.min(500, Math.max(50, Number(budgetMatch[1])));

  if (/(cheap|affordable|budget|value)/.test(q) && !budgetMatch) filters.maxPrice = 120;
  if (/(premium|luxury|high end|penthouse)/.test(q) && !budgetMatch) filters.maxPrice = 500;

  if (/(best|top|highest|rating)/.test(q)) filters.sortBy = 'rating-desc';
  if (/(cheapest|lowest price)/.test(q)) filters.sortBy = 'price-asc';

  if (/(wifi|work|remote)/.test(q)) filters.selectedAmenities?.push('Free WiFi');
  if (/(parking|car)/.test(q)) filters.selectedAmenities?.push('Free parking on premises');
  if (/(ac|air conditioning|heat)/.test(q)) filters.selectedAmenities?.push('Air conditioning');

  const guestMatch = q.match(/(\d+)\s*(?:guest|guests|people|adults)/);
  if (guestMatch) filters.guests = Math.min(12, Math.max(1, Number(guestMatch[1])));

  if (/(airport|city|penthouse|rooftop|sosua|apartment|modern|cozy|spacious)/.test(q)) {
    if (/airport/.test(q)) filters.searchQuery = 'airport';
    else if (/city/.test(q)) filters.searchQuery = 'city';
    else if (/(penthouse|rooftop)/.test(q)) filters.searchQuery = 'penthouse';
    else if (/modern/.test(q)) filters.searchQuery = 'modern';
    else if (/cozy/.test(q)) filters.searchQuery = 'cozy';
    else if (/spacious/.test(q)) filters.searchQuery = 'spacious';
    else if (/sosua/.test(q)) filters.searchQuery = 'sosua';
  }

  if (/weekend/.test(q)) {
    const friday = nextWeekday(5);
    filters.checkIn = dateKey(friday);
    filters.checkOut = dateKey(addDays(friday, 2));
  } else if (/this month|next week|soon/.test(q)) {
    const start = addDays(new Date(), 7);
    filters.checkIn = dateKey(start);
    filters.checkOut = dateKey(addDays(start, 4));
  }

  filters.selectedAmenities = Array.from(new Set(filters.selectedAmenities));

  return filters;
}

function parseTripSignals(prompt: string) {
  const q = prompt.toLowerCase();

  const mood: Mood = /(work|remote)/.test(q)
    ? 'work'
    : /(family|kids|children)/.test(q)
      ? 'family'
      : /(explore|adventure|city)/.test(q)
        ? 'adventure'
        : 'relax';

  const budget: Budget = /premium|luxury|high end/.test(q)
    ? 'premium'
    : /(under|below|budget|value|cheap|affordable)/.test(q)
      ? 'value'
      : 'balanced';

  const group: Group = /(group|friends|team)/.test(q)
    ? 'group'
    : /(family|kids|children)/.test(q)
      ? 'small-family'
      : 'solo-couple';

  const tripLength: TripLength = /7\s*(night|day)/.test(q)
    ? '7'
    : /4\s*(night|day)/.test(q)
      ? '4'
      : '2';

  const timing: Timing = /this month|next week/.test(q)
    ? 'month'
    : /weekend|soon/.test(q)
      ? 'soon'
      : 'flexible';

  return { mood, budget, group, tripLength, timing };
}

function nextAvailableDate(property: GenieProperty, nights: number, timing: Timing) {
  const booked = getBookedSet(property.bookedRanges);
  const startOffset = timing === 'soon' ? 3 : timing === 'month' ? 8 : 3;
  const maxOffset = timing === 'soon' ? 16 : timing === 'month' ? 35 : 60;

  for (let offset = startOffset; offset <= maxOffset; offset += 1) {
    const start = addDays(new Date(), offset);
    const startKey = dateKey(start);
    const endKey = dateKey(addDays(start, nights));
    const stayDays = rangeDays(startKey, endKey);
    if (!stayDays.some((day) => booked.has(day))) {
      return startKey;
    }
  }

  return null;
}

function rankProperties(properties: GenieProperty[], prompt: string, filters: GenieApplyFiltersDetail): Recommendation[] {
  const signals = parseTripSignals(prompt);
  const nights = signals.tripLength === '7' ? 7 : signals.tripLength === '4' ? 4 : 2;

  return properties
    .map((property) => {
      let score = property.rating * 7;
      const reasons: string[] = [];
      const title = property.title.toLowerCase();

      const availableStart = nextAvailableDate(property, nights, signals.timing);
      if (!availableStart) score -= 120;
      else {
        score += 24;
        reasons.push(`Available from ${availableStart}`);
      }

      if (property.minNights <= nights) {
        score += 10;
        reasons.push(`Matches minimum stay (${property.minNights} nights)`);
      } else {
        score -= 24;
      }

      if (filters.maxPrice) {
        if (property.price <= filters.maxPrice) {
          score += 18;
          reasons.push(`Within budget ($${property.price}/night)`);
        } else {
          score -= 26;
        }
      }

      if (filters.selectedAmenities?.length) {
        const amenityHits = filters.selectedAmenities.filter((a) => property.amenities.includes(a)).length;
        score += amenityHits * 6;
      }

      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        if (title.includes(q) || property.location.toLowerCase().includes(q)) {
          score += 12;
          reasons.push(`Matches "${filters.searchQuery}"`);
        }
      }

      if (signals.group === 'group' && /(3 bedroom|spacious|penthouse)/.test(title)) score += 10;
      if (signals.group === 'small-family' && /(2-bedroom|2 bedroom|spacious)/.test(title)) score += 8;
      if (signals.group === 'solo-couple' && /(cozy|modern|apartment)/.test(title)) score += 7;

      if (signals.mood === 'work' && property.amenities.includes('Free WiFi')) score += 8;
      if (signals.mood === 'relax' && /(penthouse|rooftop|spacious)/.test(title)) score += 8;
      if (signals.mood === 'adventure' && /(city|airport|modern)/.test(title)) score += 8;

      reasons.push(`${property.rating.toFixed(2)} rating from ${property.reviewCount} reviews`);

      return { property, score, reasons: reasons.slice(0, 3) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

const QUESTIONS = {
  mood: {
    title: 'What kind of trip are you planning?',
    options: [
      { value: 'relax' as const, label: 'Relaxing stay' },
      { value: 'work' as const, label: 'Work + comfort' },
      { value: 'family' as const, label: 'Family trip' },
      { value: 'adventure' as const, label: 'Explore + adventure' },
    ],
  },
  budget: {
    title: 'What budget range per night?',
    options: [
      { value: 'value' as const, label: 'Value (under $120)' },
      { value: 'balanced' as const, label: 'Balanced ($120-$200)' },
      { value: 'premium' as const, label: 'Premium ($200+)' },
    ],
  },
  group: {
    title: 'Who are you traveling with?',
    options: [
      { value: 'solo-couple' as const, label: 'Solo / Couple' },
      { value: 'small-family' as const, label: 'Small family' },
      { value: 'group' as const, label: 'Group' },
    ],
  },
  tripLength: {
    title: 'How long is the stay?',
    options: [
      { value: '2' as const, label: '2 nights' },
      { value: '4' as const, label: '4 nights' },
      { value: '7' as const, label: '7 nights' },
    ],
  },
  timing: {
    title: 'When are you traveling?',
    options: [
      { value: 'soon' as const, label: 'Within 2 weeks' },
      { value: 'month' as const, label: 'This month' },
      { value: 'flexible' as const, label: 'Flexible dates' },
    ],
  },
};

const QUESTION_ORDER: (keyof GeniePreferences)[] = ['mood', 'budget', 'group', 'tripLength', 'timing'];

export default function GenieAssistant({ properties }: GenieAssistantProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [activePrompt, setActivePrompt] = useState('');
  const [prefs, setPrefs] = useState<GeniePreferences>({});
  const [mode, setMode] = useState<'text' | 'guided'>('text');

  const currentQuestion = useMemo(() => QUESTION_ORDER.find((key) => !prefs[key]), [prefs]);

  const promptFilters = useMemo(
    () => (activePrompt ? parsePromptToFilters(activePrompt) : null),
    [activePrompt],
  );

  const promptRecommendations = useMemo(
    () => (activePrompt && promptFilters ? rankProperties(properties, activePrompt, promptFilters) : []),
    [activePrompt, promptFilters, properties],
  );

  const guidedRecommendations = useMemo(() => {
    if (!prefs.mood || !prefs.budget || !prefs.group || !prefs.tripLength || !prefs.timing) return [];

    const pseudoPrompt = `${prefs.mood} ${prefs.budget} ${prefs.group} ${prefs.tripLength} nights ${prefs.timing}`;
    const filters = parsePromptToFilters(pseudoPrompt);
    return rankProperties(properties, pseudoPrompt, filters);
  }, [prefs, properties]);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      const custom = event as CustomEvent<GeniePromptDetail>;
      const prompt = custom.detail?.prompt?.trim();
      if (!prompt) return;

      setOpen(true);
      setMode('text');
      setPromptInput(prompt);
      setActivePrompt(prompt);

      const filters = parsePromptToFilters(prompt);
      window.dispatchEvent(new CustomEvent<GenieApplyFiltersDetail>(GENIE_APPLY_FILTERS_EVENT, { detail: filters }));
    };

    window.addEventListener(GENIE_PROMPT_EVENT, onPrompt as EventListener);
    return () => window.removeEventListener(GENIE_PROMPT_EVENT, onPrompt as EventListener);
  }, []);

  const submitPrompt = (value?: string) => {
    const prompt = (value ?? promptInput).trim();
    if (!prompt) return;

    setMode('text');
    setActivePrompt(prompt);
    setPromptInput(prompt);

    const filters = parsePromptToFilters(prompt);
    window.dispatchEvent(new CustomEvent<GenieApplyFiltersDetail>(GENIE_APPLY_FILTERS_EVENT, { detail: filters }));
  };

  const resetGuided = () => setPrefs({});

  const applyAnswer = (value: Mood | Budget | Group | TripLength | Timing) => {
    if (!currentQuestion) return;

    setPrefs((prev) => {
      if (currentQuestion === 'mood') return { ...prev, mood: value as Mood };
      if (currentQuestion === 'budget') return { ...prev, budget: value as Budget };
      if (currentQuestion === 'group') return { ...prev, group: value as Group };
      if (currentQuestion === 'tripLength') return { ...prev, tripLength: value as TripLength };
      return { ...prev, timing: value as Timing };
    });
  };

  return (
    <>
      {pathname !== '/' ? (
        <button type="button" className="genie-fab" onClick={() => setOpen(true)}>
          <i className="ph-fill ph-magic-wand" />
          <span>Genie</span>
        </button>
      ) : null}

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              className="genie-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-label="Close Genie assistant"
            />

            <motion.aside
              className="genie-panel"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.28 }}
            >
              <div className="genie-head">
                <div>
                  <strong>Genie</strong>
                  <p>Text-first stay assistant</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                  <i className="ph ph-x" />
                </button>
              </div>

              <div className="genie-mode-toggle">
                <button type="button" className={mode === 'text' ? 'active' : ''} onClick={() => setMode('text')}>
                  Text mode
                </button>
                <button type="button" className={mode === 'guided' ? 'active' : ''} onClick={() => setMode('guided')}>
                  Guided
                </button>
              </div>

              {mode === 'text' ? (
                <div className="genie-results">
                  <div className="genie-inline-prompt">
                    <input
                      suppressHydrationWarning
                      type="text"
                      placeholder="Describe your trip. Example: best family stay under $150 with parking this month"
                      value={promptInput}
                      onChange={(event) => setPromptInput(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && submitPrompt()}
                    />
                    <button type="button" onClick={() => submitPrompt()}>
                      Ask
                    </button>
                  </div>

                  <div className="genie-inline-chips">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button key={prompt} type="button" onClick={() => submitPrompt(prompt)}>
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {activePrompt ? (
                    <div className="genie-result-head">
                      <h4>Top picks for: &quot;{activePrompt}&quot;</h4>
                    </div>
                  ) : null}

                  {promptRecommendations.map((item) => (
                    <article key={item.property.id} className="genie-result-card">
                      <div className="genie-result-media">
                        <Image src={item.property.image} alt={item.property.title} fill sizes="120px" />
                      </div>
                      <div className="genie-result-copy">
                        <strong>{item.property.title}</strong>
                        <p>{item.property.location}</p>
                        <p className="price">${item.property.price} / night</p>
                        <ul>
                          {item.reasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                        <Link href={`/property/${item.property.id}`} onClick={() => setOpen(false)}>
                          View stay
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="genie-body">
                  {currentQuestion ? (
                    <>
                      <p className="genie-question">{QUESTIONS[currentQuestion].title}</p>
                      <div className="genie-options">
                        {QUESTIONS[currentQuestion].options.map((option) => (
                          <button key={option.value} type="button" onClick={() => applyAnswer(option.value)}>
                            {option.label}
                          </button>
                        ))}
                      </div>

                      <div className="genie-progress">
                        {QUESTION_ORDER.map((key) => (
                          <span key={key} className={prefs[key] ? 'done' : ''} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="genie-result-head">
                        <h4>Guided picks for you</h4>
                        <button type="button" onClick={resetGuided}>
                          Start over
                        </button>
                      </div>
                      {guidedRecommendations.map((item) => (
                        <article key={item.property.id} className="genie-result-card">
                          <div className="genie-result-media">
                            <Image src={item.property.image} alt={item.property.title} fill sizes="120px" />
                          </div>
                          <div className="genie-result-copy">
                            <strong>{item.property.title}</strong>
                            <p>{item.property.location}</p>
                            <p className="price">${item.property.price} / night</p>
                            <ul>
                              {item.reasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                              ))}
                            </ul>
                            <Link href={`/property/${item.property.id}`} onClick={() => setOpen(false)}>
                              View stay
                            </Link>
                          </div>
                        </article>
                      ))}
                    </>
                  )}
                </div>
              )}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
