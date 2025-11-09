# 🚨 CRITICAL: Apiary Privacy Leak - FIX REQUIRED

## Security Issue ❌

**Severity:** HIGH  
**Impact:** Users can see other users' apiaries on the profile page

---

## 🔍 The Problem

When a user is logged in and visits `/profile`, they can see apiaries belonging to OTHER users (like "Иван Иванов"), not just their own.

**Example:**
```
User A logs in → Goes to /profile → Sees User B's apiaries ❌
Should only see their own apiaries! ✅
```

---

## 🔎 Root Cause

### **Frontend (Correct) ✅**

The frontend is doing the right thing:

```typescript
// src/lib/apiaries.ts
export async function fetchUserApiaries(): Promise<Apiary[]> {
  const token = authStorage.getToken();
  
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  
  // ✅ Sends user=me parameter
  const data = await apiRequest<any>(`/api/apiaries?user=me`, {
    method: "GET",
    headers,
  });
  
  return normalizeApiaryList(data);
}
```

**Request sent:**
```
GET /api/apiaries?user=me
Authorization: Bearer {token}
```

### **Backend (Missing Implementation) ❌**

The Laravel backend's `ApiariesController` is **NOT** filtering by the authenticated user when `?user=me` is present.

**Current behavior:**
```php
// Returns ALL apiaries in database ❌
public function index(Request $request)
{
    $apiaries = Apiary::all();
    return response()->json(['items' => $apiaries]);
}
```

**Should be:**
```php
// Return only authenticated user's apiaries when ?user=me ✅
public function index(Request $request)
{
    if ($request->get('user') === 'me') {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $apiaries = Apiary::where('user_id', $user->id)->get();
        return response()->json(['items' => $apiaries]);
    }
    
    // Return public apiaries for other requests
    $apiaries = Apiary::where('visibility', 'public')->get();
    return response()->json(['items' => $apiaries]);
}
```

---

## ✅ REQUIRED FIX (Laravel Backend)

### **File: `app/Http/Controllers/ApiariesController.php`**

Update the `index()` method to handle the `?user=me` parameter:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Apiary;
use Illuminate\Http\Request;

