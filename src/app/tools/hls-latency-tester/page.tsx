"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, Play, Square, Activity, Timer, AlertCircle, RefreshCw } from 'lucide-react';

interface LatencyRecord {
  timestamp: string;
  latencyMs: number;
  status: 'ok' | 'error';
}

interface ManifestMeta {
  type: string;
  targetDuration: string;
  mediaSequence: string;
  segmentsCount: number;
  version: string;
}

export default function HLSLatencyTester() {
  const [streamUrl, setStreamUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [history, setHistory] = useState<LatencyRecord[]>([]);
  const [meta, setMeta] = useState<ManifestMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const historyRef = useRef<LatencyRecord[]>([]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const runTestTick = async (url: string) => {
    const started = performance.now();
    const timeString = new Date().toLocaleTimeString();
    try {
      // Use proxy endpoint to bypass CORS
      const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(url)}&t=${Date.now()}`;
      const res = await fetch(proxyUrl);
      const elapsed = Math.round(performance.now() - started);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      // Update history
      const record: LatencyRecord = { timestamp: timeString, latencyMs: elapsed, status: 'ok' };
      const nextHistory = [record, ...historyRef.current].slice(0, 15);
      historyRef.current = nextHistory;
      setHistory(nextHistory);

      // Parse manifest
      const targetDurationMatch = text.match(/#EXT-X-TARGETDURATION:(\d+)/i);
      const mediaSequenceMatch = text.match(/#EXT-X-MEDIA-SEQUENCE:(\d+)/i);
      const typeMatch = text.match(/#EXT-X-PLAYLIST-TYPE:([^\r\n]*)/i);
      const versionMatch = text.match(/#EXT-X-VERSION:(\d+)/i);
      const segments = text.split('\n').filter(line => line.trim().startsWith('#EXTINF:')).length;

      setMeta({
        type: typeMatch ? typeMatch[1].trim() : 'Live / Live VOD',
        targetDuration: targetDurationMatch ? `${targetDurationMatch[1]}s` : 'N/A',
        mediaSequence: mediaSequenceMatch ? mediaSequenceMatch[1] : 'N/A',
        segmentsCount: segments,
        version: versionMatch ? versionMatch[1] : '3'
      });
      setError(null);
    } catch (err: any) {
      const record: LatencyRecord = { timestamp: timeString, latencyMs: 0, status: 'error' };
      const nextHistory = [record, ...historyRef.current].slice(0, 15);
      historyRef.current = nextHistory;
      setHistory(nextHistory);
      setError(`Fetch error: ${err.message || 'Stream server blocked or unavailable.'}`);
    }
  };

  const handleStart = () => {
    if (!streamUrl.trim()) {
      setError("Please enter a stream URL.");
      return;
    }
    
    setTesting(true);
    setHistory([]);
    historyRef.current = [];
    setMeta(null);
    setError(null);

    // Initial check
    runTestTick(streamUrl.trim());

    // Schedule checks
    timerRef.current = setInterval(() => {
      runTestTick(streamUrl.trim());
    }, 3000);
  };

  const handleStop = () => {
    setTesting(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const averageLatency = history.length > 0 
    ? Math.round(history.filter(h => h.status === 'ok').reduce((acc, h) => acc + h.latencyMs, 0) / (history.filter(h => h.status === 'ok').length || 1))
    : 0;

  return (
    <main className="min-h-screen bg-[var(--bg-base)] pt-[100px] pb-[60px]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] font-[family-name:var(--font-dm-sans)] text-[var(--text-muted)] mb-8">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/tools" className="hover:text-[var(--text-primary)] transition-colors">Tools</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[var(--text-primary)] font-medium truncate">HLS Latency Tester</span>
        </nav>

        {/* Heading */}
        <div className="mb-10 max-w-3xl">
          <h1 className="font-[family-name:var(--font-sora)] font-bold text-[36px] md:text-[48px] text-[var(--text-primary)] mb-4 leading-tight">
            HLS M3U8 Stream <span className="text-[var(--accent)]">Latency Tester</span>
          </h1>
          <p className="font-[family-name:var(--font-dm-sans)] text-[16px] md:text-[18px] text-[var(--text-secondary)] leading-relaxed">
            Analyze live HLS stream manifests in real-time. Measure request round-trip latency, monitor chunk updates, and evaluate server performance metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls and Input */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-sora)] font-bold text-[18px] text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[var(--accent)]" />
                Configure Stream Target
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">HLS Manifest URL (.m3u8)</label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/live/index.m3u8"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    disabled={testing}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[8px] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-mono disabled:opacity-50"
                  />
                </div>

                {!testing ? (
                  <button 
                    onClick={handleStart}
                    className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 rounded-[8px] transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Play className="w-4 h-4 fill-white" /> Start Latency Test
                  </button>
                ) : (
                  <button 
                    onClick={handleStop}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-[8px] transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Square className="w-4 h-4 fill-white" /> Stop Testing
                  </button>
                )}

                {error && (
                  <div className="p-4 bg-red-500/10 text-red-500 rounded-[8px] border border-red-500/20 text-xs flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>

            {meta && (
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 shadow-sm space-y-4">
                <h3 className="font-[family-name:var(--font-sora)] font-bold text-[15px] text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">Manifest Details</h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-[family-name:var(--font-dm-sans)]">
                  <div>
                    <span className="text-[var(--text-muted)] block mb-1">Playlist Type</span>
                    <span className="font-bold text-[var(--text-secondary)]">{meta.type}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block mb-1">Target Duration</span>
                    <span className="font-bold text-[var(--text-secondary)]">{meta.targetDuration}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block mb-1">Media Sequence</span>
                    <span className="font-bold text-[var(--text-secondary)] font-mono">{meta.mediaSequence}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block mb-1">Segment Count</span>
                    <span className="font-bold text-[var(--text-secondary)]">{meta.segmentsCount} segments</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block mb-1">HLS Version</span>
                    <span className="font-bold text-[var(--text-secondary)]">v{meta.version}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Latency History and Graph */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 shadow-sm min-h-[350px] flex flex-col justify-between">
              
              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[var(--text-muted)]">
                  <Timer className="w-12 h-12 opacity-35 mb-4" />
                  <h3 className="font-[family-name:var(--font-sora)] font-bold text-[16px] text-[var(--text-primary)] mb-2">No Live Data</h3>
                  <p className="font-[family-name:var(--font-dm-sans)] text-sm max-w-sm">
                    Enter an HLS stream URL and start testing. Latency updates will show here every 3 seconds.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col">
                  
                  {/* Summary Metric cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] text-center">
                      <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider block mb-1">Current Latency</span>
                      <span className={`text-3xl font-black font-mono ${history[0].status === 'error' ? 'text-red-500' : 'text-[var(--accent)]'}`}>
                        {history[0].status === 'ok' ? `${history[0].latencyMs}ms` : 'Offline'}
                      </span>
                    </div>

                    <div className="bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--border)] text-center">
                      <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider block mb-1">Average Ping</span>
                      <span className="text-3xl font-black font-mono text-emerald-500">{averageLatency}ms</span>
                    </div>
                  </div>

                  {/* Realtime Request Log */}
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Response Ping Timeline</h3>
                    <div className="overflow-y-auto max-h-[220px] space-y-2 pr-1 font-mono text-xs">
                      {history.map((record, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg">
                          <span className="text-[var(--text-muted)]">{record.timestamp}</span>
                          {record.status === 'ok' ? (
                            <span className="text-emerald-500 font-bold">SUCCESS · {record.latencyMs}ms</span>
                          ) : (
                            <span className="text-red-500 font-bold">FAILED · TIMEOUT</span>
                          )}
                        </div>
                      ))}
                    </div>
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
