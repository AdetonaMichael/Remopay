# Tier Upgrade Integration Guide — Next.js Web Application

**Version:** 1.0  
**Date:** June 19, 2026  
**Scope:** Web application using Next.js  
**Purpose:** API and integration documentation for tier upgrade workflow

---

## Overview

The tier upgrade system enables users to verify their identity and increase their account tier through a multi-step verification process:

- **Tier Zero (Basic):** Initial account tier (default for new users)
- **Tier One (Bronze):** Enhanced identity verification (personal details, BVN)
- **Tier Two (Silver):** Government-issued identity document verification

Each tier upgrade is an independent process that can be saved as a draft, resumed later, and tracked through its lifecycle.

---

## User Flow

### 1. **Initial State**
- User logs in and visits the Tier Upgrade page
- Frontend fetches user's current tier status and any existing upgrade applications
- Display shows current tier and next available tier

### 2. **Draft Saving (Optional)**
- User starts filling tier upgrade form
- User can save incomplete data as a draft at any time
- Draft data is persisted to backend
- User can leave and return later

### 3. **Resume Capability**
- When user visits tier upgrade page again, fetch existing draft/application
- Auto-populate form fields with previously saved data
- Show current progress and status
- Allow user to continue or modify previous entries

### 4. **Form Submission**
- User completes all required fields
- Frontend validates data locally
- Submit to backend endpoint
- Backend persists application and sends to Maplerad

### 5. **Status Tracking**
- Show application status (draft, submitted, processing, approved, rejected, failed)
- Display submission timestamp
- Show approval/rejection timestamp if applicable
- Display failure reason if rejected

---

## API Endpoints

### Base URL
```
https://api.remopay.com/api/v1/payment
```

### Authentication
All endpoints require:
- **Header:** `Authorization: Bearer {jwt_token}`
- **Method:** Sanctum authentication

---

### 1. Get Tier Upgrade Application

**Purpose:** Retrieve existing tier upgrade application (draft or submitted)  
**Method:** `GET`  
**Endpoint:** `/tier-upgrade/{tier}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tier` | string | Yes | Target tier: `zero`, `one`, or `two` |

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Application retrieved",
  "data": {
    "id": 1,
    "user_id": 123,
    "current_tier": "zero",
    "requested_tier": "one",
    "status": "draft",
    "status_label": "Draft",
    "form_data": {
      "dob": "15-08-1990",
      "phone": {
        "phone_country_code": "+234",
        "phone_number": "08012345678"
      },
      "address": {
        "street": "123 Main Street",
        "city": "Lagos",
        "state": "Lagos",
        "country": "Nigeria",
        "postal_code": "100001"
      },
      "identification_number": "12345678901",
      "photo": "https://res.cloudinary.com/..."
    },
    "failure_reason": null,
    "retry_count": 0,
    "can_retry": false,
    "submitted_at": null,
    "approved_at": null,
    "rejected_at": null,
    "failed_at": null,
    "maplerad_reference_id": null,
    "created_at": "2026-06-19T10:30:00Z",
    "updated_at": "2026-06-19T10:35:00Z"
  }
}
```

**Response (No Application - 404):**
```json
{
  "success": false,
  "message": "No existing application found for this tier",
  "data": null
}
```

**Response (Unauthorized - 401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### 2. Save Tier Upgrade Draft

**Purpose:** Save incomplete tier upgrade form data as draft  
**Method:** `POST`  
**Endpoint:** `/tier-upgrade/{tier}/save-draft`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tier` | string | Yes | Target tier: `zero`, `one`, or `two` |

**Request Body (Partial - All Fields Optional):**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "country": "Nigeria",
  "dob": "15-08-1990",
  "phone": {
    "phone_country_code": "+234",
    "phone_number": "08012345678"
  },
  "address": {
    "street": "123 Main Street",
    "street2": "Apt 10",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postal_code": "100001"
  },
  "identification_number": "12345678901",
  "photo": "https://res.cloudinary.com/...",
  "identity": {
    "type": "nin",
    "number": "12345678901",
    "country": "NG",
    "image": "https://..."
  }
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Draft saved successfully",
  "data": {
    "id": 1,
    "user_id": 123,
    "current_tier": "zero",
    "requested_tier": "one",
    "status": "draft",
    "status_label": "Draft",
    "form_data": {
      "dob": "15-08-1990",
      "phone": { ... }
    },
    "created_at": "2026-06-19T10:30:00Z",
    "updated_at": "2026-06-19T10:35:00Z"
  }
}
```

---

### 3. Submit Tier Upgrade

**Purpose:** Submit complete tier upgrade application for processing  
**Method:** `POST`  
**Endpoint:** `/tier-upgrade/{tier}/submit`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tier` | string | Yes | Target tier: `zero`, `one`, or `two` |

**Request Body (Complete - All Required Fields):**

