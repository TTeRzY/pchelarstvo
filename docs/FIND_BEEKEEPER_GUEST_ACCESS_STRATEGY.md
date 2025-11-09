# 🔒 Find Beekeeper - Guest vs Logged-In User Access Strategy

## Current Status ❌

**Right now, the `/beekeepers` page is completely public with NO restrictions!**

- ❌ No authentication check
- ❌ Anyone can see all beekeeper info
- ❌ Contact details visible to guests
- ❌ No incentive to register

---

## Recommended Strategy ✅

### **Philosophy:**
1. **Show enough to be useful** (discovery)
2. **Hide sensitive info** (privacy)
3. **Encourage registration** (conversion)

---

## 🌍 What GUESTS (Non-Logged-In Users) Should See

### **✅ Visible to Guests:**

#### **1. Basic Profile Info**
- ✅ Name
- ✅ Region & City
- ✅ Avatar/Photo
- ✅ Trust Level (Gold/Silver/Bronze)
- ✅ Verification Status (✓ Verified badge)
- ✅ Star Rating & Review Count

#### **2. Public Statistics**
- ✅ Number of apiaries (only public ones)
- ✅ Total hives (only from public apiaries)
- ✅ Years of experience
- ✅ Completed deals count
- ✅ Active listings count

#### **3. Professional Info**
- ✅ Specializations (if set to public)
- ✅ Products offered (if set to public)
- ✅ Bio (first 2-3 sentences only)
- ✅ Badges (Expert, Professional, etc.)

---

### **❌ Hidden from Guests:**

#### **1. Contact Information**
- ❌ Phone number
- ❌ Email address
- ❌ Social media links

#### **2. Detailed Profile**
- ❌ Full bio (only preview)
- ❌ Private apiaries
- ❌ Exact apiary locations
- ❌ Detailed notes/descriptions

#### **3. Interactive Features**
- ❌ "Свържи се" (Contact) button → Shows login prompt
- ❌ Direct messaging
- ❌ Saving favorites

---

### **🔓 What Shows After Login:**

Once a user logs in, they unlock:
- ✅ Full contact details (phone/email)
- ✅ Full bio
- ✅ "Свържи се" button (working)
- ✅ Direct messaging capability
- ✅ Save to favorites
- ✅ More detailed apiary info

---

## 📱 UI Implementation Examples

### **1. Beekeeper Card (Guest View)**

```
┌─────────────────────────────────┐
│ [Avatar] Иван Петров      ⭐⭐⭐⭐⭐│
│ 🥇 Златно  ✓ Verified          │
│                                 │
│ 📍 София, Витоша                │
│ 🏺 3 пчелина                    │
│ 🐝 35 кошера                    │
│ 📅 5 години опит                │
│                                 │
│ Специализации: Акациев мед...   │
│                                 │
│ [Виж профил] [🔒 Вход за контакт]│
└─────────────────────────────────┘
```

### **2. Profile Modal (Guest View)**

```
┌────────────────────────────────────────┐
│     [Amber Gradient Header]            │
│   [Avatar]         ✓ Верифициран       │
│                                        │
│   Иван Петров                          │
│   🥇 Златно                  ⭐⭐⭐⭐⭐│
│                                        │
│   [3 пчелина] [35 кошера] [5 години]  │
│                                        │
│   За пчелара:                          │
│   "Занимавам се с пчеларство от       │
│   2018 година. Специализирам се в..." │
│   [... 🔒 Влезте, за да видите повече]│
│                                        │
│   Контакти:                            │
│   ┌──────────────────────────────────┐│
│   │ 🔒 Влезте, за да видите контакти ││
│   │                                  ││
│   │ [Вход]  [Регистрация]           ││
│   └──────────────────────────────────┘│
└────────────────────────────────────────┘
```

### **3. Profile Modal (Logged-In User View)**

```
┌────────────────────────────────────────┐
│     [Amber Gradient Header]            │
│   [Avatar]         ✓ Верифициран       │
│                                        │
│   Иван Петров                          │
│   🥇 Златно                  ⭐⭐⭐⭐⭐│
│                                        │
│   [3 пчелина] [35 кошера] [5 години]  │
│                                        │
│   За пчелара:                          │
│   "Занимавам се с пчеларство от       │
│   2018 година. Специализирам се в     │
│   производство на акациев и липов     │
│   мед. Предлагам и пчелни майки..."   │
│   ✅ Full bio visible                  │
│                                        │
│   Контакти:                            │
│   📞 +359 88 123 4567                  │
│   ✉️ ivan.petrov@example.com           │
│                                        │
│   [Свържи се]  [Запази]               │
└────────────────────────────────────────┘
```

