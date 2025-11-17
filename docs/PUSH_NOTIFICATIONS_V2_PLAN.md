# Push Notifications V2 - Implementation Plan

## 📋 Overview

Plan for implementing push notifications to alert beekeepers about pesticide treatments in their area (v2 feature).

---

## 🎯 Goals

1. **Real-time Alerts**: Notify beekeepers when treatments are reported near their apiaries
2. **Proactive Protection**: Give beekeepers time to protect their hives
3. **Radius-based**: Alert beekeepers within 3km radius of treatment location
4. **Multiple Channels**: Email, SMS, and browser push notifications

---

## 🏗️ Architecture

### Components Needed

1. **Notification Service** (Backend)
   - Calculate distances between treatments and apiaries
   - Find beekeepers within radius
   - Queue notifications
   - Send via multiple channels

2. **Push Notification Service** (Backend)
   - Browser push notifications (Web Push API)
   - Email notifications
   - SMS notifications (optional)

3. **Frontend Push Subscription** (Frontend)
   - Request permission
   - Subscribe to push service
   - Handle incoming notifications
   - Display notifications

4. **Notification Preferences** (Frontend + Backend)
   - User settings for notification types
   - Radius preferences
   - Frequency controls

---

## 📊 Database Schema

### New Tables

```sql
-- User notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  radius_km INTEGER DEFAULT 3,
  notify_before_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Push notification subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(endpoint)
);

-- Notification queue
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  treatment_report_id UUID REFERENCES treatment_reports(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'email', 'sms', 'push'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  payload JSONB,
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_treatment ON notifications(treatment_report_id);
```

---

## 🔧 Backend Implementation

### 1. Notification Service

**File:** `app/Services/TreatmentNotificationService.php`

```php
class TreatmentNotificationService
{
    public function notifyNearbyBeekeepers(TreatmentReport $report): void
    {
        // 1. Geocode treatment location (if not already geocoded)
        $treatmentCoords = $this->geocodeLocation($report->location);
        
        // 2. Find apiaries within radius
        $apiaries = Apiary::whereRaw(
            "ST_DWithin(
                location::geography,
                ST_MakePoint(?, ?)::geography,
                ? * 1000
            )",
            [$treatmentCoords['lng'], $treatmentCoords['lat'], 3] // 3km radius
        )->get();
        
        // 3. Get unique beekeepers
        $userIds = $apiaries->pluck('user_id')->unique();
        
        // 4. Get notification preferences
        $users = User::whereIn('id', $userIds)
            ->with('notificationPreferences')
            ->get();
        
        // 5. Queue notifications
        foreach ($users as $user) {
            $prefs = $user->notificationPreferences;
            
            if ($prefs->email_enabled) {
                $this->queueEmailNotification($user, $report);
            }
            
            if ($prefs->push_enabled) {
                $this->queuePushNotification($user, $report);
            }
            
            if ($prefs->sms_enabled) {
                $this->queueSmsNotification($user, $report);
            }
        }
    }
    
    private function queueEmailNotification(User $user, TreatmentReport $report): void
    {
        Notification::create([
            'user_id' => $user->id,
            'treatment_report_id' => $report->id,
            'type' => 'email',
            'payload' => [
                'subject' => '⚠️ Сигнал за третиране с препарати',
                'template' => 'treatment-alert',
                'data' => [
                    'location' => $report->location,
                    'date' => $report->treatment_date,
                    'time' => $report->treatment_time,
                    'pesticide' => $report->pesticide_name,
                    'crop' => $report->crop_type,
                ],
            ],
        ]);
    }
    
    private function queuePushNotification(User $user, TreatmentReport $report): void
    {
        $subscriptions = PushSubscription::where('user_id', $user->id)->get();
        
        foreach ($subscriptions as $subscription) {
            Notification::create([
                'user_id' => $user->id,
                'treatment_report_id' => $report->id,
                'type' => 'push',
                'payload' => [
                    'endpoint' => $subscription->endpoint,
                    'title' => '⚠️ Сигнал за третиране',
                    'body' => "Локация: {$report->location}",
                    'data' => [
                        'url' => "/treatments",
                        'treatment_id' => $report->id,
                    ],
                ],
            ]);
        }
    }
}
```

