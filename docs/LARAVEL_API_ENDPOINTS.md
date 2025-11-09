# Laravel API Endpoints - Quick Reference

This document lists all the Laravel API endpoints that need to be implemented to support the admin dashboard.

## Authentication

All endpoints require Bearer token authentication:
```
Authorization: Bearer {token}
```

---

## Admin Statistics

### GET /api/admin/stats

Returns dashboard statistics.

**Response:**
```json
{
  "users": {
    "total": 150,
    "byRole": {
      "user": 120,
      "moderator": 20,
      "admin": 8,
      "super_admin": 2
    },
    "byStatus": {
      "active": 140,
      "suspended": 8,
      "banned": 2
    },
    "todayRegistrations": 5,
    "verifiedCount": 130
  },
  "listings": {
    "total": 450,
    "byStatus": {
      "pending": 15,
      "approved": 300,
      "rejected": 20,
      "active": 250,
      "completed": 50,
      "flagged": 5
    },
    "todayListings": 12
  },
  "recentActivity": [
    {
      "id": "listing-123",
      "type": "listing_moderation",
      "action": "approved",
      "targetTitle": "Мед от Акация",
      "moderatedBy": "admin-user-id",
      "moderatedAt": "2025-11-07T10:30:00Z"
    }
  ],
  "generatedAt": "2025-11-07T12:00:00Z"
}
```

---

## User Management

### GET /api/admin/users

Get paginated list of users with filters.

**Query Parameters:**
- `role` (optional): `user`, `moderator`, `admin`, `super_admin`
- `status` (optional): `active`, `suspended`, `banned`
- `search` (optional): Search by name or email
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Items per page (default: 20)

**Response:**
```json
{
  "users": [
    {
      "id": "user-123",
      "name": "Иван Петров",
      "email": "ivan@example.com",
      "role": "user",
      "status": "active",
      "verifiedAt": "2025-01-15T10:00:00Z",
      "trustLevel": "gold",
      "createdAt": "2025-01-01T00:00:00Z",
      "lastLoginAt": "2025-11-07T09:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "perPage": 20
}
```

### GET /api/admin/users/{id}

Get single user by ID.

**Response:**
```json
{
  "id": "user-123",
  "name": "Иван Петров",
  "email": "ivan@example.com",
  "role": "user",
  "status": "active",
  "verifiedAt": "2025-01-15T10:00:00Z",
  "trustLevel": "gold",
  "createdAt": "2025-01-01T00:00:00Z",
  "lastLoginAt": "2025-11-07T09:00:00Z"
}
```

### PATCH /api/admin/users/{id}

Update user details.

**Request Body:**
```json
{
  "name": "Иван Петров Updated",
  "role": "moderator",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "name": "Иван Петров Updated",
    "email": "ivan@example.com",
    "role": "moderator",
    "status": "active",
    "verifiedAt": "2025-01-15T10:00:00Z",
    "trustLevel": "gold",
    "createdAt": "2025-01-01T00:00:00Z",
    "lastLoginAt": "2025-11-07T09:00:00Z"
  }
}
```

### DELETE /api/admin/users/{id}

Delete user (super admin only).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### POST /api/admin/users/{id}/verify

Manually verify user account.

**Response:**
```json
{
  "success": true,
  "message": "User verified successfully",
  "user": {
    "id": "user-123",
    "verifiedAt": "2025-11-07T12:00:00Z",
    ...
  }
}
```

### POST /api/admin/users/{id}/suspend

Suspend user account.

**Request Body:**
```json
{
  "reason": "Violation of community guidelines"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User suspended successfully",
  "user": {
    "id": "user-123",
    "status": "suspended",
    ...
  }
}
```

### POST /api/admin/users/{id}/activate

Reactivate suspended user.

**Response:**
```json
{
  "success": true,
  "message": "User activated successfully",
  "user": {
    "id": "user-123",
    "status": "active",
    ...
  }
}
```

---

## Listing Management

### GET /api/admin/listings

Get all listings (including non-public) with filters.

**Query Parameters:**
- `status` (optional): `pending`, `approved`, `rejected`, `active`, `completed`, `flagged`
- `search` (optional): Search by title, product, or region
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Items per page (default: 20)

**Response:**
```json
{
  "listings": [
    {
      "id": "listing-123",
      "createdAt": "2025-11-05T10:00:00Z",
      "type": "sell",
      "product": "мед",
      "title": "Мед от Акация",
      "quantityKg": 50,
      "pricePerKg": 15.50,
      "region": "София",
      "city": "София",
      "contactName": "Иван Петров",
      "phone": "+359888123456",
      "email": "ivan@example.com",
      "description": "Качествен акациев мед",
      "status": "pending",
      "user": {
        "id": "user-123",
        "name": "Иван Петров",
        "email": "ivan@example.com"
      },
      "moderatedBy": null,
      "moderatedAt": null,
      "rejectionReason": null,
      "flagCount": 0
    }
  ],
  "total": 450,
  "page": 1,
  "perPage": 20
}
```

### GET /api/admin/listings/pending

Get pending listings queue (oldest first).

**Response:**
```json
{
  "listings": [
    {
      "id": "listing-123",
      "title": "Мед от Акация",
      "status": "pending",
      "createdAt": "2025-11-05T10:00:00Z",
      ...
    }
  ],
  "count": 15
}
```

### GET /api/admin/listings/flagged

Get flagged listings (highest flag count first).

**Response:**
```json
{
  "listings": [
    {
      "id": "listing-456",
      "title": "Suspicious Listing",
      "status": "flagged",
      "flagCount": 5,
      ...
    }
  ],
  "count": 5
}
```

### POST /api/admin/listings/{id}/approve

Approve a pending listing.

**Response:**
```json
{
  "success": true,
  "message": "Listing approved successfully",
  "listing": {
    "id": "listing-123",
    "status": "approved",
    "moderatedBy": "admin-user-id",
    "moderatedAt": "2025-11-07T12:00:00Z",
    "rejectionReason": null,
    ...
  }
}
```

### POST /api/admin/listings/{id}/reject

Reject a listing with reason.

**Request Body:**
```json
{
  "reason": "Недостатъчно информация за продукта"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Listing rejected",
  "listing": {
    "id": "listing-123",
    "status": "rejected",
    "moderatedBy": "admin-user-id",
    "moderatedAt": "2025-11-07T12:00:00Z",
    "rejectionReason": "Недостатъчно информация за продукта",
    ...
  }
}
```

---

## Error Responses

All endpoints should return appropriate HTTP status codes with error messages:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**400 Bad Request:**
```json
{
  "error": "Invalid request data",
  "details": {
    "field": "reason",
    "message": "Reason is required (minimum 5 characters)"
  }
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Notes

- All timestamps should be in ISO 8601 format (UTC)
- All endpoints require authentication
- Role-based permissions should be enforced server-side
- Search should be case-insensitive
- Pagination should include total count
- Activity logs should be recorded for audit trail
- Email notifications should be sent for:
  - User verification
  - User suspension/activation
  - Listing approval/rejection

---

## Testing

Use these tools to test your Laravel endpoints:

1. **Postman/Insomnia**: Import the endpoints and test manually
2. **Laravel Testing**: Write feature tests for each endpoint
3. **Next.js Dev Tools**: Monitor network requests from the admin dashboard

Example test request:
```bash
curl -X GET "http://127.0.0.1:8000/api/admin/stats" \
  -H "Authorization: Bearer {your-token}" \
  -H "Accept: application/json"
```