---

## 🔧 Implementation Steps

### **Step 1: Update BeekeepersPage Component**

```typescript
// src/app/beekeepers/page.tsx

"use client";

import { useAuth } from '@/context/AuthProvider';
import { useModal } from '@/components/modal/ModalProvider';
// ... other imports

export default function BeekeepersPage() {
  const { user } = useAuth();  // ✅ Add auth check
  const { open: openAuthModal } = useModal();  // ✅ Add modal
  
  // ... existing state

  const handleContactClick = (beekeeper: BeekeeperProfile) => {
    if (!user) {
      // Show login modal
      openAuthModal('login');
      return;
    }
    
    // Show contact info or send message
    // ... existing logic
  };

  const handleViewProfile = (beekeeper: BeekeeperProfile) => {
    setSelectedBeekeeper(beekeeper);
  };

  return (
    <PageShell>
      {/* ... existing filters */}
      
      {/* Beekeepers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBeekeepers.map((bk) => (
          <BeekeeperCard
            key={bk.id}
            beekeeper={bk}
            onViewProfile={() => handleViewProfile(bk)}
            onContact={() => handleContactClick(bk)}
            isGuest={!user}  // ✅ Pass guest status
          />
        ))}
      </div>

      {/* Profile Modal */}
      {selectedBeekeeper && (
        <BeekeeperProfileModal
          beekeeper={selectedBeekeeper}
          onClose={() => setSelectedBeekeeper(null)}
          onContact={() => handleContactClick(selectedBeekeeper)}
          isGuest={!user}  // ✅ Pass guest status
        />
      )}
    </PageShell>
  );
}
```

---

### **Step 2: Update BeekeeperCard Component**

```typescript
// src/components/beekeepers/BeekeeperCard.tsx

type BeekeeperCardProps = {
  beekeeper: BeekeeperProfile;
  onViewProfile: () => void;
  onContact: () => void;
  isGuest?: boolean;  // ✅ Add guest flag
};

export default function BeekeeperCard({ 
  beekeeper, 
  onViewProfile, 
  onContact,
  isGuest = false  // ✅ Default to guest
}: BeekeeperCardProps) {
  // ... existing code

  return (
    <article>
      {/* ... existing profile display */}
      
      {/* Actions */}
      <div className="flex gap-2">
        <button 
          onClick={onViewProfile}
          className="flex-1 rounded-lg bg-white border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Виж профил
        </button>
        <button 
          onClick={onContact}
          className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-amber-400"
        >
          {isGuest ? (
            <>🔒 Вход за контакт</>  // ✅ Different text for guests
          ) : (
            <>Свържи се</>
          )}
        </button>
      </div>
    </article>
  );
}
```

---

### **Step 3: Update BeekeeperProfileModal Component**

