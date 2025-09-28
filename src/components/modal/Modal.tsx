// components/modal/Modal.tsx
"use client";
import { useEffect, useRef } from "react";
import { useModal } from "./ModalProvider";

export default function Modal({ children, title }: { children: React.ReactNode; title?: string }) {
  const { close } = useModal();
  const dialogRef = useRef<HTMLDivElement>(null);

  // simple focus
  useEffect(() => {
    const first = dialogRef.current?.querySelector<HTMLElement>("button,[href],input,select,textarea");
    first?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-9999"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Dialog"}
    >
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div ref={dialogRef} className="w-full max-w-md rounded-2xl bg-white shadow-lg outline-none">
          {children}
        </div>
      </div>
    </div>
  );
}