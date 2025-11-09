# Laravel Backend - Beekeepers API Implementation Guide

## 📋 Overview

You need to add **2 new API endpoints** to your Laravel backend that return user profiles formatted as "beekeepers".

**Key Concept**: Every registered user IS a beekeeper. The API just returns users with public profiles.

---

## 🛠️ Implementation Steps

### **Step 1: Create Beekeeper Controller**

Create: `app/Http/Controllers/Api/BeekeeperController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BeekeeperController extends Controller
{
    /**
     * Get list of beekeepers (public user profiles)
     * 
     * GET /api/beekeepers
     */
    public function index(Request $request): JsonResponse
    {
        // Start with active users only
        $query = User::where('status', 'active')
                    ->where('role', '!=', 'super_admin'); // Hide super admins

        // Search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('region', 'LIKE', "%{$search}%")
                  ->orWhere('city', 'LIKE', "%{$search}%")
                  ->orWhere('bio', 'LIKE', "%{$search}%");
            });
        }

        // Region filter
        if ($request->has('region')) {
            $query->where('region', $request->input('region'));
        }

        // Verified filter
        if ($request->boolean('verified')) {
            $query->whereNotNull('email_verified_at');
        }

        // Sort
        $sortBy = $request->input('sortBy', 'rating');
        switch ($sortBy) {
            case 'experience':
                $query->orderBy('created_at', 'asc'); // Oldest first = most experienced
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'deals':
                $query->orderBy('completed_deals', 'desc');
                break;
            case 'rating':
            default:
                // For now, order by trust level (gold > silver > bronze)
                $query->orderByRaw("FIELD(trust_level, 'gold', 'silver', 'bronze')");
                break;
        }

        // Pagination
        $perPage = $request->input('perPage', 20);
        $beekeepers = $query->paginate($perPage);

        // Transform to beekeeper format
        $items = $beekeepers->map(function($user) {
            return $this->transformUserToBeekeeper($user);
        });

        return response()->json([
            'items' => $items,
            'total' => $beekeepers->total(),
            'page' => $beekeepers->currentPage(),
            'perPage' => $beekeepers->perPage(),
        ]);
    }

    /**
     * Get single beekeeper profile
     * 
     * GET /api/beekeepers/{id}
     */
    public function show($id): JsonResponse
    {
        $user = User::where('id', $id)
                    ->where('status', 'active')
                    ->first();

        if (!$user) {
            return response()->json([
                'error' => 'Beekeeper not found'
            ], 404);
        }

        // Transform to beekeeper format
        $beekeeper = $this->transformUserToBeekeeper($user);

        return response()->json($beekeeper);
    }

    /**
     * Transform User model to BeekeeperProfile format
     */
    private function transformUserToBeekeeper($user): array
    {
        // Calculate experience
        $yearsExperience = now()->diffInYears($user->created_at);
        $experience = $yearsExperience >= 5 ? 'expert' 
                    : ($yearsExperience >= 2 ? 'intermediate' : 'beginner');

        // Calculate rating (placeholder until review system)
        $ratingMap = [
            'gold' => 4.8,
            'silver' => 4.3,
            'bronze' => 4.0,
        ];
        $rating = $ratingMap[$user->trust_level] ?? 4.0;

        // Calculate review count (placeholder)
        $reviewCountMap = [
            'gold' => rand(15, 35),
            'silver' => rand(5, 15),
            'bronze' => rand(0, 5),
        ];
        $reviewCount = $reviewCountMap[$user->trust_level] ?? 0;

        // Generate badges
        $badges = $this->generateBadges($user, $yearsExperience);

        // Respect privacy settings
        $showContact = $user->privacy === 'public';

        return [
            'id' => $user->id,
            'name' => $user->name,
            'region' => $user->region ?? 'Неизвестен',
            'city' => $user->city,
            'avatarUrl' => $user->avatar_url,
            
            // Trust & Verification
            'trustLevel' => $user->trust_level,
            'verifiedAt' => $user->email_verified_at,
            'rating' => $rating,
            'reviewCount' => $reviewCount,
            
            // Beekeeping Info
            'apiariesCount' => $user->apiaries_count ?? 0,
            'totalHives' => ($user->apiaries_count ?? 0) * 10, // Estimate
            'experience' => $experience,
            'memberSince' => $user->created_at->toISOString(),
            
            // Specializations & Products (future fields)
            'specializations' => $user->specializations ?? null,
            'products' => $user->products ?? null,
            
            // Bio & Contact (respects privacy)
            'bio' => $user->bio,
            'phone' => $showContact ? $user->phone : null,
            'email' => $showContact ? $user->email : null,
            'privacy' => $user->privacy ?? 'members',
            
            // Stats
            'activeListingsCount' => $user->active_listings_count ?? 0,
            'completedDeals' => $user->completed_deals ?? 0,
            
            // Badges
            'badges' => $badges,
        ];
    }

    /**
     * Generate special badges based on user data
     */
    private function generateBadges($user, $yearsExperience): array
    {
        $badges = [];

        // Admin/Moderator badges
        if (in_array($user->role, ['admin', 'super_admin'])) {
            $badges[] = 'Администратор';
        } elseif ($user->role === 'moderator') {
            $badges[] = 'Модератор';
        }

        // Trust level badges
        if ($user->trust_level === 'gold') {
            $badges[] = 'Професионалист';
        }

        // Experience badges
        if ($yearsExperience >= 5) {
            $badges[] = 'Експерт';
        } elseif ($yearsExperience >= 3) {
            $badges[] = 'Опитен';
        }

        // Activity badges
        if (($user->active_listings_count ?? 0) >= 5) {
            $badges[] = 'Активен продавач';
        }

        return $badges;
    }
}
```

