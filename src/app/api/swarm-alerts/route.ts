import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

function backendUrl(path: string) {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_BASE is not configured");
  }
  return `${API_BASE}${path}`;
}

export async function GET() {
  try {
    const res = await fetch(backendUrl("/api/swarm-alerts"), {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Backend error", status: res.status }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Unexpected error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const res = await fetch(backendUrl("/api/swarm-alerts"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text || "Backend error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Unexpected error" }, { status: 500 });
  }
}