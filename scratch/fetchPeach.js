const fetch = require('undici').fetch;
async function main() {
  const text = await fetch('https://peachify.top/').then(r => r.text());
  const jsFiles = [...text.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]);
  console.log("JS Files:", jsFiles);
  for (const js of jsFiles) {
    const url = js.startsWith('http') ? js : `https://peachify.top${js.startsWith('/') ? '' : '/'}${js}`;
    const code = await fetch(url).then(r => r.text());
    if (code.includes('a8f2') || code.includes('aes') || code.includes('createDecipher')) {
      console.log(`Found AES related code in ${url}`);
      // Find 64 char hex strings
      const hexStrings = code.match(/[a-f0-9]{64}/gi);
      if (hexStrings) {
        console.log(`Potential keys in ${url}:`, Array.from(new Set(hexStrings)));
      }
    }
  }
}
main();
