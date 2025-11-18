# Laravel Backend - Apiary Fields Update

## 📋 Overview

The frontend has been updated to support two new fields for apiaries:
1. **`apiaryNumber`** (Регистрационен номер) - Registration number for the apiary
2. **`beekeeperName`** (Име на пчелар) - Name of the beekeeper (separate from owner)

## 🔄 What Needs to be Updated

### **Endpoint: POST /api/add-apiary**

The frontend is already sending these fields in the request body. You need to:

1. **Accept the new fields** in your Laravel controller
2. **Store them in the database** (add columns if needed)
3. **Return them in responses** when fetching apiaries

---

## 📤 Frontend Request Format

The frontend sends requests with both camelCase and snake_case variants for compatibility:

```json
{
  "name": "Пчелин Марин Терзийски",
  "lat": 42.6977,
  "lng": 23.3219,
  "region": "Пловдив",
  "city": "Кричим",
  "address": "местност Адалъка",
  "code": null,
  "apiaryNumber": "REG-12345",
  "apiary_number": "REG-12345",
  "owner": "Марин Терзийски",
  "beekeeperName": "Иван Петров",
  "beekeeper_name": "Иван Петров",
  "visibility": "public",
  "notes": "Пчелина се намира в земплището на гр. Кричим",
  "flora": ["Липа", "Акация", "полска паша"],
  "hiveCount": 4,
  "hive_count": 4
}
```

---

## 🗄️ Database Migration

Add these columns to your `apiaries` table if they don't exist:

```php
// Create migration: php artisan make:migration add_apiary_fields_to_apiaries_table

public function up()
{
    Schema::table('apiaries', function (Blueprint $table) {
        // Registration number (official registration number)
        $table->string('apiary_number')->nullable()->after('code');
        
        // Beekeeper name (person who manages the apiary, may differ from owner)
        $table->string('beekeeper_name')->nullable()->after('owner');
        
        // Index for searching
        $table->index('apiary_number');
    });
}

public function down()
{
    Schema::table('apiaries', function (Blueprint $table) {
        $table->dropIndex(['apiary_number']);
        $table->dropColumn(['apiary_number', 'beekeeper_name']);
    });
}
```

---

## 🎯 Laravel Controller Update

### **Update ApiaryController (or your create endpoint)**

```php
// In your ApiaryController or wherever you handle POST /api/add-apiary

public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'lat' => 'required|numeric',
        'lng' => 'required|numeric',
        'region' => 'nullable|string|max:255',
        'city' => 'nullable|string|max:255',
        'address' => 'nullable|string|max:255',
        'code' => 'nullable|string|max:255',
        'apiaryNumber' => 'nullable|string|max:255', // Accept camelCase
        'apiary_number' => 'nullable|string|max:255', // Accept snake_case
        'owner' => 'nullable|string|max:255',
        'beekeeperName' => 'nullable|string|max:255', // Accept camelCase
        'beekeeper_name' => 'nullable|string|max:255', // Accept snake_case
        'visibility' => 'required|in:public,unlisted',
        'notes' => 'nullable|string',
        'flora' => 'nullable|array',
        'flora.*' => 'string|max:255',
        'hiveCount' => 'nullable|integer|min:0',
        'hive_count' => 'nullable|integer|min:0',
    ]);

    // Normalize field names (accept both camelCase and snake_case)
    $apiary = Apiary::create([
        'name' => $validated['name'],
        'lat' => $validated['lat'],
        'lng' => $validated['lng'],
        'region' => $validated['region'] ?? null,
        'city' => $validated['city'] ?? null,
        'address' => $validated['address'] ?? null,
        'code' => $validated['code'] ?? null,
        'apiary_number' => $validated['apiaryNumber'] ?? $validated['apiary_number'] ?? null,
        'owner' => $validated['owner'] ?? null,
        'beekeeper_name' => $validated['beekeeperName'] ?? $validated['beekeeper_name'] ?? null,
        'visibility' => $validated['visibility'],
        'notes' => $validated['notes'] ?? null,
        'flora' => $validated['flora'] ?? [],
        'hive_count' => $validated['hiveCount'] ?? $validated['hive_count'] ?? null,
        'user_id' => auth()->id(), // Associate with authenticated user
    ]);

    return response()->json($apiary, 201);
}
```

---

## 📥 Response Format

When returning apiary data (GET /api/apiaries), include the new fields:

