# USD Dollar Account Creation Implementation Guide - Next.js Web

## Overview

The Remopay USD Dollar Account API allows Next.js web applications to create USD virtual accounts for authenticated users through Maplerad. This guide provides complete endpoint documentation, request/response formats, field specifications, and implementation expectations for Next.js frontend applications.

**API Version:** v1  
**Authentication:** Required (Bearer token via Sanctum)  
**Base URL:** `https://remopay.example.com/api/v1/payment`  
**Framework:** Next.js 13+ (App Router/Pages Router compatible)

---

## Prerequisites

Before implementing USD account creation, ensure:

- User is authenticated with valid Sanctum Bearer token
- User has a Maplerad customer ID (`maplerad_id` from `maplerad_customers` table)
- User has completed Maplerad customer enrollment with at least basic information
- User has not already created a USD virtual account (system checks and skips duplicate creation)
- API token securely stored (environment variable or secure session)
- All required documents are available:
  - Source of funds document
  - Proof of address document
  - Optional: identification document images (front and back)

---

## Implementation Flow

### Step 1: Create USD Dollar Account

**Purpose:** Create a USD virtual account for a Maplerad customer with comprehensive KYC documentation and employment details.

**Endpoint:** `POST /collections/virtual-account/usd`  
**Full URL:** `POST https://remopay.example.com/api/v1/payment/collections/virtual-account/usd`

#### Request Headers

```http
Authorization: Bearer YOUR_SANCTUM_TOKEN
Content-Type: application/json
```

#### Request Body

```json
{
  "customer_id": "cust_1234567890abcdef",
  "meta": {
    "identification_number": "12345678901",
    "passport_number": "A12345678",
    "employment_status": "EMPLOYED",
    "employment_description": "Software Engineer at Tech Company",
    "nationality": "NG",
    "employer_name": "Tech Company Inc",
    "occupation": "Software Engineer",
    "us_residency_status": "NON_RESIDENT_ALIEN",
    "documents": {
      "identification_country": "NG",
      "identification_type": "NIN",
      "identification_number": "12345678901",
      "identification_expiration": "15-12-2025",
      "identification_image_front": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "identification_image_back": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "source_of_funds": {
        "file_name": "bank_statement.pdf",
        "file": "data:application/pdf;base64,JVBERi0xLjQK..."
      },
      "proof_of_address": {
        "file_name": "utility_bill.pdf",
        "file": "data:application/pdf;base64,JVBERi0xLjQK..."
      }
    }
  }
}
```

#### Request Field Specifications

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|-------------------|
| `customer_id` | string | ✅ | Maplerad customer ID | Must be valid maplerad_id from database |
| `meta` | object | ✅ | Metadata container for KYC information | Must be non-empty object |
| `meta.identification_number` | string | ✅ | Customer's national ID number | No specific length requirement |
| `meta.passport_number` | string | ❌ | Customer's passport number | Optional; no specific format required |
| `meta.employment_status` | string | ✅ | Current employment status | Must be one of: `EMPLOYED`, `SELF_EMPLOYED`, `UNEMPLOYED`, `STUDENT`, `RETIRED` |
| `meta.employment_description` | string | ✅ | Description of employment/occupation | Free text; must not be empty |
| `meta.nationality` | string | ✅ | Two-letter country code | Must be ISO 3166-1 alpha-2 code; max 10 characters |
| `meta.employer_name` | string | ✅ | Name of employer/business | Free text; must not be empty |
| `meta.occupation` | string | ✅ | Job title or occupational description | Free text; must not be empty |
| `meta.us_residency_status` | string | ✅ | US tax residency status | Must be one of: `NON_RESIDENT_ALIEN`, `RESIDENT_ALIEN`, `US_CITIZEN` |
| `meta.documents` | object | ❌ | Document container for verification | Optional; if provided, must follow specification |
| `meta.documents.identification_country` | string | ❌ | Country of identification document | Two-letter country code; max 10 characters; optional |
| `meta.documents.identification_type` | string | ❌ | Type of identification document | Must be one of: `PASSPORT`, `NIN`, `DRIVERS_LICENSE`; optional |
| `meta.documents.identification_number` | string | ❌ | Document ID number | Optional; free text |
| `meta.documents.identification_expiration` | string | ❌ | Document expiration date | Format: `dd-mm-yyyy` (e.g., "15-12-2025"); optional |
| `meta.documents.identification_image_front` | string | ❌ | Front side of identification document | Base64-encoded image (JPEG/PNG); optional; processed and converted by backend |
| `meta.documents.identification_image_back` | string | ❌ | Back side of identification document | Base64-encoded image (JPEG/PNG); optional; processed and converted by backend |
| `meta.documents.source_of_funds` | object | ✅ | Source of funds documentation | Required object with file_name and file properties |
| `meta.documents.source_of_funds.file_name` | string | ✅ | Original file name for source of funds | Include extension (e.g., "bank_statement.pdf") |
| `meta.documents.source_of_funds.file` | string | ✅ | Source of funds document content | Base64-encoded file (PDF/image); processed by backend |
| `meta.documents.proof_of_address` | object | ✅ | Proof of address documentation | Required object with file_name and file properties |
| `meta.documents.proof_of_address.file_name` | string | ✅ | Original file name for proof of address | Include extension (e.g., "utility_bill.pdf") |
| `meta.documents.proof_of_address.file` | string | ✅ | Proof of address document content | Base64-encoded file (PDF/image); processed by backend |

