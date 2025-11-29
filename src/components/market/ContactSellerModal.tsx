"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import { useModal } from "@/components/modal/ModalProvider";
import { useAuth } from "@/context/AuthProvider";
import { authStorage } from "@/lib/authClient";
import { contactListing } from "@/lib/listings";
import { useTranslations } from "next-intl";

type ContactSellerPayload = {
  listingId: string;
  listingTitle: string;
  sellerName?: string | null;
  sellerEmail?: string | null;
  sellerPhone?: string | null;
};

type FormState = {
  email: string;
  phone: string;
  message: string;
};

const initialState: FormState = {
  email: "",
  phone: "",
  message: "",
};

export default function ContactSellerModal() {
  const { type, payload, close, open } = useModal();
  const contactPayload = (payload ?? null) as ContactSellerPayload | null;
  const { user } = useAuth();
  const t = useTranslations("marketplace.contact");
  const tCommon = useTranslations("common");

  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (type === "contactSeller" && contactPayload) {
      setForm((prev) => ({
        email: user?.email ?? prev.email ?? "",
        phone: "",
        message: "",
      }));
      setSubmitted(false);
      setError(null);
    }
  }, [type, contactPayload, user?.email]);

  if (type !== "contactSeller") {
    return null;
  }

  if (!contactPayload) {
    close();
    return null;
  }

  const sellerName = contactPayload.sellerName || t("unknownSeller");
  const listingTitle = contactPayload.listingTitle;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const message = form.message.trim();
    if (!message) {
      setError(t("validation.messageRequired"));
      return;
    }

    const token = authStorage.getToken();
    if (!token) {
      setError(t("loginRequired"));
      setTimeout(() => {
        close();
        open("login");
      }, 600);
      return;
    }

    setSubmitting(true);

    try {
      // Token is now automatically included by the unified API client
      await contactListing(contactPayload.listingId, {
        message,
        email: form.email.trim() || user?.email || null,
        phone: form.phone.trim() || null,
      });

      setSubmitted(true);
      setForm((prev) => ({ ...prev, message: "" }));
      setTimeout(() => {
        close();
      }, 1200);
    } catch (err: any) {
      // Use error utility to get user-friendly message
      setError(getUserErrorMessage(err, t("error")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={t("title")}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t("title")}</h2>
            <p className="text-sm text-gray-600">
              {t("subtitle", { seller: sellerName })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t("listingLabel", { title: listingTitle })}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-lg px-2 py-1 text-sm hover:bg-gray-100"
            aria-label={t("close")}
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="contact-message">
              {t("messageLabel")}
            </label>
            <textarea
              id="contact-message"
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              rows={5}
              required
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder={t("messagePlaceholder")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="contact-email">
                {t("emailLabel")}
              </label>
              <input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                placeholder={user?.email ?? "name@example.com"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="contact-phone">
                {t("phoneLabel")}
              </label>
              <input
                id="contact-phone"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                placeholder="+359 88 000 0000"
              />
            </div>
          </div>
        </div>

        {contactPayload.sellerEmail || contactPayload.sellerPhone ? (
          <div className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
            <p className="font-medium text-gray-700">{t("sellerContactHeading")}</p>
            {contactPayload.sellerEmail ? (
              <p>{t("sellerEmail", { email: contactPayload.sellerEmail })}</p>
            ) : null}
            {contactPayload.sellerPhone ? (
              <p>{t("sellerPhone", { phone: contactPayload.sellerPhone })}</p>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        {submitted ? (
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {t("success")}
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            disabled={submitting}
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? t("sending") : tCommon("actions.contact")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