#### For Tier Zero:
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "country": "Nigeria"
}
```

#### For Tier One:
```json
{
  "dob": "15-08-1990",
  "phone": {
    "phone_country_code": "+234",
    "phone_number": "08012345678"
  },
  "address": {
    "street": "123 Main Street",
    "street2": "Apt 10",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postal_code": "100001"
  },
  "identification_number": "12345678901",
  "photo": "https://res.cloudinary.com/..."
}
```

#### For Tier Two:
```json
{
  "identity": {
    "type": "nin",
    "image": "https://res.cloudinary.com/...",
    "number": "12345678901",
    "country": "NG"
  }
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Tier upgrade request successful",
  "data": {
    "customer": {
      "id": "uuid-string",
      "maplerad_id": "maplerad-uuid",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane@example.com",
      "tier": "one",
      "status": "active"
    },
    "application_id": 1
  }
}
```

**Response (Validation Error - 422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "identification_number": [
      "Identification number must be exactly 11 digits"
    ],
    "phone.phone_number": [
      "Phone number must be a valid Nigerian number"
    ]
  }
}
```

**Response (Application Pending - 400):**
```json
{
  "success": false,
  "message": "You already have a pending tier upgrade application. Please check your status or wait for approval."
}
```

---

### 4. Get Tier Upgrade Status

**Purpose:** Retrieve current status of tier upgrade application  
**Method:** `GET`  
**Endpoint:** `/tier-upgrade/{tier}/status`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tier` | string | Yes | Target tier: `zero`, `one`, or `two` |

**Response (With Application - 200):**
```json
{
  "success": true,
  "message": "Status retrieved",
  "data": {
    "status": "approved",
    "tier": "one",
    "application": {
      "id": 1,
      "user_id": 123,
      "current_tier": "zero",
      "requested_tier": "one",
      "status": "approved",
      "status_label": "Approved",
      "form_data": { ... },
      "failure_reason": null,
      "retry_count": 0,
      "can_retry": false,
      "submitted_at": "2026-06-19T10:35:00Z",
      "approved_at": "2026-06-19T10:45:00Z",
      "rejected_at": null,
      "failed_at": null,
      "maplerad_reference_id": "ref-12345",
      "created_at": "2026-06-19T10:30:00Z",
      "updated_at": "2026-06-19T10:45:00Z"
    }
  }
}
```

**Response (No Application - 200):**
```json
{
  "success": true,
  "message": "No existing application",
  "data": {
    "status": "not_started",
    "tier": "one",
    "application": null
  }
}
```

---

## Data Validation Rules

### Tier Zero (Basic)
| Field | Type | Format | Validation |
|-------|------|--------|-----------|
| `first_name` | String | N/A | Required, max 255 characters |
| `last_name` | String | N/A | Required, max 255 characters |
| `email` | String | Email | Required, valid email format |
| `country` | String | N/A | Required, country name or code |

### Tier One (Bronze)
| Field | Type | Format | Validation |
|-------|------|--------|-----------|
| `dob` | String | DD-MM-YYYY | Required, valid date |
| `phone.phone_country_code` | String | +234 | Required, country code with + prefix |
| `phone.phone_number` | String | 0801234567 | Required, Nigerian format: +234 or 0 followed by 10 digits |
| `address.street` | String | N/A | Required, street address |
| `address.street2` | String | N/A | Optional, apartment/unit number |
| `address.city` | String | N/A | Required, city name |
| `address.state` | String | N/A | Required, state/province |
| `address.country` | String | N/A | Required, country name |
| `address.postal_code` | String | N/A | Required, postal/zip code |
| `identification_number` | String | 11 digits | Required, exactly 11 numeric digits (BVN) |
| `photo` | String | URL | Optional, HTTPS URL to profile photo |

### Tier Two (Silver)
| Field | Type | Format | Validation |
|-------|------|--------|-----------|
| `identity.type` | String | Enum | Required, one of: `nin`, `passport`, `drivers_license`, `voters_card` |
| `identity.image` | String | URL | Required, HTTPS URL to identity document image |
| `identity.number` | String | N/A | Required, identity document number |
| `identity.country` | String | 2-char code | Required, ISO country code (e.g., NG, US) |

---

## Status Lifecycle

```
┌─────────┐
│ Draft   │ ← User saves incomplete form
└────┬────┘
     │ Submit with complete data
     ↓
┌──────────────┐
│ Processing   │ ← Backend sends to Maplerad
└────┬─────────┘
     │
     ├─→ ┌──────────┐
     │   │ Approved │ ← Maplerad approved
     │   └──────────┘
     │
     ├─→ ┌──────────┐
     │   │ Rejected │ ← Maplerad rejected
     │   └──────────┘
     │
     └─→ ┌────────┐
         │ Failed │ ← API error (can retry)
         └────────┘
