async function test() {
  const FETCH = (url, opts) => fetch(url, { ...opts, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Cookie': 'user_token=1b8771d4552c859e7f6dd08c25b95a7d; SE81313283=81702845; 81702845=474%3A3189; t_hash_p=d4a4a377e8f47ebd03242c8d280aca9%3A%3A8179b9d01f91ea2b6a9ff46c74ffb310%3A%3A1780564205%3A%3Ani%3A%3Ap; recentplay=82698051-SE81313283; cf_clearance=OAeqqdD6ZbT76IGiSSuGEhvwL1FIngTgShxuiyq.Oy8-1780564203-1.2.1.1-LcD0En5lRChlCYoYWX6q_XiQ3cRqSoOlqBMSZ2bEtstEXlnS.9vxMsis1BkSNsg4RB1.akQBtxJuZnhy72x_kMMNCS.okR_JkzGhYkc.wugAdFWIClr.A30yGhbLuAw.fZTerBRBMcDZpSv82WflKO1IySsnAnVeDha0b9ignwHFEKHbz3ueE0NTiZDs4rMa9ufNu_Pq43Xq.sUuTFvGiBtfPpskM7UtUJSmarqrac4sRT9ad57cEdsc7lDnc0KbQuVxZl8cQt.7YmujoInqMVW2aqM_RhvIoSdGnmbRQtEEEFOrL4PPT8JCgjY5fvOhVLO3cWzmjN4Jm2UzMA146oOOq53N_Fd5Grgrv6OBjcV63i5ypNuyhtBUpI6rNmG4rrcUfPpk8Cp_fa.FEkctTo2W8xd2bDJzKn29H0ZMdo8; t_hash=22141276f60a94343e8e567f1367c0ea%3A%3A1780577035%3A%3Ani', ...opts?.headers } });

  const id = '82813816';
  const t = Math.floor(Date.now() / 1000);
  const postRes = await FETCH('https://net11.cc/post.php?id=' + id + '&t=' + t, {
    headers: { 'Referer': 'https://net11.cc/home', 'X-Requested-With': 'XMLHttpRequest' }
  });
  const postData = await postRes.json();
  
  const hashRes = await FETCH('https://net11.cc/play.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest', 'Origin': 'https://net11.cc', 'Referer': 'https://net11.cc/home' },
    body: 'id=' + id
  });
  const hashData = await hashRes.json();
  
  // Notice this uses net52.cc
  const playUrl = 'https://net52.cc/play.php?id=' + id + '&' + hashData.h;
  const playRes = await FETCH(playUrl, { headers: { 'Referer': 'https://net11.cc/home' } });
  const html = await playRes.text();
  
  console.log('--- HTML content snippet ---');
  console.log(html.substring(0, 1000));
  
  const time = html.match(/data-time="([^"]+)"/)?.[1];
  const h = html.match(/data-h="([^"]+)"/)?.[1];
  console.log('Time:', time, 'H:', h);

  if (!time || !h) {
    console.log('Could not get time or h from HTML!');
    return;
  }

  const playlistUrl = 'https://net52.cc/playlist.php?id=' + id + '&t=' + encodeURIComponent(postData.title || '') + '&tm=' + time + '&h=' + encodeURIComponent(h);
  console.log('Playlist URL:', playlistUrl);
  
  const playlistRes = await FETCH(playlistUrl, { headers: { 'Referer': playUrl } });
  const playlistData = await playlistRes.json();
  console.log('Playlist Data:', JSON.stringify(playlistData, null, 2));
}

test().catch(console.error);
