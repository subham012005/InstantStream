import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided in request" }, { status: 400 });
    }

    // Prepare payload for tmpfiles.org API
    const uploadData = new FormData();
    uploadData.append("file", file);

    // Call the keyless, high-speed temporary file host
    const response = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: uploadData,
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to upload file to hosting CDN" }, { status: 500 });
    }

    const result = await response.json();
    const viewerUrl = result.data.url; // e.g. "https://tmpfiles.org/158931/screenshot.png"

    // Convert viewer page link into the direct raw download link:
    // https://tmpfiles.org/158931/screenshot.png -> https://tmpfiles.org/dl/158931/screenshot.png
    const directFileUrl = viewerUrl.replace("https://tmpfiles.org/", "https://tmpfiles.org/dl/");

    return NextResponse.json({ url: directFileUrl });
  } catch (error) {
    console.error("Backend Upload Error:", error);
    return NextResponse.json({ error: "Internal server error during file processing" }, { status: 500 });
  }
}
