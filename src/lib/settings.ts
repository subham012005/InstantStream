import { ProxyAgent, fetch as undiciFetch } from 'undici';

export interface ProxyStat {
  url: string;
  latency: number;
  status: 'active' | 'dead' | 'testing';
  lastChecked: number;
}

let defaultConfig = {
  proxyList: "http://185.11.134.227:8443\nhttp://86.53.163.185:10001\nhttp://34.43.46.91:80",
  proxyUrl: "http://185.11.134.227:8443",
  showAdFree: true,
  defaultServer: "auto",
  disabledServers: {} as Record<string, boolean>,
  aesKey: "a8f2a1b5e9c470814f6b2c3a5d8e7f9c1a2b3c4d5e3f7a8b8cad1e2d0a4d5c5d"
};

if (!(globalThis as any).proxyStats) {
  (globalThis as any).proxyStats = [] as ProxyStat[];
}

export function getProxyStats(): ProxyStat[] {
  return (globalThis as any).proxyStats || [];
}

export function getAdminConfig() {
  if (!(globalThis as any).adminConfig) {
    (globalThis as any).adminConfig = { ...defaultConfig, disabledServers: { ...defaultConfig.disabledServers } };
  }
  return (globalThis as any).adminConfig;
}

export function updateAdminConfig(newConfig: Partial<typeof defaultConfig>) {
  const conf = getAdminConfig();
  const oldProxyList = conf.proxyList;
  
  Object.assign(conf, newConfig);
  
  if (conf.proxyList !== oldProxyList) {
    testProxiesBackground();
  }
  
  return conf;
}

export function getProxyDispatcher() {
  const activeProxy = getAdminConfig().proxyUrl;
  
  if (!(globalThis as any).proxyDispatcher || (globalThis as any).lastActiveProxy !== activeProxy) {
    if (activeProxy && activeProxy.trim() !== "") {
      (globalThis as any).proxyDispatcher = new ProxyAgent(activeProxy);
    } else {
      (globalThis as any).proxyDispatcher = undefined;
    }
    (globalThis as any).lastActiveProxy = activeProxy;
  }
  
  return (globalThis as any).proxyDispatcher;
}

async function testSingleProxy(url: string): Promise<ProxyStat> {
  const start = Date.now();
  try {
    const dispatcher = new ProxyAgent(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await undiciFetch("https://uwu.eat-peach.sbs/moviebox/movie/936075", {
      dispatcher,
      headers: {
        Accept: "*/*",
        Origin: "https://peachify.top",
        Referer: "https://peachify.top/",
        "User-Agent": "Mozilla/5.0"
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    const latency = Date.now() - start;
    
    if (response.ok) {
      return { url, latency, status: 'active', lastChecked: Date.now() };
    } else {
      console.log(`Proxy test failed for ${url}: status ${response.status}`);
      return { url, latency: 9999, status: 'dead', lastChecked: Date.now() };
    }
  } catch (e: any) {
    console.log(`Proxy test error for ${url}:`, e.message);
    return { url, latency: 9999, status: 'dead', lastChecked: Date.now() };
  }
}

export async function testProxiesBackground() {
  if ((globalThis as any).isTestingProxies) return;
  (globalThis as any).isTestingProxies = true;

  try {
    const config = getAdminConfig();
    const proxyListStr = config.proxyList || "";
    const urls = proxyListStr.split('\n').map((u: string) => u.trim()).filter((u: string) => u !== "");
    
    if (urls.length === 0) {
      config.proxyUrl = "";
      (globalThis as any).proxyStats = [];
      return;
    }

    let stats: ProxyStat[] = urls.map((url: string) => ({
      url,
      latency: 0,
      status: 'testing',
      lastChecked: Date.now()
    }));
    (globalThis as any).proxyStats = [...stats];

    const results = await Promise.all(urls.map((url: string) => testSingleProxy(url)));
    
    const activeProxies = results.filter(r => r.status === 'active').sort((a, b) => a.latency - b.latency);
    
    if (activeProxies.length > 0) {
      config.proxyUrl = activeProxies[0].url;
    } else if (urls.length > 0) {
      // Fallback to first proxy if all tests fail
      config.proxyUrl = urls[0];
    } else {
      config.proxyUrl = "";
    }
    
    (globalThis as any).proxyStats = results;

  } finally {
    (globalThis as any).isTestingProxies = false;
  }
}

if (!(globalThis as any).proxyIntervalStarted) {
  (globalThis as any).proxyIntervalStarted = true;
  setTimeout(() => {
    testProxiesBackground();
  }, 1000);
  setInterval(() => {
    testProxiesBackground();
  }, 5 * 60 * 1000);
}
