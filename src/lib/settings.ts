import { ProxyAgent } from 'undici';

let defaultConfig = {
  proxyUrl: "http://37.49.224.15:3128",
  showAdFree: true,
  defaultServer: "auto",
  disabledServers: {} as Record<string, boolean>
};

export function getAdminConfig() {
  if (!(globalThis as any).adminConfig) {
    (globalThis as any).adminConfig = { ...defaultConfig, disabledServers: { ...defaultConfig.disabledServers } };
  }
  return (globalThis as any).adminConfig;
}

export function updateAdminConfig(newConfig: Partial<typeof defaultConfig>) {
  const conf = getAdminConfig();
  const oldProxy = conf.proxyUrl;
  
  Object.assign(conf, newConfig);
  
  if (conf.proxyUrl && conf.proxyUrl !== oldProxy) {
    (globalThis as any).proxyDispatcher = new ProxyAgent(conf.proxyUrl);
  }
  
  return conf;
}

export function getProxyDispatcher() {
  if (!(globalThis as any).proxyDispatcher) {
    (globalThis as any).proxyDispatcher = new ProxyAgent(getAdminConfig().proxyUrl);
  }
  return (globalThis as any).proxyDispatcher;
}
