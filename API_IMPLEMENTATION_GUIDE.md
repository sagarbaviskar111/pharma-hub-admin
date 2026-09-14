# Pharma Hub Admin Panel - API Implementation & Validation Guide

## Overview

This document provides a comprehensive guide to the API implementation and validation rules for the Pharma Hub Admin Panel. All API calls follow the specification and include proper client-side validation.

---

## Table of Contents

1. [API Configuration](#api-configuration)
2. [Authentication](#authentication)
3. [Jobs API](#jobs-api)
4. [Departments API](#departments-api)
5. [News API](#news-api)
6. [Validation Rules](#validation-rules)
7. [Error Handling](#error-handling)
8. [File Upload Guidelines](#file-upload-guidelines)

---

## API Configuration

**File:** `src/utils/apiConfig.js`

The application uses a centralized API configuration to manage different environments:

```javascript
// Development (default)
const BASE_API_URL = "http://localhost:5000";

// Staging
// const BASE_API_URL = "http://api.pharmatalenthub.in";

// Production
// const BASE_API_URL = "https://pharmatalenthub.in/api";

// Alternative Production
// const BASE_API_URL = "https://pharma-bharat-be.onrender.com";
```

**To switch environments:** Uncomment the desired URL and comment out others in `apiConfig.js`.

---

## Authentication

### Login

**Endpoint:** `POST /api/auth/login`  
**Auth Required:** No  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "_id": "userId",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules:**
- `email`: Required, must be a valid email format
- `password`: Required, minimum 6 characters

**Implementation:** `src/pages/Login.js`
- Uses `validators.validateLogin()` for input validation
- Stores token in localStorage
- Handles validation errors with user feedback

---

## Jobs API

### 1. Create Job

**Endpoint:** `POST /api/jobs`  
**Auth Required:** Bearer token in Authorization header  
**Content-Type:** `multipart/form-data`

**Required Fields:**
- `positionName` (string)
- `company` (string)
- `salary` (string)
- `location` (string)
- `qualification` (string)
- `companyOverview` (string)
- `image` (file, image/*, max 5MB)

**Optional Fields:**
- `experience` (string)
- `type` (string) - e.g., "Full-time", "Part-time"
- `applicationDeadline` (ISO 8601 date string)
- `responsibilities` (array or CSV string)
- `skills` (array or CSV string)
- `tags` (string)
- `applylink` (string)
- `department` (ObjectId)
- `email` (string)
- `logo` (file, image/*, max 5MB)
- `driveLocation` (string)
- `driveDate` (ISO 8601 date string)
- `driveTime` (time string)
- `driveContactPerson` (string)
- `driveContactNumber` (string)

**Response (201 Created):**
```json
{
  "message": "Job created successfully",
  "job": {
    "_id": "jobId",
    "positionName": "Frontend Developer",
    "company": "ACME Ltd",
    "imageUrl": "https://cloudinary-url.com/image.jpg",
    "imagePublicId": "job_images/publicId",
    "logoPublicId": "job_logos/publicId",
    ...
  }
}
```

**Validation Rules:**
- All required fields must be non-empty strings
- `applicationDeadline` must be valid ISO 8601 format if provided
- `responsibilities` and `skills` must be arrays of strings or CSV strings
- Image files: type must match `image/*`, size ≤ 5MB
- Logo files (optional): type must match `image/*`, size ≤ 5MB

**Implementation:** `src/pages/AddJob.js`
- Uses `validators.validateJobCreate()` for data validation
- Uses `validators.validateFile()` for file validation
- Shows validation errors before submission
- JSON input mode available for bulk data entry

---

### 2. Get Jobs

**Endpoint:** `GET /api/jobs`  
**Auth Required:** No  
**Query Parameters:**
- `id` (optional) - Single job ID
- `departmentId` (optional) - Filter by department
- `query` (optional) - Text search
- `page` (default: 1)
- `limit` (default: 10)

**Response (200 OK):**
```json
{
  "totalJobs": 25,
  "totalPages": 3,
  "currentPage": 1,
  "jobs": [
    {
      "_id": "jobId",
      "positionName": "Frontend Developer",
      "company": "ACME Ltd",
      "location": "Pune",
      ...
    }
  ]
}
```

**Implementation:** `src/pages/ListJobs.js`
- Fetches with pagination support
- Includes Authorization header with token

---

### 3. Get Job Details

**Endpoint:** `GET /api/jobs/:id`  
**Auth Required:** No

**Response (200 OK):** Returns complete job document with populated department

**Implementation:** `src/pages/UpdateJob.js`
- Fetches job details on component mount
- Pre-fills form with existing data
- Includes Authorization header for security

---

### 4. Update Job

**Endpoint:** `PUT /api/jobs/:id`  
**Auth Required:** Bearer token required  
**Content-Type:** `multipart/form-data` (if files) or `application/json`

**Request Body:** Any subset of job fields (partial update)
```json
{
  "company": "New Company Name",
  "salary": "8-12 LPA",
  "image": <File>,
  "logo": <File>,
  ...
}
```

**Response (200 OK):**
```json
{
  "message": "Job updated successfully",
  "job": { ...updated job object... }
}
```

**Validation Rules:**
- All fields are optional (partial updates allowed)
- `applicationDeadline` must be valid ISO 8601 if provided
- `responsibilities` and `skills` follow same format as create
- Image/Logo validation: max 5MB, image/* type
- Previous Cloudinary assets are automatically deleted if new files provided

**Implementation:** `src/pages/UpdateJob.js`
- Uses `validators.validateJobUpdate()` for data validation
- Shows validation errors before submission
- Supports file upload for image and logo updates
- Properly handles File objects in FormData

---

### 5. Delete Job

**Endpoint:** `DELETE /api/jobs/:id`  
**Auth Required:** Bearer token required

**Response (200 OK):**
```json
{
  "message": "Job deleted successfully"
}
```

**Implementation:** `src/pages/ListJobs.js`
- Includes Authorization header
- Refreshes job list after deletion
- Provides error feedback if deletion fails

---

## Departments API

### 1. Create Department

**Endpoint:** `POST /api/departments`  
**Auth Required:** Bearer token required  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "name": "Engineering"
}
```

**Response (201 Created):**
```json
{
  "message": "Department added successfully",
  "department": {
    "_id": "deptId",
    "name": "Engineering"
  }
}
```

**Validation Rules:**
- `name` is required
- `name` must be a string
- `name` must not be empty

**Implementation:** `src/pages/AddDepartment.js`
- Uses `validators.validateDepartment()` for validation
- Includes Authorization header with token
- Shows success/error messages with proper styling

---

### 2. Get Departments

**Endpoint:** `GET /api/departments`  
**Auth Required:** No

**Response (200 OK):**
```json
[
  {
    "_id": "deptId",
    "name": "Engineering"
  },
  {
    "_id": "deptId2",
    "name": "Sales"
  }
]
```

**Implementation:** Used in `AddJob.js`, `UpdateJob.js`, and `ListDepartments.js`
- Fetches all departments for dropdown/list display
- No pagination (returns all)

---

### 3. Delete Department

**Endpoint:** `DELETE /api/departments/:id`  
**Auth Required:** Bearer token required

**Response (200 OK):**
```json
{
  "message": "Department deleted successfully"
}
```

**Implementation:** `src/pages/ListDepartments.js`
- Includes Authorization header
- Updates list after deletion

---

## News API

### 1. Create News Article

**Endpoint:** `POST /api/news`  
**Auth Required:** No  
**Content-Type:** `multipart/form-data`

**Required Fields:**
- `title` (string)
- `content` (string)
- `author` (string)
- `image` (file, image/*, max 5MB)

**Response (201 Created):**
```json
{
  "message": "News created successfully",
  "news": {
    "_id": "newsId",
    "title": "Company Announces New Products",
    "content": "Long article content...",
    "author": "John Doe",
    "imageUrl": "https://cloudinary-url.com/image.jpg",
    ...
  }
}
```

**Validation Rules:**
- All fields required
- `title`, `content`, `author` must be non-empty strings
- Image file required: type `image/*`, size ≤ 5MB

**Implementation:** `src/pages/AdminArticleForm.js`
- Uses `validators.validateNews()` for data validation
- Uses `validators.validateFile()` for image validation
- Modal interface for adding/editing
- Ant Design components for UI

---

### 2. Get News Articles

**Endpoint:** `GET /api/news`  
**Auth Required:** No

**Response (200 OK):**
```json
[
  {
    "_id": "newsId",
    "title": "Article Title",
    "content": "Article content",
    "author": "Author Name",
    "imageUrl": "...",
    "date": "2025-12-10T00:00:00Z",
    ...
  }
]
```

**Implementation:** `src/pages/ListNews.js` and `AdminArticleForm.js`
- Fetches all articles
- Used for list display and admin management

---

### 3. Get Article Details

**Endpoint:** `GET /api/news/:id`  
**Auth Required:** No

**Response (200 OK):** Returns complete news document

---

### 4. Update Article

**Endpoint:** `PUT /api/news/:id`  
**Auth Required:** No  
**Content-Type:** `multipart/form-data`

**Request Body (all optional):**
- `title` (string)
- `content` (string)
- `author` (string)
- `image` (file, max 5MB)

**Response (200 OK):**
```json
{
  "message": "News article updated successfully",
  "news": { ...updated news... }
}
```

**Validation Rules:**
- All fields optional (partial update)
- If image provided: max 5MB, type `image/*`
- Note: Old image not automatically deleted (consider for improvement)

**Implementation:** `src/pages/AdminArticleForm.js`
- Supports editing through modal
- Image upload optional for updates

---

### 5. Delete Article

**Endpoint:** `DELETE /api/news/:id`  
**Auth Required:** No

**Response (200 OK):**
```json
{
  "message": "News article deleted successfully"
}
```

**Implementation:** `src/pages/AdminArticleForm.js` and `src/pages/ListNews.js`
- Confirmation dialog before deletion

---

## Validation Rules

### File Validation

**Utility Function:** `validators.validateFile(file, type, maxSizeBytes)`

```javascript
// Example usage
const validation = validators.validateFile(file, 'image/*', 5 * 1024 * 1024);

if (validation.isValid) {
  // File is valid
} else {
  console.error(validation.error); // "File must be of type image/* or File size must be less than 5 MB"
}
```

**Rules:**
- File type must match pattern (e.g., `image/*` for any image)
- Max size default: 5MB (5242880 bytes)
- Returns: `{ isValid: boolean, error: string | null }`

### Email Validation

**Utility Function:** `validators.isValidEmail(email)`

- Must match pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Returns boolean

### Password Validation

**Utility Function:** `validators.isValidPassword(password)`

- Minimum 6 characters
- Returns boolean

### Job Data Validation

**Utility Function:** `validators.validateJobCreate(jobData)`

Validates:
- Required fields: positionName, company, salary, location, qualification, companyOverview
- Field types must be strings
- applicationDeadline (if provided) must be valid ISO 8601 date
- responsibilities/skills must be array of strings or CSV string

Returns: `{ isValid: boolean, errors: string[] }`

### Department Validation

**Utility Function:** `validators.validateDepartment(departmentData)`

- name required and must be non-empty string
- Returns: `{ isValid: boolean, errors: string[] }`

### News Validation

**Utility Function:** `validators.validateNews(newsData)`

- Required fields: title, content, author
- All must be non-empty strings
- Returns: `{ isValid: boolean, errors: string[] }`

---

## Error Handling

### Client-Side Error Handling

All components implement consistent error handling:

1. **Input Validation Errors:** Displayed before API call
2. **API Response Errors:** Caught from server response
3. **Network Errors:** Caught from try-catch blocks

### Error Display

```javascript
// Example from AddJob.js
{errors.length > 0 && (
    <div style={styles.errorContainer}>
        <h4>Validation Errors:</h4>
        {errors.map((error, index) => (
            <p key={index}>• {error}</p>
        ))}
    </div>
)}
```

### Common Error Scenarios

1. **Missing Authentication Token:** 
   - Error: "Authentication token not found. Please login again."
   - Action: Redirect to login

2. **Validation Failed:**
   - Error: Array of validation errors
   - Action: Display errors, prevent submission

3. **Network Error:**
   - Error: Caught exception
   - Action: Display error message to user

4. **Server Error (4xx/5xx):**
   - Error: Server response message
   - Action: Display error, allow retry

---

## File Upload Guidelines

### Image Upload Requirements

**For Jobs:**
- Required: Image file (main job image)
- Optional: Logo file
- Format: image/* (PNG, JPG, GIF, WebP, etc.)
- Max Size: 5MB per file
- Destination: Cloudinary (automatic)

**For News:**
- Required: Image file
- Format: image/* 
- Max Size: 5MB
- Destination: Cloudinary (automatic)

**For Departments:**
- No file upload

### Upload Workflow

1. **File Selection:** User selects file via input[type="file"]
2. **Client Validation:** `validateFile()` checks type and size
3. **FormData Preparation:** File appended to FormData
4. **Server Upload:** Sent to backend
5. **Cloudinary Processing:** Backend uploads to Cloudinary
6. **Database Storage:** Image URL and public IDs stored

### Best Practices

1. Always validate file before allowing upload
2. Show file size in UI (e.g., "max 5MB")
3. Provide clear feedback on upload progress
4. Handle upload failures gracefully
5. Consider compression for large files client-side (future improvement)

---

## Implementation Summary

| Component | API Endpoints Used | Validation |
|-----------|-------------------|-----------|
| Login.js | POST /auth/login | validateLogin() |
| AddJob.js | POST /jobs, GET /departments | validateJobCreate(), validateFile() |
| UpdateJob.js | GET /jobs/:id, PUT /jobs/:id, GET /departments | validateJobUpdate(), validateFile() |
| ListJobs.js | GET /jobs, DELETE /jobs/:id | - |
| AddDepartment.js | POST /departments | validateDepartment() |
| ListDepartments.js | GET /departments, DELETE /departments/:id | - |
| AdminArticleForm.js | POST /news, GET /news, PUT /news/:id, DELETE /news/:id | validateNews(), validateFile() |
| ListNews.js | GET /news, DELETE /news/:id | - |

---

## Validator Utility

**File:** `src/utils/validators.js`

Centralized validation functions used across the application:

```javascript
import validators from '../utils/validators';

// Example: Validate job data
const validation = validators.validateJobCreate(jobData);
if (!validation.isValid) {
  console.error(validation.errors); // Array of error messages
}

// Example: Validate file
const fileValidation = validators.validateFile(file, 'image/*', 5 * 1024 * 1024);
if (!fileValidation.isValid) {
  console.error(fileValidation.error); // String error message
}
```

---

## Future Improvements

1. **News Image Management:** Store Cloudinary public_id for automatic cleanup
2. **Client-Side Image Compression:** Reduce file sizes before upload
3. **Progress Indicators:** Show upload/processing progress
4. **Bulk Operations:** Add bulk job/news management
5. **Advanced Search:** Implement full-text search
6. **Field-Level Validation:** Real-time validation as user types
7. **Retry Logic:** Automatic retry for failed network requests
8. **Pagination Improvements:** Implement cursor-based pagination

---

## Support & Troubleshooting

### Common Issues

**Q: File upload fails with "File type error"**  
A: Ensure file is an image format (PNG, JPG, etc.). Check file extension and MIME type.

**Q: Validation errors not showing**  
A: Check that validators.js is properly imported and validator function is called.

**Q: Token expiration issues**  
A: Implement token refresh mechanism or redirect to login.

**Q: Large file uploads timeout**  
A: Implement client-side image compression or increase server timeout.

For additional support, refer to API server documentation or contact the development team.

---

**Last Updated:** December 10, 2025  
**Version:** 1.0  
**API Version:** RESTful API v1
