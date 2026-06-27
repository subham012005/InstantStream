import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/genre/:id", async (req, res) => {
  try {
    const genreId = req.params.id;

    console.log(`\n========== GENRE ${genreId} ==========\n`);

    const response = await fetch(
      `https://www.netflix.com/in/browse/genre/${genreId}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137.0.0.0 Safari/537.36",
          Accept: "text/html",
        },
      }
    );

    const html = await response.text();

    const graphqlMatch = html.match(
      /netflix\.reactContext\.models\.graphql\s*=\s*JSON\.parse\('([\s\S]*?)'\);/
    );

    if (!graphqlMatch) {
      return res.status(404).json({
        error: "GraphQL data not found",
      });
    }

    const graphqlText = graphqlMatch[1];

    console.log("GraphQL Length:", graphqlText.length);

    // ====================================================
    // STEP 1: Build Movie Map
    // ====================================================

    const movies = {};

    const movieRegex =
      /Movie:\{\\\\?"videoId\\\\?":(\d+)\}":\{"__typename":"Movie".*?"title":"([^"]+)"/g;

    let movieMatch;

    while ((movieMatch = movieRegex.exec(graphqlText)) !== null) {
      const id = movieMatch[1];

      if (!movies[id]) {
        movies[id] = {
          id,
          title: movieMatch[2],
        };
      }
    }

    console.log("Movies Found:", Object.keys(movies).length);

    // ====================================================
    // STEP 2: Extract Posters
    // ====================================================

    const resultsMap = new Map();

    const edgeRegex =
      /__ref":"Movie:\{\\\\"videoId\\\\":(\d+)\}"[\s\S]{0,1200}?"url":"(https:[^"]+)"/g;

    let edgeMatch;

    while ((edgeMatch = edgeRegex.exec(graphqlText)) !== null) {
      const id = edgeMatch[1];
      const poster = edgeMatch[2];

      if (movies[id] && !resultsMap.has(id)) {
        resultsMap.set(id, {
          id,
          title: movies[id].title,
          poster,
          netflixUrl: `https://www.netflix.com/title/${id}`,
        });
      }
    }

    const results = [...resultsMap.values()];


    console.log("Movies Found:", Object.keys(movies).length);
    console.log("Movies With Posters:", results.length);
    console.log(
      "Missing:",
      Object.keys(movies).length - results.length
    );


    console.log("Unique Results Found:", results.length);

    // ====================================================
    // DEBUG OUTPUT
    // ====================================================

    console.log("\n========== SAMPLE RESULTS ==========\n");

    results.slice(0, 5).forEach((movie, index) => {
      console.log(`#${index + 1}`);
      console.log("ID:", movie.id);
      console.log("TITLE:", movie.title);
      console.log("POSTER:", movie.poster);
      console.log("----------------------------");
    });

    // ====================================================
    // RESPONSE
    // ====================================================

    res.json({
      genreId,
      count: results.length,
      results,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

























const PORT = 3000;










app.get("/title/:id", async (req, res) => {
  try {
    const id = req.params.id;

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

    // ====================================================
    // Extract nmTitleGQL block
    // ====================================================

    const nmStart = html.indexOf('"nmTitleGQL"');

    if (nmStart === -1) {
      return res.status(404).json({
        error: "nmTitleGQL block not found",
      });
    }

    const nmBlock = html.substring(
      nmStart,
      nmStart + 50000
    );

    // ====================================================
    // Title
    // ====================================================

    const title =
      nmBlock.match(
        /"copy":\{"title":"([^"]+)"/
      )?.[1]
        ?.replace(/\\x20/g, " ") || null;

    // ====================================================
    // Synopsis
    // ====================================================

    const synopsis =
      nmBlock.match(
        /"synopsis":"([^"]+)"/
      )?.[1]
        ?.replace(/\\x20/g, " ")
        ?.replace(/\\x27/g, "'")
        ?.replace(/\\u2014/g, "—") || null;

    // ====================================================
    // Poster
    // ====================================================

    const poster =
      nmBlock.match(
        /"billboard":\{"small":"([^"]+)"/
      )?.[1]
        ?.replace(/\\x2F/g, "/")
        ?.replace(/\\x3F/g, "?")
        ?.replace(/\\x3D/g, "=") || null;

    // ====================================================
    // Backdrop
    // ====================================================

    const backdrop =
      nmBlock.match(
        /"heroImage":\{"url":"([^"]+)"/
      )?.[1]
        ?.replace(/\\x2F/g, "/")
        ?.replace(/\\x3F/g, "?")
        ?.replace(/\\x3D/g, "=") || null;

    // ====================================================
    // Genres
    // ====================================================

    const genreBlock =
      nmBlock.match(
        /"coreGenre":\{"name":\[(.*?)\]\}/s
      )?.[1] || "";

    const genres = [
      ...genreBlock.matchAll(
        /"name":"([^"]+)"/g
      ),
    ].map((g) =>
      g[1].replace(/\\x20/g, " ")
    );

    // ====================================================
    // Actors
    // ====================================================

    const actorBlock =
      nmBlock.match(
        /"actors":\[(.*?)\],"creators"/s
      )?.[1] || "";

    const actors = [
      ...actorBlock.matchAll(
        /"name":"([^"]+)"/g
      ),
    ].map((a) =>
      a[1].replace(/\\x20/g, " ")
    );

    // ====================================================
    // Directors
    // ====================================================

    const directorBlock =
      nmBlock.match(
        /"directors":\[(.*?)\],"fullCast"/s
      )?.[1] || "";

    const directors = [
      ...directorBlock.matchAll(
        /"name":"([^"]+)"/g
      ),
    ].map((d) =>
      d[1].replace(/\\x20/g, " ")
    );

    // ====================================================
    // Type
    // ====================================================

    const type =
      nmBlock.match(
        /"metaData":\{.*?"type":"([^"]+)"/s
      )?.[1] || null;

    // ====================================================
    // Maturity Rating Value
    // ====================================================

    const maturityValue =
      nmBlock.match(
        /"maturityDetails":\{"value":(\d+)/
      )?.[1] || null;

    // ====================================================
    // Video ID
    // ====================================================

    const videoId =
      nmBlock.match(
        /"videoId":(\d+)/
      )?.[1] || id;

    // ====================================================
    // Response
    // ====================================================

    const result = {
      id: videoId,
      title,
      synopsis,
      poster,
      backdrop,
      genres,
      actors,
      directors,
      maturityValue,
      type,
      netflixUrl: `https://www.netflix.com/title/${videoId}`,
    };

    console.log("\n========== TITLE DATA ==========\n");
    console.log(JSON.stringify(result, null, 2));

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});