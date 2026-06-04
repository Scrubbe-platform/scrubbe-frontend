// app/api/status/route.ts  (or pages/api/status.ts)

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://status.scrubbe.com/api/v1/operations/status",
      {
        // Always fetch fresh — don't let Next.js cache this
        cache: "no-store",
        headers: { "Accept": "application/json" },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        // Allow the browser to call this route
        "Access-Control-Allow-Origin": "*",
        // Cache for 25s so rapid page loads don't hammer the upstream
        "Cache-Control": "public, max-age=25, stale-while-revalidate=5",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach status endpoint" },
      { status: 502 }
    );
  }
}