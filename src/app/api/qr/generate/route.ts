import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get("data");
  const format = req.nextUrl.searchParams.get("format") || "svg";
  const size = parseInt(req.nextUrl.searchParams.get("size") || "300");

  if (!data) {
    return NextResponse.json(
      { error: "Missing 'data' parameter" },
      { status: 400 }
    );
  }

  if (format === "svg") {
    const svg = await QRCode.toString(data, {
      type: "svg",
      width: size,
      margin: 2,
    });
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const buffer = await QRCode.toBuffer(data, {
    width: size,
    margin: 2,
  });
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
