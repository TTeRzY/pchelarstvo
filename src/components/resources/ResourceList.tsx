"use client";

import type { ResourceCategory } from "@/data/beekeeping-resources";

type ResourceListProps = {
  categories: ResourceCategory[];
};

export default function ResourceList({ categories }: ResourceListProps) {
  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <div key={category.id} className="space-y-4">
          {/* Category Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
            <p className="text-gray-600 mt-1">{category.description}</p>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            {category.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 p-5 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 hover:shadow-md transition-all"
              >
                {/* Icon */}
                <span className="text-4xl shrink-0">{resource.icon}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors text-lg">
                      {resource.title}
                    </h3>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                        {resource.type}
                      </span>
                      <span className="text-gray-400 group-hover:text-amber-600 transition-colors">
                        ↗
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {resource.description}
                  </p>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mt-3">
                    {resource.free && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        Безплатно
                      </span>
                    )}
                    {resource.verified && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <span>✓</span>
                        <span>Проверен</span>
                      </span>
                    )}
                    {resource.language === 'bg' && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                        🇧🇬 Български
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

