# Airtime-to-Cash Conversion Implementation Guide - Web (Next.js)

## Overview

The Remopay Airtime-to-Cash Conversion system allows users to convert mobile phone airtime into cash that gets credited to their wallets. Admins review and approve conversions through a dashboard. This guide provides complete endpoint documentation, request/response formats, and implementation expectations for both user and admin interfaces on Next.js.

**API Version:** v1  
**Authentication:** Required (Bearer token via Sanctum)  
**Base URL:** `https://remopay.example.com/api/v1`  
**Framework:** Next.js 13+ (App Router/Pages Router compatible)

---

## System Overview

### Conversion Flow

1. **User Initiates** → User requests airtime conversion with amount and provider
2. **Instructions Provided** → System returns provider details and receiving number
3. **User Transfers** → User manually transfers airtime to receiving number
4. **Submit Proof** → User uploads screenshot of successful transfer
5. **Admin Review** → Admin views pending requests and screenshot
6. **Admin Approves/Rejects** → Admin approves or rejects with reason
7. **Automatic Processing** → System credits wallet after approval
8. **Completion** → Transaction marked complete, user notified

### Status Flow

```
PENDING 
  ↓ (user submits proof)
TRANSFER_SUBMITTED
  ↓ (admin reviews)
VERIFICATION_IN_PROGRESS (optional)
  ├→ APPROVED (if valid)
  │    ↓
  │  PROCESSING
  │    ↓
  │  COMPLETED ✓
  │
  └→ REJECTED (if invalid)
```

### Key Concepts

- **Airtime Amount**: Initial amount of airtime user sends (in NGN)
- **Service Fee**: Percentage deducted from airtime amount (default 5%)
- **Conversion Rate**: How much cash received per NGN after fees (varies by provider)
- **Net Amount**: Airtime amount minus service fee
- **Cash Credited**: Final amount credited to wallet after conversion
- **Settlement Method**: How user receives cash (wallet = directly to account)

---

## Prerequisites

Before implementing, ensure:

- User is authenticated with valid Sanctum Bearer token
- User has wallet with at least minimum airtime conversion amount
- Admin has admin role and permissions
- User has phone number to transfer airtime from
- Screenshot capability on frontend for proof submission
- File upload/attachment handling for screenshot submission

---

## USER ENDPOINTS

### 1. Get Available Providers

Get list of supported mobile network providers with their details.

**Endpoint:** `GET /airtime/providers`  
**Full URL:** `GET https://remopay.example.com/api/v1/airtime/providers`  
**Authentication:** Required (Bearer token)

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Available providers retrieved successfully",
  "data": {
    "providers": [
      {
        "code": "mtn",
        "name": "MTN",
        "logo_url": "https://example.com/mtn-logo.png",
        "conversion_rate": 0.80,
        "service_fee_percentage": 0.05,
        "is_active": true,
        "receiving_number": "08010000000",
        "min_amount": 50,
        "max_amount": 50000
      },
      {
        "code": "airtel",
        "name": "Airtel",
        "logo_url": "https://example.com/airtel-logo.png",
        "conversion_rate": 0.78,
        "service_fee_percentage": 0.05,
        "is_active": true,
        "receiving_number": "08020000000",
        "min_amount": 50,
        "max_amount": 50000
      },
      {
        "code": "glo",
        "name": "Globacom",
        "logo_url": "https://example.com/glo-logo.png",
        "conversion_rate": 0.75,
        "service_fee_percentage": 0.05,
        "is_active": true,
        "receiving_number": "08030000000",
        "min_amount": 50,
        "max_amount": 50000
      },
      {
        "code": "9mobile",
        "name": "9mobile",
        "logo_url": "https://example.com/9mobile-logo.png",
        "conversion_rate": 0.70,
        "service_fee_percentage": 0.05,
        "is_active": true,
        "receiving_number": "08040000000",
        "min_amount": 50,
        "max_amount": 50000
      }
    ]
  }
}
```

#### Provider Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Provider identifier (mtn, airtel, glo, 9mobile) |
| `name` | string | Display name of provider |
| `logo_url` | string | URL to provider logo image |
| `conversion_rate` | decimal | How much cash received per NGN after fees (0.70-0.80) |
| `service_fee_percentage` | decimal | Percentage fee deducted from airtime (typically 0.05 = 5%) |
| `is_active` | boolean | Whether provider is accepting conversions |
| `receiving_number` | string | Phone number to which airtime should be sent |
| `min_amount` | integer | Minimum airtime amount in NGN |
| `max_amount` | integer | Maximum airtime amount in NGN |

---

### 2. Initiate Airtime Conversion

Start a new airtime conversion request.

**Endpoint:** `POST /airtime/initiate`  
**Full URL:** `POST https://remopay.example.com/api/v1/airtime/initiate`  
**Authentication:** Required (Bearer token)

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Request Body

```json
{
  "phone_number": "08012345678",
  "provider": "mtn",
  "airtime_amount": 10000,
  "settlement_method": "wallet",
  "notes": "Optional notes about the conversion"
}
```