```typescript
// src/components/beekeepers/BeekeeperProfileModal.tsx

type BeekeeperProfileModalProps = {
  beekeeper: BeekeeperProfile;
  onClose: () => void;
  onContact: () => void;
  isGuest?: boolean;  // ✅ Add guest flag
};

export default function BeekeeperProfileModal({ 
  beekeeper, 
  onClose, 
  onContact,
  isGuest = false  // ✅ Default to guest
}: BeekeeperProfileModalProps) {
  
  // Truncate bio for guests
  const displayBio = isGuest && beekeeper.bio 
    ? beekeeper.bio.slice(0, 150) + '...'
    : beekeeper.bio;
  
  return (
    <div className="modal">
      {/* ... header, name, stats ... */}
      
      {/* Bio Section */}
      {beekeeper.bio && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">За пчелара</h3>
          <p className="text-gray-700 leading-relaxed">
            {displayBio}
          </p>
          {isGuest && beekeeper.bio.length > 150 && (
            <p className="text-sm text-amber-600 mt-2">
              🔒 Влезте, за да видите пълното описание
            </p>
          )}
        </div>
      )}
      
      {/* Contact Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Контакти</h3>
        
        {isGuest ? (
          // ✅ Guest view - login prompt
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Влезте, за да видите контактите
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Регистрирайте се безплатно, за да свържете се с пчелари
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={onContact}
                className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 font-medium"
              >
                Вход
              </button>
              <button 
                onClick={onContact}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Регистрация
              </button>
            </div>
          </div>
        ) : (
          // ✅ Logged-in view - show contacts
          <div className="space-y-3">
            {beekeeper.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">📞</span>
                <div>
                  <div className="text-xs text-gray-500">Телефон</div>
                  <a 
                    href={`tel:${beekeeper.phone}`}
                    className="text-gray-900 font-medium hover:text-amber-600"
                  >
                    {beekeeper.phone}
                  </a>
                </div>
              </div>
            )}
            
            {beekeeper.email && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">✉️</span>
                <div>
                  <div className="text-xs text-gray-500">Имейл</div>
                  <a 
                    href={`mailto:${beekeeper.email}`}
                    className="text-gray-900 font-medium hover:text-amber-600"
                  >
                    {beekeeper.email}
                  </a>
                </div>
              </div>
            )}
            
            {!beekeeper.phone && !beekeeper.email && (
              <p className="text-sm text-gray-500 text-center py-4">
                Пчеларът не е споделил контактна информация
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isGuest && (
          <>
            <button 
              onClick={onContact}
              className="flex-1 px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 font-medium"
            >
              Изпрати съобщение
            </button>
            <button className="px-4 py-2 bg-white border text-gray-700 rounded-lg hover:bg-gray-50">
              ⭐ Запази
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 🎯 Benefits of This Approach

### **For Users:**
1. ✅ **Discovery** - Can browse and compare beekeepers freely
2. ✅ **Trust** - See ratings, experience, verification before registering
3. ✅ **Privacy** - Contact info hidden until they choose to share

### **For Platform:**
1. ✅ **Conversion** - Clear value proposition for registration
2. ✅ **SEO** - Public pages are indexable by Google
3. ✅ **Growth** - Easy sharing ("Check out this beekeeper!")

### **For Beekeepers:**
1. ✅ **Exposure** - Profile visible to everyone
2. ✅ **Quality Leads** - Only serious people register to contact
3. ✅ **Privacy Control** - Can set profile to private/members-only

---

## 🔐 Privacy Levels (Future Enhancement)

Allow beekeepers to choose their visibility:

### **Level 1: Public (Default)**
- Visible to everyone (guests + logged-in users)
- Contact info hidden from guests

### **Level 2: Members Only**
- Only logged-in users can see profile
- Contact info visible to all members

### **Level 3: Private**
- Not listed in directory
- Only accessible via direct link
- Contact info visible to logged-in users

---

## 📊 Analytics to Track

Monitor these metrics to validate the strategy:

1. **Guest Engagement:**
   - Profiles viewed by guests
   - Contact button clicks (from guests)
   - Login prompts shown

2. **Conversion Rate:**
   - Guest → Registration rate
   - Time from browse → register
   - Beekeepers contacted after registration

3. **User Behavior:**
   - Profiles viewed by logged-in users
   - Contact info reveal rate
   - Messages sent

---

## 🚀 Quick Win Implementation

**Minimum viable changes:**

1. ✅ Add `useAuth()` check in `/beekeepers` page
2. ✅ Pass `isGuest` prop to cards and modal
3. ✅ Show login prompt instead of contact info for guests
4. ✅ Change "Свържи се" to "🔒 Вход за контакт" for guests

**Time estimate:** 30-60 minutes

---

## 🎨 Alternative: Blur Effect

Instead of hiding, you could blur sensitive info:

```tsx
{isGuest ? (
  <div className="relative">
    <div className="filter blur-sm pointer-events-none">
      📞 +359 88 123 4567
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <button 
        onClick={onContact}
        className="px-3 py-1 bg-amber-500 text-sm rounded-lg"
      >
        🔒 Вход за контакт
      </button>
    </div>
  </div>
) : (
  <a href={`tel:${beekeeper.phone}`}>{beekeeper.phone}</a>
)}
```

This creates **curiosity** and **FOMO** (fear of missing out)!

---

## Summary

### **Recommended Guest Access:**
✅ **Show:** Name, region, ratings, stats, bio preview, badges
❌ **Hide:** Phone, email, full bio, private apiaries
🔒 **Gate:** Contact button triggers login modal

### **Benefits:**
- Builds trust before registration
- Protects beekeeper privacy
- Increases registration conversions
- SEO-friendly public pages

### **Implementation:**
1. Add `useAuth()` check
2. Pass `isGuest` to components
3. Conditionally render contact info
4. Show login prompt for guests

**This creates a win-win: Discovery for guests, privacy for beekeepers, conversions for the platform!** 🐝✨