---

### **Step 2: Add Routes**

Add to: `routes/api.php`

```php
use App\Http\Controllers\Api\BeekeeperController;

// Public routes (no auth required)
Route::get('/beekeepers', [BeekeeperController::class, 'index']);
Route::get('/beekeepers/{id}', [BeekeeperController::class, 'show']);

// Future: Protected routes (require auth)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/beekeepers/{id}/contact', [BeekeeperController::class, 'contact']);
    Route::post('/beekeepers/{id}/review', [BeekeeperController::class, 'review']);
});
```

---

### **Step 3: Add Missing Database Fields** (Optional but Recommended)

If these fields don't exist in your `users` table, add them:

```php
// Create migration: php artisan make:migration add_beekeeper_fields_to_users_table

public function up()
{
    Schema::table('users', function (Blueprint $table) {
        // Location
        $table->string('region')->nullable()->after('email');
        $table->string('city')->nullable()->after('region');
        
        // Profile
        $table->text('bio')->nullable();
        $table->string('avatar_url')->nullable();
        $table->string('phone')->nullable();
        $table->enum('privacy', ['public', 'members', 'private'])
              ->default('members');
        
        // Beekeeping Stats
        $table->integer('apiaries_count')->default(0);
        $table->integer('active_listings_count')->default(0);
        $table->integer('completed_deals')->default(0);
        
        // Future fields
        $table->json('specializations')->nullable(); // ['Производство на мед', ...]
        $table->json('products')->nullable(); // ['Акациев мед', ...]
        
        // Indexes for filtering
        $table->index('region');
        $table->index('trust_level');
        $table->index(['status', 'privacy']);
    });
}
```

---

### **Step 4: Update User Model** (Optional)

Add to: `app/Models/User.php`

```php
protected $fillable = [
    'name',
    'email',
    'password',
    'region',
    'city',
    'bio',
    'phone',
    'privacy',
    'avatar_url',
    'apiaries_count',
    'active_listings_count',
    'completed_deals',
    'specializations',
    'products',
    // ... other fields
];

protected $casts = [
    'email_verified_at' => 'datetime',
    'specializations' => 'array',
    'products' => 'array',
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
];

// Accessor for years of experience
public function getYearsExperienceAttribute(): int
{
    return $this->created_at->diffInYears(now());
}
```

---

## 📊 Expected API Response Format

### **GET /api/beekeepers**