#### Request Field Specifications

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|-------------------|
| `phone_number` | string | ✅ | User's phone number to transfer from | 10-11 digits; format: 080xxxxxxxxx or 0701xxxxxxxx |
| `provider` | string | ✅ | Mobile network provider code | Must be one of: mtn, airtel, glo, 9mobile |
| `airtime_amount` | integer | ✅ | Amount of airtime to convert | Must be >= min_amount and <= max_amount for provider |
| `settlement_method` | string | ✅ | How to receive converted cash | Currently only: wallet |
| `notes` | string | ❌ | Optional notes about request | Max 500 characters |

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Airtime conversion request created successfully",
  "data": {
    "transaction": {
      "id": 1,
      "user_id": 5,
      "phone_number": "08012345678",
      "provider": "mtn",
      "airtime_amount": 10000,
      "gross_amount": 10000,
      "service_fee": 500,
      "service_fee_percentage": 0.05,
      "net_amount": 9500,
      "cash_credited": 0,
      "conversion_rate": 0.80,
      "settlement_method": "wallet",
      "status": "pending",
      "reference": "AIRTIME_ABC123DEF456GHI789",
      "screenshot_url": null,
      "screenshot_uploaded_at": null,
      "approved_by": null,
      "approved_at": null,
      "rejection_reason": null,
      "rejected_by": null,
      "rejected_at": null,
      "completed_at": null,
      "notes": "Optional notes",
      "created_at": "2026-05-29T10:00:00Z",
      "updated_at": "2026-05-29T10:00:00Z"
    },
    "instructions": {
      "reference": "AIRTIME_ABC123DEF456GHI789",
      "provider": "MTN",
      "provider_logo": "https://example.com/mtn-logo.png",
      "receiving_number": "08010000000",
      "airtime_amount": 10000,
      "sender_number": "08012345678",
      "settlement_method": "wallet",
      "expiration_time": "2026-05-30T10:00:00Z",
      "terms": "Please transfer the airtime amount to the receiving number and upload a screenshot proof within 24 hours."
    }
  }
}
```

#### Response Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `transaction.id` | integer | Unique transaction ID in system |
| `transaction.reference` | string | Unique reference code for tracking |
| `transaction.status` | string | Current status: pending |
| `instructions.receiving_number` | string | Phone number user must send airtime to |
| `instructions.expiration_time` | string | When request expires if not completed (ISO 8601) |

#### Error Response - Validation Error (422 Unprocessable Entity)

```json
{
  "success": false,
  "message": "The phone_number field is required",
  "errors": {
    "phone_number": ["The phone_number field must be 10-11 digits"]
  }
}
```

#### Error Response - Business Logic Error (422 Unprocessable Entity)

```json
{
  "success": false,
  "message": "Daily limit exceeded. Remaining today: ₦123456"
}
```

#### Common Error Messages and Causes

| Message | Cause | Solution |
|---------|-------|----------|
| "The phone_number field must be 10-11 digits" | Invalid phone number format | Ensure 10-11 digit Nigerian number |
| "Minimum airtime amount is ₦50" | Amount below minimum | Increase amount to at least minimum for provider |
| "Maximum airtime amount is ₦50000" | Amount above maximum | Reduce amount to not exceed maximum |
| "Daily limit exceeded" | User exceeded daily conversion limit | Wait until next day or reduce amount |
| "Unsupported settlement method" | Invalid settlement method | Use "wallet" |
| "Provider not found or inactive" | Provider code invalid or disabled | Select from available providers |

---

### 3. Submit Transfer Proof

Submit screenshot proof of airtime transfer to receiving number.

**Endpoint:** `POST /airtime/{id}/submit-proof`  
**Full URL:** `POST https://remopay.example.com/api/v1/airtime/{id}/submit-proof`  
**Authentication:** Required (Bearer token)  
**Parameters:** `{id}` = Transaction ID

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Request Body

```json
{
  "screenshot_url": "https://example.com/uploads/screenshot_abc123.png"
}
```

#### Request Field Specifications

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|-------------------|
| `screenshot_url` | string | ✅ | URL to uploaded screenshot image | Valid URL; must be publicly accessible |

#### Upload Flow

1. **Upload Image First**: Upload screenshot to file storage (S3, local, etc.)
2. **Get URL**: Obtain public URL of uploaded image
3. **Submit URL**: Submit URL via this endpoint

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Proof submitted successfully. Awaiting admin verification.",
  "data": {
    "transaction": {
      "id": 1,
      "user_id": 5,
      "phone_number": "08012345678",
      "provider": "mtn",
      "airtime_amount": 10000,
      "gross_amount": 10000,
      "service_fee": 500,
      "service_fee_percentage": 0.05,
      "net_amount": 9500,
      "cash_credited": 0,
      "conversion_rate": 0.80,
      "settlement_method": "wallet",
      "status": "transfer_submitted",
      "reference": "AIRTIME_ABC123DEF456GHI789",
      "screenshot_url": "https://example.com/uploads/screenshot_abc123.png",
      "screenshot_uploaded_at": "2026-05-29T10:15:00Z",
      "approved_by": null,
      "approved_at": null,
      "rejection_reason": null,
      "rejected_by": null,
      "rejected_at": null,
      "completed_at": null,
      "notes": null,
      "created_at": "2026-05-29T10:00:00Z",
      "updated_at": "2026-05-29T10:15:00Z"
    }
  }
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "message": "Transaction not found"
}
```

#### Error Response (403 Forbidden)

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

#### Error Response - Invalid Status (422)

```json
{
  "success": false,
  "message": "Cannot submit proof for transaction with status: transfer_submitted"
}
```

---

### 4. Get Conversion History

Retrieve user's conversion transaction history with filtering and pagination.

**Endpoint:** `GET /airtime/history`  
**Full URL:** `GET https://remopay.example.com/api/v1/airtime/history`  
**Authentication:** Required (Bearer token)

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter by status (pending, transfer_submitted, approved, completed, rejected) |
| `provider` | string | - | Filter by provider (mtn, airtel, glo, 9mobile) |
| `start_date` | string | - | Filter from date (format: YYYY-MM-DD) |
| `end_date` | string | - | Filter to date (format: YYYY-MM-DD) |
| `per_page` | integer | 15 | Records per page for pagination |
| `page` | integer | 1 | Page number |