#### Important Notes on Fields

1. **customer_id**: This is the Maplerad customer ID (maplerad_id), NOT the Remopay user ID. Must be obtained from the user's Maplerad customer record.

2. **Employment Status**: Should accurately reflect the user's current employment situation. Select from:
   - `EMPLOYED`: Working full-time or part-time for an organization
   - `SELF_EMPLOYED`: Running own business
   - `UNEMPLOYED`: Not currently employed
   - `STUDENT`: Currently studying
   - `RETIRED`: Retired from work

3. **Nationality & Country Codes**: Use ISO 3166-1 alpha-2 codes (e.g., "NG" for Nigeria, "US" for United States, "GB" for United Kingdom)

4. **US Residency Status**: Critical for US tax compliance:
   - `NON_RESIDENT_ALIEN`: Not a US citizen/resident
   - `RESIDENT_ALIEN`: Has green card or permanent resident status
   - `US_CITIZEN`: US citizenship

5. **Document Images**: 
   - Must be valid base64-encoded strings
   - Should be JPEG or PNG format (backend handles conversion)
   - Frontend should compress images before encoding to reduce payload size
   - Only include if documents are available; both front and back are optional but if one is provided, consider providing both

6. **Documents (source_of_funds, proof_of_address)**:
   - Must be base64-encoded (PDF or image)
   - Include proper file extensions in file_name
   - These documents are mandatory for USD account creation
   - Backend processes and validates document format

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "USD account created successfully",
  "data": {
    "account": {
      "id": "va_usd_1234567890abcdef",
      "customer_id": "cust_1234567890abcdef",
      "currency": "USD",
      "account_number": "1234567890",
      "bank_name": "Remopay Bank",
      "account_type": "virtual",
      "status": "active",
      "balance": 0,
      "created_at": "2026-05-29T10:00:00Z",
      "metadata": {
        "employment_status": "EMPLOYED",
        "us_residency_status": "NON_RESIDENT_ALIEN",
        "document_status": "pending_review"
      }
    }
  }
}
```

#### Success Response Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` on successful creation |
| `message` | string | Human-readable success message |
| `data.account.id` | string | Unique identifier for the created virtual account |
| `data.account.customer_id` | string | Associated Maplerad customer ID |
| `data.account.currency` | string | Currency type; always `USD` for this endpoint |
| `data.account.account_number` | string | Virtual account number for receiving funds |
| `data.account.bank_name` | string | Bank name associated with the virtual account |
| `data.account.account_type` | string | Type of account; always `virtual` |
| `data.account.status` | string | Account status; typically `active`, `pending`, or `suspended` |
| `data.account.balance` | integer | Current balance in lowest denomination (cents); initially 0 |
| `data.account.created_at` | string | Timestamp of account creation (ISO 8601) |
| `data.account.metadata` | object | Additional metadata including document review status |

#### Duplicate Account Response (200 OK)

If the user already has a USD virtual account, the system returns the existing account instead of creating a new one:

```json
{
  "success": true,
  "message": "USD virtual account already exists",
  "data": {
    "account": {
      "id": "va_usd_existing_id",
      "customer_id": "cust_1234567890abcdef",
      "currency": "USD",
      "account_number": "9876543210",
      "bank_name": "Remopay Bank",
      "account_type": "virtual",
      "status": "active",
      "balance": 50000,
      "created_at": "2026-04-15T08:30:00Z"
    },
    "skipped": true
  }
}
```

Note: The `skipped: true` field indicates this was an existing account, not a newly created one.

#### Error Response - Validation Error (400 Bad Request)

```json
{
  "success": false,
  "message": "The given data was invalid",
  "errors": {
    "customer_id": ["The customer_id field is required"],
    "meta.employment_status": ["The selected meta.employment_status is invalid"],
    "meta.documents.source_of_funds.file": ["The meta.documents.source_of_funds.file field is required"]
  }
}
```

