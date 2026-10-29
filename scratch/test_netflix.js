async function testNetflix(id) {
    const response = await fetch(
      `https://www.netflix.com/title/${id}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137.0.0.0 Safari/537.36",
          Accept: "text/html",
        },
      }
    );
    const html = await response.text();
    const nmStart = html.indexOf('"nmTitleGQL"');
    if (nmStart !== -1) {
        const block = html.substring(nmStart, nmStart + 100000);
        console.log("moreLikeThis index:", block.indexOf('moreLikeThis'));
        console.log("similars index:", block.indexOf('similars'));
        console.log("related index:", block.indexOf('related'));
        const m = block.match(/"moreLikeThis":\[(.*?)\]/);
        if (m) {
           console.log("Found moreLikeThis");
           console.log(m[0].substring(0, 1000));
        }
    } else {
        console.log("no nmTitleGQL");
    }
}
testNetflix('82698051');
