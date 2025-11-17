# Pesticide Treatment Reporting - Minimal Implementation

## Overview
Create a pesticide treatment reporting system using the same flow as swarm alerts. No EPORD integration - just community reporting.

## ✅ Reusable Components

### 1. Modal System
- ✅ `Modal` component (`src/components/modal/Modal.tsx`)
- ✅ `ModalProvider` (`src/components/modal/ModalProvider.tsx`)
- ✅ Modal state management

### 2. API Route Pattern
- ✅ `src/app/api/swarm-alerts/route.ts` pattern
- ✅ GET/POST handlers
- ✅ Backend forwarding logic

### 3. Ticker Component
- ✅ `SwarmTicker` component structure
- ✅ Auto-refresh logic
- ✅ Event-based updates
- ✅ Scrolling animation

### 4. Form Structure
- ✅ Form state management
- ✅ Validation pattern
- ✅ Submit/error handling
- ✅ Success feedback

## 📋 Minimal Requirements

### Frontend Components Needed

1. **ReportTreatmentModal** (new)
   - Based on `ReportSwarmModal.tsx`
   - Fields: name, phone, location, treatment date, pesticide (optional), notes

2. **TreatmentTicker** (new, optional)
   - Based on `SwarmTicker.tsx`
   - Shows recent treatment reports
   - Can combine with swarm ticker or separate

3. **API Route** (new)
   - `src/app/api/treatment-reports/route.ts`
   - Same pattern as `swarm-alerts/route.ts`

### Backend Requirements

**Database Table:**
```sql
CREATE TABLE treatment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name VARCHAR(255),
  reporter_phone VARCHAR(50),
  location VARCHAR(255) NOT NULL,
  treatment_date DATE,
  treatment_time TIME,
  pesticide_name VARCHAR(255),
  crop_type VARCHAR(100),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'reported',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_treatment_reports_date ON treatment_reports(treatment_date);
CREATE INDEX idx_treatment_reports_location ON treatment_reports(location);
```

**API Endpoints (Backend):**
- `GET /api/treatment-reports` - List all reports
- `POST /api/treatment-reports` - Create new report

### Data Model

```typescript
// Frontend type
export type TreatmentReport = {
  id: string;
  reporterName?: string;
  reporterPhone?: string;
  location: string;
  treatmentDate?: string;
  treatmentTime?: string;
  pesticideName?: string;
  cropType?: string;
  notes?: string;
  status?: string;
  createdAt: string;
};

// Form state
type TreatmentFormState = {
  name: string;
  phone: string;
  location: string;
  treatmentDate: string;
  treatmentTime: string;
  pesticideName: string;
  cropType: string;
  notes: string;
};
```

## 🔄 Implementation Steps

### Step 1: Create API Route
**File:** `src/app/api/treatment-reports/route.ts`

Copy from `swarm-alerts/route.ts` and change:
- Endpoint: `/api/treatment-reports`
- Backend path: `/api/treatment-reports`

### Step 2: Create Report Modal
**File:** `src/components/treatments/ReportTreatmentModal.tsx`

Based on `ReportSwarmModal.tsx`:
- Change modal type: `"reportTreatment"`
- Add fields: `treatmentDate`, `treatmentTime`, `pesticideName`, `cropType`
- Update API endpoint: `/api/treatment-reports`
- Update UPDATE_EVENT: `"treatment:updated"`

### Step 3: Create Ticker (Optional)
**File:** `src/components/treatments/TreatmentTicker.tsx`

Based on `SwarmTicker.tsx`:
- Change API endpoint: `/api/treatment-reports`
- Change UPDATE_EVENT: `"treatment:updated"`
- Update styling (different color to distinguish from swarms)

### Step 4: Add to Layout
**File:** `src/app/layout.tsx`

Add:
```tsx
import ReportTreatmentModal from "@/components/treatments/ReportTreatmentModal";

// In JSX:
<ReportTreatmentModal />
```

### Step 5: Add Trigger Button
Add button to header or map page:
```tsx
<button onClick={() => open("reportTreatment")}>
  Съобщи за третиране
</button>
```

### Step 6: Update Translations
**Files:** `src/i18n/messages/bg.json`, `src/i18n/messages/en.json`

Add treatment-related translations.

## 📝 Form Fields

### Required Fields
- **Location** (required) - Same as swarm alerts

