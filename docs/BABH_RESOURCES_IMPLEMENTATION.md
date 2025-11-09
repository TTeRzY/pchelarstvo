# БАБХ Resources Integration - Implementation Plan

## 📋 БАБХ Overview

**БАБХ (Българска агенция по безопасност на храните)**  
**English**: Bulgarian Food Safety Agency

Official authority for food safety, veterinary control, and beekeeping regulation in Bulgaria.

---

## 🔗 Key БАБХ Resources for Beekeepers

### **Official Links Found:**

1. **Bee Diseases & Health**
   - URL: `https://bfsa.egov.bg/wps/portal/bfsa-web/activities/animal.health.and.welfare/animal-health/current.information.on.animal.diseases/bee.diseases`
   - Content: Disease monitoring, prevention measures, health bulletins
   - Importance: Critical for disease control

2. **Apiary Registration**
   - URL: `https://www.naas.government.bg/vprosi-i-otgovori/publikuvani-otgovori/kakvi-sa-iziskvaniyata-za-registraciyata-na-pchelin-i-kandidatstvane-za-subsidii`
   - Content: Registration requirements, subsidy applications
   - Importance: Required for legal operation and EU funding

3. **Organic Beekeeping**
   - URL: `https://sp2023.bg/index.php/bg/intervencii/ii-a-9-biologicno-pcelarstvo`
   - Content: Organic certification, requirements, guidelines
   - Importance: For certified organic honey producers

4. **БАБХ Main Portal**
   - URL: `https://bfsa.egov.bg`
   - Content: General information, news, regulations

5. **Subsidies & Programs**
   - URL: `https://www.dfz.bg/beekeeping/`
   - Content: Financial support programs for beekeepers

---

## 🎨 Proposed UI Solution

### **Option A: Sidebar "Полезни ресурси" Section** (Recommended)

Add a new card in the left sidebar (after Forecast and Calendar sections):

```
┌─────────────────────────┐
│ Прогноза и паши         │
│ [Existing section]      │
└─────────────────────────┘

┌─────────────────────────┐
│ Календар на задачите    │
│ [Existing section]      │
└─────────────────────────┘

┌─────────────────────────┐  ← NEW SECTION
│ 🏛️ Официални ресурси   │
│ ───────────────────────  │
│ 📋 БАБХ - Регистрация   │
│ 🐝 Болести по пчелите   │
│ 🌱 Биологично пчеларство│
│ 💰 Програми и субсидии  │
│ 📖 Законодателство      │
└─────────────────────────┘
```

**Pros:**
- ✅ Natural fit with existing sidebar structure
- ✅ Always visible (sticky sidebar)
- ✅ Doesn't clutter main content
- ✅ Consistent with current design

---

### **Option B: Main Content "Quick Links" Banner**

Add a horizontal banner below "Quick Actions":

```
┌────────────────────────────────────────────┐
│        Официални ресурси за пчелари        │
│ ───────────────────────────────────────────│
│  📋 БАБХ   🐝 Болести  🌱 Био   💰 Субсидии│
└────────────────────────────────────────────┘
```

**Pros:**
- ✅ More prominent
- ✅ Wider space for more resources
- ✅ Eye-catching

**Cons:**
- ⚠️ Takes up main content space
- ⚠️ Scrolls away

---

### **Option C: Footer Enhancement**

Already has some legal links in footer, expand that section.

**Pros:**
- ✅ Doesn't affect main page layout

**Cons:**
- ⚠️ Less visible
- ⚠️ Users have to scroll to footer

---

## ✅ **Recommended Approach: Option A (Sidebar)**

**Rationale:**
- Sidebar is already used for quick reference info
- Sticky positioning keeps it always visible
- Matches existing design pattern
- Doesn't crowd the main content
- Mobile: Can be moved below main content

---

## 🛠️ Implementation Details

### **Component Structure:**

```typescript
// New component: src/components/resources/OfficialResources.tsx

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
```

---

### **Integration in Home Page:**

```typescript
// src/app/page.tsx

import OfficialResources from "@/components/resources/OfficialResources";

// In the sidebar section, after Calendar:
<aside className="hidden lg:flex col-span-12 lg:col-span-3 flex-col gap-6 sticky top-6 h-fit">
  {/* Existing Forecast section */}
  <section>...</section>
  
  {/* Existing Calendar section */}
  <section>...</section>
  
  {/* NEW: Official Resources section */}
  <OfficialResources />
</aside>
```

---

### **Mobile Responsiveness:**

On mobile (when sidebar is hidden), add a collapsible section in main content:

```typescript
{/* Mobile: Official Resources */}
<section className="lg:hidden rounded-2xl border border-gray-200 shadow-sm">
  <button
    onClick={() => setShowResources(!showResources)}
    className="w-full p-5 flex items-center justify-between"
  >
    <div className="flex items-center gap-2">
      <span className="text-xl">🏛️</span>
      <h2 className="text-lg font-semibold">Официални ресурси</h2>
    </div>
    <span>{showResources ? '▲' : '▼'}</span>
  </button>
  {showResources && <OfficialResources />}
</section>
```

