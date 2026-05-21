# SEO Topology Map — FluxPlays

This document maps the complete content architecture of the FluxPlays SEO ecosystem. It defines pillar pages, supporting content clusters, internal linking strategy, target keywords, and backlink targets.

---

## 1. Cluster: Streaming Platform Guides

**Pillar Page:** `/blog/best-streaming-platforms-in-2026`

| Supporting Page | URL | Keywords |
|---|---|---|
| Netflix Alternatives | `/trending/netflix-alternatives` | netflix alternative, free streaming, cord-cutting |
| Free Streaming Platforms | `/trending/free-streaming-platforms` | free streaming, FAST platforms, tubi alternative |
| Watch Movies Online | `/trending/watch-movies-online` | watch movies online, stream movies free |
| Best Anime Streaming Apps | `/trending/best-anime-streaming-apps` | anime streaming app, watch anime online |
| Open Source Streaming | `/blog/best-open-source-streaming-platforms` | jellyfin, plex alternative, self-hosted streaming |
| FluxPlays vs Netflix | `/compare/fluxplays-vs-netflix` | fluxplays vs netflix, netflix alternative comparison |
| FluxPlays vs Plex | `/compare/fluxplays-vs-plex` | plex alternative, plex vs web player |
| FluxPlays vs Jellyfin | `/compare/fluxplays-vs-jellyfin` | jellyfin web player, jellyfin alternative |

### Internal Linking Plan
- Pillar page links to all supporting pages
- All comparison pages link back to the pillar page
- Trending pages reference the pillar page in CTAs
- Footer links to `/blog` and `/guides`

### Backlink Targets
- Reddit: r/cordcutters, r/selfhosted, r/Piracy for legitimate discussion
- Hacker News: Show HN post linking to open-source streaming architecture
- GitHub: README links in streaming-related open-source repos
- Comparison sites: AlternativeTo listing for FluxPlays

---

## 2. Cluster: Movie Discovery & Entertainment

**Pillar Page:** `/blog/best-movie-streaming-uis`

| Supporting Page | URL | Keywords |
|---|---|---|
| Entertainment App UI Ideas | `/blog/best-entertainment-app-ui-ideas` | streaming UI design, movie app design |
| Streaming Website Features | `/blog/best-streaming-website-features` | streaming website features, video player UX |
| Netflix Clone Projects | `/blog/best-netflix-clone-projects` | netflix clone react, netflix clone github |
| Movie Streaming Platforms | `/blog/best-streaming-platforms-in-2026` | best streaming platforms 2026 |

### Target Keywords
- `streaming app UI design`
- `best movie discovery app`
- `netflix ui design inspiration`
- `video player UX patterns`

### Backlink Targets
- Dev.to design category
- CSS-Tricks article submission
- Smashing Magazine showcase
- Awwwards nomination

---

## 3. Cluster: React / Next.js Streaming Development

**Pillar Page:** `/blog/best-react-streaming-apps`

| Supporting Page | URL | Keywords |
|---|---|---|
| Video Player Libraries | `/blog/best-video-player-libraries-for-web-apps` | react video player, hls.js react |
| HLS Streaming Tools | `/blog/best-hls-streaming-tools` | hls streaming tools, video.js alternative |
| WebRTC Tools | `/blog/best-webrtc-streaming-tools` | webrtc streaming, mediasoup, livekit |
| Netflix Clone | `/blog/best-netflix-clone-projects` | netflix clone nextjs, streaming app tutorial |
| For Developers | `/trending/video-streaming-for-developers` | video streaming architecture, mse api |

### Target Keywords
- `build react video streaming app`
- `nextjs hls player`
- `react video player library 2026`
- `best hls.js alternatives`

### Backlink Targets
- Dev.to React category
- Hashnode developer streaming series
- Next.js GitHub Discussions
- Vercel templates showcase

---

## 4. Cluster: HLS / WebRTC / Video Architecture

**Pillar Page:** `/blog/best-hls-streaming-tools`

| Supporting Page | URL | Keywords |
|---|---|---|
| WebRTC Tools | `/blog/best-webrtc-streaming-tools` | webrtc vs hls, sfu server |
| Streaming for Developers | `/trending/video-streaming-for-developers` | adaptive bitrate, hls architecture |
| Video Player Libraries | `/blog/best-video-player-libraries-for-web-apps` | hls.js, dash.js, vidstack |

### Target Keywords
- `hls streaming setup guide`
- `webrtc vs hls latency`
- `best hls player browser`
- `adaptive bitrate streaming react`

### Backlink Targets
- VideoLAN community (VLC adjacent)
- WebRTC community papers
- Cloudflare developer blog comments
- AWS Media Blog guest posts

---

## 5. Cluster: Comparison Pages

**All comparison pages:** `/compare/[slug]`

| Page | Slug | Target User Intent |
|---|---|---|
| vs Netflix | `fluxplays-vs-netflix` | "is there a free alternative to netflix" |
| vs Plex | `fluxplays-vs-plex` | "plex vs web player for drive links" |
| vs Jellyfin | `fluxplays-vs-jellyfin` | "jellyfin vs web utility player" |
| vs Kodi | `fluxplays-vs-kodi` | "kodi alternative browser" |
| vs YouTube | `fluxplays-vs-youtube-streaming` | "watch video without youtube" |

### Internal Linking Each Comparison Must Have
1. Link to home (CTA)
2. Link to at least 1 trending page
3. Link to at least 1 blog article
4. Link to `/compare/[another-comparison]` as "See Also"

---

## 6. Cluster: Trending Landing Pages

**All trending pages:** `/trending/[slug]`

| Page | Priority | Primary Keyword |
|---|---|---|
| Netflix Alternatives | High | "netflix alternative free" |
| Free Streaming Platforms | High | "free streaming platforms 2026" |
| Watch Movies Online | High | "watch movies online free" |
| Best Anime Streaming Apps | Medium | "best anime streaming app" |
| Video Streaming for Developers | Medium | "video streaming for developers" |

---

## 7. Homepage Internal Links (Critical Path)

The homepage (`/`) must link to:
- `/blog` (Blog section)
- `/guides` (Guides section)
- `/trending/netflix-alternatives` (via Trending section — future)
- `/compare/fluxplays-vs-netflix` (via Comparison section — future)
- `/newsletter` (via footer)
- `/search` (via header — future)

---

## 8. Orphan Page Audit (Pages With No Incoming Links)

Run this audit before every deployment:

```
Pages that must have at least 2 internal incoming links:
- /newsletter → link from footer + blog sidebar
- /search → link from header nav + blog pages
- /about → link from footer + homepage
- /creators → link from footer + about page
- /contact → link from footer + about page
```
