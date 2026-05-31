"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, PlusCircle, Search, Film, CheckCircle2, Clapperboard, Globe } from 'lucide-react';
import Link from 'next/link';

interface Site {
  Timestamp?: string;
  'Site Name'?: string;
  'Site URL'?: string;
  Description?: string;
  'Which kind of movies present there ? '?: string;
  Approved?: string;
}

interface Props {
  sites: Site[];
  formUrl: string;
}

export default function CommunityDashboard({ sites, formUrl }: Props) {
  const [activeTab, setActiveTab] = useState<'browse' | 'submit'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBar, setShowBar] = useState(false);
  const [barClosed, setBarClosed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowBar(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Native form state
  const [formData, setFormData] = useState({
    name: '', url: '', description: '', kind: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleNativeSubmit = () => {
    // We let the native form do the actual POST to avoid fetch CORS blocking.
    setIsSubmitting(true);
    setTimeout(() => {
      setSubmitSuccess(true);
      setFormData({ name: '', url: '', description: '', kind: '' });
      setIsSubmitting(false);
    }, 1200); // Small wait to show the animation and ensure submission goes through
  };

  const filteredSites = sites.filter(site => {
    const name = site['Site Name']?.toLowerCase() || '';
    const desc = site['Description']?.toLowerCase() || '';
    const tag  = site['Which kind of movies present there ? ']?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || desc.includes(query) || tag.includes(query);
  });

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      
      <div className="max-w-[1200px] mx-auto pt-[80px] px-4 md:px-8 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] mb-6">
            <Globe className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[12px] text-[var(--text-primary)] uppercase tracking-widest">Directory</span>
          </div>
          <h1 className="font-[family-name:var(--font-sora)] font-bold text-[48px] text-[var(--text-primary)] mb-4 leading-tight">
            FluxPlays Community
          </h1>
          <p className="font-[family-name:var(--font-dm-sans)] text-[18px] text-[var(--text-secondary)] max-w-2xl mx-auto">
            Find more places to watch. Discover community-curated streaming sites or share your favorites.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 w-full max-w-md mx-auto">
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-1.5 rounded-[12px] flex w-full gap-2">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex-1 py-2.5 rounded-[8px] font-semibold transition-all flex items-center justify-center gap-2 text-[14px] ${
                activeTab === 'browse'
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              <Clapperboard className="w-4 h-4" />
              Browse
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`flex-1 py-2.5 rounded-[8px] font-semibold transition-all flex items-center justify-center gap-2 text-[14px] ${
                activeTab === 'submit'
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Submit
            </button>
          </div>
        </div>

        {/* Browse Tab Content */}
        {activeTab === 'browse' && (
          <div className="animate-fade-in">
            <div className="relative max-w-[600px] mx-auto mb-10">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search sites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] py-[14px] pl-12 pr-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors font-[family-name:var(--font-dm-sans)] text-[15px]"
              />
            </div>

            {filteredSites.length === 0 ? (
              <div className="text-center py-20 bg-[var(--bg-surface)] rounded-[14px] border border-[var(--border)] border-dashed">
                <Film className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                <h3 className="text-[18px] text-[var(--text-primary)] font-semibold mb-2 font-[family-name:var(--font-sora)]">No sites found</h3>
                <p className="text-[var(--text-secondary)] font-[family-name:var(--font-dm-sans)] text-[15px]">Try a different search or submit a site!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSites.map((site, index) => {
                  const url = site['Site URL']?.startsWith('http') ? site['Site URL'] : `https://${site['Site URL']}`;
                  return (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-[var(--bg-surface)] border border-[var(--border)] rounded-[14px] p-6 hover:border-[var(--accent)] transition-all hover:-translate-y-1 block relative"
                    >
                      <div className="absolute top-6 right-6">
                        <ExternalLink className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-[10px] bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                          <span className="text-[var(--accent)] font-bold text-lg font-[family-name:var(--font-sora)]">
                            {site['Site Name']?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-[16px] font-bold text-[var(--text-primary)] font-[family-name:var(--font-sora)] mb-1 pr-6 truncate">
                            {site['Site Name'] || 'Unknown Site'}
                          </h3>
                          <div className="flex items-center gap-1 text-emerald-500 font-semibold text-[11px] uppercase tracking-widest">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </div>
                        </div>
                      </div>

                      <p className="text-[var(--text-secondary)] text-[14px] font-[family-name:var(--font-dm-sans)] leading-relaxed mb-6 line-clamp-2 min-h-[42px]">
                        {site['Description'] || 'No description provided.'}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-4 border-t border-[var(--border-subtle)]">
                        {site['Which kind of movies present there ? '] ? (
                          <div className="px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[12px] text-[var(--text-secondary)] font-medium font-[family-name:var(--font-jetbrains-mono)]">
                            {site['Which kind of movies present there ? ']}
                          </div>
                        ) : (
                          <div className="px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[12px] text-[var(--text-secondary)] font-medium font-[family-name:var(--font-jetbrains-mono)]">
                            General
                          </div>
                        )}
                        {(() => { let d = ''; try { d = new URL(url).hostname.replace('www.', ''); } catch {} return d ? (
                          <span className="text-[12px] text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)] truncate max-w-[140px]">{d}</span>
                        ) : null; })()}
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Submit Tab Content */}
        {activeTab === 'submit' && (
          <div className="animate-fade-in max-w-[600px] mx-auto">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] overflow-hidden relative">
               <div className="p-6 md:p-8 relative z-10">
                  <div className="text-center mb-8">
                    <h2 className="font-[family-name:var(--font-sora)] text-[24px] font-bold text-[var(--text-primary)] mb-2">Share a Site</h2>
                    <p className="font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] text-[15px]">Fill in the details below. Once approved, the site will appear in the directory!</p>
                  </div>

                  {submitSuccess ? (
                    <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
                      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[var(--text-primary)] mb-3">Submitted Successfully!</h3>
                      <p className="font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] text-center max-w-sm mb-8">
                        Your site has been sent for review.
                      </p>
                      <button 
                        onClick={() => setSubmitSuccess(false)}
                        className="px-6 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border)] hover:text-[var(--accent)] hover:border-[var(--accent)] rounded-[8px] text-[var(--text-primary)] font-semibold transition-all text-[14px]"
                      >
                        Submit Another
                      </button>
                    </div>
                  ) : (
                    <>
                      <iframe name="hidden_iframe" id="hidden_iframe" style={{display: 'none'}}></iframe>
                      <form 
                        action="https://docs.google.com/forms/d/e/1FAIpQLSfJ-zFXbkbMSfNWWP3XtHuA_qD2w7AVzpP28uBXZF_sChrIbA/formResponse" 
                        method="POST"
                        target="hidden_iframe"
                        onSubmit={handleNativeSubmit} 
                        className="space-y-5"
                      >
                        <div>
                          <label className="block text-[14px] font-semibold text-[var(--text-primary)] mb-2">Site Name <span className="text-[var(--accent)]">*</span></label>
                          <input 
                            name="entry.883955246"
                            type="text" 
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g. MyAwesomeStream"
                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[8px] px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors text-[14px] font-[family-name:var(--font-dm-sans)]"
                          />
                        </div>
                        <div>
                          <label className="block text-[14px] font-semibold text-[var(--text-primary)] mb-2">Site URL <span className="text-[var(--accent)]">*</span></label>
                          <input 
                            name="entry.131760258"
                            type="url" 
                            required
                            value={formData.url}
                            onChange={e => setFormData({...formData, url: e.target.value})}
                            placeholder="https://example.com"
                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[8px] px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors text-[14px] font-[family-name:var(--font-dm-sans)]"
                          />
                        </div>
                        <div>
                          <label className="block text-[14px] font-semibold text-[var(--text-primary)] mb-2">Description</label>
                          <textarea 
                            name="entry.913762387"
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="What makes this site great?"
                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[8px] px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors text-[14px] font-[family-name:var(--font-dm-sans)] resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[14px] font-semibold text-[var(--text-primary)] mb-2">Content Type</label>
                          <input 
                            name="entry.498607371"
                            type="text" 
                            value={formData.kind}
                            onChange={e => setFormData({...formData, kind: e.target.value})}
                            placeholder="e.g. Anime, Movies"
                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[8px] px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors text-[14px] font-[family-name:var(--font-dm-sans)]"
                          />
                        </div>

                        <button 
                          disabled={isSubmitting}
                          type="submit" 
                          className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-[8px] transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-2"
                        >
                          {isSubmitting ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                          ) : 'Submit for Review'}
                        </button>
                      </form>
                    </>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Back Bar — appears after 5s */}
      <AnimatePresence>
        {showBar && !barClosed && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              height: '52px',
              background: 'var(--bg-elevated)',
              borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              zIndex: 100
            }}
          >
            <Link href="/" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '14px' }}>
              ← Back to FluxPlays
            </Link>
            <button
              onClick={() => setBarClosed(true)}
              style={{ color: 'var(--text-muted)', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
            >×</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
