# Treatment Report Submission Flow

## 📋 Complete Flow After Submission

### 1. User Submits Form

**Location:** `src/components/treatments/ReportTreatmentModal.tsx`

**Action:** User clicks "Изпрати сигнал" button

**Validation:**
- ✅ Location field is required (client-side validation)
- ✅ All fields are trimmed
- ✅ Optional fields can be empty

---

### 2. Payload Transformation

**Location:** `src/components/treatments/ReportTreatmentModal.tsx` (lines 71-80)

**Transformation:**
```typescript
Frontend Form → Backend API
name → reporter_name
phone → reporter_phone
location → location (required)
treatmentDate → treatment_date (YYYY-MM-DD)
treatmentTime → treatment_time (HH:mm)
pesticideName → pesticide_name
cropType → crop_type
notes → notes
```

**Empty fields:** Converted to `null` (not empty strings)

---

### 3. Frontend API Call

**Location:** `src/components/reports/BaseReportModal.tsx` (lines 94-98)

**Request:**
```typescript
POST /api/treatment-reports
Headers: {
  "Content-Type": "application/json"
}
Body: {
  reporter_name: string | null,
  reporter_phone: string | null,
  location: string,
  treatment_date: string | null,
  treatment_time: string | null,
  pesticide_name: string | null,
  crop_type: string | null,
  notes: string | null
}
```

---

### 4. Next.js API Route (Frontend)

**Location:** `src/app/api/treatment-reports/route.ts` (POST handler)

**Process:**
1. Receives request from frontend
2. Forwards to backend: `POST {API_BASE}/api/treatment-reports`
3. Sends headers: `Content-Type` and `Accept: application/json`
4. Handles response:
   - ✅ **201 Created**: Returns success response
   - ❌ **422 Validation Error**: Returns Laravel error format
   - ❌ **Other Errors**: Returns error message

---

### 5. Backend Processing (Laravel)

**Location:** Backend Laravel API

**Process:**
1. Validates request data
   - `location` is required
   - `treatment_date` must be valid date (YYYY-MM-DD)
   - `treatment_time` must be valid time (HH:mm)
   - Field length limits enforced
2. Creates `TreatmentReport` record in database
3. Sets `status = 'reported'` (default)
4. Returns created record with:
   - `id` (UUID)
   - All submitted fields
   - `status: 'reported'`
   - `created_at` timestamp
   - `updated_at` timestamp

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "reporter_name": "Иван Петров",
  "reporter_phone": "+359888123456",
  "location": "София, район Люлин",
  "treatment_date": "2025-11-17",
  "treatment_time": "14:30:00",
  "pesticide_name": "Глифосат",
  "crop_type": "Слънчоглед",
  "notes": "Обработка на 10 декара",
  "status": "reported",
  "created_at": "2025-11-17T18:12:45.000000Z",
  "updated_at": "2025-11-17T18:12:45.000000Z"
}
```

---

### 6. Frontend Success Handling

**Location:** `src/components/reports/BaseReportModal.tsx` (lines 116-118)

**On Success (201 Created):**

1. **Show Success Message**
   ```typescript
   setSubmitted(true);
   // Displays: "Благодарим! Сигналът е приет и ще бъде споделен с пчеларите."
   ```

2. **Dispatch Update Event**
   ```typescript
   window.dispatchEvent(new Event("treatment:updated"));
   ```
   - This event can be listened to by other components
   - Currently: **No components are listening** (see Missing Features below)

3. **Auto-Close Modal**
   ```typescript
   setTimeout(() => handleClose(), 1600);
   ```
   - Modal closes after 1.6 seconds
   - Form is reset
   - State is cleared

4. **Form Reset**
   ```typescript
   function handleClose() {
     close();
     setForm(initialState); // All fields cleared
     setSubmitted(false);
     setError(null);
   }
   ```

---

### 7. Error Handling

**Location:** `src/components/reports/BaseReportModal.tsx` (lines 100-114)

#### Laravel Validation Errors (422)

**Backend Response:**
```json
{
  "message": "The location field is required.",
  "errors": {
    "location": ["The location field is required."]
  }
}
```

**Frontend Handling:**
- Extracts first error message from `errors` object
- Displays error in modal: "The location field is required."
- Form remains open
- User can correct and resubmit

#### Network Errors

**Frontend Handling:**
- Catches fetch errors
- Displays: "Неуспешно изпращане"
- Form remains open
- User can retry

#### Server Errors (500)

**Frontend Handling:**
- Displays error message from backend
- Form remains open
- User can retry

---

## 🔄 Current State After Submission

### ✅ What Happens Now

1. ✅ **Report is saved** to database
2. ✅ **Success message** is shown to user
3. ✅ **Modal closes** automatically
4. ✅ **Form resets** for next submission
5. ✅ **Event is dispatched** (`treatment:updated`)

### ⚠️ What's Missing (Not Implemented Yet)

1. ❌ **No Treatment Ticker** - Unlike swarm alerts, there's no ticker component to display treatment reports
2. ❌ **No Event Listeners** - The `treatment:updated` event is dispatched but nothing listens to it
3. ❌ **No Display Page** - No page to view all treatment reports
4. ❌ **No Notifications** - No email/SMS notifications to beekeepers
5. ❌ **No Map Integration** - Reports not shown on map

---

## 📊 Data Flow Diagram

```
User Submits Form
    ↓