---

## 🎨 Design Specifications

### **Visual Style:**
- **Border**: `border border-gray-200`
- **Background**: White (`bg-white`)
- **Padding**: `p-5`
- **Border Radius**: `rounded-2xl`
- **Shadow**: `shadow-sm`
- **Hover**: `hover:bg-amber-50` (matching site's amber theme)

### **Icons:**
- 🏛️ - Official institutions
- 📋 - Registration/documents
- 🐝 - Bee health
- 🌱 - Organic/biological
- 💰 - Financial support
- 📖 - Legislation
- ↗ - External link indicator

### **Typography:**
- **Title**: `text-lg font-semibold text-gray-900`
- **Link Title**: `text-sm font-medium`
- **Description**: `text-xs text-gray-500`

---

## 📱 Responsive Behavior

| Screen Size | Behavior |
|-------------|----------|
| **Desktop (lg+)** | Sidebar, always visible (sticky) |
| **Tablet (md-lg)** | Sidebar, scrollable |
| **Mobile (<md)** | Below main content or collapsible |

---

## 🔍 SEO Considerations

### **Structured Data:**
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Официални ресурси за пчелари",
  "description": "Важни връзки към държавни институции за български пчелари",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "БАБХ - Болести по пчелите",
      "url": "https://bfsa.egov.bg/..."
    },
    // ... more items
  ]
}
```

---

## 🌍 i18n Support

### **Translation Keys:**

```json
// src/i18n/messages/bg.json
{
  "home": {
    "officialResources": {
      "title": "Официални ресурси",
      "subtitle": "Важни връзки към държавни институции",
      "visitBabh": "Посети портала на БАБХ",
      "links": {
        "registration": {
          "title": "Регистрация на пчелин",
          "description": "Изисквания и процедури"
        },
        "diseases": {
          "title": "Болести по пчелите",
          "description": "Информация от БАБХ"
        },
        "organic": {
          "title": "Биологично пчеларство",
          "description": "Сертификация и насоки"
        },
        "subsidies": {
          "title": "Програми и субсидии",
          "description": "Финансова подкрепа"
        },
        "legislation": {
          "title": "Закон за пчеларството",
          "description": "Правна рамка"
        }
      }
    }
  }
}

// src/i18n/messages/en.json
{
  "home": {
    "officialResources": {
      "title": "Official Resources",
      "subtitle": "Important links to government institutions",
      "visitBabh": "Visit BFSA portal",
      "links": {
        "registration": {
          "title": "Apiary Registration",
          "description": "Requirements and procedures"
        },
        "diseases": {
          "title": "Bee Diseases",
          "description": "Information from BFSA"
        },
        "organic": {
          "title": "Organic Beekeeping",
          "description": "Certification and guidelines"
        },
        "subsidies": {
          "title": "Programs & Subsidies",
          "description": "Financial support"
        },
        "legislation": {
          "title": "Beekeeping Law",
          "description": "Legal framework"
        }
      }
    }
  }
}
```

---

## 📊 Analytics Tracking

Track external link clicks:

```typescript
const handleResourceClick = (resourceTitle: string, url: string) => {
  // Google Analytics / Matomo tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'official_resource_click', {
      resource_title: resourceTitle,
      resource_url: url,
    });
  }
};
```

---

## ✅ Implementation Checklist

- [ ] Create `src/components/resources/OfficialResources.tsx`
- [ ] Define `OFFICIAL_RESOURCES` array with all links
- [ ] Add i18n translations for Bulgarian and English
- [ ] Integrate component in home page sidebar
- [ ] Add mobile-responsive version
- [ ] Test all external links
- [ ] Verify hover states and transitions
- [ ] Add analytics tracking
- [ ] Test on mobile devices
- [ ] Verify accessibility (keyboard navigation, screen readers)
- [ ] Update documentation

---

## 🎯 Expected Impact

### **User Benefits:**
- ✅ Quick access to official government resources
- ✅ No need to search for БАБХ links
- ✅ All regulatory info in one place
- ✅ Builds trust (official sources)
- ✅ Helps with compliance

### **Website Benefits:**
- ✅ Positions site as authoritative hub
- ✅ Increases time on site
- ✅ Reduces support queries
- ✅ SEO boost (links to government sites)
- ✅ Professional appearance

---

## 🚀 Future Enhancements

1. **Dynamic Content**: Fetch latest bulletins from БАБХ API
2. **Notifications**: Alert users to new regulations
3. **Local Resources**: Add region-specific offices
4. **Document Library**: Store PDF guides locally
5. **Deadline Tracker**: Remind users of registration deadlines

---

## 📝 Notes

- All links verified as of Nov 2025
- БАБХ = Българска агенция по безопасност на храните
- All resources are in Bulgarian (target audience)
- External links open in new tab for better UX
- Maintains site's amber color scheme

---

**Status**: Ready for implementation  
**Estimated Time**: 1-2 hours  
**Priority**: High (important for beekeepers)  
**Complexity**: Low

