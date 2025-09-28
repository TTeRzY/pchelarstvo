import { NextRequest, NextResponse } from "next/server";

const RESOURCE_PATH = "/api/add-apiary";

const readApiRoot = () =>
  process.env.API_BASE ?? process.env.AUTH_API_BASE ?? process.env.NEXT_PUBLIC_API_BASE ?? "";

async function forward(req: NextRequest) {
  const apiRoot = readApiRoot();
  if (!apiRoot) {
    return NextResponse.json(
      { message: "API base URL is not configured" },
      { status: 500 }
    );
  }

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  if (!headers.has("accept")) {
    headers.set("accept", "application/json");
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  try {
    const upstream = await fetch(`${apiRoot.replace(/\/$/, "")}${RESOURCE_PATH}`, init);
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("transfer-encoding");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Upstream request failed" },
      { status: 502 }
    );
  }
}

type RouteContext = { params: Record<string, never> };

export async function POST(req: NextRequest, _context: RouteContext) {
  return forward(req);
}

export async function OPTIONS(req: NextRequest, _context: RouteContext) {
  return forward(req);
}