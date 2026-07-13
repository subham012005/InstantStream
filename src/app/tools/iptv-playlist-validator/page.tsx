"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Play, Check, AlertTriangle, List, Search, Download } from 'lucide-react';

interface ParsedChannel {
  name: string;
  logo: string | null;
  group: string;
  url: string;
}

export default function IPTVPlaylistValidator() {
  const [m3uText, setM3uText] = useState('');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [channels, setChannels] = useState<ParsedChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');

  const handleParse = (text: string) => {
    try {
      if (!text.trim()) {
        setError("Playlist content is empty.");
        return;
      }
      
      const lines = text.split('\n');
      const parsed: ParsedChannel[] = [];
      let current: Partial<ParsedChannel> | null = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF:')) {
          const info = line.substring(8);
          const commaIdx = info.lastIndexOf(',');
          const name = commaIdx !== -1 ? info.substring(commaIdx + 1).trim() : 'Unnamed Channel';
          
          const logoMatch = info.match(/tvg-logo="([^"]*)"/i);
          const groupMatch = info.match(/group-title="([^"]*)"/i);

          current = {
            name,
            logo: logoMatch ? logoMatch[1] : null,
            group: groupMatch ? groupMatch[1] : 'General',
            url: ''
          };
        } else if (line && !line.startsWith('#')) {
          if (current) {
            current.url = line;
            parsed.push(current as ParsedChannel);
            current = null;
          }
        }
      }

      if (parsed.length === 0) {
        throw new Error("No channels found. Ensure the format contains standard #EXTINF tag definitions followed by stream URLs.");
      }

      setChannels(parsed);
      setSelectedGroup('All');
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to parse playlist.");
      setChannels([]);
    }
  };

  const handleFetchUrl = async () => {
    if (!playlistUrl.trim()) {
      setError("Please enter a valid M3U URL.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Use proxy or server-side fetch to avoid CORS blocks
      const res = await fetch(`/api/proxy-video?url=${encodeURIComponent(playlistUrl.trim())}`);
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const text = await res.text();
      handleParse(text);
    } catch (err: any) {
      setError(`Failed to fetch playlist URL due to CORS or Server Error: ${err.message}. Try pasting playlist text contents directly below.`);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  const groups = ['All', ...new Set(channels.map(c => c.group))];

  const filteredChannels = channels.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'All' || c.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <main className="min-h-screen bg-[var(--bg-base)] pt-[100px] pb-[60px]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] font-[family-name:var(--font-dm-sans)] text-[var(--text-muted)] mb-8">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/tools" className="hover:text-[var(--text-primary)] transition-colors">Tools</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[var(--text-primary)] font-medium truncate">IPTV Playlist Validator</span>
        </nav>

        {/* Heading */}
        <div className="mb-10 max-w-3xl">
          <h1 className="font-[family-name:var(--font-sora)] font-bold text-[36px] md:text-[48px] text-[var(--text-primary)] mb-4 leading-tight">
            Free IPTV M3U Playlist <span className="text-[var(--accent)]">Tester & Validator</span>
          </h1>
          <p className="font-[family-name:var(--font-dm-sans)] text-[16px] md:text-[18px] text-[var(--text-secondary)] leading-relaxed">
            Validate, parse, and check your IPTV M3U playlists online. Extract channel details, categories, logos, and test streams directly inside your browser.
          </p>
        </div>

        {/* Grid configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Parser Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-sora)] font-bold text-[18px] text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <List className="w-5 h-5 text-[var(--accent)]" />
                Load IPTV Playlist
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Option 1: Paste Playlist URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="https://example.com/playlist.m3u"
                      value={playlistUrl}
                      onChange={(e) => setPlaylistUrl(e.target.value)}
                      className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[8px] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-mono"
                    />
                    <button 
                      onClick={handleFetchUrl}
                      disabled={loading}
                      className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-bold px-4 py-2 rounded-[8px] transition-colors disabled:opacity-50"
                    >
                      {loading ? "..." : "Fetch"}
                    </button>
                  </div>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
                  <span className="flex-shrink mx-4 text-[11px] text-[var(--text-muted)] font-bold uppercase">Or</span>
                  <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Option 2: Paste Raw M3U Content</label>
                  <textarea 
                    placeholder="#EXTM3U&#10;#EXTINF:-1 tvg-logo=&quot;http://logo.com&quot; group-title=&quot;News&quot;,CNN&#10;http://stream.cnn.com/live.m3u8"
                    value={m3uText}
                    onChange={(e) => setM3uText(e.target.value)}
                    rows={8}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[8px] p-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-mono resize-none"
                  />
                  <button 
                    onClick={() => handleParse(m3uText)}
                    className="w-full bg-[var(--bg-elevated)] hover:bg-[var(--border)] text-[var(--text-primary)] text-sm font-bold py-2.5 rounded-[8px] border border-[var(--border)] transition-colors"
                  >
                    Parse Playlist Contents
                  </button>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 text-red-500 rounded-[8px] border border-red-500/20 text-xs flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 shadow-sm min-h-[400px] flex flex-col">
              
              {channels.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[var(--text-muted)]">
                  <List className="w-12 h-12 opacity-35 mb-4" />
                  <h3 className="font-[family-name:var(--font-sora)] font-bold text-[16px] text-[var(--text-primary)] mb-2">No Playlist Loaded</h3>
                  <p className="font-[family-name:var(--font-dm-sans)] text-sm max-w-sm">
                    Paste a URL or paste raw M3U text in the left panel to parse and validate your channels.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 flex flex-col flex-1">
                  
                  {/* Stats & Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-[var(--border-subtle)]">
                    <div>
                      <h3 className="font-[family-name:var(--font-sora)] font-bold text-[18px] text-[var(--text-primary)]">Parsed Channels</h3>
                      <p className="text-[13px] text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)]">
                        Found {channels.length} items ({filteredChannels.length} filtered)
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-[200px]">
                        <input 
                          type="text" 
                          placeholder="Search channels..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[8px] pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                        />
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      </div>

                      <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[8px] px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      >
                        {groups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Channel Grid */}
                  <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 space-y-3 scrollbar-thin">
                    {filteredChannels.length === 0 ? (
                      <div className="text-center py-12 text-[var(--text-muted)] text-sm">
                        No channels matching search filters.
                      </div>
                    ) : (
                      filteredChannels.map((channel, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[10px] hover:border-[var(--accent)] transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden flex items-center justify-center shrink-0">
                              {channel.logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={channel.logo} alt="" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                              ) : (
                                <Play className="w-4 h-4 text-[var(--text-muted)]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-[var(--text-primary)] truncate font-[family-name:var(--font-sora)]">{channel.name}</h4>
                              <p className="text-[11px] text-[var(--text-muted)] font-[family-name:var(--font-dm-sans)] truncate flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border)]">{channel.group}</span>
                                <span className="font-mono text-[9px] opacity-75">{channel.url}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/hls-m3u8-stream-player?url=${encodeURIComponent(channel.url)}`}
                              className="p-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all text-xs flex items-center gap-1 font-bold"
                              title="Play stream in HLS player"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Play</span>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
