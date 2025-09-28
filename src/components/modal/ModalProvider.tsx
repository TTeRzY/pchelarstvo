// components/modal/ModalProvider.tsx
"use client";
import { createContext, useContext, useCallback, useState, useEffect } from "react";

type ModalType = "login" | "register" | "forgotPassword" | "reportSwarm" | "contactSeller" | null;
type ModalCtx = {
  open: (type: Exclude<ModalType, null>, payload?: unknown) => void;
  close: () => void;
  type: ModalType;
  payload: unknown;
};

const Ctx = createContext<ModalCtx | null>(null);

export default function ModalProvider({ children }: { children: React.ReactNode }) {
  const [type, setType] = useState<ModalType>(null);
  const [payload, setPayload] = useState<unknown>(null);

  const open = useCallback((t: Exclude<ModalType, null>, data?: unknown) => {
    setType(t);
    setPayload(data ?? null);
  }, []);

  const close = useCallback(() => {
    setType(null);
    setPayload(null);
  }, []);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return <Ctx.Provider value={{ open, close, type, payload }}>{children}</Ctx.Provider>;
}

export function useModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useModal must be used within <ModalProvider>");
  return ctx;
}
