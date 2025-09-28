import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ slug?: string[] }> };

const API_ROOT = process.env.AUTH_API_BASE ?? process.env.NEXT_PUBLIC_API_BASE;

if (!API_ROOT) {
  console.warn("AUTH_API_BASE (or NEXT_PUBLIC_API_BASE) is not configured for auth proxy");
}

function buildTargetUrl(slug: string[], req: NextRequest) {
  const base = (API_ROOT ?? "").replace(/\/$/, "");
  const path = slug.length ? slug.join("/") : "";
  const url = new URL(`${base}/api/auth/${path}`);
  if (req.nextUrl.search) {
    url.search = req.nextUrl.search;
  }
  return url;
}

async function forward(req: NextRequest, slug: string[]) {
  if (!API_ROOT) {
    return NextResponse.json({ message: "Auth API base URL is not configured" }, { status: 500 });
  }

  const targetUrl = buildTargetUrl(slug, req);
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.set("accept", headers.get("accept") ?? "application/json");

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const upstream = await fetch(targetUrl, init);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("transfer-encoding");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

async function resolveSlug(ctx: RouteContext) {
  const { slug = [] } = await ctx.params;
  return slug;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  return forward(req, await resolveSlug(ctx));
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  return forward(req, await resolveSlug(ctx));
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  return forward(req, await resolveSlug(ctx));
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return forward(req, await resolveSlug(ctx));
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return forward(req, await resolveSlug(ctx));
}

export async function OPTIONS(req: NextRequest, ctx: RouteContext) {
  return forward(req, await resolveSlug(ctx));
}