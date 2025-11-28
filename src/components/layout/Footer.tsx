import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-yellow-400 text-black">
      <div className="max-w-[1400px] mx-auto px-6 py-10 flex flex-wrap gap-8 justify-between">
        
        {/* Навигация */}
        <div className="min-w-[200px] flex-1">
          <h4 className="text-lg font-semibold mb-3 text-black">Навигация</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/map" className="hover:underline">Карта на пчелините</Link></li>
            <li><Link href="/marketplace" className="hover:underline">Пчелна борса</Link></li>
            <li><a href="#" className="hover:underline">База знания</a></li>
          </ul>
        </div>

        {/* Правна рамка */}
        <div className="min-w-[200px] flex-1">
          <h4 className="text-lg font-semibold mb-3 text-black">Правна рамка</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://www.mzh.government.bg/odz-razgrad/Libraries/%D0%97%D0%B0%D0%BA%D0%BE%D0%BD%D0%B8/ZPch.sflb.ashx" className="hover:underline">Закон за пчеларството</a></li>
            <li><a href="https://www.dfz.bg/beekeeping/-/asset_publisher/qait/content/intervencii-v-sektora-na-pcelarstvoto-1#" className="hover:underline">Наредби</a></li>
          </ul>
        </div>

        {/* Контакти */}
        <div className="min-w-[200px] flex-1">
          <h4 className="text-lg font-semibold mb-3 text-black">Контакти</h4>
          <p className="text-sm">info@pchelarstvo.bg</p>
          <p className="text-sm">+359 879 122727</p>
        </div>

        {/* За платформата */}
        <div className="min-w-[200px] flex-1">
          <h4 className="text-lg font-semibold mb-3 text-black">За платформата</h4>
          <p className="text-sm text-gray-700 mb-2">
            Pchelarstvo.bg е безплатна общностна платформа за българските пчелари, създадена без комерсиални цели.
          </p>
          <p className="text-xs text-gray-600 italic">
            Платформата е напълно безплатна за общността. Всички услуги са достъпни без такси.
          </p>
        </div>

      </div>

      {/* Copy bar */}
      <div className="border-t border-gray-700 mt-6">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-black">
          <span>© {new Date().getFullYear()} Pchelarstvo.bg</span>
          <nav className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Политика за поверителност</Link>
            <Link href="/terms" className="hover:underline">Условия за използване</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}