### 2. Web Push Service

**File:** `app/Services/WebPushService.php`

```php
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class WebPushService
{
    public function send(Notification $notification): bool
    {
        $payload = $notification->payload;
        
        $subscription = Subscription::create([
            'endpoint' => $payload['endpoint'],
            'keys' => [
                'p256dh' => $payload['p256dh'] ?? '',
                'auth' => $payload['auth'] ?? '',
            ],
        ]);
        
        $webPush = new WebPush([
            'VAPID' => [
                'subject' => config('app.url'),
                'publicKey' => config('services.webpush.public_key'),
                'privateKey' => config('services.webpush.private_key'),
            ],
        ]);
        
        $result = $webPush->sendOneNotification(
            $subscription,
            json_encode([
                'title' => $payload['title'],
                'body' => $payload['body'],
                'data' => $payload['data'] ?? [],
            ])
        );
        
        return $result->isSuccess();
    }
}
```

### 3. Treatment Report Observer

**File:** `app/Observers/TreatmentReportObserver.php`

```php
class TreatmentReportObserver
{
    public function created(TreatmentReport $report): void
    {
        // Queue notification job
        dispatch(new NotifyNearbyBeekeepersJob($report));
    }
}
```

### 4. Notification Queue Worker

**File:** `app/Jobs/NotifyNearbyBeekeepersJob.php`

```php
class NotifyNearbyBeekeepersJob implements ShouldQueue
{
    public function handle(TreatmentNotificationService $service): void
    {
        $service->notifyNearbyBeekeepers($this->report);
    }
}
```

---

## 🎨 Frontend Implementation

### 1. Push Subscription Service

**File:** `src/lib/pushNotifications.ts`

```typescript
export async function requestPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    throw new Error("Browser does not support notifications");
  }
  
  return await Notification.requestPermission();
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers not supported");
  }
  
  const registration = await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  
  // Send subscription to backend
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });
  
  return subscription;
}

export async function unsubscribeFromPush(): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    await subscription.unsubscribe();
    await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  }
}
```

### 2. Service Worker

**File:** `public/sw.js`

```javascript
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  
  const options = {
    title: data.title || 'Pchelarstvo.bg',
    body: data.body || 'Нов сигнал за третиране',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.data || {},
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'Виж детайли' },
      { action: 'dismiss', title: 'Затвори' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    const url = event.notification.data?.url || '/treatments';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});
```

### 3. Notification Preferences Component

**File:** `src/components/notifications/NotificationPreferences.tsx`

```typescript
export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState({
    emailEnabled: true,
    pushEnabled: false,
    smsEnabled: false,
    radiusKm: 3,
    notifyBeforeHours: 24,
  });
  
  const [pushSupported, setPushSupported] = useState(false);
  
  useEffect(() => {
    setPushSupported(
      "Notification" in window && 
      "serviceWorker" in navigator &&
      "PushManager" in window
    );
  }, []);
  
  async function handleEnablePush() {
    try {
      await requestPermission();
      await subscribeToPush();
      setPrefs(prev => ({ ...prev, pushEnabled: true }));
    } catch (err) {
      console.error("Failed to enable push:", err);
    }
  }
  
  // ... rest of component
}
```

---

## 🔄 Flow Diagram

```
Treatment Report Created
    ↓
TreatmentReportObserver.created()
    ↓
Dispatch NotifyNearbyBeekeepersJob
    ↓
TreatmentNotificationService.notifyNearbyBeekeepers()
    ↓
1. Geocode location
2. Find apiaries within 3km
3. Get beekeepers
4. Check notification preferences
    ↓
Queue Notifications:
    ├─ Email Notification (if enabled)
    ├─ Push Notification (if enabled)
    └─ SMS Notification (if enabled)
    ↓
Notification Queue Worker
    ↓
Send via appropriate channel
    ↓
Update notification status
```

---

## 📱 Notification Content

### Email Template

**Subject:** ⚠️ Сигнал за третиране с препарати - [Локация]