### Optional Fields
- **Name** - Reporter name
- **Phone** - Contact phone
- **Treatment Date** - When treatment will occur
- **Treatment Time** - Time of treatment
- **Pesticide Name** - Name of pesticide (optional)
- **Crop Type** - What crop is being treated
- **Notes** - Additional information

## 🎨 UI Considerations

### Color Scheme
- Swarm alerts: Amber/Yellow (`bg-amber-200`)
- Treatment reports: Orange/Red (`bg-orange-200` or `bg-red-100`) to indicate warning

### Icons
- Swarm: 🐝
- Treatment: ⚠️ or 🧪

### Combined Ticker Option
Instead of separate tickers, could combine:
- Show both swarms and treatments in one ticker
- Use different colors/icons to distinguish
- Filter by type

## 🔧 Minimal Backend Implementation

**Laravel Controller:**
```php
// app/Http/Controllers/TreatmentReportController.php
class TreatmentReportController extends Controller
{
    public function index()
    {
        $reports = TreatmentReport::orderBy('created_at', 'desc')
            ->where('status', 'reported')
            ->get();
        
        return response()->json($reports);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reporter_name' => 'nullable|string|max:255',
            'reporter_phone' => 'nullable|string|max:50',
            'location' => 'required|string|max:255',
            'treatment_date' => 'nullable|date',
            'treatment_time' => 'nullable|string',
            'pesticide_name' => 'nullable|string|max:255',
            'crop_type' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);
        
        $report = TreatmentReport::create($validated);
        
        return response()->json($report, 201);
    }
}
```

**Laravel Model:**
```php
// app/Models/TreatmentReport.php
class TreatmentReport extends Model
{
    protected $fillable = [
        'reporter_name',
        'reporter_phone',
        'location',
        'treatment_date',
        'treatment_time',
        'pesticide_name',
        'crop_type',
        'notes',
        'status',
    ];
    
    protected $casts = [
        'treatment_date' => 'date',
    ];
}
```

**Migration:**
```php
// database/migrations/xxxx_create_treatment_reports_table.php
Schema::create('treatment_reports', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('reporter_name')->nullable();
    $table->string('reporter_phone', 50)->nullable();
    $table->string('location');
    $table->date('treatment_date')->nullable();
    $table->time('treatment_time')->nullable();
    $table->string('pesticide_name')->nullable();
    $table->string('crop_type')->nullable();
    $table->text('notes')->nullable();
    $table->string('status')->default('reported');
    $table->timestamps();
    
    $table->index('treatment_date');
    $table->index('location');
});
```

## 📊 Reusability Summary

### 100% Reusable
- ✅ Modal component structure
- ✅ API route pattern
- ✅ Form validation logic
- ✅ Error handling
- ✅ Success feedback
- ✅ Event system (UPDATE_EVENT)

### 90% Reusable (Minor Changes)
- ✅ Ticker component (change API endpoint, styling)
- ✅ Form fields (add date/time/pesticide fields)

### New Components
- ⚠️ ReportTreatmentModal (based on ReportSwarmModal)
- ⚠️ TreatmentTicker (based on SwarmTicker, optional)
- ⚠️ API route (copy of swarm-alerts route)

## 🚀 Quick Start

1. **Copy swarm alert files:**
   ```bash
   # Create treatments directory
   mkdir src/components/treatments
   
   # Copy and modify files
   cp src/components/swarm/ReportSwarmModal.tsx src/components/treatments/ReportTreatmentModal.tsx
   cp src/components/swarm/SwarmTicker.tsx src/components/treatments/TreatmentTicker.tsx
   cp src/app/api/swarm-alerts/route.ts src/app/api/treatment-reports/route.ts
   ```

2. **Modify files:**
   - Change modal type to `"reportTreatment"`
   - Add treatment-specific fields
   - Update API endpoints
   - Update event names

3. **Add to layout:**
   - Import and add `ReportTreatmentModal`
   - Optionally add `TreatmentTicker`

4. **Backend:**
   - Create migration
   - Create model
   - Create controller
   - Add routes

## ⏱️ Estimated Effort

- **Frontend**: 2-3 hours (mostly copy-paste-modify)
- **Backend**: 1-2 hours (standard CRUD)
- **Testing**: 1 hour
- **Total**: 4-6 hours

## 🎯 Success Criteria

- ✅ Users can report pesticide treatments
- ✅ Reports appear in ticker (if implemented)
- ✅ Same UX as swarm alerts
- ✅ No EPORD dependency
- ✅ Minimal code duplication

