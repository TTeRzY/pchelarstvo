# Future Development Roadmap - Version 2.0+

**Project**: Pchelarstvo.bg  
**Current Version**: 1.0  
**Last Updated**: 2025

---

## Overview

This document outlines planned features for future versions of Pchelarstvo.bg. These features will enhance the platform's value to the beekeeping community in Bulgaria.

---

## 🎯 Feature 1: EPORD Pesticide Treatment Alerts

### Overview
Extend the current swarm alert system to include pesticide treatment notifications from EPORD (Електронна платформа за оповестяване на растителнозащитни дейности).

**Reference**: [EPORD User Guide](https://bees4peace.com/blog/rykovodstvo-epord/)

### Current State
- ✅ Swarm alert system exists (`/api/swarm-alerts`)
- ✅ Swarm ticker component displays alerts
- ✅ Report swarm modal for user submissions
- ⚠️ EPORD link exists in map page but no integration

### EPORD System Analysis

**How EPORD Works:**
- Government GIS platform for reporting plant protection activities
- Farmers register planned pesticide treatments
- System automatically notifies beekeepers within **3km radius** of treatment area
- Notifications sent via email and SMS
- Requires apiary registration number (from BFSA)

**Key Requirements:**
1. Beekeeper must have registered apiary (BFSA registration number)
2. Apiary must be marked on map with GPS coordinates
3. System calculates 3km radius around treatment areas
4. Automatic notifications for treatments within radius

### Implementation Plan

#### Phase 1: Data Model & API (Backend)
```typescript
// New types needed
type PesticideTreatment = {
  id: string;
  treatmentId: string; // EPORD treatment ID
  farmerName: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  pesticide: {
    name: string;
    activeIngredient: string;
    registrationNumber: string;
  };
  treatmentDate: string;
  treatmentTime: string;
  cropType: string;
  area: number; // hectares
  radius: number; // notification radius (default 3km)
  status: 'planned' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
};

type TreatmentNotification = {
  id: string;
  treatmentId: string;
  apiaryId: string;
  userId: string;
  distance: number; // km from apiary
  notifiedAt: string;
  readAt: string | null;
  notificationMethod: 'email' | 'sms' | 'app';
};
```

**Backend Tasks:**
- [ ] Create `pesticide_treatments` table
- [ ] Create `treatment_notifications` table
- [ ] Create API endpoint: `POST /api/treatments/sync` (sync from EPORD)
- [ ] Create API endpoint: `GET /api/treatments` (list treatments)
- [ ] Create API endpoint: `GET /api/treatments/nearby` (treatments near apiary)
- [ ] Create notification service (calculate 3km radius, match apiaries)
- [ ] Create background job to sync EPORD data (daily/hourly)
- [ ] Create notification job (email/SMS/push)

#### Phase 2: EPORD Integration
**Options:**

**Option A: EPORD API Integration (Preferred)**
- Check if EPORD provides API access
- If yes, implement OAuth/API key authentication
- Sync treatments automatically

**Option B: Web Scraping (Fallback)**
- Scrape EPORD public data (if allowed)
- Parse treatment announcements
- Store in our database

**Option C: Manual Import**
- Allow farmers to manually report treatments
- Verify with EPORD registration number
- Store in our system

**Implementation:**
- [ ] Research EPORD API availability
- [ ] Implement chosen integration method
- [ ] Create sync service
- [ ] Add error handling and retry logic
- [ ] Add rate limiting

#### Phase 3: Frontend Components

**New Components:**
```typescript
// components/treatments/TreatmentAlert.tsx
// components/treatments/TreatmentTicker.tsx (extend SwarmTicker)
// components/treatments/TreatmentModal.tsx
// components/treatments/TreatmentMap.tsx
// app/treatments/page.tsx (treatment calendar/list)
```

**Features:**
- [ ] Extend `SwarmTicker` to show both swarms and treatments
- [ ] Create treatment alert modal (similar to swarm modal)
- [ ] Add treatment notifications to user dashboard
- [ ] Create treatment calendar view
- [ ] Add treatment map overlay (show treatment areas)
- [ ] Add treatment filters (date, pesticide, distance)
- [ ] Add treatment details page

#### Phase 4: Notification System
- [ ] Email notifications (using existing email service)
- [ ] SMS notifications (integrate SMS provider)
- [ ] In-app notifications (real-time updates)
- [ ] Push notifications (if PWA implemented)
- [ ] Notification preferences (user settings)

### Database Schema

```sql
-- Pesticide treatments table
CREATE TABLE pesticide_treatments (
  id UUID PRIMARY KEY,
  epord_treatment_id VARCHAR(255) UNIQUE,
  farmer_name VARCHAR(255),
  farmer_email VARCHAR(255),
  farmer_phone VARCHAR(50),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_address TEXT,
  pesticide_name VARCHAR(255),
  pesticide_registration_number VARCHAR(100),
  active_ingredient VARCHAR(255),
  treatment_date DATE,
  treatment_time TIME,
  crop_type VARCHAR(100),
  area_hectares DECIMAL(10, 2),
  notification_radius_km INT DEFAULT 3,
  status VARCHAR(20) DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Treatment notifications table
CREATE TABLE treatment_notifications (
  id UUID PRIMARY KEY,
  treatment_id UUID REFERENCES pesticide_treatments(id),
  apiary_id UUID REFERENCES apiaries(id),
  user_id UUID REFERENCES users(id),
  distance_km DECIMAL(8, 2),
  notified_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP NULL,
  notification_method VARCHAR(20),
  email_sent BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_treatments_location ON pesticide_treatments USING GIST (
  ll_to_earth(location_lat, location_lng)
);
CREATE INDEX idx_treatments_date ON pesticide_treatments(treatment_date);
CREATE INDEX idx_notifications_user ON treatment_notifications(user_id);
CREATE INDEX idx_notifications_apiary ON treatment_notifications(apiary_id);
```

### User Flow

1. **Beekeeper Registration:**
   - User registers apiary with BFSA registration number
   - System validates registration number
   - Apiary coordinates stored

2. **Treatment Sync:**
   - Background job syncs EPORD treatments daily
   - System calculates which apiaries are within 3km
   - Creates notifications for affected beekeepers

3. **Notification:**
   - Beekeeper receives email/SMS/in-app notification
   - Notification shows: treatment date, pesticide, distance, farmer contact
   - Beekeeper can view details and contact farmer

4. **Treatment Calendar:**
   - Beekeeper views upcoming treatments near their apiaries
   - Can filter by date, pesticide, distance
   - Can export calendar

### Technical Considerations

**Challenges:**
- EPORD API may not be publicly available
- Need to handle coordinate calculations (3km radius)
- Real-time sync may be difficult
- SMS costs for notifications

**Solutions:**
- Use PostGIS for efficient geospatial queries
- Implement caching for treatment data
- Batch notifications to reduce costs
- Provide opt-in/opt-out for notifications

### Estimated Effort
- **Backend**: 3-4 weeks
- **Frontend**: 2-3 weeks
- **Integration**: 1-2 weeks
- **Testing**: 1 week
- **Total**: 7-10 weeks

---

## 🏪 Feature 2: Beekeeper Virtual Stand/Stall

### Overview
Create a dedicated profile page where beekeepers can showcase their products, services, and apiary information - essentially a "virtual marketplace stall."

### Current State
- ✅ User profiles exist (`/profile`)
- ✅ Beekeeper directory exists (`/beekeepers`)
- ✅ Marketplace exists (`/marketplace`)
- ⚠️ No dedicated "stand" page combining all beekeeper info

### Implementation Plan

#### Phase 1: Data Model
```typescript
type BeekeeperStand = {
  id: string;
  userId: string;
  apiaryId: string;
  // Stand Information
  standName: string;
  description: string;
  logo?: string;
  coverImage?: string;
  // Products & Services
  products: Product[];
  services: Service[];
  // Contact & Location
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
    };
  };
  location: {
    address: string;
    city: string;
    region: string;
    coordinates: { lat: number; lng: number };
  };
  // Business Info
  businessHours?: string;
  certifications?: string[];
  yearsOfExperience?: number;
  // Statistics
  totalHives: number;
  honeyProduction: number; // kg/year
  // Settings
  isPublic: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type Product = {
  id: string;
  standId: string;
  name: string;
  description: string;
  category: 'honey' | 'wax' | 'propolis' | 'royal_jelly' | 'pollen' | 'other';
  price?: number;
  priceUnit?: 'kg' | 'liter' | 'piece';
  images: string[];
  availability: 'in_stock' | 'out_of_stock' | 'seasonal';
  season?: string;
  createdAt: string;
};

type Service = {
  id: string;
  standId: string;
  name: string;
  description: string;
  category: 'queen_breeding' | 'hive_rental' | 'consultation' | 'education' | 'other';
  price?: number;
  priceUnit?: 'hour' | 'day' | 'session' | 'fixed';
  availability: boolean;
  createdAt: string;
};
```

#### Phase 2: Backend API
- [ ] `GET /api/stands` - List all public stands
- [ ] `GET /api/stands/:id` - Get stand details
- [ ] `GET /api/stands/my` - Get current user's stand
- [ ] `POST /api/stands` - Create stand
- [ ] `PUT /api/stands/:id` - Update stand
- [ ] `POST /api/stands/:id/products` - Add product
- [ ] `PUT /api/stands/:id/products/:productId` - Update product
- [ ] `DELETE /api/stands/:id/products/:productId` - Remove product
- [ ] `POST /api/stands/:id/services` - Add service
- [ ] `GET /api/stands/search` - Search stands

#### Phase 3: Frontend Components

**New Pages:**
- [ ] `/stands` - Browse all stands
- [ ] `/stands/:id` - Stand detail page
- [ ] `/stands/my` - My stand (edit mode)
- [ ] `/stands/create` - Create stand wizard

**Components:**
```typescript
// components/stands/StandCard.tsx
// components/stands/StandHeader.tsx
// components/stands/ProductGallery.tsx
// components/stands/ServiceList.tsx
// components/stands/StandMap.tsx
// components/stands/StandContact.tsx
// components/stands/StandStats.tsx
// components/stands/EditStandModal.tsx
// components/stands/AddProductModal.tsx
// components/stands/AddServiceModal.tsx
```

**Features:**
- [ ] Stand profile page with customizable layout
- [ ] Product gallery with images
- [ ] Service listings
- [ ] Contact form/widget
- [ ] Map showing stand location
- [ ] Reviews/ratings (future)
- [ ] Social sharing
- [ ] QR code generation for stand URL

#### Phase 4: Integration with Existing Features
- [ ] Link stands to apiaries
- [ ] Link stands to marketplace listings
- [ ] Show stand info in beekeeper directory
- [ ] Add "Visit Stand" button to beekeeper profiles

### User Flow

1. **Create Stand:**
   - Beekeeper goes to "Create Stand"
   - Fills in basic info (name, description, logo)
   - Links to existing apiary
   - Adds products/services
   - Publishes stand

2. **Browse Stands:**
   - Users browse stands by region/category
   - Filter by products, services, location
   - View stand details
   - Contact beekeeper

3. **Manage Stand:**
   - Beekeeper edits stand info
   - Adds/removes products
   - Updates availability
   - Views analytics (visits, contacts)

### Design Considerations

**Stand Page Layout:**
```
┌─────────────────────────────────┐
│  Cover Image / Logo              │
│  Stand Name | Verified Badge     │
│  Description                     │
├─────────────────────────────────┤
│  Products Gallery                │
│  [Product Cards]                 │
├─────────────────────────────────┤
│  Services                        │
│  [Service List]                  │
├─────────────────────────────────┤
│  Location Map                   │
│  Contact Info                    │
├─────────────────────────────────┤
│  Statistics                      │
│  Reviews (future)                │
└─────────────────────────────────┘
```

### Estimated Effort
- **Backend**: 2-3 weeks
- **Frontend**: 3-4 weeks
- **Integration**: 1 week
- **Testing**: 1 week
- **Total**: 7-9 weeks

---

## 📅 Feature 3: Beekeeping Events Platform

### Overview
Create a platform where users can create, discover, and manage beekeeping events at local and national levels.

### Current State
- ✅ Calendar component exists (for beekeeping calendar/seasonal info)
- ⚠️ No event management system
- ⚠️ No event discovery

### Implementation Plan

#### Phase 1: Data Model
```typescript
type Event = {
  id: string;
  title: string;
  description: string;
  // Event Type
  type: 'workshop' | 'conference' | 'exhibition' | 'market' | 'meeting' | 'other';
  category: 'education' | 'networking' | 'commercial' | 'social';
  // Timing
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  isRecurring: boolean;
  recurrencePattern?: string; // 'weekly', 'monthly', 'yearly'
  // Location
  location: {
    name: string;
    address: string;
    city: string;
    region: string;
    coordinates?: { lat: number; lng: number };
    isOnline: boolean;
    onlineUrl?: string;
  };
  // Organization
  organizer: {
    userId: string;
    name: string;
    email: string;
    phone?: string;
  };
  // Event Details
  image?: string;
  maxAttendees?: number;
  currentAttendees: number;
  price: {
    amount: number;
    currency: 'BGN';
    isFree: boolean;
  };
  registrationRequired: boolean;
  registrationUrl?: string;
  // Content
  agenda?: string;
  speakers?: Speaker[];
  tags: string[];
  // Status
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  isPublic: boolean;
  // Metadata
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

type Speaker = {
  id: string;
  name: string;
  bio?: string;
  photo?: string;
  organization?: string;
};

type EventRegistration = {
  id: string;
  eventId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  registeredAt: string;
  notes?: string;
};
```

#### Phase 2: Backend API
- [ ] `GET /api/events` - List events (with filters)
- [ ] `GET /api/events/:id` - Get event details
- [ ] `GET /api/events/my` - Get user's events
- [ ] `POST /api/events` - Create event
- [ ] `PUT /api/events/:id` - Update event
- [ ] `DELETE /api/events/:id` - Delete event
- [ ] `POST /api/events/:id/register` - Register for event
- [ ] `GET /api/events/:id/registrations` - Get registrations (organizer only)
- [ ] `GET /api/events/calendar` - Get events for calendar view
- [ ] `GET /api/events/search` - Search events

#### Phase 3: Frontend Components

**New Pages:**
- [ ] `/events` - Browse events
- [ ] `/events/:id` - Event detail page
- [ ] `/events/create` - Create event
- [ ] `/events/my` - My events (created/registered)
- [ ] `/events/calendar` - Calendar view

**Components:**
```typescript
// components/events/EventCard.tsx
// components/events/EventDetail.tsx
// components/events/EventCalendar.tsx
// components/events/EventFilters.tsx
// components/events/CreateEventModal.tsx
// components/events/EventRegistration.tsx
// components/events/EventMap.tsx
// components/events/SpeakerList.tsx
```

**Features:**
- [ ] Event listing with filters (date, type, location, category)
- [ ] Event detail page with full information
- [ ] Calendar view (monthly/weekly/daily)
- [ ] Map view (show events on map)
- [ ] Event creation form
- [ ] Event registration
- [ ] Event management (edit, cancel, view registrations)
- [ ] Event reminders (email notifications)
- [ ] Event sharing (social media, email)
- [ ] Event search

#### Phase 4: Event Types

**Workshop:**
- Educational content
- Hands-on activities
- Materials needed
- Skill level

**Conference:**
- Multiple sessions
- Speaker lineup
- Agenda
- Networking opportunities

**Exhibition/Market:**
- Vendor listings
- Product showcases
- Market hours
- Entry fee

**Meeting:**
- Local beekeeper associations
- Discussion topics
- Meeting minutes (future)

### User Flow

1. **Create Event:**
   - User clicks "Create Event"
   - Fills in event details
   - Sets location (physical or online)
   - Adds image, agenda, speakers
   - Publishes event

2. **Discover Events:**
   - Users browse events by date/type/location
   - Filter by category, region
   - View event details
   - Register for event

3. **Manage Events:**
   - Organizer views registrations
   - Sends updates to attendees
   - Cancels/reschedules if needed
   - Marks event as completed

### Integration Points

- [ ] Link events to beekeeper stands
- [ ] Show events in beekeeper profiles
- [ ] Add events to home page (upcoming events)
- [ ] Email notifications for new events
- [ ] Calendar export (iCal format)

### Estimated Effort
- **Backend**: 2-3 weeks
- **Frontend**: 3-4 weeks
- **Integration**: 1 week
- **Testing**: 1 week
- **Total**: 7-9 weeks

---

## 📊 Implementation Priority

### Recommended Order:

1. **Beekeeper Virtual Stand** (Highest Priority)
   - Builds on existing marketplace
   - Direct value to beekeepers
   - Revenue potential
   - **Timeline**: Version 2.0

2. **Events Platform** (Medium Priority)
   - Community building
   - User engagement
   - **Timeline**: Version 2.1

3. **EPORD Integration** (Lower Priority - Complex)
   - Requires external integration
   - May need government cooperation
   - **Timeline**: Version 2.2 or later

### Alternative: Parallel Development
If resources allow, develop Features 1 and 2 in parallel (different teams), then Feature 3.

---

## 🔗 Feature Interconnections

### How Features Work Together:

1. **Stand + Events:**
   - Beekeepers can promote events on their stands
   - Events can link to organizer's stand

2. **EPORD + Stand:**
   - Treatment notifications shown on stand page
   - Stand location used for EPORD radius calculation

3. **Events + EPORD:**
   - Educational events about pesticide safety
   - Workshops on EPORD registration

4. **All Features:**
   - Unified beekeeper profile showing:
     - Stand/products
     - Apiaries (with EPORD alerts)
     - Events (organized/attended)

---

## 📝 Technical Requirements

### New Dependencies
```json
{
  "dependencies": {
    "@turf/turf": "^6.5.0", // Geospatial calculations (EPORD)
    "ical-generator": "^6.0.0", // Calendar export (Events)
    "date-fns": "^3.0.0", // Date handling (Events)
    "react-calendar": "^4.0.0", // Calendar component (Events)
    "react-image-gallery": "^1.3.0" // Image gallery (Stands)
  }
}
```

### Database Requirements
- PostGIS extension (for geospatial queries in EPORD)
- Full-text search (for event/stand search)
- Indexing for performance

### Third-Party Services
- SMS provider (for EPORD notifications)
- Email service (already in use)
- Image storage/CDN (for stand/event images)
- Payment gateway (for paid events, future)

---

## 🎯 Success Metrics

### EPORD Integration
- Number of beekeepers with registered apiaries
- Number of treatments synced per month
- Notification delivery rate
- User engagement with notifications

### Virtual Stands
- Number of active stands
- Stand page views
- Product/service listings
- Contact form submissions

### Events Platform
- Number of events created
- Event attendance rate
- User registrations
- Event search usage

---

## 🚀 Getting Started

### For Each Feature:

1. **Create Feature Branch:**
   ```bash
   git checkout -b feature/epord-integration
   git checkout -b feature/virtual-stands
   git checkout -b feature/events-platform
   ```

2. **Set Up Database:**
   - Create migrations
   - Add indexes
   - Seed test data

3. **Implement Backend:**
   - API endpoints
   - Business logic
   - Validation

4. **Implement Frontend:**
   - Components
   - Pages
   - Integration

5. **Testing:**
   - Unit tests
   - Integration tests
   - E2E tests

6. **Documentation:**
   - API documentation
   - User guides
   - Admin guides

---

## 📚 References

- [EPORD User Guide](https://bees4peace.com/blog/rykovodstvo-epord/)
- [EPORD Official Site](https://epord.bfsa.bg)
- Current Swarm Alert Implementation: `src/components/swarm/`
- Current Marketplace: `src/app/marketplace/`
- Current Beekeeper Directory: `src/app/beekeepers/`

---

**Next Steps:**
1. Review and prioritize features
2. Create detailed technical specifications
3. Set up project boards/tasks
4. Begin implementation with highest priority feature