#### Example Request

```
GET /api/v1/airtime/history?status=completed&provider=mtn&per_page=10&page=1
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Conversion history retrieved",
  "data": {
    "data": [
      {
        "id": 3,
        "user_id": 5,
        "phone_number": "08012345678",
        "provider": "mtn",
        "airtime_amount": 5000,
        "gross_amount": 5000,
        "service_fee": 250,
        "service_fee_percentage": 0.05,
        "net_amount": 4750,
        "cash_credited": 3800,
        "conversion_rate": 0.80,
        "settlement_method": "wallet",
        "status": "completed",
        "reference": "AIRTIME_XYZ789UVW123",
        "screenshot_url": "https://example.com/uploads/screenshot_xyz.png",
        "screenshot_uploaded_at": "2026-05-28T15:30:00Z",
        "approved_by": 2,
        "approved_at": "2026-05-28T16:00:00Z",
        "rejection_reason": null,
        "rejected_by": null,
        "rejected_at": null,
        "completed_at": "2026-05-28T16:10:00Z",
        "created_at": "2026-05-28T15:00:00Z",
        "updated_at": "2026-05-28T16:10:00Z"
      },
      {
        "id": 1,
        "user_id": 5,
        "phone_number": "08012345678",
        "provider": "airtel",
        "airtime_amount": 10000,
        "gross_amount": 10000,
        "service_fee": 500,
        "service_fee_percentage": 0.05,
        "net_amount": 9500,
        "cash_credited": 7410,
        "conversion_rate": 0.78,
        "settlement_method": "wallet",
        "status": "completed",
        "reference": "AIRTIME_ABC123DEF",
        "screenshot_url": "https://example.com/uploads/screenshot_abc.png",
        "screenshot_uploaded_at": "2026-05-27T14:20:00Z",
        "approved_by": 2,
        "approved_at": "2026-05-27T14:45:00Z",
        "rejection_reason": null,
        "rejected_by": null,
        "rejected_at": null,
        "completed_at": "2026-05-27T14:55:00Z",
        "created_at": "2026-05-27T14:00:00Z",
        "updated_at": "2026-05-27T14:55:00Z"
      }
    ],
    "current_page": 1,
    "per_page": 15,
    "total": 2,
    "last_page": 1,
    "next_page_url": null,
    "prev_page_url": null
  },
  "summary": {
    "total_requests": 2,
    "completed": 2,
    "rejected": 0,
    "pending": 0,
    "total_converted": 11210,
    "total_fees_paid": 750
  }
}
```

#### Pagination Fields

| Field | Type | Description |
|-------|------|-------------|
| `current_page` | integer | Current page number |
| `per_page` | integer | Records per page |
| `total` | integer | Total number of records |
| `last_page` | integer | Last page number |
| `next_page_url` | string/null | URL to next page or null |
| `prev_page_url` | string/null | URL to previous page or null |

#### Summary Fields

| Field | Type | Description |
|-------|------|-------------|
| `total_requests` | integer | Total conversion requests by user |
| `completed` | integer | Successfully completed conversions |
| `rejected` | integer | Rejected conversions |
| `pending` | integer | Pending conversions awaiting completion |
| `total_converted` | decimal | Total cash credited from conversions |
| `total_fees_paid` | decimal | Total service fees paid |

---

### 5. Get Single Transaction

Get detailed information about a specific conversion transaction.

