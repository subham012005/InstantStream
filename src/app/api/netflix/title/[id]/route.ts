import { NextResponse } from 'next/server';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

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
      return NextResponse.json({ error: "nmTitleGQL block not found" }, { status: 404 });
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

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
