'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { SiteContentData, FaqItem } from '@/lib/siteContent';
import { defaultContent } from '@/lib/siteContent';

export default function ContentPage() {
  const [content, setContent] = useState<SiteContentData>(defaultContent);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => { if (!r.ok) throw new Error('Load failed'); return r.json(); })
      .then((data) => { setContent(data); setLoadError(false); })
      .catch(() => setLoadError(true));
  }, [loadAttempt]);

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

  function updateFaq(i: number, field: keyof FaqItem, value: string) {
    const faqs = (content.faqs ?? []).map((faq, j) =>
      j === i ? { ...faq, [field]: value } : faq
    );
    setContent({ ...content, faqs });
  }

  function addFaq() {
    const faqs = [...(content.faqs ?? []), { question: '', answer: '' }];
    setContent({ ...content, faqs });
  }

  function removeFaq(i: number) {
    const faqs = (content.faqs ?? []).filter((_, j) => j !== i);
    setContent({ ...content, faqs });
  }

  const inputCls = 'mt-1 block w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black';
  const smallInputCls = 'mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Site Content</h1>
          <p className="mt-1 text-sm text-gray-500">Edit the text shown on the homepage.</p>
        </div>
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition"
        >
          {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved ✓' : status === 'error' ? 'Error — retry' : 'Save changes'}
        </button>
      </div>

      {loadError && (
        <div className="py-6 px-5 text-center bg-red-50 rounded-2xl border border-red-100">
          <p className="text-sm text-red-600 mb-2">Failed to load site content.</p>
          <button onClick={() => setLoadAttempt((a) => a + 1)} className="text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-900">Retry</button>
        </div>
      )}

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

        {/* Booking Policy */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Policy</h2>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Cancellation policy</span>
            <p className="text-xs text-gray-500 mt-0.5 mb-1.5">Shown to customers above the checkout button in the booking sidebar.</p>
            <textarea rows={3} className={`${inputCls} resize-none`}
              value={content.cancellationPolicy ?? ''}
              onChange={(e) => setContent({ ...content, cancellationPolicy: e.target.value })} />
          </label>
        </section>

        {/* FAQs */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">FAQs</h2>
            <button
              type="button"
              onClick={addFaq}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add FAQ
            </button>
          </div>
          <div className="space-y-4">
            {(content.faqs ?? []).map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">FAQ {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeFaq(i)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove FAQ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <label className="block">
                  <span className="text-xs font-medium text-gray-500">Question</span>
                  <input className={smallInputCls} value={faq.question}
                    onChange={(e) => updateFaq(i, 'question', e.target.value)} />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-500">Answer</span>
                  <textarea rows={3} className={`${smallInputCls} resize-none`} value={faq.answer}
                    onChange={(e) => updateFaq(i, 'answer', e.target.value)} />
                </label>
              </div>
            ))}
            {(content.faqs ?? []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No FAQs yet. Click &ldquo;Add FAQ&rdquo; to create one.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