**Body:**
```
Здравейте,

Получихме сигнал за планирано третиране с растителнозащитни препарати в близост до вашите пчелини.

📍 Локация: [location]
📅 Дата: [treatment_date]
🕐 Час: [treatment_time]
🧪 Препарат: [pesticide_name]
🌾 Култура: [crop_type]

Вашите пчелини в радиус от 3km:
- [Apiary 1]
- [Apiary 2]

Препоръки:
- Затворете кошерите преди третирането
- Използвайте защитни мрежи
- Следете метеорологичните условия

[View Details Button] → /treatments/[id]
```

### Push Notification

```json
{
  "title": "⚠️ Сигнал за третиране",
  "body": "Третиране планирано в [location] на [date]",
  "icon": "/icon-192x192.png",
  "badge": "/badge-72x72.png",
  "data": {
    "url": "/treatments",
    "treatment_id": "uuid"
  },
  "actions": [
    { "action": "view", "title": "Виж детайли" },
    { "action": "dismiss", "title": "Затвори" }
  ]
}
```

---

## 🔐 Security & Privacy

### VAPID Keys

- Generate VAPID keys for Web Push
- Store private key securely (env variable)
- Public key sent to frontend for subscription

### User Privacy

- Users must explicitly opt-in
- Clear privacy policy
- Easy unsubscribe
- No location tracking without consent

---

## 📊 Notification Preferences

### User Settings

1. **Email Notifications**
   - Enable/disable
   - Frequency (immediate, daily digest, weekly)

2. **Push Notifications**
   - Enable/disable
   - Request permission
   - Test notification

3. **SMS Notifications** (Optional)
   - Enable/disable
   - Phone number verification

4. **Radius Settings**
   - Default: 3km
   - Customizable: 1km, 3km, 5km, 10km

5. **Timing Settings**
   - Notify before: 24h, 48h, 1 week
   - Quiet hours: 22:00 - 07:00

---

## 🧪 Testing Strategy

### Unit Tests

- Distance calculation
- Radius filtering
- Notification queuing
- Preference checking

### Integration Tests

- End-to-end notification flow
- Push subscription/unsubscription
- Email delivery
- Error handling

### Manual Testing

- Test push notifications on different browsers
- Test email templates
- Test notification preferences
- Test radius calculations

---

## 📈 Metrics & Monitoring

### Track

- Notification delivery rate
- Open/click rate
- Unsubscribe rate
- Error rate
- Delivery time

### Alerts

- High failure rate
- Queue backlog
- Service downtime

---

## 🚀 Deployment Checklist

### Backend

- [ ] Install Web Push library (`minishlink/web-push`)
- [ ] Generate VAPID keys
- [ ] Create database migrations
- [ ] Implement notification service
- [ ] Set up queue workers
- [ ] Configure email service
- [ ] Test notification delivery

### Frontend

- [ ] Register service worker
- [ ] Implement push subscription
- [ ] Create notification preferences UI
- [ ] Handle notification clicks
- [ ] Test on multiple browsers

### Infrastructure

- [ ] Set up queue system (Redis/Beanstalkd)
- [ ] Configure email service (SMTP/SendGrid)
- [ ] Set up SMS service (optional)
- [ ] Monitor notification delivery

---

## ⏱️ Estimated Effort

- **Backend Development**: 3-4 weeks
- **Frontend Development**: 2-3 weeks
- **Testing & QA**: 1-2 weeks
- **Total**: 6-9 weeks

---

## 🎯 Success Criteria

- ✅ Beekeepers receive notifications within 5 minutes of report
- ✅ 95%+ notification delivery rate
- ✅ User can customize preferences
- ✅ Works on major browsers (Chrome, Firefox, Safari, Edge)
- ✅ No performance impact on report submission

---

## 📝 Notes

- **V2 Feature**: Not blocking for initial release
- **Progressive Enhancement**: Works without push (email fallback)
- **Privacy First**: Opt-in only, clear consent
- **Scalable**: Queue-based for high volume

---

**This is a comprehensive plan for v2. The current implementation (v1) focuses on reporting and display. Push notifications can be added later without breaking changes.**

