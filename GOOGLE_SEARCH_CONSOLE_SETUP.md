# Google Search Console Setup & Indexing Guide

Google Search Console (GSC) is mandatory to track impressions, indexing status, and rich snippet performance (like our 4.9 Star Rating schema).

## Step 1: Verification
1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property**.
3. Choose **URL Prefix** and enter `https://fluxplays.vercel.app/`.
4. Choose the **HTML Tag** method. 
5. The verification meta tag is already in `src/app/layout.tsx` (`google-site-verification`: `KqdYTJrHIT42Hgxlk50mHAaHCQODltsy-x2AzSsFbuI`).
6. Deploy changes to Vercel.
7. Click **Verify** in GSC.

## Step 2: Sitemap Submission
1. In the GSC dashboard, navigate to **Indexing > Sitemaps**.
2. Enter `sitemap.xml` and click **Submit**.
3. Verify that Google correctly discovers the programmatic routes (Blogs, Guides).

## Step 3: Structured Data Validation
1. Use the [Google Rich Results Test](https://search.google.com/test/rich-results).
2. Enter `https://fluxplays.vercel.app/` and test.
3. You should see valid entities for **WebApplication** and **AggregateRating** (this confirms the review stars are configured correctly).
4. Enter `https://fluxplays.vercel.app/blog/how-to-stream-videos-without-downloading` and confirm **Article** and **BreadcrumbList** schemas are valid.

## Step 4: Indexing Checks
- Perform a direct query in Google Search: `site:fluxplays.vercel.app`.
- If pages are missing, navigate to GSC -> **URL Inspection**, paste the missing URL, and click **Request Indexing**.
- Monitor the **Page Experience** and **Core Web Vitals** tabs bi-weekly to ensure technical regressions don't penalize your SEO.
