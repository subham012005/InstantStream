<div align="center">
  <img src="https://fluxplays.live/og-image.png" alt="FluxPlays - Modern Video Streaming Web App" width="100%" />

  <h1>FluxPlays</h1>
  <p><strong>The Modern, Zero-Latency Browser Video Streaming Utility</strong></p>

  <p>
    <a href="https://fluxplays.live">Live Demo</a> •
    <a href="https://fluxplays.live/guides">Architecture Guides</a> •
    <a href="https://fluxplays.live/blog">Blog</a>
  </p>
</div>

<br/>

**FluxPlays (formerly InstantStream)** is a highly optimized, browser-based video streaming application built on Next.js. It bypasses the need for downloading bulky MP4 files or native media players by leveraging the browser's native capabilities, HTTP Range Requests, and HLS protocols.

If you have a direct link to a video file, FluxPlays will stream it instantly .

## 🚀 Key Features
- **Zero Latency Seeking**: Implements sub-150ms HTTP Range Request chunks for scrubbing.
- **Protocol Flexibility**: Natively supports MP4 (H.264), WEBM (VP9), and HLS (.m3u8) streams.
- **Provider Agnostic**: Paste links from Google Drive, Telegram CDNs, or direct servers.
- **E-E-A-T Optimized**: Includes a programmatic SEO blog and guide ecosystem natively wired through ISR.
- **Zero Footprint**: Streams without saving cache files temporarily to the disk. 

## 🛠 Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS / Vanilla CSS
- **SEO Elements**: JSON-LD Structured Data, Dynamic OpenGraph Meta
- **Hosting**: Vercel Edge

## 📦 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📈 SEO & Growth Architecture
This project is engineered as a case study in **Scale-Up SEO**:
- **Programmatic Routing**: `/guides/[slug]` maps out comprehensive industry comparisons.
- **Rich Snippets**: `AggregateRating` and `WebApplication` schema are hardcoded in the `layout.tsx` for high SERP CTR.
- **Semantic HTML**: Strict 1-H1 rules and validated metadata across all nodes.

*Read the exact strategy documents in the root directory (e.g., `SEO_BACKLINK_PLAN.md`)*.

---

> Built with Next.js and ❤️ by the open-source community.