**Endpoint:** `GET /airtime/{id}`  
**Full URL:** `GET https://remopay.example.com/api/v1/airtime/{id}`  
**Authentication:** Required (Bearer token)  
**Parameters:** `{id}` = Transaction ID

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Transaction details retrieved",
  "data": {
    "id": 1,
    "user_id": 5,
    "phone_number": "08012345678",
    "provider": "mtn",
    "airtime_amount": 10000,
    "gross_amount": 10000,
    "service_fee": 500,
    "service_fee_percentage": 0.05,
    "net_amount": 9500,
    "cash_credited": 7600,
    "conversion_rate": 0.80,
    "settlement_method": "wallet",
    "status": "completed",
    "reference": "AIRTIME_ABC123DEF456GHI789",
    "screenshot_url": "https://example.com/uploads/screenshot_abc123.png",
    "screenshot_uploaded_at": "2026-05-29T10:15:00Z",
    "approved_by": 2,
    "approved_at": "2026-05-29T10:30:00Z",
    "rejection_reason": null,
    "rejected_by": null,
    "rejected_at": null,
    "completed_at": "2026-05-29T10:35:00Z",
    "notes": "Verified successful transfer",
    "created_at": "2026-05-29T10:00:00Z",
    "updated_at": "2026-05-29T10:35:00Z"
  }
}
```

---

### 6. Get User Statistics

Get aggregated conversion statistics for the authenticated user.

**Endpoint:** `GET /airtime/stats`  
**Full URL:** `GET https://remopay.example.com/api/v1/airtime/stats`  
**Authentication:** Required (Bearer token)

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Statistics retrieved",
  "data": {
    "total_requests": 15,
    "completed": 12,
    "pending": 2,
    "rejected": 1,
    "total_converted": 85500,
    "total_fees_paid": 4500
  }
}
```

#### Statistics Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `total_requests` | integer | Total conversion requests initiated |
| `completed` | integer | Successfully completed conversions |
| `pending` | integer | Currently pending/in-progress conversions |
| `rejected` | integer | Conversions rejected by admin |
| `total_converted` | decimal | Total cash credited from all conversions |
| `total_fees_paid` | decimal | Total service fees deducted |

---

## ADMIN ENDPOINTS

### 1. Admin Dashboard

Get overview metrics and statistics for dashboard display.

**Endpoint:** `GET /admin/airtime/dashboard`  
**Full URL:** `GET https://remopay.example.com/api/v1/admin/airtime/dashboard`  
**Authentication:** Required (Bearer token + Admin role)

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Dashboard metrics retrieved",
  "data": {
    "overview": {
      "total_requests": 150,
      "pending_approval": 8,
      "approved_today": 12,
      "completed_today": 10
    },
    "volume": {
      "today_total_converted": 125000,
      "this_month_total_converted": 2500000,
      "today_airtime_received": 156250,
      "this_month_airtime_received": 3125000
    },
    "revenue": {
      "today_fees_earned": 12500,
      "this_month_fees_earned": 250000,
      "total_fees_earned": 850000
    },
    "status": {
      "completed": 120,
      "rejected": 15,
      "pending": 8
    },
    "by_provider": {
      "MTN": {
        "total_requests": 50,
        "completed": 45,
        "rejected": 3,
        "total_airtime_received": 625000,
        "total_cash_converted": 500000,
        "total_fees": 31250
      },
      "Airtel": {
        "total_requests": 40,
        "completed": 35,
        "rejected": 3,
        "total_airtime_received": 500000,
        "total_cash_converted": 390000,
        "total_fees": 25000
      },
      "Globacom": {
        "total_requests": 35,
        "completed": 30,
        "rejected": 4,
        "total_airtime_received": 437500,
        "total_cash_converted": 328125,
        "total_fees": 21875
      },
      "9mobile": {
        "total_requests": 25,
        "completed": 10,
        "rejected": 5,
        "total_airtime_received": 312500,
        "total_cash_converted": 218750,
        "total_fees": 15625
      }
    }
  }
}
```

---

### 2. Get Pending Conversions

Get all pending conversion requests awaiting admin approval.

**Endpoint:** `GET /admin/airtime/pending`  
**Full URL:** `GET https://remopay.example.com/api/v1/admin/airtime/pending`  
**Authentication:** Required (Bearer token + Admin role)

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `per_page` | integer | 15 | Records per page |
| `page` | integer | 1 | Page number |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Pending requests retrieved",
  "data": {
    "data": [
      {
        "id": 5,
        "user_id": 8,
        "user": {
          "id": 8,
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com",
          "phone": "08012345678"
        },
        "phone_number": "08012345678",
        "provider": "mtn",
        "airtime_amount": 15000,
        "gross_amount": 15000,
        "service_fee": 750,
        "service_fee_percentage": 0.05,
        "net_amount": 14250,
        "cash_credited": 0,
        "conversion_rate": 0.80,
        "settlement_method": "wallet",
        "status": "transfer_submitted",
        "reference": "AIRTIME_DEF456GHI789",
        "screenshot_url": "https://example.com/uploads/screenshot_def456.png",
        "screenshot_uploaded_at": "2026-05-29T14:30:00Z",
        "approved_by": null,
        "approved_at": null,
        "created_at": "2026-05-29T14:00:00Z",
        "updated_at": "2026-05-29T14:30:00Z"
      }
    ],
    "current_page": 1,
    "per_page": 15,
    "total": 8,
    "last_page": 1
  }
}
```

---

### 3. Get All Conversions (with Filters)

Get all conversion transactions with advanced filtering, sorting, and pagination.

**Endpoint:** `GET /admin/airtime`  
**Full URL:** `GET https://remopay.example.com/api/v1/admin/airtime`  
**Authentication:** Required (Bearer token + Admin role)

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `provider` | string | Filter by provider code |
| `user_id` | integer | Filter by user ID |
| `reference` | string | Search by reference number (partial match) |
| `phone_number` | string | Search by phone number (partial match) |
| `start_date` | string | Filter from date (YYYY-MM-DD) |
| `end_date` | string | Filter to date (YYYY-MM-DD) |
| `sort_by` | string | Sort field (created_at, airtime_amount, cash_credited, status) |
| `sort_order` | string | Sort order (asc, desc) |
| `per_page` | integer | Records per page (default: 15) |
| `page` | integer | Page number (default: 1) |

#### Example Request

