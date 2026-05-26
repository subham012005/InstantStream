"use client";

import React, { useState } from 'react';
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
    <>
      {/* Background Decoration matching Main Platform */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="orb orb-animate-1 w-[600px] h-[600px] bg-primary/20 top-[-100px] left-[-100px]" />
        <div className="orb orb-animate-2 w-[500px] h-[500px] bg-secondary/15 bottom-[-50px] right-[-50px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px]"></div>
      </div>

      <div className="max-w-6xl mx-auto pt-24 px-4 pb-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <Globe className="w-4 h-4 text-primary" />
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Community</span>
          </div>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg mb-5 leading-tight tracking-tighter">
            Community <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Directory</span>
          </h1>
          <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant max-w-2xl mx-auto tracking-tight">
            Discover the best streaming sites submitted by our community, or share your own favorites with everyone!
          </p>
        </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8 relative z-10 w-full max-w-md mx-auto">
        <div className="bg-surface border border-black/10 dark:border-white/10 p-1.5 rounded-2xl flex w-full gap-2 backdrop-blur-md shadow-lg">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
              activeTab === 'browse'
                ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <Clapperboard className="w-4 h-4" />
            Browse Sites
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
              activeTab === 'submit'
                ? 'bg-secondary text-white shadow-[0_0_15px_rgba(var(--secondary),0.3)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Submit a Site
          </button>
        </div>
      </div>

      {/* Browse Tab Content */}
      {activeTab === 'browse' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative max-w-xl mx-auto mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search sites by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border border-black/10 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md"
            />
          </div>

          {filteredSites.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-3xl border border-black/10 dark:border-white/10 border-dashed">
              <Film className="w-16 h-16 text-on-surface-variant/30 mx-auto mb-4" />
              <h3 className="text-xl text-on-surface font-medium mb-2">No sites found</h3>
              <p className="text-on-surface-variant">Try a different search or be the first to submit a site!</p>
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
                    className="group glass-panel border border-black/10 dark:border-white/10 rounded-2xl p-6 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,112,243,0.15)] hover:-translate-y-1 cursor-pointer overflow-hidden relative block"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20 shrink-0">
                        <span className="text-primary font-bold text-lg">
                          {site['Site Name']?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                          {site['Site Name'] || 'Unknown Site'}
                        </h3>
                        <div className="flex items-center gap-1 text-emerald-500 font-medium mt-1 text-xs uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Community Verified</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-on-surface-variant text-sm line-clamp-3 mb-4 min-h-[3rem] leading-relaxed">
                      {site['Description'] || 'No description provided.'}
                    </p>

                    {/* Footer: category + domain */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pt-3 border-t border-black/5 dark:border-white/5">
                      {site['Which kind of movies present there ? '] ? (
                        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                          {site['Which kind of movies present there ? ']}
                        </div>
                      ) : (
                        <div className="inline-block px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs text-on-surface-variant font-medium">
                          General
                        </div>
                      )}
                      {(() => { let d = ''; try { d = new URL(url).hostname.replace('www.', ''); } catch {} return d ? (
                        <span className="text-[11px] text-on-surface-variant/60 font-mono truncate max-w-[140px]">{d}</span>
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
          <div className="bg-surface-container border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
             <div className="p-4 sm:p-8 relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-on-surface mb-2">Share a Streaming Site</h2>
                  <p className="text-on-surface-variant text-sm">Fill in the details below. Once approved, the site will appear in the directory for everyone to discover!</p>
                </div>

                {submitSuccess ? (
                  <div className="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-on-surface mb-3">Submitted Successfully!</h3>
                    <p className="text-on-surface-variant text-base text-center max-w-sm mb-8">
                      Your site has been sent for review. It will appear on the browse list exactly once it is approved.
                    </p>
                    <button 
                      onClick={() => setSubmitSuccess(false)}
                      className="px-8 py-3 bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-on-surface font-semibold transition-all shadow-sm"
                    >
                      Submit Another Site
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
                      className="space-y-6 relative"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-on-surface mb-1.5">Site Name <span className="text-red-500">*</span></label>
                          <input 
                            name="entry.883955246"
                            type="text" 
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g. MyAwesomeStream"
                            className="w-full bg-surface-container border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-on-surface mb-1.5">Site URL <span className="text-red-500">*</span></label>
                          <input 
                            name="entry.131760258"
                            type="url" 
                            required
                            value={formData.url}
                            onChange={e => setFormData({...formData, url: e.target.value})}
                            placeholder="https://example.com"
                            className="w-full bg-surface-container border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-on-surface mb-1.5">Description</label>
                          <textarea 
                            name="entry.913762387"
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="What makes this site great?"
                            className="w-full bg-surface-container border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none font-body-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-on-surface mb-1.5">Content Type</label>
                          <input 
                            name="entry.498607371"
                            type="text" 
                            value={formData.kind}
                            onChange={e => setFormData({...formData, kind: e.target.value})}
                            placeholder="e.g. Anime, Movies, Documentaries"
                            className="w-full bg-surface-container border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md"
                          />
                        </div>
                      </div>

                      <button 
                        disabled={isSubmitting}
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90 text-on-primary font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg hover:shadow-primary/20"
                      >
                        {isSubmitting ? (
                          <><div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> Submitting...</>
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
    </>
  );
}
