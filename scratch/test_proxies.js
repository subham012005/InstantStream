const { ProxyAgent, fetch } = require('undici');

const proxies = [
  "http://79.110.192.44:8081",
  "http://212.127.95.235:8081",
  "http://185.11.134.227:8443",
  "http://138.201.198.53:80",
  "http://45.67.223.123:2001",
  "http://46.249.100.124:80",
  "http://81.200.154.236:48503",
  "http://37.187.74.125:80",
  "http://86.53.163.185:10001",
  "http://212.47.232.28:80",
  "http://34.44.49.215:80",
  "http://34.43.46.91:80",
  "http://104.154.186.48:80",
  "http://198.111.166.184:80",
  "http://5.161.103.41:88",
  "http://172.200.72.48:80",
  "http://142.93.202.130:3128",




  "http://79.110.192.44:8081",
  "http://4.213.167.178:80"
];

async function testProxies() {
  for (const proxy of proxies) {
    console.log(`Testing proxy: ${proxy}...`);
    try {
      const dispatcher = new ProxyAgent(proxy);
      const start = Date.now();

      const response = await fetch("https://uwu.eat-peach.sbs/moviebox/movie/936075", {
        dispatcher,
        headers: {
          Accept: "*/*",
          Origin: "https://peachify.top",
          Referer: "https://peachify.top/",
          "User-Agent": "Mozilla/5.0"
        },
        signal: AbortSignal.timeout(5000)
      });

      const elapsed = Date.now() - start;
      console.log(`Status: ${response.status} in ${elapsed}ms`);
      if (response.ok) {
        console.log(`✅ Proxy ${proxy} is working!`);
      } else {
        console.log(`❌ Proxy ${proxy} returned bad status`);
      }
    } catch (e) {
      console.log(`❌ Proxy ${proxy} failed: ${e.message}`);
    }
  }
}

testProxies();