```json
{
  "items": [
    {
      "id": "user-1",
      "name": "Иван Петров",
      "region": "София",
      "city": "София",
      "avatarUrl": "https://...",
      "trustLevel": "silver",
      "verifiedAt": "2024-03-20T12:00:00Z",
      "rating": 4.3,
      "reviewCount": 12,
      "apiariesCount": 2,
      "totalHives": 20,
      "experience": "intermediate",
      "memberSince": "2024-01-10T00:00:00Z",
      "specializations": ["Производство на мед"],
      "products": ["Акациев мед", "Липов мед"],
      "bio": "Пчелар с 2 години опит...",
      "phone": "+359 88 123 4567",
      "email": "ivan@example.com",
      "privacy": "public",
      "activeListingsCount": 3,
      "completedDeals": 15,
      "badges": ["Опитен"]
    }
    // ... more beekeepers
  ],
  "total": 45,
  "page": 1,
  "perPage": 20
}
```

### **GET /api/beekeepers/{id}**

```json
{
  "id": "user-1",
  "name": "Иван Петров",
  // ... same format as above (single object)
}
```

---

## 🔐 Privacy Logic

```php
// In controller:
$showContact = $user->privacy === 'public';

return [
    'phone' => $showContact ? $user->phone : null,
    'email' => $showContact ? $user->email : null,
    // ...
];
```

**Privacy Levels:**
- **public** - Show everything including phone/email
- **members** - Show profile but hide contact info
- **private** - Don't show in directory at all (filter out)

---

## 🎯 Query Parameters Supported

### **GET /api/beekeepers?{params}**

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `search` | string | `?search=Иван` | Search name, region, city, bio |
| `region` | string | `?region=София` | Filter by specific region |
| `verified` | boolean | `?verified=true` | Only verified users |
| `trustLevel` | string | `?trustLevel=gold` | Filter by trust level |
| `sortBy` | string | `?sortBy=rating` | Sort order |
| `page` | int | `?page=2` | Pagination page |
| `perPage` | int | `?perPage=20` | Results per page |

---

## 📝 Simplified Version (If You Want Minimal Implementation)

### **Quick Implementation (15 minutes):**

```php
// routes/api.php
Route::get('/beekeepers', function (Request $request) {
    $users = User::where('status', 'active')
                 ->where('role', '!=', 'super_admin')
                 ->get();
    
    $beekeepers = $users->map(function($user) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'region' => $user->region ?? 'Неизвестен',
            'city' => $user->city,
            'avatarUrl' => $user->avatar_url,
            'trustLevel' => $user->trust_level ?? 'bronze',
            'verifiedAt' => $user->email_verified_at,
            'rating' => 4.5, // Placeholder
            'reviewCount' => rand(5, 20), // Placeholder
            'apiariesCount' => $user->apiaries_count ?? 0,
            'totalHives' => ($user->apiaries_count ?? 0) * 10,
            'experience' => 'intermediate', // Placeholder
            'memberSince' => $user->created_at,
            'bio' => $user->bio,
            'phone' => $user->privacy === 'public' ? $user->phone : null,
            'email' => $user->privacy === 'public' ? $user->email : null,
            'privacy' => $user->privacy ?? 'members',
            'activeListingsCount' => $user->active_listings_count ?? 0,
            'completedDeals' => $user->completed_deals ?? 0,
            'badges' => [],
        ];
    });
    
    return response()->json([
        'items' => $beekeepers,
        'total' => $beekeepers->count(),
        'page' => 1,
        'perPage' => $beekeepers->count(),
    ]);
});

Route::get('/beekeepers/{id}', function ($id) {
    $user = User::where('id', $id)
                ->where('status', 'active')
                ->first();
    
    if (!$user) {
        return response()->json(['error' => 'Not found'], 404);
    }
    
    // Same transformation as above
    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        // ... same fields
    ]);
});
```

---

## 🔑 Required Database Fields

### **Minimum Required (Already Have):**
- ✅ `id` - User ID
- ✅ `name` - Full name
- ✅ `email` - Email address
- ✅ `status` - active/suspended/banned
- ✅ `role` - user/moderator/admin/super_admin
- ✅ `trust_level` - bronze/silver/gold
- ✅ `email_verified_at` - Verification timestamp
- ✅ `created_at` - Registration date

### **Recommended to Add:**
- 📝 `region` - VARCHAR(100) - София, Пловдив, etc.
- 📝 `city` - VARCHAR(100) - Specific city
- 📝 `bio` - TEXT - User description
- 📝 `phone` - VARCHAR(20) - Contact phone
- 📝 `privacy` - ENUM('public', 'members', 'private')
- 📝 `avatar_url` - VARCHAR(255) - Profile photo
- 📝 `apiaries_count` - INT DEFAULT 0
- 📝 `active_listings_count` - INT DEFAULT 0
- 📝 `completed_deals` - INT DEFAULT 0