class ApiariesController extends Controller
{
    /**
     * Get apiaries (filtered by user if ?user=me)
     */
    public function index(Request $request)
    {
        // ✅ CRITICAL: Filter by authenticated user when ?user=me
        if ($request->get('user') === 'me') {
            $user = $request->user();
            
            // Ensure user is authenticated
            if (!$user) {
                return response()->json([
                    'error' => 'Unauthorized',
                    'message' => 'Authentication required to view your apiaries'
                ], 401);
            }
            
            // Return ONLY the authenticated user's apiaries
            $apiaries = Apiary::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'items' => $apiaries,
                'count' => $apiaries->count(),
            ]);
        }
        
        // For public requests (no ?user=me), return public apiaries
        $query = Apiary::where('visibility', 'public');
        
        // Apply filters (region, etc.)
        if ($request->has('region')) {
            $query->where('region', $request->input('region'));
        }
        
        if ($request->has('lat') && $request->has('lng')) {
            // Add proximity filtering if needed
        }
        
        $limit = $request->input('limit', 50);
        $apiaries = $query->limit($limit)->get();
        
        return response()->json([
            'items' => $apiaries,
            'count' => $apiaries->count(),
        ]);
    }
    
    /**
     * Create a new apiary (authenticated users only)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'region' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
            'flora' => 'nullable|array',
            'hiveCount' => 'nullable|integer|min:0',
            'hive_count' => 'nullable|integer|min:0',
            'visibility' => 'required|in:public,unlisted',
            'notes' => 'nullable|string',
        ]);
        
        // ✅ CRITICAL: Set user_id to authenticated user
        $apiary = Apiary::create([
            'user_id' => $user->id,  // ← Must set this!
            'name' => $validated['name'],
            'owner' => $user->name,  // For backward compatibility
            'lat' => $validated['lat'],
            'lng' => $validated['lng'],
            'region' => $validated['region'] ?? null,
            'city' => $validated['city'] ?? null,
            'address' => $validated['address'] ?? null,
            'code' => $validated['code'] ?? null,
            'flora' => $validated['flora'] ?? null,
            'hive_count' => $validated['hiveCount'] ?? $validated['hive_count'] ?? null,
            'visibility' => $validated['visibility'],
            'notes' => $validated['notes'] ?? null,
        ]);
        
        return response()->json([
            'item' => $apiary,
            'message' => 'Apiary created successfully'
        ], 201);
    }
    
    /**
     * Get a single apiary
     */
    public function show(Request $request, $id)
    {
        $apiary = Apiary::find($id);
        
        if (!$apiary) {
            return response()->json(['error' => 'Not found'], 404);
        }
        
        $user = $request->user();
        
        // ✅ SECURITY: Check if user can view this apiary
        if ($apiary->visibility === 'unlisted' && (!$user || $apiary->user_id !== $user->id)) {
            return response()->json(['error' => 'Not found'], 404);
        }
        
        return response()->json(['item' => $apiary]);
    }
    
    /**
     * Update an apiary (owner only)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $apiary = Apiary::find($id);
        
        if (!$apiary) {
            return response()->json(['error' => 'Not found'], 404);
        }
        
        // ✅ SECURITY: Only owner can update
        if ($apiary->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'lat' => 'sometimes|numeric',
            'lng' => 'sometimes|numeric',
            'region' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'hiveCount' => 'nullable|integer|min:0',
            'hive_count' => 'nullable|integer|min:0',
            'visibility' => 'sometimes|in:public,unlisted',
            'notes' => 'nullable|string',
        ]);
        
        $apiary->update($validated);
        
        return response()->json([
            'item' => $apiary,
            'message' => 'Apiary updated successfully'
        ]);
    }
    
    /**
     * Delete an apiary (owner only)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $apiary = Apiary::find($id);
        
        if (!$apiary) {
            return response()->json(['error' => 'Not found'], 404);
        }
        
        // ✅ SECURITY: Only owner can delete
        if ($apiary->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        
        $apiary->delete();
        
        return response()->json([
            'message' => 'Apiary deleted successfully'
        ]);
    }
}
```

---

## 🔒 Security Rules Implemented

### **1. Read Own Apiaries (`GET /api/apiaries?user=me`)**
- ✅ Requires authentication
- ✅ Returns ONLY user's own apiaries
- ✅ Filters by `user_id = authenticated_user.id`

### **2. Read Public Apiaries (`GET /api/apiaries`)**
- ✅ No authentication required
- ✅ Returns only `visibility = 'public'` apiaries
- ✅ Used for map display

### **3. Create Apiary (`POST /api/add-apiary`)**
- ✅ Requires authentication
- ✅ Automatically sets `user_id` to authenticated user
- ✅ Cannot create apiary for another user

### **4. Update Apiary (`PUT /api/apiaries/{id}`)**
- ✅ Requires authentication
- ✅ Checks ownership: `apiary.user_id === authenticated_user.id`
- ✅ Returns 403 Forbidden if not owner

### **5. Delete Apiary (`DELETE /api/apiaries/{id}`)**
- ✅ Requires authentication
- ✅ Checks ownership: `apiary.user_id === authenticated_user.id`
- ✅ Returns 403 Forbidden if not owner

---

## 🧪 Testing

### **Test 1: User can only see their own apiaries**

**Setup:**
- User A has 2 apiaries
- User B has 3 apiaries (including "Иван Иванов")

**Test:**
1. Login as User A
2. Go to `/profile`
3. Check "Моите пчелини" section
4. **Expected:** See only User A's 2 apiaries ✅
5. **NOT Expected:** See User B's apiaries ❌

**API Call:**
```bash
curl -H "Authorization: Bearer {user_a_token}" \
     http://localhost:8000/api/apiaries?user=me
```

**Expected Response:**
```json
{
  "items": [
    {"id": 1, "name": "User A Apiary 1", "user_id": 123},
    {"id": 2, "name": "User A Apiary 2", "user_id": 123}
  ],
  "count": 2
}
```

### **Test 2: Unauthenticated request fails**

```bash
curl http://localhost:8000/api/apiaries?user=me
```

**Expected Response:**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required to view your apiaries"
}
```
**Status:** 401

### **Test 3: User cannot update another user's apiary**

```bash
curl -X PUT \
     -H "Authorization: Bearer {user_a_token}" \
     -H "Content-Type: application/json" \
     -d '{"name":"Hacked"}' \
     http://localhost:8000/api/apiaries/99
```

**Expected Response:**
```json
{
  "error": "Forbidden"
}
```
**Status:** 403

---

## 📊 Database Schema Verification

Ensure your `apiaries` table has the `user_id` foreign key:

```sql
-- Check if user_id column exists
SHOW COLUMNS FROM apiaries LIKE 'user_id';

-- If not exists, run migration:
ALTER TABLE apiaries 
ADD COLUMN user_id BIGINT UNSIGNED NULL AFTER id,
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_user_id ON apiaries(user_id);
```

**Verify data:**
```sql
-- Check which apiaries have user_id set
SELECT id, name, owner, user_id FROM apiaries;

-- Update imported/old apiaries (if needed)
-- These are apiaries without user_id (imported from BABH)
UPDATE apiaries SET user_id = NULL WHERE user_id IS NULL;
```

---

## 🚨 IMMEDIATE ACTION REQUIRED

### **Priority: CRITICAL**

This is a **data privacy leak**. Users can currently see each other's apiaries!

### **Steps to Fix:**

1. ✅ **Update Laravel Controller** (5 minutes)
   - Implement the `index()` method with `?user=me` filtering
   - Add ownership checks to `update()` and `destroy()` methods

2. ✅ **Test the Fix** (2 minutes)
   - Login as different users
   - Verify each user sees only their own apiaries
   - Try to access another user's apiary (should fail)

3. ✅ **Deploy to Production** (ASAP)
   - This fix must be deployed immediately
   - Notify users if sensitive data was potentially accessed

---

## 📁 Summary

**Frontend:** ✅ Working correctly (sends `?user=me` with auth token)  
**Backend:** ❌ **MISSING IMPLEMENTATION** (must filter by user_id)

**Fix:** Update Laravel `ApiariesController.php` to filter by authenticated user when `?user=me` parameter is present.

**Impact:** HIGH - Privacy leak allowing users to see each other's apiaries

**Effort:** 5-10 minutes

**Status:** 🚨 **ACTION REQUIRED IMMEDIATELY**

---

## ✅ After Fix Verification

Once you've updated the Laravel backend, test with:

```bash
# User A token
curl -H "Authorization: Bearer {token_a}" \
     http://localhost:8000/api/apiaries?user=me

# Should return ONLY User A's apiaries

# User B token
curl -H "Authorization: Bearer {token_b}" \
     http://localhost:8000/api/apiaries?user=me

# Should return ONLY User B's apiaries (not User A's)
```

**Frontend will automatically work correctly once backend is fixed!** 🐝🔒

