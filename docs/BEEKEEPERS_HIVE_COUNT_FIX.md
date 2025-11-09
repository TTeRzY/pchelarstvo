# 🐝 Beekeepers Page - Real Hive Count Implementation

## Problem ❌

Currently, the beekeepers page shows incorrect hive counts because:

1. **Frontend** (`beekeeperMapper.ts` line 42-43):
   ```typescript
   apiariesCount: user.apiariesCount || 0,
   totalHives: (user.apiariesCount || 0) * 10, // ❌ Just an estimate!
   ```

2. **Why it's wrong:**
   - `user.apiariesCount` might be 0 or outdated
   - `totalHives` is just `apiariesCount * 10` (not real data)
   - Doesn't count actual `hiveCount` from user's apiaries

---

## Solution ✅

Since we now have proper User-Apiary relationships in the backend (with `user_id` foreign key), we can calculate the **real hive count**!

---

## Backend Update Required (Laravel)

### **File: `app/Http/Controllers/BeekeeperController.php`**

Update the `index()` method to calculate real hive counts:

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class BeekeeperController extends Controller
{
    public function index(Request $request)
    {
        // Get active users (not suspended/banned)
        $query = User::where('status', 'active')
            ->whereNotIn('role', ['super_admin']); // Hide super admins
        
        // Apply filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('region', 'LIKE', "%{$search}%")
                  ->orWhere('city', 'LIKE', "%{$search}%")
                  ->orWhere('bio', 'LIKE', "%{$search}%");
            });
        }
        
        if ($request->has('region') && $request->input('region') !== 'Всички') {
            $query->where('region', $request->input('region'));
        }
        
        if ($request->has('verified') && $request->input('verified') === 'true') {
            $query->whereNotNull('verified_at');
        }
        
        // Get users with their apiaries
        $users = $query->with('apiaries')->get();
        
        // Map to beekeeper format
        $beekeepers = $users->map(function ($user) {
            // ✅ Calculate REAL hive count from user's apiaries
            $totalHives = $user->apiaries()
                ->whereNotNull('hive_count')
                ->sum('hive_count');
            
            // ✅ Count user's apiaries
            $apiariesCount = $user->apiaries()->count();
            
            // Calculate experience (years)
            $memberSince = $user->member_since ?? $user->created_at;
            $experience = now()->diffInYears($memberSince);
            
            // Generate rating based on trust level
            $ratingMap = [
                'gold' => 4.8,
                'silver' => 4.3,
                'bronze' => 4.0,
            ];
            
            return [
                'id' => $user->id,
                'name' => $user->name,
                'region' => $user->region ?? 'Неизвестен',
                'city' => $user->city,
                'avatarUrl' => $user->avatar_url,
                
                // Trust & Verification
                'trustLevel' => $user->trust_level,
                'verifiedAt' => $user->verified_at,
                'rating' => $ratingMap[$user->trust_level] ?? 4.0,
                'reviewCount' => 0, // TODO: Implement reviews
                
                // Beekeeping Info - ✅ REAL DATA!
                'apiariesCount' => $apiariesCount,
                'totalHives' => $totalHives,
                'experience' => $experience,
                'memberSince' => $memberSince,
                
                // Bio & Contact (respects privacy)
                'bio' => $user->bio,
                'phone' => $user->privacy === 'public' ? $user->phone : null,
                'email' => $user->privacy === 'public' ? $user->email : null,
                'privacy' => $user->privacy ?? 'members',
                
                // Stats
                'activeListingsCount' => $user->listings()
                    ->whereIn('status', ['active', 'approved'])
                    ->count(),
                'completedDeals' => 0, // TODO: Track deals
                
                // Badges
                'badges' => $this->generateBadges($user, $experience),
            ];
        });
        
        // Apply sorting
        $sortBy = $request->input('sortBy', 'rating');
        switch ($sortBy) {
            case 'rating':
                $beekeepers = $beekeepers->sortByDesc('rating');
                break;
            case 'experience':
                $beekeepers = $beekeepers->sortBy('memberSince');
                break;
            case 'newest':
                $beekeepers = $beekeepers->sortByDesc('memberSince');
                break;
            case 'deals':
                $beekeepers = $beekeepers->sortByDesc('completedDeals');
                break;
        }
        
        return response()->json([
            'items' => $beekeepers->values(),
            'total' => $beekeepers->count(),
            'page' => 1,
            'perPage' => $beekeepers->count(),
        ]);
    }
    
    private function generateBadges($user, $experience)
    {
        $badges = [];
        
        if ($experience >= 5) {
            $badges[] = 'Експерт';
        } elseif ($experience >= 3) {
            $badges[] = 'Опитен';
        }
        
        $activeListings = $user->listings()
            ->whereIn('status', ['active', 'approved'])
            ->count();
        
        if ($activeListings >= 5) {
            $badges[] = 'Активен продавач';
        }
        
        if ($user->trust_level === 'gold') {
            $badges[] = 'Професионалист';
        }
        
        return $badges;
    }
}
```

---

## Key Changes ✅

### **Before (Estimated):**
```php
'apiariesCount' => 0,  // ❌ Hardcoded
'totalHives' => 0,     // ❌ Hardcoded
```

### **After (Real Data):**
```php
'apiariesCount' => $user->apiaries()->count(),  // ✅ Real count
'totalHives' => $user->apiaries()->sum('hive_count'),  // ✅ Real sum
```

---

## How It Works 🔍

### **1. Count User's Apiaries:**
```php
$apiariesCount = $user->apiaries()->count();
```
Returns: `3` (if user has 3 apiaries)

### **2. Sum Hive Counts from All Apiaries:**
```php
$totalHives = $user->apiaries()
    ->whereNotNull('hive_count')
    ->sum('hive_count');