Payload Transformation (frontend → backend field names)
    ↓
POST /api/treatment-reports (Next.js route)
    ↓
POST {API_BASE}/api/treatment-reports (Laravel backend)
    ↓
Validation & Database Save
    ↓
Response (201 Created with report data)
    ↓
Frontend Success Handling:
    ├─ Show success message
    ├─ Dispatch "treatment:updated" event
    ├─ Close modal (after 1.6s)
    └─ Reset form
```

---

## 🎯 Future Enhancements (Not Yet Implemented)

### 1. Treatment Ticker Component

**Similar to:** `SwarmTicker.tsx`

**Would:**
- Listen to `treatment:updated` event
- Fetch reports from `/api/treatment-reports`
- Display scrolling ticker with recent reports
- Auto-refresh every 60 seconds
- Show location, date, time, pesticide name

**Example:**
```tsx
<TreatmentTicker />
// Displays: "София, район Люлин · 17.11.2025 14:30 · Глифосат"
```

### 2. Treatment Reports Page

**Would:**
- List all treatment reports
- Filter by date, location, pesticide
- Show details: reporter, location, date/time, pesticide, crop, notes
- Map view showing treatment locations

### 3. Beekeeper Notifications

**Would:**
- Find beekeepers within 3km radius
- Send email/SMS notifications
- Alert about upcoming treatments
- Include treatment details

### 4. Map Integration

**Would:**
- Show treatment reports on map
- Different marker color (orange/red)
- Click to see details
- Filter by date range

---

## 🔍 Current Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Form Submission | ✅ Complete | Works perfectly |
| Backend API | ✅ Complete | Saves to database |
| Success Feedback | ✅ Complete | Message + auto-close |
| Error Handling | ✅ Complete | Validation + network errors |
| Event Dispatch | ✅ Complete | `treatment:updated` event |
| **Ticker Display** | ❌ **Missing** | No component to show reports |
| **Reports List** | ❌ **Missing** | No page to view all reports |
| **Notifications** | ❌ **Missing** | No alerts to beekeepers |
| **Map Display** | ❌ **Missing** | Reports not on map |

---

## 📝 Summary

**Current Flow:**
1. User submits → Form validated
2. Data transformed → Sent to backend
3. Backend saves → Returns success
4. Frontend shows success → Closes modal
5. **Event dispatched** → But nothing listens yet

**What Works:**
- ✅ Complete submission flow
- ✅ Data persistence
- ✅ User feedback
- ✅ Error handling

**What's Next (Future Development):**
- ⚠️ Create `TreatmentTicker` component
- ⚠️ Create treatment reports list page
- ⚠️ Add map integration
- ⚠️ Add beekeeper notifications

---

**The core functionality is complete and working. The report is successfully saved to the database. The missing pieces are display/notification features that can be added later.**

