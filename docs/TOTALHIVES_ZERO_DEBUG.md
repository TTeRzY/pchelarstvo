# 🐛 Debug: "0 кошера" Issue on Beekeepers Page

## Problem

The beekeepers cards are showing `🏺 0 кошера` instead of the real hive count.

---

## 🔍 Data Flow Trace

### **1. Component Display** (`src/components/beekeepers/BeekeeperCard.tsx` line 83)

```tsx
<span>{beekeeper.totalHives} кошера</span>
```

Gets value from `beekeeper.totalHives` property.

---

### **2. Type Definition** (`src/types/beekeeper.ts` line 29)

```typescript
export type BeekeeperProfile = {
  // ...
  totalHives: number;  // ← Expects this from API
}
```

---

### **3. API Client** (`src/lib/beekeeperClient.ts`)

```typescript
export async function fetchBeekeepers(params) {
  const response = await fetch('/api/beekeepers');
  return response.json();
}
```

Calls Next.js API route.

---

### **4. Next.js API Route** (`src/app/api/beekeepers/route.ts`)

```typescript
// ✅ Now proxies to Laravel (we just updated this!)
const response = await fetch(`${apiBase}/api/beekeepers${queryString}`);
const data = await response.json();
return NextResponse.json(data);
```

Proxies directly to Laravel backend.

---

### **5. Laravel Backend** (`app/Http/Controllers/BeekeeperController.php`)

**This is where the problem is!** ⚠️

The Laravel backend is either:
1. ❌ Not implemented yet
2. ❌ Not returning `totalHives` field
3. ❌ Not calculating it correctly
4. ❌ Returning 0 or null

---

## 🔧 Root Cause

**The Laravel backend needs to calculate and return `totalHives`!**

Currently, the backend might be returning something like:

```json
{
  "items": [
    {
      "id": 1,
      "name": "Иван Иванов",
      "apiariesCount": 1,
      // ❌ Missing totalHives!
      // OR
      "totalHives": 0,  // ❌ Not calculated!
    }
  ]
}
```

---

## ✅ Required Laravel Implementation

