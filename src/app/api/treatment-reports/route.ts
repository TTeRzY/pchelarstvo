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
    const res = await fetch(backendUrl("/api/treatment-reports"), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Backend error" }));
      return NextResponse.json(errorData, { status: res.status });
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
    const res = await fetch(backendUrl("/api/treatment-reports"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      // Handle Laravel validation errors (422) or other errors
      const errorData = await res.json().catch(() => ({ error: "Backend error" }));
      
      // Laravel validation errors have 'message' and 'errors' fields
      if (res.status === 422 && errorData.errors) {
        // Return Laravel validation error format
        return NextResponse.json(errorData, { status: 422 });
      }
      
      // Other errors
      return NextResponse.json(
        { error: errorData.message || errorData.error || "Backend error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Unexpected error" }, { status: 500 });
  }
}