#### Error Response - Business Logic Error (400 Bad Request)

```json
{
  "success": false,
  "message": "Customer not found in Maplerad system"
}
```

#### Common Error Messages and Causes

| Status | Message | Cause | Solution |
|--------|---------|-------|----------|
| 400 | "customer_id field is required" | customer_id not provided or empty | Ensure customer_id is included and valid |
| 400 | "The selected employment_status is invalid" | Invalid employment status value | Must be EMPLOYED, SELF_EMPLOYED, UNEMPLOYED, STUDENT, or RETIRED |
| 400 | "The selected us_residency_status is invalid" | Invalid US residency status | Must be NON_RESIDENT_ALIEN, RESIDENT_ALIEN, or US_CITIZEN |
| 400 | "source_of_funds.file field is required" | Source of funds document missing | Provide source of funds document as base64-encoded file |
| 400 | "proof_of_address.file field is required" | Proof of address document missing | Provide proof of address document as base64-encoded file |
| 400 | "Failed to process identification image front" | Image processing error | Ensure image is valid JPEG/PNG; reduce image size |
| 400 | "Failed to process identification image back" | Image processing error | Ensure image is valid JPEG/PNG; reduce image size |
| 400 | "Customer not found in Maplerad" | Invalid customer_id | Verify customer_id exists in Maplerad system |
| 401 | "Unauthorized" | Missing or invalid Bearer token | Provide valid Sanctum Bearer token in Authorization header |
| 500 | "An unexpected error occurred while creating USD account" | Server-side error | Contact support; check server logs |

---

## Frontend Implementation Expectations

### Data Preparation Requirements

**Image Handling:**
- Compress images before base64 encoding to reduce payload size
- Recommended: JPEG images at 80% quality, 1024x768 maximum dimensions
- Use canvas or image compression library (e.g., `browser-image-compression`)
- Ensure images are valid JPEG/PNG format

**Document Handling:**
- Accept PDF or image files for source of funds and proof of address
- Convert to base64 before sending to API
- Validate file size (recommend max 5MB per document)
- Preserve original file names for reference

**Employment Status Selection:**
- Provide dropdown/select with options: EMPLOYED, SELF_EMPLOYED, UNEMPLOYED, STUDENT, RETIRED
- Validate selection before submission

**US Residency Status Selection:**
- Provide dropdown/select with options: NON_RESIDENT_ALIEN, RESIDENT_ALIEN, US_CITIZEN
- Consider adding informational text about tax implications
- Validate selection before submission

### Request Preparation Steps

1. **Validate all required fields** are present and non-empty
2. **Prepare images** (compress, convert to base64)
3. **Prepare documents** (convert to base64, retain file names)
4. **Construct payload** with proper nesting of meta object
5. **Add Authorization header** with Bearer token
6. **Send POST request** to endpoint

### Response Handling Expectations

**Success Cases:**
- HTTP 200 with success=true: Account created or already exists
- Extract account details from `data.account` object
- Check `data.skipped` to determine if this was a new account
- Display account number and bank details to user

**Error Cases:**
- HTTP 400 with validation errors: Display field-specific error messages
- HTTP 400 with business logic error: Display user-friendly error message
- HTTP 401: Redirect to login (token expired/invalid)
- HTTP 500: Display generic error message, suggest retry

**Error Message Display:**
- For validation errors: Show field-specific errors from `errors` object
- For business logic errors: Show `message` field directly to user
- Provide "Try Again" button for retryable errors
- Log error details for debugging

### State Management Considerations

- Store customer_id (maplerad_id) securely after user enrollment
- Cache Bearer token from authentication response
- Maintain form state during document upload
- Handle loading states during request processing
- Implement proper error recovery without data loss

### Security Considerations

- **Never** log or display base64-encoded documents
- **Never** store document content in local storage
- **Always** use HTTPS for API communication
- **Always** validate and sanitize user inputs before submission
- Use CSRF tokens if applicable
- Implement rate limiting on frontend (e.g., disable button during request)
- Clear sensitive data from memory after use

---

## Example Request & Response

### Complete Example: Creating USD Account with All Fields

**Request:**