```
GET /api/v1/admin/airtime?status=completed&provider=mtn&sort_by=created_at&sort_order=desc&per_page=20
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Transactions retrieved",
  "data": {
    "data": [
      {
        "id": 1,
        "user_id": 5,
        "user": {
          "id": 5,
          "first_name": "Jane",
          "last_name": "Smith",
          "email": "jane@example.com"
        },
        "phone_number": "08012345678",
        "provider": "mtn",
        "airtime_amount": 10000,
        "service_fee": 500,
        "cash_credited": 7600,
        "status": "completed",
        "reference": "AIRTIME_ABC123",
        "screenshot_url": "https://example.com/uploads/screenshot_abc.png",
        "approved_by": 2,
        "approved_at": "2026-05-29T10:30:00Z",
        "completed_at": "2026-05-29T10:35:00Z",
        "created_at": "2026-05-29T10:00:00Z"
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 150,
    "last_page": 8
  }
}
```

---

### 4. Get Single Transaction (Admin View)

Get detailed view of a conversion transaction with relationships.

**Endpoint:** `GET /admin/airtime/{id}`  
**Full URL:** `GET https://remopay.example.com/api/v1/admin/airtime/{id}`  
**Authentication:** Required (Bearer token + Admin role)  
**Parameters:** `{id}` = Transaction ID

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Transaction details retrieved",
  "data": {
    "id": 5,
    "user_id": 8,
    "user": {
      "id": 8,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "08012345678",
      "created_at": "2026-01-15T08:00:00Z"
    },
    "phone_number": "08012345678",
    "provider": "mtn",
    "providerConfig": {
      "code": "mtn",
      "name": "MTN",
      "conversion_rate": 0.80,
      "service_fee_percentage": 0.05,
      "receiving_number": "08010000000"
    },
    "airtime_amount": 15000,
    "gross_amount": 15000,
    "service_fee": 750,
    "service_fee_percentage": 0.05,
    "net_amount": 14250,
    "cash_credited": 11400,
    "conversion_rate": 0.80,
    "settlement_method": "wallet",
    "status": "completed",
    "reference": "AIRTIME_DEF456GHI789",
    "screenshot_url": "https://example.com/uploads/screenshot_def456.png",
    "screenshot_uploaded_at": "2026-05-29T14:30:00Z",
    "approved_by": 2,
    "approved_at": "2026-05-29T15:00:00Z",
    "rejection_reason": null,
    "rejected_by": null,
    "rejected_at": null,
    "completed_at": "2026-05-29T15:05:00Z",
    "approvedBy": {
      "id": 2,
      "first_name": "Admin",
      "last_name": "User",
      "email": "admin@example.com"
    },
    "auditLogs": [
      {
        "id": 1,
        "action": "created",
        "performed_by_user_id": 8,
        "performed_by_admin_id": null,
        "old_values": {},
        "new_values": {
          "id": 5,
          "user_id": 8,
          "reference": "AIRTIME_DEF456GHI789"
        },
        "metadata": {},
        "created_at": "2026-05-29T14:00:00Z"
      },
      {
        "id": 2,
        "action": "proof_submitted",
        "performed_by_user_id": 8,
        "performed_by_admin_id": null,
        "old_values": {
          "screenshot_url": null,
          "status": "pending"
        },
        "new_values": {
          "screenshot_url": "https://example.com/uploads/screenshot_def456.png",
          "status": "transfer_submitted"
        },
        "metadata": {},
        "created_at": "2026-05-29T14:30:00Z"
      },
      {
        "id": 3,
        "action": "approved",
        "performed_by_user_id": null,
        "performed_by_admin_id": 2,
        "old_values": {
          "status": "transfer_submitted",
          "approved_by": null
        },
        "new_values": {
          "status": "approved",
          "approved_by": 2
        },
        "metadata": {
          "notes": null
        },
        "created_at": "2026-05-29T15:00:00Z"
      }
    ],
    "created_at": "2026-05-29T14:00:00Z",
    "updated_at": "2026-05-29T15:05:00Z"
  }
}
```

---

### 5. Approve Conversion

Approve a conversion request and trigger wallet credit processing.

**Endpoint:** `POST /admin/airtime/{id}/approve`  
**Full URL:** `POST https://remopay.example.com/api/v1/admin/airtime/{id}/approve`  
**Authentication:** Required (Bearer token + Admin role)  
**Parameters:** `{id}` = Transaction ID

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Request Body

```json
{
  "notes": "Screenshot verified. Transfer confirmed."
}
```

#### Request Field Specifications

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|-------------------|
| `notes` | string | ❌ | Optional admin notes about approval | Max 500 characters |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Conversion approved. Processing wallet credit...",
  "data": {
    "transaction": {
      "id": 5,
      "user_id": 8,
      "phone_number": "08012345678",
      "provider": "mtn",
      "airtime_amount": 15000,
      "service_fee": 750,
      "cash_credited": 0,
      "status": "approved",
      "reference": "AIRTIME_DEF456GHI789",
      "screenshot_url": "https://example.com/uploads/screenshot_def456.png",
      "approved_by": 2,
      "approved_at": "2026-05-29T15:00:00Z",
      "created_at": "2026-05-29T14:00:00Z",
      "updated_at": "2026-05-29T15:00:00Z"
    }
  }
}
```

#### Processing Notes

- Transaction status changes to `approved`
- Background job is automatically dispatched
- Job will process wallet credit within seconds
- User receives notifications (email, in-app, push)
- Transaction moves to `processing` → `completed`

#### Error Response - Invalid Status (422)

```json
{
  "success": false,
  "message": "Cannot approve transaction with status: completed"
}
```

---

### 6. Reject Conversion

Reject a conversion request with reason.

**Endpoint:** `POST /admin/airtime/{id}/reject`  
**Full URL:** `POST https://remopay.example.com/api/v1/admin/airtime/{id}/reject`  
**Authentication:** Required (Bearer token + Admin role)  
**Parameters:** `{id}` = Transaction ID

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Request Body