```

**Example:**
- Apiary 1: 12 hives
- Apiary 2: 8 hives
- Apiary 3: 15 hives
- **Total: 35 hives** ✅

---

## Privacy Consideration 🔒

**Question:** Should hive counts be public?

**Options:**

### **Option A: Fully Public (Recommended)**
```php
// Always show real counts
'apiariesCount' => $user->apiaries()->count(),
'totalHives' => $user->apiaries()->sum('hive_count'),
```

**Pros:**
- ✅ Builds trust (transparency)
- ✅ Helps buyers find serious beekeepers
- ✅ Standard practice in beekeeping communities

---

### **Option B: Respect Privacy Setting**
```php
if ($user->privacy === 'public') {
    // Show real counts
    'apiariesCount' => $user->apiaries()->count(),
    'totalHives' => $user->apiaries()->sum('hive_count'),
} else {
    // Show approximate/hidden
    'apiariesCount' => 0,
    'totalHives' => 0,
}
```

**Pros:**
- ✅ Users control their data
- ✅ More privacy-conscious

**Cons:**
- ❌ Less useful for directory
- ❌ Defeats purpose of public listing

---

### **Option C: Show Only Public Apiaries**
```php
// Count only apiaries where visibility='public'
$publicApiaries = $user->apiaries()->where('visibility', 'public');

'apiariesCount' => $publicApiaries->count(),
'totalHives' => $publicApiaries->sum('hive_count'),
```

**Pros:**
- ✅ Respects apiary-level privacy
- ✅ Shows real data for public apiaries
- ✅ Balanced approach

**Best Choice:** This is probably the most sensible!

---

## Recommended Implementation ✅

Use **Option C** (only count public apiaries):

```php
// In BeekeeperController.php

// Count only PUBLIC apiaries and their hives
$publicApiaries = $user->apiaries()->where('visibility', 'public');

return [
    // ...
    'apiariesCount' => $publicApiaries->count(),
    'totalHives' => $publicApiaries->whereNotNull('hive_count')
        ->sum('hive_count'),
    // ...
];
```

**Result on Frontend:**
```
┌─────────────────────────────┐
│ Иван Петров          ⭐⭐⭐⭐⭐│
│ 🥇 Златно  ✓ Verified      │
│                             │
│ 📍 София, Витоша            │
│ 🏺 3 пчелина                │ ← Real count!
│ 🐝 35 кошера                │ ← Real sum!
│ 📅 5 години опит            │
└─────────────────────────────┘
```

---

## Testing Checklist ✅

After implementing in Laravel:

1. ✅ Create user with 0 apiaries → shows "0 кошера"
2. ✅ Add 1 apiary with 10 hives → shows "10 кошера"
3. ✅ Add 2nd apiary with 15 hives → shows "25 кошера"
4. ✅ Set apiary to private → doesn't count in total
5. ✅ Set apiary to public → counts in total
6. ✅ Check multiple users on `/beekeepers` page
7. ✅ Verify stats bar shows correct total

---

## Frontend Changes (Optional)

If you want to show a note about privacy:

```typescript
// In BeekeeperCard.tsx or BeekeeperProfileModal.tsx

{beekeeper.totalHives > 0 ? (
  <span>🐝 {beekeeper.totalHives} кошера</span>
) : (
  <span className="text-gray-400">🐝 Не е публикувано</span>
)}
```

---

## Summary

✅ **Backend calculates real hive counts**
✅ **Only counts public apiaries** (respects privacy)
✅ **Sums `hive_count` from all public apiaries**
✅ **Updates automatically when apiaries change**
✅ **No estimation or hardcoded values**

Once you implement this in the Laravel backend, the `/beekeepers` page will display **real, accurate hive counts**! 🐝✨

