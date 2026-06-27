const start = Date.now();
fetch("https://uwu.eat-peach.sbs/moviebox/movie/936075", {
  headers: {
    Accept: "*/*",
    Origin: "https://peachify.top",
    Referer: "https://peachify.top/",
    "User-Agent": "Mozilla/5.0"
  }
}).then(res => res.text()).then(() => {
  console.log(`Fetch took ${Date.now() - start}ms`);
}).catch(err => {
  console.log(`Fetch failed after ${Date.now() - start}ms`, err.message);
});