```bash
curl -X POST "https://remopay.example.com/api/v1/payment/collections/virtual-account/usd" \
  -H "Authorization: Bearer YOUR_SANCTUM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "cust_1234567890abcdef",
    "meta": {
      "identification_number": "12345678901",
      "passport_number": "A12345678",
      "employment_status": "EMPLOYED",
      "employment_description": "Senior Software Engineer at TechCorp",
      "nationality": "NG",
      "employer_name": "TechCorp Inc",
      "occupation": "Senior Software Engineer",
      "us_residency_status": "NON_RESIDENT_ALIEN",
      "documents": {
        "identification_country": "NG",
        "identification_type": "NIN",
        "identification_number": "12345678901",
        "identification_expiration": "15-12-2027",
        "identification_image_front": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABg...",
        "identification_image_back": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABg...",
        "source_of_funds": {
          "file_name": "bank_statement_may_2026.pdf",
          "file": "data:application/pdf;base64,JVBERi0xLjQKCjEgMCBvYmo..."
        },
        "proof_of_address": {
          "file_name": "utility_bill_may_2026.pdf",
          "file": "data:application/pdf;base64,JVBERi0xLjQKCjEgMCBvYmo..."
        }
      }
    }
  }'
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "USD account created successfully",
  "data": {
    "account": {
      "id": "va_usd_xyz789",
      "customer_id": "cust_1234567890abcdef",
      "currency": "USD",
      "account_number": "1234567890",
      "bank_name": "Remopay Bank",
      "account_type": "virtual",
      "status": "active",
      "balance": 0,
      "created_at": "2026-05-29T10:00:00Z",
      "metadata": {
        "employment_status": "EMPLOYED",
        "us_residency_status": "NON_RESIDENT_ALIEN",
        "document_status": "pending_review"
      }
    }
  }
}
```

---

## Related Endpoints

### Check Account Request Status

**Purpose:** Check the status of an account creation request (useful for monitoring document review progress).

**Endpoint:** `GET /collections/virtual-account/status/{reference}`  
**Full URL:** `GET https://remopay.example.com/api/v1/payment/collections/virtual-account/status/{reference}`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reference` | string (URL param) | ✅ | Reference ID from account creation response or request status tracking |

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Account request status retrieved successfully",
  "data": {
    "reference": "ref_xyz789",
    "status": "completed",
    "account_id": "va_usd_xyz789",
    "document_review_status": "approved",
    "created_at": "2026-05-29T10:00:00Z",
    "updated_at": "2026-05-29T12:30:00Z"
  }
}
```

---

## Backend Flow & Processing Details

**For Frontend Development Context:**

1. **Request Validation**: Your request is validated against the `CreateUsdAccountRequest` form request rules. All required fields must be present.

2. **Duplicate Check**: System automatically checks if USD account already exists for this customer. If it does, existing account is returned with `skipped: true`.

3. **Image Processing**: If provided, identification images are processed and converted to optimized format by backend before sending to Maplerad API.

4. **Document Processing**: Base64-encoded documents are validated and processed by backend before inclusion in Maplerad API request.

5. **Maplerad API Call**: Backend calls Maplerad API at `/v1/collections/virtual-account/usd` with all prepared data.

6. **Response Transformation**: Raw Maplerad API response is transformed and returned to frontend.

---

## Important Implementation Notes

### Do NOT

- ❌ Hardcode customer_id values
- ❌ Assume successful response without checking `success` field
- ❌ Store base64-encoded documents in local storage
- ❌ Log full request/response to console in production
- ❌ Send uncompressed large images
- ❌ Assume employment_status or us_residency_status values beyond the documented list
- ❌ Forget to include Authorization header

### Do

- ✅ Validate all required fields before submission
- ✅ Compress images before base64 encoding
- ✅ Check both HTTP status code AND `success` field in response
- ✅ Handle validation errors by field and display appropriate messages
- ✅ Implement proper loading/disabled states during request
- ✅ Store customer_id securely after user enrollment
- ✅ Implement proper error recovery mechanisms

---

## Troubleshooting Common Issues

**Issue: "customer_id not found"**
- Verify the customer_id (maplerad_id) is correct and the user has completed Maplerad enrollment
- Ensure you're using maplerad_id from the maplerad_customers table, not the user ID

**Issue: "Failed to process identification image"**
- Ensure image is valid JPEG or PNG
- Reduce image size (recommend max 1024x768)
- Compress image before base64 encoding
- Check file is not corrupted

**Issue: "source_of_funds.file is required"**
- Ensure source of funds document is provided and base64-encoded
- Verify file_name is included

**Issue: "Unauthorized (401)"**
- Check Bearer token is valid and not expired
- Verify token is prefixed with "Bearer " in Authorization header
- Re-authenticate if token has expired

**Issue: Duplicate account warning**
- This is expected behavior if user already has USD account
- Use the returned account details instead of attempting recreation
- Check `skipped: true` in response to identify this case

---

## Support & Documentation

For additional information:
- Backend Implementation: Check MapleradController.php and MapLeradService.php
- Validation Rules: Check CreateUsdAccountRequest.php
- API Routing: Check routes/api/v1/payment.php

