"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, Download, RefreshCw, Trash2 } from 'lucide-react';

export default function SrtToVttConverter() {
  const [srtContent, setSrtContent] = useState('');
  const [vttContent, setVttContent] = useState('');
  const [fileName, setFileName] = useState('subtitles.vtt');
  const [error, setError] = useState<string | null>(null);

  const convertSrtToVtt = (srtText: string): string => {
    // WebVTT header
    let vtt = "WEBVTT\n\n";
    // Replace SRT comma timestamps (00:00:00,000) with WebVTT dot timestamps (00:00:00.000)
    vtt += srtText.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    return vtt;
  };

  const handleConvert = () => {
    if (!srtContent.trim()) {
      setError("Please paste SRT content or load an SRT file first.");
      return;
    }
    try {
      const converted = convertSrtToVtt(srtContent);
      setVttContent(converted);
      setError(null);
    } catch (err: any) {
      setError("Failed to convert subtitles. Check file formatting.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set file name to download
    const outputName = file.name.replace(/\.srt$/i, '.vtt');
    setFileName(outputName);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setSrtContent(text);
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read the file.");
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!vttContent) return;
    const blob = new Blob([vttContent], { type: 'text/vtt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setSrtContent('');
    setVttContent('');
    setFileName('subtitles.vtt');
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-base)] pt-[100px] pb-[60px]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] font-[family-name:var(--font-dm-sans)] text-[var(--text-muted)] mb-8">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/tools" className="hover:text-[var(--text-primary)] transition-colors">Tools</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[var(--text-primary)] font-medium truncate">SRT to WebVTT Converter</span>
        </nav>

        {/* Heading */}
        <div className="mb-10 max-w-3xl">
          <h1 className="font-[family-name:var(--font-sora)] font-bold text-[36px] md:text-[48px] text-[var(--text-primary)] mb-4 leading-tight">
            Free SRT to WebVTT <span className="text-[var(--accent)]">Subtitle Converter</span>
          </h1>
          <p className="font-[family-name:var(--font-dm-sans)] text-[16px] md:text-[18px] text-[var(--text-secondary)] leading-relaxed">
            Convert standard SRT subtitles into WebVTT (.vtt) captions natively in your browser. 100% client-side processing keeps your file uploads completely private.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Input Area */}
          <div className="space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 shadow-sm flex flex-col min-h-[450px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-[family-name:var(--font-sora)] font-bold text-[18px] text-[var(--text-primary)] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[var(--accent)]" />
                  SRT Source Subtitles
                </h2>
                
                <div className="flex items-center gap-2">
                  <label className="bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all">
                    Load file
                    <input 
                      type="file" 
                      accept=".srt" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                  {srtContent && (
                    <button 
                      onClick={handleClear}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                      title="Clear content"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <textarea 
                placeholder="1&#10;00:01:20,000 --&gt; 00:01:23,000&#10;Hello, this is a subtitle entry!&#10;&#10;2&#10;00:01:24,000 --&gt; 00:01:28,000&#10;Paste raw SRT content or load a file."
                value={srtContent}
                onChange={(e) => setSrtContent(e.target.value)}
                className="flex-1 w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[8px] p-4 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-mono resize-none"
              />

              <button 
                onClick={handleConvert}
                className="mt-4 w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 rounded-[8px] transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" /> Convert to WebVTT
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 text-red-500 rounded-[8px] border border-red-500/20 text-xs">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Output Area */}
          <div className="space-y-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] p-6 shadow-sm flex flex-col min-h-[450px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-[family-name:var(--font-sora)] font-bold text-[18px] text-[var(--text-primary)] flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-500" />
                  WebVTT Output Captions
                </h2>
                {vttContent && (
                  <span className="text-[11px] text-[var(--text-muted)] font-mono truncate max-w-[200px]">
                    Ready: {fileName}
                  </span>
                )}
              </div>

              <textarea 
                readOnly
                placeholder="WebVTT output will render here..."
                value={vttContent}
                className="flex-1 w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[8px] p-4 text-xs text-[var(--text-muted)] outline-none font-mono resize-none"
              />

              <button 
                onClick={handleDownload}
                disabled={!vttContent}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" /> Download WebVTT file
              </button>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
