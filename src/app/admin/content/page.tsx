'use client';

import { useEffect, useState } from 'react';
import type { SiteContentData } from '@/lib/siteContent';
import { defaultContent } from '@/lib/siteContent';

export default function ContentPage() {
  const [content, setContent] = useState<SiteContentData>(defaultContent);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then(setContent);
  }, []);

  async function save() {
    setStatus('saving');
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    setStatus(res.ok ? 'saved' : 'error');
    setTimeout(() => setStatus('idle'), 3000);
  }

  function updateCard(index: number, field: 'title' | 'description', value: string) {
    const cards = [...content.features.cards];
    cards[index] = { ...cards[index], [field]: value };
    setContent({ ...content, features: { ...content.features, cards } });
  }

  function updateFooterColumn(ci: number, value: string) {
    const columns = content.footer.columns.map((col, i) =>
      i === ci ? { ...col, title: value } : col
    );
    setContent({ ...content, footer: { ...content.footer, columns } });
  }

  function updateFooterLink(ci: number, li: number, field: 'title' | 'url', value: string) {
    const columns = content.footer.columns.map((col, i) => {
      if (i !== ci) return col;
      const links = col.links.map((link, j) =>
        j === li ? { ...link, [field]: value } : link
      );
      return { ...col, links };
    });
    setContent({ ...content, footer: { ...content.footer, columns } });
  }

  function updateStep(i: number, field: 'title' | 'body', value: string) {
    const steps = content.howToRent.steps.map((step, j) =>
      j === i ? { ...step, [field]: value } : step
    );
    setContent({ ...content, howToRent: { ...content.howToRent, steps } });
  }

  const inputCls = 'mt-1 block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black';
  const smallInputCls = 'mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Content</h1>
          <p className="text-gray-500 text-sm mt-1">Edit the text shown on the homepage.</p>
        </div>
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition"
        >
          {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved ✓' : status === 'error' ? 'Error — retry' : 'Save changes'}
        </button>
      </div>

      <div className="space-y-8">

        {/* Hero */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Hero Section</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Headline</span>
              <input className={inputCls} value={content.hero.headline}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, headline: e.target.value } })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Subheading</span>
              <textarea rows={2} className={`${inputCls} resize-none`} value={content.hero.subheading}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, subheading: e.target.value } })} />
            </label>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Features Section</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <input className={inputCls} value={content.features.title}
                onChange={(e) => setContent({ ...content, features: { ...content.features, title: e.target.value } })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Subtitle</span>
              <input className={inputCls} value={content.features.subtitle}
                onChange={(e) => setContent({ ...content, features: { ...content.features, subtitle: e.target.value } })} />
            </label>
            <div className="grid gap-4 sm:grid-cols-3 mt-2">
              {content.features.cards.map((card, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Card {i + 1} title</span>
                    <input className={smallInputCls} value={card.title}
                      onChange={(e) => updateCard(i, 'title', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</span>
                    <textarea rows={3} className={`${smallInputCls} resize-none`} value={card.description}
                      onChange={(e) => updateCard(i, 'description', e.target.value)} />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fleet Section */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Fleet Section</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Badge text</span>
              <input className={inputCls} value={content.fleet.badge}
                onChange={(e) => setContent({ ...content, fleet: { ...content.fleet, badge: e.target.value } })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <input className={inputCls} value={content.fleet.title}
                onChange={(e) => setContent({ ...content, fleet: { ...content.fleet, title: e.target.value } })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Description</span>
              <textarea rows={2} className={`${inputCls} resize-none`} value={content.fleet.description}
                onChange={(e) => setContent({ ...content, fleet: { ...content.fleet, description: e.target.value } })} />
            </label>
          </div>
        </section>

        {/* Business Info */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Business Info</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Phone</span>
              <input className={inputCls} value={content.business.phone}
                onChange={(e) => setContent({ ...content, business: { ...content.business, phone: e.target.value } })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Hours</span>
              <input className={inputCls} placeholder="Mo-Su 08:00-20:00" value={content.business.hours}
                onChange={(e) => setContent({ ...content, business: { ...content.business, hours: e.target.value } })} />
            </label>
          </div>
        </section>

        {/* Footer */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Footer</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Description</span>
              <textarea rows={2} className={`${inputCls} resize-none`} value={content.footer.description}
                onChange={(e) => setContent({ ...content, footer: { ...content.footer, description: e.target.value } })} />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              {(['instagram', 'twitter', 'facebook'] as const).map((field) => (
                <label key={field} className="block">
                  <span className="text-sm font-medium text-gray-700 capitalize">{field} URL</span>
                  <input className={inputCls} value={content.footer[field]}
                    onChange={(e) => setContent({ ...content, footer: { ...content.footer, [field]: e.target.value } })} />
                </label>
              ))}
            </div>
            <div className="space-y-4 mt-2">
              {content.footer.columns.map((col, ci) => (
                <div key={ci} className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Column {ci + 1} heading</span>
                    <input className={smallInputCls} value={col.title}
                      onChange={(e) => updateFooterColumn(ci, e.target.value)} />
                  </label>
                  <div className="space-y-2">
                    {col.links.map((link, li) => (
                      <div key={li} className="grid grid-cols-2 gap-2">
                        <input placeholder="Link title"
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                          value={link.title}
                          onChange={(e) => updateFooterLink(ci, li, 'title', e.target.value)} />
                        <input placeholder="URL"
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
                          value={link.url}
                          onChange={(e) => updateFooterLink(ci, li, 'url', e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Rent */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">How to Rent</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Headline</span>
              <input className={inputCls} value={content.howToRent.headline}
                onChange={(e) => setContent({ ...content, howToRent: { ...content.howToRent, headline: e.target.value } })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Description</span>
              <textarea rows={2} className={`${inputCls} resize-none`} value={content.howToRent.description}
                onChange={(e) => setContent({ ...content, howToRent: { ...content.howToRent, description: e.target.value } })} />
            </label>
            <div className="grid gap-4 sm:grid-cols-3 mt-2">
              {content.howToRent.steps.map((step, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Step {i + 1} title</span>
                    <input className={smallInputCls} value={step.title}
                      onChange={(e) => updateStep(i, 'title', e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Body text</span>
                    <textarea rows={3} className={`${smallInputCls} resize-none`} value={step.body}
                      onChange={(e) => updateStep(i, 'body', e.target.value)} />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
