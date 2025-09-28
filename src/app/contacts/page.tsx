"use client";

import PageShell from "@/components/layout/PageShell";
import ApiariesMapClient from "@/components/map/ApiariesMap";

export default function ContactPage() {
  const SHOW_MAP = true;

  return (
    <PageShell>
      <section className="bg-white rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row">
          {/* LEFT: Basic info */}
          <div className="flex-1 p-8 flex flex-col gap-10">
            <header>
              <h1 className="text-3xl font-bold">Контакти</h1>
              <p className="text-gray-600 mt-2 max-w-prose">
                Имаш идея, въпрос или обратна връзка? Пиши ми или се обади.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <a
                  href="mailto:info@pchelarstvo.bg"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400"
                >
                  Имейл
                </a>
                <a
                  href="tel:+359881112222"
                  className="rounded-xl bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Телефон
                </a>
              </div>
            </header>

            <div className="space-y-6 text-sm">
              <div>
                <div className="text-gray-500">Имейл</div>
                <div className="font-medium">info@pchelarstvo.bg</div>
              </div>
              <div>
                <div className="text-gray-500">Телефон</div>
                <div className="font-medium">+359 88 111 2222</div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold">Полезни връзки</h2>
              <ul className="mt-3 text-sm space-y-2 text-gray-700">
                <li>
                  <a className="hover:underline" href="/marketplace/new">
                    Подай обява
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="/map">
                    Добави пчелин на картата
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href="/news">
                    Последни новини
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT: Optional map */}
          {SHOW_MAP && (
            <div className="flex-1 p-8 bg-gray-50">
              <h2 className="text-lg font-semibold mb-4">Локация (пример)</h2>
              <div className="h-64 w-full rounded-xl overflow-hidden">
                <ApiariesMapClient
                  items={[
                    {
                      id: "demo",
                      name: "Pchelarstvo.bg",
                      lat: 42.6977,
                      lng: 23.3219,
                      region: "Онлайн",
                      type: "Хоби",
                      status: "Активен",
                      colonies: 0,
                    },
                  ]}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Онлайн проект — без физически офис. Картата е демонстративна.
              </p>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}