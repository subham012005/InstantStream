import { NextRequest, NextResponse } from 'next/server';
import { validateSafeUrl } from '@/lib/security';

export const runtime = 'nodejs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Range, Content-Type',
  'Cross-Origin-Resource-Policy': 'cross-origin',
} as const;

const UPSTREAM_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'video/*,*/*;q=0.8',
};

function buildResponseHeaders(upstream: Response): Headers {
  const headers = new Headers({
    ...CORS_HEADERS,
    'Content-Type': upstream.headers.get('content-type') || 'video/mp4',
    'Accept-Ranges': upstream.headers.get('accept-ranges') || 'bytes',
    'Cache-Control': 'public, max-age=3600',
  });

  const contentLength = upstream.headers.get('content-length');
  const contentRange = upstream.headers.get('content-range');
  if (contentLength) headers.set('Content-Length', contentLength);
  if (contentRange) headers.set('Content-Range', contentRange);

  return headers;
}

export async function GET(req: NextRequest) {
  try {
    const videoUrl = req.nextUrl.searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // SSRF Validation
    const safetyCheck = await validateSafeUrl(videoUrl);
    if (!safetyCheck.safe || !safetyCheck.url) {
      return NextResponse.json(
        { error: safetyCheck.error || 'Invalid or forbidden destination URL' },
        { status: 403 }
      );
    }

    const rangeHeader = req.headers.get('range');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(videoUrl, {
      method: 'GET',
      headers: {
        ...UPSTREAM_HEADERS,
        Referer: safetyCheck.url.origin,
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok && response.status !== 206) {
      return NextResponse.json(
        { error: `Failed to fetch video: upstream returned HTTP ${response.status}` },
        { status: response.status }
      );
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: buildResponseHeaders(response),
    });
  } catch (error) {
    console.error('Video proxy error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to proxy video' }, { status: 500 });
  }
}

export async function HEAD(req: NextRequest) {
  try {
    const videoUrl = req.nextUrl.searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    const safetyCheck = await validateSafeUrl(videoUrl);
    if (!safetyCheck.safe || !safetyCheck.url) {
      return NextResponse.json(
        { error: safetyCheck.error || 'Invalid or forbidden destination URL' },
        { status: 403 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(videoUrl, {
      method: 'HEAD',
      headers: {
        ...UPSTREAM_HEADERS,
        Referer: safetyCheck.url.origin,
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    return new NextResponse(null, {
      status: response.status,
      headers: buildResponseHeaders(response),
    });
  } catch (error) {
    console.error('Video proxy HEAD error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to proxy video metadata' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Access-Control-Max-Age': '86400',
    },
  });
}
