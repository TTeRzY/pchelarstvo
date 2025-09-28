export default function Footer() {
  return (
    <footer className="bg-yellow-400 text-black">
      <div className="max-w-[1400px] mx-auto px-6 py-10 flex flex-wrap gap-8 justify-between">
        
        {/* Навигация */}
        <div className="min-w-[200px] flex-1">
          <h4 className="text-lg font-semibold mb-3 text-black">Навигация</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/map" className="hover:underline">Карта на пчелините</a></li>
            <li><a href="/marketplace" className="hover:underline">Пчелна борса</a></li>
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
          <p className="text-sm">+359 88 123 4567</p>
        </div>

        {/* Бюлетин */}
        <div className="min-w-[250px] flex-1">
          <h4 className="text-lg font-semibold mb-3 text-black">Бюлетин</h4>
          <p className="text-sm mb-3">Абонирай се за новини и съвети</p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Имейл адрес"
              className="flex-1 rounded-xl border border-gray-600 bg-white px-3 py-2 text-sm placeholder-gray-400 text-gray-200 focus:outline-none focus:ring focus:ring-yellow-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-green-400 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-400"
            >
              Запиши ме
            </button>
          </form>
        </div>
      </div>

      {/* Copy bar */}
      <div className="border-t border-gray-700 mt-6">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-black">
          <span>© {new Date().getFullYear()} Pchelarstvo.bg</span>
          <nav className="flex gap-4">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}