```json
{
  "rejection_reason": "Screenshot does not show successful transfer. Please resubmit.",
  "notes": "Optional internal notes"
}
```

#### Request Field Specifications

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|-------------------|
| `rejection_reason` | string | ✅ | Reason for rejection (shown to user) | Required; max 500 characters |
| `notes` | string | ❌ | Optional internal admin notes | Max 500 characters |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Conversion rejected successfully. User has been notified.",
  "data": {
    "transaction": {
      "id": 5,
      "user_id": 8,
      "phone_number": "08012345678",
      "provider": "mtn",
      "airtime_amount": 15000,
      "service_fee": 750,
      "status": "rejected",
      "reference": "AIRTIME_DEF456GHI789",
      "rejection_reason": "Screenshot does not show successful transfer. Please resubmit.",
      "rejected_by": 2,
      "rejected_at": "2026-05-29T15:30:00Z",
      "created_at": "2026-05-29T14:00:00Z",
      "updated_at": "2026-05-29T15:30:00Z"
    }
  }
}
```

#### User Notification

User receives notification with rejection reason and can:
- Resubmit proof if they wish
- Start a new conversion request
- Contact support if they believe rejection is incorrect

---

### 7. Get Providers (Admin)

Get all provider configurations for management purposes.

**Endpoint:** `GET /admin/airtime/providers`  
**Full URL:** `GET https://remopay.example.com/api/v1/admin/airtime/providers`  
**Authentication:** Required (Bearer token + Admin role)

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Providers retrieved",
  "data": [
    {
      "code": "mtn",
      "name": "MTN",
      "logo_url": "https://example.com/mtn-logo.png",
      "conversion_rate": 0.80,
      "service_fee_percentage": 0.05,
      "min_amount": 50,
      "max_amount": 50000,
      "daily_limit": 500000,
      "receiving_number": "08010000000",
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-05-29T10:00:00Z"
    },
    {
      "code": "airtel",
      "name": "Airtel",
      "logo_url": "https://example.com/airtel-logo.png",
      "conversion_rate": 0.78,
      "service_fee_percentage": 0.05,
      "min_amount": 50,
      "max_amount": 50000,
      "daily_limit": 500000,
      "receiving_number": "08020000000",
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-05-29T10:00:00Z"
    }
  ]
}
```

---

### 8. Update Provider Configuration

Update provider settings like conversion rates, fees, and limits.

**Endpoint:** `PUT /admin/airtime/providers/{code}`  
**Full URL:** `PUT https://remopay.example.com/api/v1/admin/airtime/providers/mtn`  
**Authentication:** Required (Bearer token + Admin role)  
**Parameters:** `{code}` = Provider code (mtn, airtel, glo, 9mobile)

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Request Body

```json
{
  "conversion_rate": 0.82,
  "service_fee_percentage": 0.04,
  "min_amount": 100,
  "max_amount": 100000,
  "daily_limit": 1000000,
  "receiving_number": "08010000001",
  "is_active": true
}
```

#### Request Field Specifications

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|-------------------|
| `conversion_rate` | decimal | ❌ | How much cash per NGN after fees | Must be between 0 and 1 (e.g., 0.80) |
| `service_fee_percentage` | decimal | ❌ | Percentage fee deducted | Must be between 0 and 1 (e.g., 0.05 = 5%) |
| `min_amount` | integer | ❌ | Minimum conversion amount in NGN | Must be >= 0 |
| `max_amount` | integer | ❌ | Maximum conversion amount in NGN | Must be >= 0 and >= min_amount |
| `daily_limit` | integer | ❌ | Daily conversion limit per user | Must be >= 0 |
| `receiving_number` | string | ❌ | Phone number for airtime transfers | Phone number format |
| `is_active` | boolean | ❌ | Whether provider accepts conversions | true or false |

#### Notes

- All fields are optional - only update fields you want to change
- Changes are logged in audit trail with old/new values
- Changes take effect immediately
- Only active providers appear to users

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Provider configuration updated",
  "data": {
    "code": "mtn",
    "name": "MTN",
    "logo_url": "https://example.com/mtn-logo.png",
    "conversion_rate": 0.82,
    "service_fee_percentage": 0.04,
    "min_amount": 100,
    "max_amount": 100000,
    "daily_limit": 1000000,
    "receiving_number": "08010000001",
    "is_active": true,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-05-29T15:30:00Z"
  }
}
```

#### Error Response - Not Found (404)

```json
{
  "success": false,
  "message": "No query results found for model"
}
```

#### Error Response - Validation Error (422)

```json
{
  "success": false,
  "message": "The conversion_rate must be between 0 and 1",
  "errors": {
    "conversion_rate": ["The conversion_rate must be between 0 and 1"]
  }
}
```

---

### 9. Get Audit Logs

Get detailed audit trail for a specific transaction or all transactions.

**Endpoint (Specific):** `GET /admin/airtime/audit-logs/{transactionId}`  
**Endpoint (All):** `GET /admin/airtime/audit-logs`  
**Full URLs:**
- `GET https://remopay.example.com/api/v1/admin/airtime/audit-logs/5`
- `GET https://remopay.example.com/api/v1/admin/airtime/audit-logs`

