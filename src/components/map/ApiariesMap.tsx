"use client";

import dynamic from "next/dynamic";

import type { ApiariesMapProps, Pin } from "./ApiariesMapInner";

const ApiariesMapClient = dynamic<ApiariesMapProps>(
  () => import("./ApiariesMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full rounded-xl bg-gray-100 animate-pulse" aria-hidden="true" />
    ),
  }
);

export type { Pin, ApiariesMapProps };

export default ApiariesMapClient;
