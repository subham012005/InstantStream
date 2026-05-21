# OG Image Pipeline — FluxPlays

This document defines the rules and conventions for all Open Graph (OG) images, social-sharing thumbnails, and alt text across the FluxPlays platform.

---

## 1. Default OG Image

| Property | Value |
|---|---|
| **File** | `public/og-image.png` |
| **Dimensions** | 1200 × 630 px |
| **Format** | PNG or WebP (PNG preferred for max compatibility) |
| **Referenced in** | `src/app/layout.tsx` → `openGraph.images[0].url` |

### Design Rules
- Dark background matching the FluxPlays surface color (`#0a0b0f`)
- FluxPlays logotype (white) centered, with tagline below
- A subtle gradient glow (primary color `#0070f3`) behind the logo
- No text smaller than 28px — Twitter crops aggressively on mobile
- Export at 72 DPI — web resolution only

---

## 2. Blog / Article Thumbnails

| Property | Value |
|---|---|
| **Dimensions** | 1200 × 630 px |
| **Naming** | `public/images/blog/[article-slug]-og.png` |
| **Example** | `public/images/blog/best-hls-streaming-tools-og.png` |

### Design Rules
- Top-left: FluxPlays logo mark (small, 48px)
- Centered: Article title (max 2 lines, large bold whitetype)
- Bottom: Article tag badge + "FluxPlays Blog" attribution
- Background: Use a subtle radial gradient unique per category:
  - Technical → `#0070f3` (blue)
  - Reviews → `#9333ea` (purple)
  - Design → `#ec4899` (pink)
  - Trending → `#f59e0b` (amber)
  - Comparison → `#10b981` (green)

---

## 3. Trending / Comparison Page OG Images

- Use a template derived from the article thumbnail template
- Prepend the type label: e.g., "Trending:" or "vs:"
- **Example:** `public/images/trending/netflix-alternatives-og.png`

---

## 4. Alt Text Rules

Every `<Image>` or `<img>` tag must have a descriptive `alt` attribute.

| ❌ Bad | ✅ Good |
|---|---|
| `alt=""` | `alt="FluxPlays video streaming interface on desktop"` |
| `alt="image"` | `alt="HLS vs DASH streaming protocol comparison diagram"` |
| `alt="blog thumbnail"` | `alt="Best React Streaming Apps — FluxPlays blog article thumbnail"` |

- Never leave `alt` empty unless the image is purely decorative (then use `alt=""` intentionally with `role="presentation"`)
- Describe the actual content of the image, not its visual style

---

## 5. Naming Conventions

All image filenames must be:
- **All lowercase** with hyphens between words
- **Descriptive** — include the subject, type, and dimensions if needed
- **No spaces, underscores, or special characters**

```
✅ fluxplays-og-default-1200x630.png
✅ best-hls-streaming-tools-og.png
✅ fluxplays-vs-plex-comparison-og.png
❌ OG Image.PNG
❌ thumbnail_1.jpg
❌ og2.webp
```

---

## 6. Social Sharing Rules

| Platform | Recommended Size | Format | Notes |
|---|---|---|---|
| Twitter/X | 1200 × 628 px | PNG/WebP | Use `summary_large_image` card |
| Facebook / OG | 1200 × 630 px | PNG | Minimum 600×315 |
| LinkedIn | 1200 × 627 px | PNG | Text must stay outside 8% margin |
| Discord | 1200 × 630 px | PNG | Unfurls automatically |
| WhatsApp | 400 × 400 px (square optional) | JPEG | Compressed heavily |

---

## 7. Generating OG Images at Scale

For pages generated at scale (trending, compare, blog), consider using:

- **Vercel OG (`@vercel/og`)** — Generate dynamic OG images via Edge Functions using JSX
- **Satori** — The underlying library; can be used standalone outside Vercel
- **Cloudinary** — URL-based image transformation for dynamic text overlays

### Example route (future implementation)
```
/api/og?title=Best+HLS+Streaming+Tools&tag=Technical
```
This edge route would render a PNG on-the-fly using `@vercel/og`.

---

## 8. Checklist Before Deploying Any New Page

- [ ] OG image exists in `public/images/`
- [ ] Image is correctly referenced in page's `generateMetadata()` or static `metadata`
- [ ] Alt text is set on all `<Image>` components
- [ ] Image filename follows the naming convention
- [ ] Image tested in [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Image tested in [Open Graph debugger](https://developers.facebook.com/tools/debug/)
