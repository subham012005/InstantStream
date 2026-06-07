import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const runtime = "nodejs";

function extractNetflixId(url: string | null) {
  const m = String(url || "").match(/netflix\.com\/(?:[a-z]{2}\/)?title\/(\d+)/i);
  return m ? m[1] : null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title")?.trim();
  const country = (searchParams.get("country") || "in").toLowerCase();
  const type = (searchParams.get("type") || "movie").toLowerCase();

  if (!title) {
    return NextResponse.json({ error: "Missing ?title=" }, { status: 400 });
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1366, height: 900 },
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled"
      ]
    });

    const page = await browser.newPage();

    // Optimize by blocking resources we don't need
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const rt = req.resourceType();
      if (rt === "image" || rt === "stylesheet" || rt === "font" || rt === "media") {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "accept-language": "en-US,en;q=0.9"
    });

    const searchUrl = `https://www.justwatch.com/${country}/search?q=${encodeURIComponent(title)}`;

    // Go to search page and wait for links
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    
    // Wait for the container that has search results, instead of sleeping
    await page.waitForSelector("a[href]", { timeout: 10000 }).catch(() => {});

    const justWatchMovieUrl = await page.evaluate((type) => {
      const wantedPath = type === "tv" || type === "series" ? "/tv-show/" : "/movie/";
      const links = Array.from(document.querySelectorAll("a[href]")).map((a: any) => a.href);
      const matched = links.filter(href => href.includes(wantedPath));
      return matched[0] || null;
    }, type);

    if (!justWatchMovieUrl) {
      await browser.close();
      return NextResponse.json({
        found: false,
        reason: "No JustWatch link found for this title.",
        title,
        searchUrl
      });
    }

    // Go to the specific movie/show page on JustWatch
    await page.goto(justWatchMovieUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    
    // Wait for the offers section to load
    await page.waitForSelector("a[href]", { timeout: 10000 }).catch(() => {});

    const netflixOfferUrl = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a[href]")) as HTMLAnchorElement[];
      const found = links.find(a => {
        const text = (
          a.innerText ||
          a.getAttribute("aria-label") ||
          a.getAttribute("title") ||
          ""
        ).toLowerCase();
        const href = a.href.toLowerCase();
        return (
          text.includes("netflix") ||
          href.includes("netflix") ||
          href.includes("provider=8")
        );
      });
      return found ? found.href : null;
    });

    if (!netflixOfferUrl) {
      await browser.close();
      return NextResponse.json({
        found: false,
        reason: "Netflix offer link not found on JustWatch.",
        title,
        justWatchUrl: justWatchMovieUrl
      });
    }

    // Follow the Netflix link which redirects to the actual Netflix URL
    await page.goto(netflixOfferUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    
    // Wait for the URL to change to netflix.com
    try {
      await page.waitForFunction(() => window.location.hostname.includes("netflix"), { timeout: 10000 });
    } catch {
      // It might have loaded already, continue
    }

    const finalUrl = page.url();
    const netflixId = extractNetflixId(finalUrl);

    await browser.close();

    return NextResponse.json({
      found: Boolean(netflixId),
      title,
      type,
      country,
      justWatchUrl: justWatchMovieUrl,
      netflixOfferUrl,
      finalUrl,
      netflixId,
      netflixUrl: netflixId ? `https://www.netflix.com/title/${netflixId}` : null
    });

  } catch (err: any) {
    if (browser) await browser.close();
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