```

**Status Values:**
- `draft` - Incomplete form saved locally
- `submitted` - Sent to Maplerad, awaiting response
- `processing` - Being processed by Maplerad
- `pending_review` - Awaiting manual review
- `approved` - Successfully approved, tier upgraded
- `rejected` - Rejected by Maplerad (cannot retry)
- `failed` - API error or timeout (can retry up to 3 times)

---

## Frontend Behavior Expectations

### 1. Form Preloading
When user visits tier upgrade page:
1. Fetch `GET /tier-upgrade/{tier}` to check for existing application
2. If found and in `draft` status:
   - Populate form fields from `form_data`
   - Display draft indicator
   - Show "Resume Draft" UI
3. If found and in `submitted` or `processing` status:
   - Lock form (read-only)
   - Display "Pending Approval" message
   - Show submission timestamp
4. If not found (404):
   - Display empty form
   - Show "Create New Application" option

### 2. Draft Saving
User should be able to save draft at any time:
1. Collect current form data
2. POST to `/tier-upgrade/{tier}/save-draft`
3. Handle success: Show "Draft saved" confirmation
4. Handle error: Show error message, allow user to retry

### 3. Form Submission
When user clicks "Submit":
1. Validate all required fields are filled
2. POST to `/tier-upgrade/{tier}/submit`
3. Show loading indicator
4. Handle success:
   - Clear form
   - Show "Submission successful" message
   - Display approval status or waiting message
   - Optionally navigate to status page
5. Handle 400+ errors:
   - Show validation errors
   - Highlight problem fields
   - Allow user to correct and retry

### 4. Status Display
Show application status with:
- Current tier badge
- Requested tier badge
- Status badge (Draft, Processing, Approved, etc.)
- Submission timestamp (if submitted)
- Approval timestamp (if approved)
- Failure reason (if rejected or failed)
- Retry button (if failed and can_retry is true)

### 5. Error Handling
- **422 Validation Error:** Show validation messages for each field
- **400 Business Logic Error:** Show user-friendly message (e.g., "Pending application exists")
- **401 Unauthorized:** Redirect to login
- **500 Server Error:** Show generic error message, suggest retry

---

## Common API Responses

### Successful Draft Save
```
HTTP 200
{
  "success": true,
  "message": "Draft saved successfully",
  "data": { application object }
}
```

### Successful Submission
```
HTTP 200
{
  "success": true,
  "message": "Tier upgrade request successful",
  "data": { customer object + application_id }
}
```

### Validation Error
```
HTTP 422
{
  "success": false,
  "message": "Validation failed",
  "errors": { field: [message] }
}
```

### No Existing Application
```
HTTP 404
{
  "success": false,
  "message": "No existing application found for this tier",
  "data": null
}
```

### Already Has Pending Application
```
HTTP 400
{
  "success": false,
  "message": "You already have a pending tier upgrade application. Please check your status or wait for approval."
}
```

---

## Implementation Checklist

**Frontend Integration:**
- [ ] Create tier upgrade page component
- [ ] Implement form fields for each tier
- [ ] Add GET endpoint call to fetch existing application on page load
- [ ] Implement draft save functionality (POST to save-draft endpoint)
- [ ] Implement form submission (POST to submit endpoint)
- [ ] Display status from GET status endpoint
- [ ] Handle all error responses gracefully
- [ ] Implement auto-population of form fields from application.form_data
- [ ] Show appropriate UI for different status values
- [ ] Add retry functionality for failed applications
- [ ] Add loading indicators during API calls
- [ ] Validate all required fields before submission

**User Experience:**
- [ ] Show "Draft saved" confirmation after saving
- [ ] Disable form fields when application is pending/processing
- [ ] Display clear status messages
- [ ] Show failure reason when application is rejected
- [ ] Allow editing and resubmission of rejected applications
- [ ] Prevent multiple simultaneous submissions
- [ ] Show progress indicator (e.g., "Step 2 of 3")
- [ ] Add confirmation before submitting completed application

---

## Testing Scenarios

### Scenario 1: New User - First Tier Upgrade
1. User visits Tier Upgrade page
2. No existing application (404)
3. User fills tier 0 form
4. User clicks "Save Draft"
5. Verify draft is saved
6. User completes form and submits
7. Verify submission succeeds

### Scenario 2: Resume Draft
1. User saves draft with partial data
2. User closes browser and leaves
3. User returns to Tier Upgrade page
4. Verify form is pre-populated with saved draft data
5. User modifies data and submits
6. Verify submission succeeds

### Scenario 3: Rejected Application
1. User submits tier upgrade
2. Maplerad rejects (status becomes "rejected")
3. GET status endpoint shows rejection reason
4. User modifies form based on reason
5. User can submit new application

### Scenario 4: Failed Application with Retry
1. User submits tier upgrade
2. Maplerad API returns error (status becomes "failed")
3. Show retry button (if retry_count < 3)
4. User clicks retry
5. Verify application is resubmitted

---

## Notes

- All timestamps are ISO 8601 format (e.g., "2026-06-19T10:30:00Z")
- Tier progression is linear: zero → one → two (users cannot skip tiers)
- Each user can have only one active (non-completed) application per tier
- Drafts are never automatically deleted; users can modify and resubmit
- Failed applications can be retried up to 3 times before requiring manual support
- All form data is stored as JSON for flexibility
- Maplerad reference IDs are provided for support inquiries