**Authentication:** Required (Bearer token + Admin role)

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Success Response - Specific Transaction (200 OK)

```json
{
  "success": true,
  "message": "Audit logs retrieved",
  "data": [
    {
      "id": 1,
      "airtime_conversion_transaction_id": 5,
      "action": "created",
      "performed_by_user_id": 8,
      "performed_by_admin_id": null,
      "old_values": {},
      "new_values": {
        "id": 5,
        "user_id": 8,
        "reference": "AIRTIME_DEF456GHI789",
        "status": "pending"
      },
      "metadata": {},
      "created_at": "2026-05-29T14:00:00Z"
    },
    {
      "id": 2,
      "airtime_conversion_transaction_id": 5,
      "action": "proof_submitted",
      "performed_by_user_id": 8,
      "performed_by_admin_id": null,
      "old_values": {
        "screenshot_url": null,
        "status": "pending"
      },
      "new_values": {
        "screenshot_url": "https://example.com/uploads/screenshot_def456.png",
        "status": "transfer_submitted"
      },
      "metadata": {},
      "created_at": "2026-05-29T14:30:00Z"
    },
    {
      "id": 3,
      "airtime_conversion_transaction_id": 5,
      "action": "approved",
      "performed_by_user_id": null,
      "performed_by_admin_id": 2,
      "old_values": {
        "status": "transfer_submitted",
        "approved_by": null
      },
      "new_values": {
        "status": "approved",
        "approved_by": 2
      },
      "metadata": {
        "notes": null
      },
      "created_at": "2026-05-29T15:00:00Z"
    }
  ]
}
```

#### Audit Log Actions

| Action | Description |
|--------|-------------|
| `created` | Transaction initiated by user |
| `proof_submitted` | User submitted screenshot proof |
| `verification_in_progress` | Admin started review |
| `approved` | Admin approved the conversion |
| `rejected` | Admin rejected the conversion |
| `processing` | System processing wallet credit |
| `completed` | Transaction completed successfully |

---

## Configuration & Environment Variables

### Required Environment Variables

```env
# Airtime Configuration
AIRTIME_REQUIRE_APPROVAL=true
AIRTIME_MIN_AMOUNT=50
AIRTIME_MAX_AMOUNT=50000
AIRTIME_DAILY_LIMIT=500000
AIRTIME_SERVICE_FEE_PERCENTAGE=0.05
AIRTIME_PENDING_EXPIRATION=1440

# Provider-Specific Configuration
MTN_CONVERSION_RATE=0.80
MTN_SERVICE_FEE=0.05
MTN_RECEIVING_NUMBER=08010000000
MTN_MIN_AMOUNT=50
MTN_MAX_AMOUNT=50000

AIRTEL_CONVERSION_RATE=0.78
AIRTEL_SERVICE_FEE=0.05
AIRTEL_RECEIVING_NUMBER=08020000000
AIRTEL_MIN_AMOUNT=50
AIRTEL_MAX_AMOUNT=50000

GLO_CONVERSION_RATE=0.75
GLO_SERVICE_FEE=0.05
GLO_RECEIVING_NUMBER=08030000000
GLO_MIN_AMOUNT=50
GLO_MAX_AMOUNT=50000

NINEMOBILE_CONVERSION_RATE=0.70
NINEMOBILE_SERVICE_FEE=0.05
NINEMOBILE_RECEIVING_NUMBER=08040000000
NINEMOBILE_MIN_AMOUNT=50
NINEMOBILE_MAX_AMOUNT=50000

# Notifications
AIRTIME_SEND_EMAIL=true
AIRTIME_SEND_PUSH=true
AIRTIME_SEND_IN_APP=true

# Job Configuration
AIRTIME_JOB_QUEUE=default
AIRTIME_JOB_DELAY=0
```

---

## Frontend Implementation Expectations

### User Frontend (Next.js)

**Step 1: Load Providers**
- Call `/airtime/providers` on page load
- Display provider list with logos and conversion rates
- Show min/max amounts and fees for each provider

**Step 2: Initiate Conversion**
- Collect: phone_number, provider, airtime_amount, settlement_method
- Validate amounts against provider limits
- Submit POST request to `/airtime/initiate`
- Display instructions with receiving number
- Start timer for expiration time

**Step 3: Upload Screenshot**
- After user transfers airtime
- Implement file upload for screenshot
- Upload to storage (S3, etc.)
- Get public URL
- Submit URL to `/airtime/{id}/submit-proof`
- Show status update to "Awaiting Admin Review"

**Step 4: Monitor Status**
- Poll `/airtime/{id}` periodically (every 5-10 seconds)
- Update UI when status changes
- Show completion when status is `completed`
- Display error if status is `rejected`

**Step 5: History**
- Call `/airtime/history` with filters
- Implement pagination
- Show transaction list with status
- Allow filtering by status/provider/date
- Display summary statistics

### Admin Frontend (Next.js)

**Dashboard**
- Call `/admin/airtime/dashboard` on load
- Display overview metrics (pending, completed today, etc.)
- Show volume and revenue graphs
- Display provider breakdown

**Pending Requests**
- Call `/admin/airtime/pending` periodically (every 30 seconds)
- Show urgent list of requests awaiting approval
- Display user info, amount, screenshot
- Show timestamp for quick assessment

