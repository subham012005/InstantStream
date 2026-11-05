/**
 * TeraBox Integration and URL Normalizer
 * Provides safe validation, normalization, and embed resolution for authorized TeraBox shared files.
 */

export interface TeraBoxInfo {
  isValid: boolean;
  rawUrl: string;
  shareId?: string;
  surl?: string;
  embedUrl?: string;
  directUrl?: string;
  error?: string;
}

export const TERABOX_DOMAINS = [
  'terabox.com',
  'www.terabox.com',
  'terabox.app',
  'www.terabox.app',
  'teraboxapp.com',
  'www.teraboxapp.com',
  '1024tera.com',
  'www.1024tera.com',
  '1024terabox.com',
  'www.1024terabox.com',
  'teraboxshare.com',
  'www.teraboxshare.com',
  'freeterabox.com',
  'www.freeterabox.com',
  '4funbox.com',
  'www.4funbox.com',
  'mirrobox.com',
  'www.mirrobox.com',
  'nephobox.com',
  'www.nephobox.com',
  'teraboxlink.com',
  'www.teraboxlink.com',
  'terasharelink.com',
  'www.terasharelink.com',
  'tibibox.com',
  'www.tibibox.com',
];

/**
 * Checks if a URL belongs to a known TeraBox domain
 */
export function isTeraBoxUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase();
    return TERABOX_DOMAINS.some(d => host === d || host.endsWith('.' + d));
  } catch {
    return false;
  }
}

/**
 * Extracts the share token / surl from various TeraBox URL formats:
 * - https://terabox.com/s/1xxxxxx
 * - https://1024tera.com/s/1xxxxxx
 * - https://teraboxapp.com/sharing/link?surl=xxxxxx
 * - https://www.terabox.com/web/share.html?surl=xxxxxx
 * - https://teraboxapp.com/wap/share/filelist?surl=xxxxxx
 */
export function parseTeraBoxUrl(url: string): TeraBoxInfo {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return { isValid: false, rawUrl: cleanUrl, error: 'Empty TeraBox URL' };
  }

  try {
    const parsed = new URL(cleanUrl);
    const host = parsed.hostname.toLowerCase();

    const isMatch = TERABOX_DOMAINS.some(d => host === d || host.endsWith('.' + d));
    if (!isMatch) {
      return { isValid: false, rawUrl: cleanUrl, error: 'Not a recognized TeraBox domain' };
    }

    let shareId: string | null = null;

    // Check pathname for /s/{id}
    const pathMatch = parsed.pathname.match(/\/s\/([a-zA-Z0-9_-]+)/i);
    if (pathMatch) {
      shareId = pathMatch[1];
    }

    // Check search param ?surl=
    if (!shareId && parsed.searchParams.has('surl')) {
      shareId = parsed.searchParams.get('surl');
    }

    // Check search param ?share_id=
    if (!shareId && parsed.searchParams.has('share_id')) {
      shareId = parsed.searchParams.get('share_id');
    }

    // Check search param ?shorturl=
    if (!shareId && parsed.searchParams.has('shorturl')) {
      shareId = parsed.searchParams.get('shorturl');
    }

    if (!shareId) {
      return {
        isValid: false,
        rawUrl: cleanUrl,
        error: 'Could not extract TeraBox share ID. Ensure you copied the full public share link (e.g. terabox.com/s/1... or with ?surl=...).'
      };
    }

    // Standard surl key for official embed player (standard format has '1' prefix or clean key)
    const surlKey = shareId.startsWith('1') ? shareId.slice(1) : shareId;

    // Use 1024tera.com for resilient global embed (prevents regional ISP blocking of terabox.com)
    const embedUrl = `https://www.1024tera.com/sharing/embed?surl=${encodeURIComponent(surlKey)}`;

    return {
      isValid: true,
      rawUrl: cleanUrl,
      shareId,
      surl: surlKey,
      embedUrl
    };
  } catch (err: any) {
    return {
      isValid: false,
      rawUrl: cleanUrl,
      error: err?.message || 'Invalid URL'
    };
  }
}
