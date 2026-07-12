const axios = require('axios');
const fs = require('fs');
const path = require('path');

const FILE_ID = '1f-cB7Ei5Hzl0PIPCvidyItI45zMsTfYU';
const OUT_PATH = path.join(__dirname, '../public/fluxplays.apk');

async function downloadAPK() {
  console.log("Starting APK download from Google Drive...");
  const initialUrl = `https://docs.google.com/uc?export=download&id=${FILE_ID}`;

  try {
    // 1. Get the warning page and cookies
    const response = await axios.get(initialUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const cookies = response.headers['set-cookie'] || [];
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

    // Extract confirmation token (confirm=XXXX) from the HTML
    // Usually it is value="XXXX" under name="confirm"
    const confirmMatch = response.data.match(/name="confirm"\s+value="([^"]+)"/);
    const confirmToken = confirmMatch ? confirmMatch[1] : 't';

    console.log(`Found confirmation token: ${confirmToken}`);
    console.log(`Using cookies: ${cookieHeader}`);

    // 2. Fetch the actual download link using the confirmation token and cookies
    const downloadUrl = `https://drive.usercontent.google.com/download?id=${FILE_ID}&export=download&confirm=${confirmToken}`;

    console.log("Downloading the 113MB APK file (this may take a few seconds)...");
    const downloadRes = await axios.get(downloadUrl, {
      responseType: 'stream',
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const writer = fs.createWriteStream(OUT_PATH);
    downloadRes.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        const stats = fs.statSync(OUT_PATH);
        console.log(`Download finished successfully! File saved to: ${OUT_PATH}`);
        console.log(`File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
        resolve();
      });
      writer.on('error', (err) => {
        console.error("Writer error:", err);
        reject(err);
      });
    });

  } catch (err) {
    console.error("Error downloading file:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
  }
}

downloadAPK();
