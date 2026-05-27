# SEO Backlink Expansion Plan — FluxPlays

This document defines all ethical, natural backlink acquisition strategies for FluxPlays. No paid links, no spam directories, no fake reviews.

---

## Rules (Non-Negotiable)

- ❌ No paid backlink farms or link exchanges
- ❌ No fake reviews or manufactured testimonials
- ❌ No irrelevant directory spam
- ❌ No comment spam on unrelated blogs
- ✅ Every link must be genuinely useful and contextually relevant
- ✅ Content shared externally must be the same quality as the site
- ✅ Be transparent about being the project creator

---

## 1. Dev.to Article Plan

**Target:** Developers who build or use streaming tools

| Article Title | Target Keywords | CTA Link |
|---|---|---|
| "Building a Low-Latency HLS Player with React and hls.js" | hls.js react, mse api | `/blog/best-hls-streaming-tools` |
| "How We Achieved 150ms Seek Times in a Browser Video Player" | browser video player performance | Homepage |
| "Why We Built FluxPlays on Next.js App Router (not Pages)" | nextjs streaming app | `/blog/best-react-streaming-apps` |
| "Google Drive Video Streaming Explained — How It Actually Works" | google drive streaming api | `/trending/free-streaming-platforms` |
| "WebRTC vs HLS in 2026: A Developer's Honest Comparison" | webrtc vs hls | `/blog/best-webrtc-streaming-tools` |

**Publishing Notes:**
- Use canonical URL pointing back to FluxPlays for advanced technical articles
- Dev.to canonical is respected — prevents Google indexing the Dev.to version
- Tag all articles: `#react #webdev #streaming #nextjs`
- Share in Dev.to comments of related popular articles

---

## 2. Hashnode Article Plan

**Target:** Technical bloggers and open-source developers

| Article Title | Target Cluster |
|---|---|
| "The Streaming App That Replaced My $50/Month Subscriptions" | Streaming Platform |
| "Open Source Media Streaming: My Journey from VLC to Self-Hosting" | Open Source |
| "Next.js + HLS.js Architecture: A Production Walkthrough" | React/Dev |
| "5 Video Player Libraries Every React Dev Should Know" | Video Players |

**Publishing Notes:**
- Each Hashnode article links to the relevant FluxPlays blog cluster page
- End each post with "Try streaming without downloading: [FluxPlays](https://fluxplays.live)"
- Submit to Hashnode's official NodeJS and React newsletters

---

## 3. Medium Canonical Article Plan

**Target:** Non-technical enthusiasts + general tech readers

- Publish on Medium's "Better Programming" and "The Startup" publications
- Use `canonical` URL pointing to fluxplays.live to protect SEO
- Titles should be more accessible: "I Stopped Paying for Netflix — Here's What I Use Instead"

---

## 4. Reddit Posting Plan

**Rules for Reddit:** Only post in relevant threads, never spam, be transparent.

| Subreddit | Strategy |
|---|---|
| r/cordcutters | Share "Netflix Alternatives" guide when users ask for recommendations |
| r/selfhosted | Share "Open Source Streaming" article in context of Jellyfin/Plex discussions |
| r/webdev | Share developer architecture deep-dive articles |
| r/reactjs | Share React streaming app architecture article |
| r/programming | Share HLS vs WebRTC technical comparison |
| r/technology | Share general "watch movies without downloading" how-to guide |

**Rules:**
- Never drop links without context — always provide value in the comment first
- Engage with comments and questions after posting
- Wait at least 48 hours before linking from same subreddit again

---

## 5. Product Hunt Launch Plan

**Launch Type:** Product of the Day / Week submission

**Basic Requirements:**
- Clear 240-character tagline: "Stream any MP4, Drive, Telegram, or HLS link instantly in your browser — free, no account"
- Upload product screenshots: Player UI, Mobile view, How it works
- Prepare a "Maker's Story" — why FluxPlays was built
- Schedule launch for a Tuesday or Wednesday (lower competition)

**Promotion:**
- Notify all contributors and early users before launch day
- Share on Twitter/X with `#ProductHunt` hashtag
- Ask developers from Dev.to/Hashnode community to upvote

---

## 6. Hacker News Show HN Post

**Title:** "Show HN: FluxPlays – Paste any video URL and stream it instantly in your browser"

**Content Strategy:**
- Explain the technical approach: MSE API, hls.js, no backend dependency for playback
- Mention the architecture decisions (Next.js App Router, Edge Functions for headers)
- Be direct about what it is and what it isn't
- Be prepared to answer technical questions about security, CORS handling

**Schedule:** Launch on a Tuesday 6-10am EST (peak HN traffic window)

---

## 7. Indie Hackers Post

**Title:** "How I built a free video streaming utility that gets X visitors/month"

**Content:**
- Honest metrics and growth story
- Technical stack decision breakdown
- SEO strategy used (link to SEO_TOPOLOGY.md concepts)
- Lessons learned

---

## 8. Quora Answer Strategy

Search for Quora questions about:
- "What is a good Netflix alternative?"
- "How can I stream Google Drive videos in a browser?"
- "What's the best free video player for the web?"
- "How do I watch videos online without downloading them?"

Provide genuinely helpful, long-form answers. Mention FluxPlays naturally in context of the answer, not as the only option.

---

## 9. GitHub Showcase Strategy

**Goal:** Get incoming links from well-trafficked open source repos

- Add FluxPlays to the [awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) list — under "Media Streaming"
- Contribute bug fixes or documentation to `hls.js`, `video.js` repos — gain credibility before asking for links
- Add FluxPlays to React and Next.js awesome lists
- Open an issue requesting listing in the [Next.js Showcase](https://nextjs.org/showcase)

---

## 10. Open Source Directory Submissions

| Directory | URL | Category |
|---|---|---|
| AlternativeTo | alternativeto.net | "Netflix alternative" |
| Slant | slant.co | Video streaming |
| G2 | g2.com | Media Players |
| Product Hunt | producthunt.com | Developer Tools |
| Open Source Alternatives | opensourcealternative.to | Video streaming |

---

## 11. Next.js / Vercel / React Showcase Submissions

- **Vercel:** Submit to official [Vercel Templates](https://vercel.com/templates) as a Next.js App Router example
- **Next.js Showcase:** Submit to [nextjs.org/showcase](https://nextjs.org/showcase) via GitHub issue
- **React ecosystem blog:** Pitch a case study to the React team or Vercel blog

---

## 12. Backlink Tracking Template

| Source | URL | Date | Status | Notes |
|---|---|---|---|---|
| Dev.to | — | — | Planned | Article under drafting |
| Reddit r/cordcutters | — | — | Planned | Wait for relevant thread |
| Product Hunt | — | — | Planned | Schedule: TBD |
| AlternativeTo | — | — | In Progress | Submitted |

---

## 13. Outreach Message Templates

### For Blog Inclusion

> Hi [Name],
>
> I came across your article "[Title]" and noticed it covers streaming tools for developers. I recently built FluxPlays — a free, browser-based utility for streaming MP4, HLS, and Google Drive links without downloading them. It might be a useful addition to your list, particularly for the "bring your own content" use case.
>
> Link: https://fluxplays.live
>
> Happy to answer any questions about the technical architecture.
>
> Best, [Your name]

### For GitHub Awesome Lists

Pull Request description:
Adding FluxPlays — a free, open-source streaming web app built with Next.js that allows users to stream MP4, HLS (m3u8), Google Drive, and Telegram video links directly in the browser without any downloads or account creation. GitHub: https://github.com/subham012005/InstantStream
