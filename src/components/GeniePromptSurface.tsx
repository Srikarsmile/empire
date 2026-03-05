'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { GENIE_PROMPT_EVENT, type GeniePromptDetail } from '@/lib/genieEvents';

const QUICK_INTENTS = [
  'Tonight under $150',
  '2 guests with fast WiFi',
  'Parking + AC near center',
  'Best rated this weekend',
];

function emitPrompt(detail: GeniePromptDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<GeniePromptDetail>(GENIE_PROMPT_EVENT, { detail }));
}

export default function GeniePromptSurface({ variant }: { variant: 'hero' | 'sticky' }) {
  const [prompt, setPrompt] = useState('');
  const [showSticky, setShowSticky] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const placeholder = useMemo(
    () =>
      variant === 'hero'
        ? 'Optional: tell Genie your dates, guests, and budget'
        : 'Ask Genie: best stays for 4 nights with parking...',
    [variant],
  );

  const submitPrompt = (value?: string) => {
    const finalPrompt = (value ?? prompt).trim();
    if (!finalPrompt) return;
    emitPrompt({ prompt: finalPrompt, source: variant === 'hero' ? 'hero' : 'sticky' });
    setPrompt('');
  };

  useEffect(() => {
    if (variant !== 'sticky') return;

    const heroAnchor = document.getElementById('genie-hero-anchor');
    if (!heroAnchor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setShowSticky(!entry.isIntersecting);
      },
      { threshold: 0.15, rootMargin: '-70px 0px 0px 0px' },
    );

    observer.observe(heroAnchor);
    return () => observer.disconnect();
  }, [variant]);

  if (variant === 'sticky') {
    if (!mounted) return null;
    if (!showSticky) return null;

    return (
      <div className="genie-sticky-bar-wrap">
        <div className="shell">
          <div className="genie-sticky-bar">
            <i className="ph-fill ph-magic-wand" />
            <input
              suppressHydrationWarning
              type="text"
              placeholder={placeholder}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submitPrompt()}
            />
            <button type="button" onClick={() => submitPrompt()}>
              Ask Genie
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return <div className="genie-hero-prompt" id="genie-hero-anchor" aria-hidden="true" />;
  }

  return (
    <div className="genie-hero-prompt" id="genie-hero-anchor">
      <p>
        <i className="ph-fill ph-magic-wand" /> Need help deciding? Ask Genie
      </p>
      <div className="genie-hero-input-row">
        <input
          suppressHydrationWarning
          type="text"
          placeholder={placeholder}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && submitPrompt()}
        />
        <button type="button" onClick={() => submitPrompt()}>
          Ask Genie
        </button>
      </div>
      <div className="genie-hero-chips">
        {QUICK_INTENTS.map((intent) => (
          <button key={intent} type="button" onClick={() => submitPrompt(intent)}>
            {intent}
          </button>
        ))}
      </div>
    </div>
  );
}