```json
{
  "id": "apiary-123",
  "name": "Пчелин Марин Терзийски",
  "region": "Пловдив",
  "city": "Кричим",
  "address": "местност Адалъка",
  "code": null,
  "apiary_number": "REG-12345",
  "owner": "Марин Терзийски",
  "beekeeper_name": "Иван Петров",
  "lat": 42.6977,
  "lng": 23.3219,
  "visibility": "public",
  "flora": ["Липа", "Акация", "полска паша"],
  "hive_count": 4,
  "notes": "Пчелина се намира в земплището на гр. Кричим",
  "updated_at": "2025-11-16T10:00:00Z"
}
```

**Note:** The frontend accepts both `apiary_number`/`apiaryNumber` and `beekeeper_name`/`beekeeperName` in responses, so you can use either naming convention.

---

## 🔄 Model Update

### **Update Apiary Model**

Add the new fields to `$fillable`:

```php
// app/Models/Apiary.php

protected $fillable = [
    'name',
    'lat',
    'lng',
    'region',
    'city',
    'address',
    'code',
    'apiary_number',  // NEW
    'owner',
    'beekeeper_name', // NEW
    'visibility',
    'notes',
    'flora',
    'hive_count',
    'user_id',
];

// If using JSON casting for flora
protected $casts = [
    'flora' => 'array',
    'lat' => 'decimal:6',
    'lng' => 'decimal:6',
];
```

---

## ✅ Checklist

### **Backend (Laravel):**
- [ ] Create migration to add `apiary_number` and `beekeeper_name` columns
- [ ] Run migration: `php artisan migrate`
- [ ] Update Apiary model `$fillable` array
- [ ] Update controller to accept new fields in validation
- [ ] Update controller to save new fields to database
- [ ] Update API responses to include new fields
- [ ] Test POST /api/add-apiary with new fields
- [ ] Test GET /api/apiaries returns new fields

### **Frontend (Already Done!):**
- [x] Form collects `apiaryNumber` and `beekeeperName`
- [x] Request sends both camelCase and snake_case variants
- [x] Response normalization handles both naming conventions
- [x] Display shows new fields when available

---

## 🧪 Testing

### **Test Creating Apiary with New Fields:**

```bash
curl -X POST "http://localhost:8000/api/add-apiary" \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test Apiary",
    "lat": 42.6977,
    "lng": 23.3219,
    "region": "София",
    "city": "София",
    "address": "Test Address",
    "apiaryNumber": "REG-12345",
    "owner": "Test Owner",
    "beekeeperName": "Test Beekeeper",
    "visibility": "public",
    "hiveCount": 10,
    "flora": ["Акация", "Липа"]
  }'
```

### **Expected Response:**

```json
{
  "id": "apiary-123",
  "name": "Test Apiary",
  "apiary_number": "REG-12345",
  "owner": "Test Owner",
  "beekeeper_name": "Test Beekeeper",
  ...
}
```

---

## 📝 Field Descriptions

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `apiary_number` | string | Official registration number of the apiary | No |
| `beekeeper_name` | string | Name of the person managing the apiary (may differ from owner) | No |
| `owner` | string | Name of the owner of the apiary | No |
| `code` | string | Internal code/number for the apiary | No |

**Note:** `apiary_number` is the official registration number, while `code` is an internal identifier. They serve different purposes.

---

## 🔄 Backward Compatibility

The frontend sends both naming conventions for maximum compatibility:
- `apiaryNumber` (camelCase) and `apiary_number` (snake_case)
- `beekeeperName` (camelCase) and `beekeeper_name` (snake_case)

Your Laravel backend can accept either format. The frontend will normalize the response regardless of which format you use.

---

## 🚀 Quick Implementation

**Minimum changes needed:**

1. **Add columns to database:**
   ```sql
   ALTER TABLE apiaries 
   ADD COLUMN apiary_number VARCHAR(255) NULL AFTER code,
   ADD COLUMN beekeeper_name VARCHAR(255) NULL AFTER owner;
   ```

2. **Update controller validation:**
   ```php
   'apiaryNumber' => 'nullable|string|max:255',
   'apiary_number' => 'nullable|string|max:255',
   'beekeeperName' => 'nullable|string|max:255',
   'beekeeper_name' => 'nullable|string|max:255',
   ```

3. **Save in controller:**
   ```php
   'apiary_number' => $request->input('apiaryNumber') ?? $request->input('apiary_number'),
   'beekeeper_name' => $request->input('beekeeperName') ?? $request->input('beekeeper_name'),
   ```

4. **Include in responses:**
   ```php
   // In your API resource or controller response
   return $apiary->toArray(); // Will include new fields if in $fillable
   ```

That's it! The frontend is already ready to work with these fields. 🎉

