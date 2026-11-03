import dns from "node:dns";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Force IPv4 lookup first to prevent IPv6 TLS handshake timeouts on Windows/certain ISPs
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore if not supported in environment
}

function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

function getMetaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*?)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']*?)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+name=["']${property}["']`, "i"),
  ];
  for (const rx of patterns) {
    const m = html.match(rx);
    if (m?.[1]) return decodeHtmlEntities(m[1]);
  }
  return null;
}

export function parseTelegramPostHtml(html: string) {
  // 1. Direct <video src="..."> in widget
  const videoMatch = html.match(/<video[^>]*src="([^"]+)"/i);
  let videoUrl = videoMatch ? decodeHtmlEntities(videoMatch[1]) : null;

  // Fallback to og:video
  if (!videoUrl) {
    videoUrl = getMetaContent(html, "og:video:secure_url") || getMetaContent(html, "og:video");
  }

  // 2. Poster / Thumbnail
  let thumbnail: string | null = null;
  const thumbMatch = html.match(
    /class=["'][^"']*tgme_widget_message_video_thumb[^"']*["'][^>]*style=["'][^"']*url\(['"]?([^'"\)]+)['"]?\)/i
  );
  if (thumbMatch) {
    thumbnail = decodeHtmlEntities(thumbMatch[1]);
  } else {
    thumbnail = getMetaContent(html, "og:image") || getMetaContent(html, "twitter:image");
  }

  // 3. Caption: preserve emojis, text, and newlines
  let caption: string | null = null;
  const textMatch = html.match(
    /<div[^>]*class=["'][^"']*js-message_text[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
  );
  if (textMatch) {
    const rawInner = textMatch[1]
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "");
    caption = decodeHtmlEntities(rawInner).trim();
  } else {
    const ogDesc = getMetaContent(html, "og:description") || getMetaContent(html, "description");
    if (ogDesc) caption = ogDesc.trim();
  }

  // 4. Dimensions
  let width: number | null = null;
  let height: number | null = null;
  const wrapMatch = html.match(
    /<div[^>]*class=["'][^"']*tgme_widget_message_video_wrap[^"']*["'][^>]*style=["']([^"']+)["']/i
  );
  if (wrapMatch) {
    const w = wrapMatch[1].match(/width:\s*(\d+)px/i);
    const pt = wrapMatch[1].match(/padding-top:\s*([\d\.]+)%/i);
    if (w) {
      width = parseInt(w[1], 10);
      if (pt) {
        height = Math.round((width * parseFloat(pt[1])) / 100);
      }
    }
  }

  if (!width) {
    const wMeta = getMetaContent(html, "og:video:width");
    if (wMeta) width = parseInt(wMeta, 10);
  }
  if (!height) {
    const hMeta = getMetaContent(html, "og:video:height");
    if (hMeta) height = parseInt(hMeta, 10);
  }

  const title = getMetaContent(html, "og:title") || getMetaContent(html, "og:site_name");

  return {
    videoUrl,
    thumbnail,
    caption: caption || null,
    title: title || null,
    width: width || null,
    height: height || null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const host = parsedUrl.hostname.toLowerCase();
    if (host !== "t.me" && host !== "telegram.me" && host !== "telegram.dog") {
      return NextResponse.json({ error: "Not a Telegram post URL" }, { status: 400 });
    }

    // Ensure it's a post link: /channelname/msgId or /channelname/topicId/msgId or /s/channel/msgId
    const parts = parsedUrl.pathname.replace(/^\//, "").split("/").filter(Boolean);
    if (parts.length < 2) {
      return NextResponse.json(
        { error: "Invalid Telegram post link. Expected format: t.me/channel/123" },
        { status: 400 }
      );
    }

    let channel = parts[0];
    let msgId = parts[1];

    if (channel === "s" && parts.length >= 3) {
      channel = parts[1];
      msgId = parts[2];
    } else if (parts.length >= 3 && /^\d+$/.test(parts[2])) {
      msgId = parts[2];
    }

    if (!/^\d+$/.test(msgId)) {
      return NextResponse.json(
        { error: "Invalid Telegram post link. Could not determine post ID." },
        { status: 400 }
      );
    }

    if (["joinchat", "addstickers"].includes(channel) || channel.startsWith("+")) {
      return NextResponse.json(
        { error: "Invite links and private channels cannot be extracted. Please provide a public post link." },
        { status: 400 }
      );
    }

    const fetchHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    };

    // Primary attempt: Fetch the official embed widget (contains direct video CDN tag & post text)
    const embedUrl = `https://t.me/${channel}/${msgId}?embed=1&mode=tme`;
    let html = "";

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(embedUrl, {
        headers: fetchHeaders,
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);
      if (res.ok) {
        html = await res.text();
      }
    } catch (err: any) {
      console.warn("Embed fetch error:", err?.message || err);
    }

    // Secondary attempt: Fallback to main page if embed had no HTML
    if (!html) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const res = await fetch(`https://t.me/${channel}/${msgId}`, {
          headers: fetchHeaders,
          signal: controller.signal,
          redirect: "follow",
        });
        clearTimeout(timeout);
        if (res.ok) {
          html = await res.text();
        }
      } catch (err: any) {
        console.warn("Main page fetch error:", err?.message || err);
      }
    }

    if (!html) {
      return NextResponse.json(
        { error: "Failed to connect to Telegram. The post may be private or unreachable." },
        { status: 502 }
      );
    }

    const parsed = parseTelegramPostHtml(html);

    if (!parsed.videoUrl) {
      return NextResponse.json(
        {
          error:
            "No video found in this Telegram post. The post might contain only text, an image, or be restricted.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      videoUrl: parsed.videoUrl,
      width: parsed.width,
      height: parsed.height,
      caption: parsed.caption,
      title: parsed.title || `@${channel} — Post #${msgId}`,
      thumbnail: parsed.thumbnail,
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return NextResponse.json({ error: "Request timed out while connecting to Telegram." }, { status: 408 });
    }
    return NextResponse.json(
      { error: err?.message || "Failed to extract video from Telegram post." },
      { status: 500 }
    );
  }
}