**Transactions List**
- Call `/admin/airtime` with various filters
- Implement sortable columns
- Show search by reference/phone
- Display date range filter

**Transaction Detail View**
- Call `/admin/airtime/{id}` to get full details
- Show screenshot preview
- Display all fields and amounts
- Show audit trail
- Provide Approve/Reject buttons

**Approval/Rejection**
- Submit POST to `/admin/airtime/{id}/approve` or `/reject`
- Handle success response
- Redirect to pending list
- Show success notification

---

## Calculation Examples

### Example 1: MTN Conversion (Rate 0.80, Fee 5%)

```
Airtime Amount:      ₦10,000
Service Fee (5%):    -₦500
Net Amount:          ₦9,500
Conversion (0.80):   ₦9,500 × 0.80 = ₦7,600
Cash Credited:       ₦7,600
```

### Example 2: Airtel Conversion (Rate 0.78, Fee 5%)

```
Airtime Amount:      ₦15,000
Service Fee (5%):    -₦750
Net Amount:          ₦14,250
Conversion (0.78):   ₦14,250 × 0.78 = ₦11,115
Cash Credited:       ₦11,115
```

---

## Status Transitions & Validations

### Valid Transitions

```
PENDING
  ↓ (user submits proof, must upload screenshot)
TRANSFER_SUBMITTED
  ├→ APPROVED (admin approves)
  │    ↓ (automatic background job)
  │  PROCESSING
  │    ↓ (wallet credit successful)
  │  COMPLETED ✓
  │
  └→ REJECTED (admin rejects)

PENDING
  ├→ TRANSFER_SUBMITTED (proof submitted)
  ├→ REJECTED (admin rejects before proof)
  └→ CANCELLED (user cancels - future feature)
```

### Status Validation Rules

| Current Status | Can Submit Proof | Can Approve | Can Reject |
|---|---|---|---|
| PENDING | ✅ | ❌ | ✅ |
| TRANSFER_SUBMITTED | ❌ | ✅ | ✅ |
| VERIFICATION_IN_PROGRESS | ❌ | ✅ | ✅ |
| APPROVED | ❌ | ❌ | ❌ |
| PROCESSING | ❌ | ❌ | ❌ |
| COMPLETED | ❌ | ❌ | ❌ |
| REJECTED | ❌ | ❌ | ❌ |

---

## Error Handling Best Practices

### Client-Side

1. **Validation Error (422)**
   - Extract field-specific errors from `errors` object
   - Display beside form fields
   - Allow user to correct and resubmit

2. **Business Logic Error (422)**
   - Display message to user
   - Suggest action (increase amount, wait, etc.)
   - Log error for debugging

3. **Authentication Error (401)**
   - Redirect to login
   - Clear stored token
   - Show login expiration message

4. **Permission Error (403)**
   - Show "Unauthorized" message
   - Prevent access to admin endpoints for non-admins

5. **Not Found (404)**
   - Show transaction not found message
   - Allow retry or go back to list

6. **Server Error (500)**
   - Show generic error message
   - Suggest retry later
   - Log error reference for support

### Server-Side Processing

- Transactions use database transactions for consistency
- Audit logs record all changes
- Events dispatched for notifications
- Jobs queued for background processing
- Proper rollback on errors

---

## Security Considerations

- ✅ **Always** validate Bearer token in Authorization header
- ✅ **Always** verify user ownership of transaction before allowing operations
- ✅ **Always** verify admin role before allowing admin endpoints
- ✅ **Never** log sensitive data like phone numbers
- ✅ **Never** expose internal IDs in user-facing messages
- ✅ **Always** sanitize user input (phone numbers, amounts)
- ✅ Use HTTPS for all API communication
- ✅ Implement rate limiting on frontend (disable buttons during requests)
- ✅ Screenshot URLs should be time-limited or private
- ✅ Validate amounts on both frontend and backend

---

## Testing Checklist

### User Flow Testing
- [ ] Get providers list
- [ ] Initiate conversion with valid amount
- [ ] Initiate with amount below minimum
- [ ] Initiate with amount above maximum
- [ ] Initiate exceeding daily limit
- [ ] Submit proof with valid URL
- [ ] Submit proof twice (should fail second time)
- [ ] View transaction history
- [ ] View single transaction details
- [ ] View statistics

### Admin Flow Testing
- [ ] View dashboard metrics
- [ ] Get pending conversions list
- [ ] Get all transactions with filters
- [ ] Get single transaction details
- [ ] Approve conversion
- [ ] Approve already completed (should fail)
- [ ] Reject conversion
- [ ] Reject already rejected (should fail)
- [ ] View audit logs
- [ ] Sort and filter transactions

---

## Support & Troubleshooting

**Issue: "Daily limit exceeded"**
- User has converted too much today
- Wait until next day or reduce amount
- Check `/airtime/stats` for total converted today

**Issue: "Cannot submit proof"**
- Already submitted proof
- Transaction not in pending state
- Start new conversion request

**Issue: "Screenshot URL invalid"**
- URL must be publicly accessible
- Upload screenshot first, then submit URL
- Check file permissions

**Issue: "Conversion not completing"**
- Background job may be processing
- Check transaction status via GET endpoint
- Admin may not have approved yet

**Issue: Admin cannot approve**
- Transaction must be in TRANSFER_SUBMITTED status
- User must have submitted proof first
- Check audit logs for transaction history