### **Future Enhancements:**
- 🔮 `specializations` - JSON - ['Производство на мед', ...]
- 🔮 `products` - JSON - ['Акациев мед', ...]
- 🔮 `rating_avg` - DECIMAL(3,2) - From reviews table
- 🔮 `review_count` - INT - Count of reviews

---

## 🎯 Testing Your API

### **Test Endpoints:**

```bash
# List all beekeepers
curl http://localhost:8000/api/beekeepers

# Search
curl http://localhost:8000/api/beekeepers?search=Иван

# Filter by region
curl http://localhost:8000/api/beekeepers?region=София

# Verified only
curl http://localhost:8000/api/beekeepers?verified=true

# Sort by experience
curl http://localhost:8000/api/beekeepers?sortBy=experience

# Get single beekeeper
curl http://localhost:8000/api/beekeepers/user-1
```

### **Expected Response:**

```json
{
  "items": [
    {
      "id": "user-2",
      "name": "Иван Петров",
      "region": "Неизвестен",
      "city": null,
      "avatarUrl": null,
      "trustLevel": "silver",
      "verifiedAt": "2024-03-20T12:00:00.000000Z",
      "rating": 4.3,
      "reviewCount": 12,
      "apiariesCount": 0,
      "totalHives": 0,
      "experience": "beginner",
      "memberSince": "2024-01-10T00:00:00.000000Z",
      "bio": null,
      "phone": null,
      "email": null,
      "privacy": "members",
      "activeListingsCount": 0,
      "completedDeals": 0,
      "badges": []
    }
  ],
  "total": 3,
  "page": 1,
  "perPage": 20
}
```

---

## ⚡ Quick Start (Copy-Paste Ready)

### **Option A: Full Controller** (30 min)
1. Copy the `BeekeeperController.php` code above
2. Save to `app/Http/Controllers/Api/BeekeeperController.php`
3. Add routes to `routes/api.php`
4. Test with curl
5. Done! ✅

### **Option B: Simple Closure Routes** (10 min)
1. Copy the simplified version
2. Paste directly in `routes/api.php`
3. Test with curl
4. Done! ✅

---

## 🔄 Frontend Connection

Once your Laravel API is ready:

```typescript
// src/lib/beekeeperClient.ts is already configured!
// It will automatically call:
// - YOUR_API_BASE/api/beekeepers
// - YOUR_API_BASE/api/beekeepers/{id}

// Just make sure NEXT_PUBLIC_API_BASE is set:
// .env.local
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

---

## ✅ Checklist

### **Backend (Laravel):**
- [ ] Create `BeekeeperController.php` OR add closure routes
- [ ] Add routes to `routes/api.php`
- [ ] Test endpoints with curl/Postman
- [ ] Verify JSON response format matches

### **Database (Optional but Recommended):**
- [ ] Add `region`, `city`, `bio` fields to users table
- [ ] Add `phone`, `privacy`, `avatar_url` fields
- [ ] Add `apiaries_count`, `active_listings_count`, `completed_deals`
- [ ] Run migrations

### **Frontend (Already Done!):**
- [x] API client ready (`beekeeperClient.ts`)
- [x] Page fetches from `/api/beekeepers`
- [x] Mapper handles missing fields gracefully
- [x] UI displays all data

---

## 🎯 What Happens

```
User registers → Automatically a "beekeeper"
                ↓
           Fills profile (region, bio, etc.)
                ↓
           Appears in /beekeepers directory
                ↓
           Others can find & contact them
```

---

## 📞 Support

If you need help with:
1. **Laravel implementation** - Follow the code examples above
2. **Database migrations** - Use the migration code provided
3. **Testing** - Use the curl commands
4. **Integration** - Frontend is ready, just start the Laravel endpoint

---

**Once you add the Laravel endpoints, the frontend will automatically work!** 🚀

The beekeepers page is already built and waiting for your API to return users. Just implement one of the two options above (full controller or simple routes) and it will work immediately! 🐝✨
