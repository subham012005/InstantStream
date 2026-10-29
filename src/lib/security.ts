import dns from 'node:dns/promises';

/**
 * Checks if an IPv4 or IPv6 address is in a private/internal or link-local range.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  if (!ip) return true;
  const cleanIp = ip.trim().toLowerCase();

  // IPv4 local/private/cloud metadata checks
  if (
    cleanIp === 'localhost' ||
    cleanIp === '0.0.0.0' ||
    cleanIp.startsWith('127.') || // Loopback
    cleanIp.startsWith('10.') || // Class A private
    cleanIp.startsWith('192.168.') || // Class C private
    cleanIp.startsWith('169.254.') || // Link-local / Cloud metadata (e.g. AWS 169.254.169.254)
    cleanIp.startsWith('100.64.') || // Shared address space
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleanIp) // Class B private 172.16.0.0 - 172.31.255.255
  ) {
    return true;
  }

  // IPv6 local/private checks
  if (
    cleanIp === '::1' ||
    cleanIp === '::' ||
    cleanIp.startsWith('fc') ||
    cleanIp.startsWith('fd') ||
    cleanIp.startsWith('fe80')
  ) {
    return true;
  }

  return false;
}

/**
 * Validates a target URL against SSRF and illegal schemes.
 * Resolves hostname to ensure it does not point to internal infrastructure.
 */
export async function validateSafeUrl(rawUrl: string): Promise<{ safe: boolean; error?: string; url?: URL }> {
  try {
    const parsed = new URL(rawUrl.trim());

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, error: 'Only HTTP and HTTPS protocols are allowed.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block obvious local names
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === '169.254.169.254'
    ) {
      return { safe: false, error: 'Access to local or private destinations is forbidden.' };
    }

    // Direct IP check
    if (isPrivateOrReservedIp(hostname)) {
      return { safe: false, error: 'Access to private or internal IP addresses is forbidden.' };
    }

    // Perform DNS lookup to resolve the actual IP address
    try {
      const lookupResult = await dns.lookup(hostname, { all: true });
      for (const entry of lookupResult) {
        if (isPrivateOrReservedIp(entry.address)) {
          return { safe: false, error: 'Resolved destination IP is internal and forbidden.' };
        }
      }
    } catch {
      return { safe: false, error: 'Could not resolve hostname via DNS.' };
    }

    return { safe: true, url: parsed };
  } catch (err: any) {
    return { safe: false, error: err?.message || 'Invalid URL' };
  }
}
