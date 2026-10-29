async function getPostDataTest(videoId) {
  const t = Math.floor(Date.now() / 1000);
  const randomHex = (len = 32) => [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
  const getCookie = () => `user_token=1b8ghgfghj771d4s; t_hash_p=${randomHex(32)}%3A%3A058f2af8e0efa33b957d4a931a2bf86c%3A%3A1781760646%3A%3Ani%3A%3Ap;`;
  
  const res = await fetch(`https://net11.cc/post.php?id=${videoId}&t=${t}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Cookie: getCookie(),
      Referer: "https://net11.cc/home",
      "X-Requested-With": "XMLHttpRequest"
    }
  });
  const data = await res.json();
  if(data.suggest) {
    console.log('Has suggest:', data.suggest.length);
    console.log(JSON.stringify(data.suggest.slice(0, 2), null, 2));
  }
}
getPostDataTest('82698051');
