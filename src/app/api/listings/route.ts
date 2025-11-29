import { NextRequest, NextResponse } from "next/server";

const RESOURCE_PATH = "/api/listings";

const readApiRoot = () =>
  process.env.API_BASE ?? process.env.AUTH_API_BASE ?? process.env.NEXT_PUBLIC_API_BASE ?? "";

const buildTargetUrl = (apiRoot: string, req: NextRequest) => {
  const base = apiRoot.replace(/\/$/, "");
  const target = `${base}${RESOURCE_PATH}`;
  const url = new URL(target);
  if (req.nextUrl.search) {
    url.search = req.nextUrl.search;
  }
  return url;
};

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
    const upstream = await fetch(buildTargetUrl(apiRoot, req), init);
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

export async function GET(req: NextRequest) {
  return forward(req);
}

export async function POST(req: NextRequest) {
  return forward(req);
}

