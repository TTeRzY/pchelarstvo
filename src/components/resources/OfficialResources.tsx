"use client";

type ResourceLink = {
  icon: string;
  title: string;
  description: string;
  url: string;
  external: boolean;
};

const OFFICIAL_RESOURCES: ResourceLink[] = [
  {
    icon: "📋",
    title: "Регистрация на пчелин",
    description: "Изисквания и процедури",
    url: "https://www.naas.government.bg/vprosi-i-otgovori/publikuvani-otgovori/kakvi-sa-iziskvaniyata-za-registraciyata-na-pchelin-i-kandidatstvane-za-subsidii",
    external: true,
  },
  {
    icon: "🐝",
    title: "Болести по пчелите",
    description: "Информация от БАБХ",
    url: "https://bfsa.egov.bg/wps/portal/bfsa-web/activities/animal.health.and.welfare/animal-health/current.information.on.animal.diseases/bee.diseases",
    external: true,
  },
  {
    icon: "🌱",
    title: "Биологично пчеларство",
    description: "Сертификация и насоки",
    url: "https://sp2023.bg/index.php/bg/intervencii/ii-a-9-biologicno-pcelarstvo",
    external: true,
  },
  {
    icon: "💰",
    title: "Програми и субсидии",
    description: "Финансова подкрепа",
    url: "https://www.dfz.bg/beekeeping/",
    external: true,
  },
  {
    icon: "📖",
    title: "Закон за пчеларството",
    description: "Правна рамка",
    url: "https://www.mzh.government.bg/odz-razgrad/Libraries/%D0%97%D0%B0%D0%BA%D0%BE%D0%BD%D0%B8/ZPch.sflb.ashx",
    external: true,
  },
];

export default function OfficialResources() {
  return (
    <section className="rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>🏛️</span>
          <span>Официални ресурси</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Важни връзки към държавни институции
        </p>
      </div>

      <ul className="space-y-3">
        {OFFICIAL_RESOURCES.map((resource) => (
          <li key={resource.url}>
            <a
              href={resource.url}
              target={resource.external ? "_blank" : undefined}
              rel={resource.external ? "noopener noreferrer" : undefined}
              className="group flex items-start gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <span className="text-xl shrink-0">{resource.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                  {resource.title}
                  {resource.external && (
                    <span className="ml-1 text-gray-400">↗</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {resource.description}
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>

      <div className="pt-3 border-t border-gray-100">
        <a
          href="https://bfsa.egov.bg"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-amber-600 transition-colors flex items-center gap-1"
        >
          <span>Посети портала на БАБХ</span>
          <span>↗</span>
        </a>
      </div>
    </section>
  );
}

