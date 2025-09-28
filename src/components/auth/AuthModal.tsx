// components/auth/AuthModal.tsx
"use client";
import Modal from "@/components/modal/Modal";
import AuthForm from "./AuthForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { useModal } from "@/components/modal/ModalProvider";

const TITLES = {
  login: "Вход",
  register: "Регистрация",
  forgotPassword: "Забравена парола",
} as const;

export default function AuthModal() {
  const { type, close } = useModal();

  if (type !== "login" && type !== "register" && type !== "forgotPassword") {
    return null;
  }

  const title = TITLES[type];
  const isAuthForm = type === "login" || type === "register";

  return (
    <Modal title={title}>
      <div className="flex items-center justify-between px-6 pt-5">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button
          onClick={close}
          className="rounded-lg px-2 py-1 text-sm hover:bg-gray-100"
          aria-label="Затвори"
        >
          ×
        </button>
      </div>
      {isAuthForm ? <AuthForm mode={type} /> : <ForgotPasswordForm />}
    </Modal>
  );
}