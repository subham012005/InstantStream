# 🚦 SEO Post-Deployment Launch Checklist

Do not consider the SEO push complete until every item on this checklist is verified in production.

## 1. Technical Signals
- [ ] Check `https://fluxplays.live/robots.txt` loads and correctly blocks `/api/` while pointing to the sitemap.
- [ ] Check `https://fluxplays.live/sitemap.xml` generates dynamically and contains the homepage, /about, /blog, /guides, and all dynamically mapped articles.
- [ ] Run a Google Lighthouse Audit on desktop and mobile. Ensure Performance > 90, SEO > 95, Accessibility > 90. Fix any remaining shifting (CLS) or slow loading (LCP).

## 2. Meta & Schema Validation
- [ ] View page source on homepage. Verify `<title>` says "FluxPlays – Modern Movie & Video..."
- [ ] View page source on homepage. Verify JSON-LD contains `"AggregateRating"`.
- [ ] View page source on a `/blog/[slug]` route. Verify `BreadcrumbList` is present and valid.

## 3. Search Engine Submission
- [ ] Submit to Google Search Console (See `GOOGLE_SEARCH_CONSOLE_SETUP.md`).
- [ ] Submit to Bing Webmaster Tools (See `BING_WEBMASTER_SETUP.md`).
- [ ] Perform live test using Google's Rich Results Tool.

## 4. GitHub SEO Updates
- [ ] Add the following tags to the GitHub Repository Topics: `streaming`, `video-streaming`, `movie-app`, `nextjs`, `react`, `entertainment`, `web-app`, `streaming-platform`, `netflix-clone`.
- [ ] Update the GitHub 'About' link to point directly to `https://fluxplays.live`.
- [ ] Ensure the README contains keyword-rich copy.

## 5. Social & Community Engine
- [ ] Generate the high-quality OG Image following the `public/og-image-requirements.md`.
- [ ] Post the launch thread on X/Twitter.
- [ ] Post the "Show HN" on Hacker News.
- [ ] Select 3 programmatic guides to syndicate on Dev.to with canonical links pointing back to FluxPlays.
