"use client";

import { useEffect, useMemo, useState } from "react";
import { createListing } from "@/lib/listings";
import { authStorage } from "@/lib/authClient";
import { useAuth } from "@/context/AuthProvider";
import { getUserErrorMessage } from "@/lib/errorUtils";

type ListingType = "sell" | "buy";
type ProductType =
  | "Акациев мед"
  | "Липов мед"
  | "Манов мед"
  | "Букет"
  | "Слънчогледов мед"
  | "Билков мед"
  | "Лавандула";

type FormState = {
  type: ListingType;
  product: ProductType | "";
  title: string;
  quantityKg: string;
  pricePerKg: string;
  region: string;
  city: string;
  contactName: string;
  phone: string;
  email: string;
  description: string;
};

const initial: FormState = {
  type: "sell",
  product: "",
  title: "",
  quantityKg: "",
  pricePerKg: "",
  region: "",
  city: "",
  contactName: "",
  phone: "",
  email: "",
  description: "",
};

export default function NewListingForm({ onCreated }: { onCreated?: (id: string) => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  // Pre-fill form with user profile data when user is available
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        contactName: user.name || prev.contactName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        region: user.region || prev.region,
        city: user.city || prev.city,
      }));
    }
  }, [user]);

  const canSubmit = useMemo(() => {
    const required = ["product", "title", "quantityKg", "pricePerKg", "region", "contactName", "phone", "email", "description"] as const;
    return required.every((k) => String(form[k]).trim() !== "");
  }, [form]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.product) e.product = "Моля, изберете продукт";
    if (!form.title.trim()) e.title = "Заглавието е задължително";
    const qty = Number(form.quantityKg);
    if (!qty || qty <= 0) e.quantityKg = "Количество (kg) трябва да е > 0";
    const price = Number(form.pricePerKg);
    if (!price || price <= 0) e.pricePerKg = "Цена/kg трябва да е > 0";
    if (!form.region.trim()) e.region = "Регионът е задължителен";
    if (!form.contactName.trim()) e.contactName = "Името за контакт е задължително";
    if (!form.phone.trim()) e.phone = "Телефонът е задължителен";
    if (form.phone && !/^[0-9+()\-.\s]{6,}$/.test(form.phone)) e.phone = "Телефонът е невалиден";
    if (!form.email.trim()) e.email = "Имейлът е задължителен";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Имейлът е невалиден";
    if (!form.description.trim()) e.description = "Описанието е задължително";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const token = authStorage.getToken();
      if (!token) {
        setErrors({ submit: "Изисква се вход в системата (Login)." });
        return;
      }
      // Token is now automatically included by the unified API client
      const created = await createListing({
        type: form.type,
        product: String(form.product),
        title: form.title.trim(),
        quantityKg: Number(form.quantityKg),
        pricePerKg: Number(form.pricePerKg),
        region: form.region.trim(),
        city: form.city.trim() || undefined,
        contactName: form.contactName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        description: form.description.trim(),
      });

      setOkMsg("Обявата е публикувана успешно!");
      // Reset form but preserve user profile data
      const resetForm: FormState = {
        ...initial,
        contactName: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        region: user?.region || "",
        city: user?.city || "",
      };
      setForm(resetForm);
      onCreated?.(created.id);
    } catch (err: any) {
      // Use error utility to get user-friendly message
      setErrors({ submit: getUserErrorMessage(err, "Възникна неочаквана грешка.") });
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!okMsg) return;
    const t = setTimeout(() => setOkMsg(""), 2500);
    return () => clearTimeout(t);
  }, [okMsg]);

  function input<K extends keyof FormState>(k: K) {
    return {
      value: form[k],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((s) => ({ ...s, [k]: e.target.value })),
    };
  }

  const label = "block text-sm font-semibold mb-1";
  const field =
    "h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";
  const fieldArea =
    "w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-4 md:p-6 space-y-4">
      <h2 className="text-lg font-extrabold uppercase">Нова обява</h2>
      
      {user && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <p className="font-medium">ℹ️ Информацията за контакт е попълнена автоматично от вашия профил.</p>
          <p className="text-xs mt-1">Можете да я редактирате, ако е необходимо.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className={label}>Вид</label>
          <select className={field} {...input("type")}>
            <option value="sell">Продавам</option>
            <option value="buy">Купувам</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className={label}>Продукт</label>
          <select className={field} {...input("product")}>
            <option value="">-- Изберете --</option>
            <option>Акациев мед</option>
            <option>Липов мед</option>
            <option>Манов мед</option>
            <option>Букет</option>
            <option>Слънчогледов мед</option>
            <option>Билков мед</option>
            <option>Лавандула</option>
          </select>
          {errors.product && <p className="text-xs text-red-600 mt-1">{errors.product}</p>}
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className={label}>Регион {user?.region && <span className="text-xs text-gray-500">(от профил)</span>}</label>
          <input className={field} placeholder="напр. Пловдив" {...input("region")} />
          {errors.region && <p className="text-xs text-red-600 mt-1">{errors.region}</p>}
        </div>
      </div>

      <div>
        <label className={label}>Заглавие</label>
        <input className={field} placeholder="Продавам акациев мед ~200 кг" {...input("title")} />
        {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className={label}>Количество (kg)</label>
          <input className={field} inputMode="decimal" placeholder="200" {...input("quantityKg")} />
          {errors.quantityKg && <p className="text-xs text-red-600 mt-1">{errors.quantityKg}</p>}
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className={label}>Цена / kg (лв)</label>
          <input className={field} inputMode="decimal" placeholder="8.20" {...input("pricePerKg")} />
          {errors.pricePerKg && <p className="text-xs text-red-600 mt-1">{errors.pricePerKg}</p>}
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className={label}>Населено място {user?.city && <span className="text-xs text-gray-500">(от профил)</span>}</label>
          <input className={field} placeholder="напр. Асеновград" {...input("city")} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className={label}>Контакт име * {user?.name && <span className="text-xs text-gray-500">(от профил)</span>}</label>
          <input className={field} placeholder="Вашето име" {...input("contactName")} />
          {errors.contactName && <p className="text-xs text-red-600 mt-1">{errors.contactName}</p>}
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className={label}>Телефон * {user?.phone && <span className="text-xs text-gray-500">(от профил)</span>}</label>
          <input className={field} placeholder="+359 88 123 4567" {...input("phone")} />
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className={label}>Email * {user?.email && <span className="text-xs text-gray-500">(от профил)</span>}</label>
          <input className={field} placeholder="user@mail.bg" {...input("email")} />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label className={label}>Описание *</label>
        <textarea className={fieldArea} rows={4} placeholder="Опишете продукта подробно..." {...input("description")} />
        {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
      </div>

      {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}
      {okMsg && <p className="text-sm text-green-700">{okMsg}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !canSubmit}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded"
        >
          {saving ? "Публикуване..." : "Публикувай обява"}
        </button>
        <button 
          type="button" 
          onClick={() => {
            // Reset form but preserve user profile data
            const resetForm: FormState = {
              ...initial,
              contactName: user?.name || "",
              email: user?.email || "",
              phone: user?.phone || "",
              region: user?.region || "",
              city: user?.city || "",
            };
            setForm(resetForm);
          }} 
          className="border px-4 py-2 rounded"
        >
          Изчисти
        </button>
      </div>
    </form>
  );
}

