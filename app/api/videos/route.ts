import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "public", "videos");
  try {
    const files = fs.readdirSync(dir).filter((f) =>
      /\.(mp4|webm|mov)$/i.test(f)
    );
    const urls = files.map((f) => `/videos/${f}`);
    return NextResponse.json(urls);
  } catch {
    return NextResponse.json([]);
  }
}