### **File: `app/Http/Controllers/BeekeeperController.php`**

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class BeekeeperController extends Controller
{
    public function index(Request $request)
    {
        // Get active users
        $query = User::where('status', 'active')
            ->whereNotIn('role', ['super_admin']);
        
        // ✅ CRITICAL: Eager load apiaries for efficiency
        $users = $query->with(['apiaries' => function($query) {
            $query->where('visibility', 'public');
        }])->get();
        
        $beekeepers = $users->map(function ($user) {
            // ✅ Calculate from loaded relationship
            $publicApiaries = $user->apiaries;  // Already filtered to public
            
            $apiariesCount = $publicApiaries->count();
            
            // ✅ THIS IS THE KEY: Sum hive_count from all public apiaries
            $totalHives = $publicApiaries->sum('hive_count');
            
            // If hive_count is null, it won't be counted
            // Make sure apiaries have hive_count set in database!
            
            return [
                'id' => $user->id,
                'name' => $user->name,
                'region' => $user->region ?? 'Неизвестен',
                'city' => $user->city,
                'avatarUrl' => $user->avatar_url,
                
                // Trust & Verification
                'trustLevel' => $user->trust_level,
                'verifiedAt' => $user->verified_at,
                'rating' => $this->calculateRating($user),
                'reviewCount' => 0, // TODO: Implement reviews
                
                // ✅ Beekeeping Info - REAL DATA
                'apiariesCount' => $apiariesCount,
                'totalHives' => $totalHives,  // ← THIS MUST BE RETURNED!
                
                'experience' => $this->calculateExperience($user),
                'memberSince' => $user->member_since ?? $user->created_at,
                
                // Bio & Contact
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
                'badges' => $this->generateBadges($user),
            ];
        });
        
        // Apply sorting
        $sortBy = $request->input('sortBy', 'rating');
        $beekeepers = $this->sortBeekeepers($beekeepers, $sortBy);
        
        return response()->json([
            'items' => $beekeepers->values(),
            'total' => $beekeepers->count(),
        ]);
    }
    
    private function calculateRating($user)
    {
        $ratingMap = [
            'gold' => 4.8,
            'silver' => 4.3,
            'bronze' => 4.0,
        ];
        
        return $ratingMap[$user->trust_level] ?? 4.0;
    }
    
    private function calculateExperience($user)
    {
        $memberSince = $user->member_since ?? $user->created_at;
        $years = now()->diffInYears($memberSince);
        
        if ($years >= 5) return 'expert';
        if ($years >= 2) return 'intermediate';
        return 'beginner';
    }
    
    private function generateBadges($user)
    {
        $badges = [];
        
        $memberSince = $user->member_since ?? $user->created_at;
        $years = now()->diffInYears($memberSince);
        
        if ($years >= 5) {
            $badges[] = 'Експерт';
        } elseif ($years >= 3) {
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
    
    private function sortBeekeepers($beekeepers, $sortBy)
    {
        switch ($sortBy) {
            case 'rating':
                return $beekeepers->sortByDesc('rating');
            case 'experience':
                return $beekeepers->sortBy('memberSince');
            case 'newest':
                return $beekeepers->sortByDesc('memberSince');
            case 'deals':
                return $beekeepers->sortByDesc('completedDeals');
            default:
                return $beekeepers->sortByDesc('rating');
        }
    }
}
```

---

## 🔍 Debugging Steps

### **Step 1: Check Laravel Response**

Open browser DevTools (F12) → Network tab:

1. Go to `/beekeepers` page
2. Look for `beekeepers?...` request
3. Click it and check the Response tab

**Look for:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Иван Иванов",
      "totalHives": ???  // ← What is this value?
    }
  ]
}
```

**Possible Issues:**
- ❌ `totalHives` field is missing
- ❌ `totalHives: 0` (not calculated)
- ❌ `totalHives: null` (apiaries have no hive_count)

---

### **Step 2: Check Database**

```sql
-- Check if apiaries have hive_count
SELECT id, name, user_id, hive_count 
FROM apiaries 
WHERE user_id = (SELECT id FROM users WHERE name = 'Иван Иванов');

-- Expected:
-- id | name      | user_id | hive_count
-- 3  | Apiary 1  | 5       | 32

-- If hive_count is NULL, totalHives will be 0!
```

---

### **Step 3: Check Laravel Logs**

```bash
# In Laravel project
tail -f storage/logs/laravel.log

# Look for errors in BeekeeperController
# Check if the controller is even being called
```

---

### **Step 4: Test Laravel Endpoint Directly**

```bash
# Direct API call to Laravel
curl http://localhost:8000/api/beekeepers

# Check response:
# Does it have totalHives?
# Is it 0 or 32?
```

---

## 🎯 Most Likely Issues

### **Issue 1: Controller Not Implemented**

**Symptom:** Laravel returns 404 or empty data

**Fix:** Implement `BeekeeperController.php` with the code above

---

### **Issue 2: `hive_count` Column is NULL in Database**

**Symptom:** `totalHives: 0` even though apiary exists

**Check:**
```sql
SELECT hive_count FROM apiaries WHERE user_id = 5;
-- If NULL → totalHives will be 0
```

**Fix:**
```sql
-- Update the apiary with hive count
UPDATE apiaries 
SET hive_count = 32 
WHERE id = 3 AND user_id = 5;
```

---

### **Issue 3: Wrong Column Name**

**Symptom:** `totalHives: 0`

**Check:**
```php
// Make sure you're using the right column name
$totalHives = $publicApiaries->sum('hive_count');  // ✅ Correct

// NOT:
$totalHives = $publicApiaries->sum('hives');       // ❌ Wrong column
$totalHives = $publicApiaries->sum('hiveCount');   // ❌ Wrong column
```

**Database column should be:** `hive_count` (snake_case)

---

### **Issue 4: Visibility Filter**

**Symptom:** User has apiaries but `totalHives: 0`

**Cause:** All apiaries are set to `visibility: 'unlisted'`

**Check:**
```sql
SELECT id, name, visibility, hive_count 
FROM apiaries 
WHERE user_id = 5;

-- If all are 'unlisted' → won't be counted in public profile
```

**Fix:** Either:
- Set apiaries to `visibility: 'public'`
- OR change backend to count all apiaries (not just public)

---

## 📊 Expected Database State for "Иван Иванов"

```sql
-- Users table
id | name         | status | role
5  | Иван Иванов  | active | user

-- Apiaries table
id | name      | user_id | visibility | hive_count
3  | Apiary 1  | 5       | public     | 32

-- Result:
apiariesCount: 1
totalHives: 32  ✅
```

---

## 🚀 Quick Debug Commands

### **1. Check Next.js Console**

When you visit `/beekeepers`, look for:

```
[Beekeepers API] Proxying to Laravel: http://localhost:8000/api/beekeepers
[Beekeepers API] Success! Received 15 beekeepers
```

### **2. Check Browser DevTools**

Network tab → `/api/beekeepers` → Response:

```json
{
  "items": [
    {
      "name": "Иван Иванов",
      "totalHives": 0  // ← Debug this!
    }
  ]
}
```

### **3. Check Laravel Response Directly**

```bash
curl http://localhost:8000/api/beekeepers | jq '.items[] | {name, totalHives}'
```

**Expected:**
```json
{
  "name": "Иван Иванов",
  "totalHives": 32
}
```

**If you see `"totalHives": 0`, the Laravel calculation is wrong!**

---

## ✅ Solution Summary

The `totalHives` is showing **0** because the **Laravel backend** is either:

1. ❌ Not implemented yet
2. ❌ Not returning `totalHives` in response
3. ❌ Not calculating it from apiaries
4. ❌ Apiaries have `hive_count = NULL` in database

**Fix:** Implement the Laravel `BeekeeperController` as shown above, ensuring:
- ✅ Eager load apiaries
- ✅ Calculate `$totalHives = $publicApiaries->sum('hive_count')`
- ✅ Return it in the response
- ✅ Verify database has `hive_count` values

**The frontend is correct - it's just displaying what the backend returns!** 🐝

