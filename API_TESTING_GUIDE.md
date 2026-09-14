# API Testing Guide - PowerShell Examples

This guide provides PowerShell commands to test all API endpoints locally.

## Prerequisites

- Server running on `http://localhost:5000`
- PowerShell 5.1 or higher
- `curl.exe` available (built-in on Windows 10+)
- Valid user credentials for auth tests

---

## Authentication Tests

### Test 1: User Login (Success)

```powershell
$loginData = @{
    email = "admin@example.com"
    password = "password123"
} | ConvertTo-Json

$response = curl.exe -X POST "http://localhost:5000/api/auth/login" `
  -H "Content-Type: application/json" `
  -d $loginData

$response | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Expected Response (200):**
```json
{
  "_id": "userId",
  "email": "admin@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save token for further tests:**
```powershell
$response = curl.exe -X POST "http://localhost:5000/api/auth/login" `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@example.com","password":"password123"}'

$token = ($response | ConvertFrom-Json).token
Write-Host "Token: $token"
```

### Test 2: Login with Invalid Email

```powershell
$loginData = @{
    email = "invalid-email-format"
    password = "password123"
} | ConvertTo-Json

curl.exe -X POST "http://localhost:5000/api/auth/login" `
  -H "Content-Type: application/json" `
  -d $loginData
```

**Expected:** Validation error from client

### Test 3: Login with Short Password

```powershell
$loginData = @{
    email = "user@example.com"
    password = "123"
} | ConvertTo-Json

curl.exe -X POST "http://localhost:5000/api/auth/login" `
  -H "Content-Type: application/json" `
  -d $loginData
```

**Expected:** Validation error (password too short)

---

## Jobs API Tests

### Setup: Get Valid Token

```powershell
# Store this for all job API tests
$response = curl.exe -X POST "http://localhost:5000/api/auth/login" `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@example.com","password":"password123"}'

$token = ($response | ConvertFrom-Json).token
```

### Test 1: List Jobs (No Auth Required)

```powershell
# Get first page with 10 items
curl.exe "http://localhost:5000/api/jobs?page=1&limit=10"

# With search query
curl.exe "http://localhost:5000/api/jobs?query=developer"

# By department
curl.exe "http://localhost:5000/api/jobs?departmentId=DEPARTMENT_ID"
```

**Expected Response (200):**
```json
{
  "totalJobs": 5,
  "totalPages": 1,
  "currentPage": 1,
  "jobs": [
    {
      "_id": "jobId",
      "positionName": "Frontend Developer",
      "company": "ACME Ltd",
      "location": "Pune",
      "salary": "5-8 LPA"
    }
  ]
}
```

### Test 2: Get Single Job Details

```powershell
# Replace JOB_ID with actual job ID
curl.exe "http://localhost:5000/api/jobs/JOB_ID"
```

**Expected Response (200):** Complete job document with populated department

### Test 3: Create Job (Full Request)

```powershell
# Using curl with multipart form data
$token = "YOUR_JWT_TOKEN"

curl.exe -X POST "http://localhost:5000/api/jobs" `
  -H "Authorization: Bearer $token" `
  -F "positionName=Frontend Developer" `
  -F "company=ACME Ltd" `
  -F "salary=5-8 LPA" `
  -F "location=Pune" `
  -F "qualification=Bachelor's in CS" `
  -F "companyOverview=We build amazing products" `
  -F "experience=2-3 years" `
  -F "type=Full-time" `
  -F "responsibilities=Build UI" `
  -F "responsibilities=Write tests" `
  -F "skills=React" `
  -F "skills=JavaScript" `
  -F "applylink=https://example.com/apply" `
  -F "tags=#React #Frontend" `
  -F "department=DEPARTMENT_ID" `
  -F "image=@C:\path\to\image.jpg" `
  -F "logo=@C:\path\to\logo.png"
```

**Expected Response (201):**
```json
{
  "message": "Job created successfully",
  "job": {
    "_id": "newJobId",
    "positionName": "Frontend Developer",
    "company": "ACME Ltd",
    "imageUrl": "https://cloudinary.com/...",
    "imagePublicId": "job_images/abc123",
    "logoPublicId": "job_logos/xyz789"
  }
}
```

### Test 4: Create Job (Missing Required Field)

```powershell
$token = "YOUR_JWT_TOKEN"

# Missing company field
curl.exe -X POST "http://localhost:5000/api/jobs" `
  -H "Authorization: Bearer $token" `
  -F "positionName=Developer" `
  -F "salary=5 LPA" `
  -F "location=Pune" `
  -F "qualification=Bachelor's" `
  -F "companyOverview=Desc" `
  -F "image=@C:\path\to\image.jpg"
```

**Expected:** Validation error

### Test 5: Update Job

```powershell
$token = "YOUR_JWT_TOKEN"
$jobId = "JOB_ID"

# Update single field
curl.exe -X PUT "http://localhost:5000/api/jobs/$jobId" `
  -H "Authorization: Bearer $token" `
  -F "salary=8-12 LPA" `
  -F "company=New Company Inc"

# Update with new image
curl.exe -X PUT "http://localhost:5000/api/jobs/$jobId" `
  -H "Authorization: Bearer $token" `
  -F "image=@C:\path\to\new-image.jpg"
```

**Expected Response (200):**
```json
{
  "message": "Job updated successfully",
  "job": {
    "_id": "jobId",
    "salary": "8-12 LPA",
    "company": "New Company Inc"
  }
}
```

### Test 6: Delete Job

```powershell
$token = "YOUR_JWT_TOKEN"
$jobId = "JOB_ID"

curl.exe -X DELETE "http://localhost:5000/api/jobs/$jobId" `
  -H "Authorization: Bearer $token"
```

**Expected Response (200):**
```json
{
  "message": "Job deleted successfully"
}
```

### Test 7: Delete Job Without Auth

```powershell
curl.exe -X DELETE "http://localhost:5000/api/jobs/JOB_ID"
```

**Expected:** 401 Unauthorized

---

## Departments API Tests

### Test 1: List All Departments

```powershell
curl.exe "http://localhost:5000/api/departments"
```

**Expected Response (200):**
```json
[
  {
    "_id": "deptId1",
    "name": "Engineering"
  },
  {
    "_id": "deptId2",
    "name": "Sales"
  }
]
```

### Test 2: Create Department

```powershell
$token = "YOUR_JWT_TOKEN"

$deptData = @{
    name = "Marketing"
} | ConvertTo-Json

curl.exe -X POST "http://localhost:5000/api/departments" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d $deptData
```

**Expected Response (201):**
```json
{
  "message": "Department added successfully",
  "department": {
    "_id": "newDeptId",
    "name": "Marketing"
  }
}
```

### Test 3: Create Department Without Auth

```powershell
curl.exe -X POST "http://localhost:5000/api/departments" `
  -H "Content-Type: application/json" `
  -d '{"name":"HR"}'
```

**Expected:** 401 Unauthorized

### Test 4: Delete Department

```powershell
$token = "YOUR_JWT_TOKEN"
$deptId = "DEPT_ID"

curl.exe -X DELETE "http://localhost:5000/api/departments/$deptId" `
  -H "Authorization: Bearer $token"
```

**Expected Response (200):**
```json
{
  "message": "Department deleted successfully"
}
```

---

## News API Tests

### Test 1: List All News Articles

```powershell
curl.exe "http://localhost:5000/api/news"
```

**Expected Response (200):**
```json
[
  {
    "_id": "newsId",
    "title": "Company Announcement",
    "content": "Long content here...",
    "author": "John Doe",
    "date": "2025-12-10T00:00:00Z",
    "imageUrl": "https://..."
  }
]
```

### Test 2: Get Single News Article

```powershell
curl.exe "http://localhost:5000/api/news/NEWS_ID"
```

**Expected Response (200):** Complete news document

### Test 3: Create News Article

```powershell
$imageFile = "C:\path\to\image.jpg"

curl.exe -X POST "http://localhost:5000/api/news" `
  -F "title=Breaking News" `
  -F "content=This is the news content" `
  -F "author=John Doe" `
  -F "image=@$imageFile"
```

**Expected Response (201):**
```json
{
  "message": "News created successfully",
  "news": {
    "_id": "newNewsId",
    "title": "Breaking News",
    "content": "This is the news content",
    "author": "John Doe",
    "imageUrl": "https://cloudinary.com/..."
  }
}
```

### Test 4: Create News Without Image

```powershell
curl.exe -X POST "http://localhost:5000/api/news" `
  -F "title=News" `
  -F "content=Content" `
  -F "author=Author"
```

**Expected:** Validation error (image required)

### Test 5: Update News Article

```powershell
$newsId = "NEWS_ID"

curl.exe -X PUT "http://localhost:5000/api/news/$newsId" `
  -F "title=Updated Title" `
  -F "content=Updated content"

# With new image
curl.exe -X PUT "http://localhost:5000/api/news/$newsId" `
  -F "title=Updated" `
  -F "image=@C:\path\to\new-image.jpg"
```

**Expected Response (200):**
```json
{
  "message": "News article updated successfully",
  "news": {
    "_id": "newsId",
    "title": "Updated Title"
  }
}
```

### Test 6: Delete News Article

```powershell
curl.exe -X DELETE "http://localhost:5000/api/news/NEWS_ID"
```

**Expected Response (200):**
```json
{
  "message": "News article deleted successfully"
}
```

---

## Stress Testing

### Test 1: Rapid Login Attempts

```powershell
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

for ($i = 1; $i -le 10; $i++) {
    $response = curl.exe -X POST "http://localhost:5000/api/auth/login" `
      -H "Content-Type: application/json" `
      -d '{"email":"user@example.com","password":"password123"}'
    Write-Host "Attempt $i: Response received"
}

$stopwatch.Stop()
Write-Host "Total time: $($stopwatch.ElapsedMilliseconds)ms"
```

### Test 2: Large Job Creation

```powershell
$token = "YOUR_JWT_TOKEN"
$responsibilities = @(
    "Responsibility 1",
    "Responsibility 2",
    "Responsibility 3",
    "Responsibility 4",
    "Responsibility 5"
)

$params = @(
    '-X', 'POST',
    'http://localhost:5000/api/jobs',
    '-H', "Authorization: Bearer $token",
    '-F', 'positionName=Senior Developer',
    '-F', 'company=Large Corp',
    '-F', 'salary=10-15 LPA',
    '-F', 'location=Mumbai',
    '-F', 'qualification=Masters',
    '-F', 'companyOverview=Large company description',
    '-F', 'image=@C:\path\to\image.jpg'
)

foreach ($resp in $responsibilities) {
    $params += @('-F', "responsibilities=$resp")
}

curl.exe @params
```

---

## Error Testing

### Test 1: File Too Large

```powershell
$token = "YOUR_JWT_TOKEN"

# Create a large dummy file (6MB)
$largefile = "C:\temp\largefile.txt"
[System.IO.File]::WriteAllText($largefile, "X" * (6 * 1024 * 1024))

curl.exe -X POST "http://localhost:5000/api/jobs" `
  -H "Authorization: Bearer $token" `
  -F "positionName=Dev" `
  -F "company=Corp" `
  -F "salary=5 LPA" `
  -F "location=City" `
  -F "qualification=BS" `
  -F "companyOverview=Desc" `
  -F "image=@$largefile"

# Expected: File size error
```

### Test 2: Invalid File Type

```powershell
$token = "YOUR_JWT_TOKEN"

# Create a text file with .jpg extension
$fakefile = "C:\temp\fake.jpg"
"This is not an image" | Out-File $fakefile

curl.exe -X POST "http://localhost:5000/api/jobs" `
  -H "Authorization: Bearer $token" `
  -F "positionName=Dev" `
  -F "company=Corp" `
  -F "salary=5 LPA" `
  -F "location=City" `
  -F "qualification=BS" `
  -F "companyOverview=Desc" `
  -F "image=@$fakefile"

# Expected: File type error from server or client validation
```

### Test 3: Invalid Token

```powershell
curl.exe -X POST "http://localhost:5000/api/jobs" `
  -H "Authorization: Bearer invalid.token.here" `
  -F "positionName=Dev" `
  -F "company=Corp" `
  -F "salary=5 LPA" `
  -F "location=City" `
  -F "qualification=BS" `
  -F "companyOverview=Desc"

# Expected: 401 Unauthorized
```

### Test 4: Expired Token

```powershell
# After ~24 hours of token issuance
curl.exe -X POST "http://localhost:5000/api/jobs" `
  -H "Authorization: Bearer oldexpiredtoken" `
  -F "positionName=Dev" `
  -F "company=Corp" `
  -F "salary=5 LPA" `
  -F "location=City" `
  -F "qualification=BS" `
  -F "companyOverview=Desc"

# Expected: 401 Unauthorized
```

---

## Response Code Summary

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success (GET, PUT, DELETE) | Operation completed |
| 201 | Created (POST) | New resource created |
| 400 | Bad Request | Validation error, malformed data |
| 401 | Unauthorized | Missing/invalid token, auth required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 413 | Payload Too Large | File size exceeds limit |
| 500 | Server Error | Unexpected server error |

---

## Useful PowerShell Functions

### Reusable Login Function

```powershell
function Get-AuthToken {
    param(
        [string]$Email = "admin@example.com",
        [string]$Password = "password123"
    )
    
    $loginData = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json
    
    try {
        $response = curl.exe -X POST "http://localhost:5000/api/auth/login" `
          -H "Content-Type: application/json" `
          -d $loginData 2>$null
        
        $result = $response | ConvertFrom-Json
        return $result.token
    }
    catch {
        Write-Error "Login failed: $_"
        return $null
    }
}

# Usage
$token = Get-AuthToken
Write-Host "Token: $token"
```

### Reusable API Call Function

```powershell
function Invoke-APICall {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Token,
        [hashtable]$Data
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $body = $Data | ConvertTo-Json
    
    try {
        $response = curl.exe -X $Method "http://localhost:5000/api/$Endpoint" `
          -H ($headers.GetEnumerator() | ForEach-Object { "$($_.Name):$($_.Value)" }) `
          -d $body 2>$null
        
        return $response | ConvertFrom-Json
    }
    catch {
        Write-Error "API call failed: $_"
        return $null
    }
}

# Usage
$token = Get-AuthToken
$result = Invoke-APICall -Method "GET" -Endpoint "jobs?page=1" -Token $token
$result
```

---

## Performance Benchmarking

### Compare Response Times

```powershell
$endpoints = @(
    "http://localhost:5000/api/jobs",
    "http://localhost:5000/api/departments",
    "http://localhost:5000/api/news"
)

foreach ($endpoint in $endpoints) {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    curl.exe "$endpoint" | Out-Null
    $stopwatch.Stop()
    Write-Host "$endpoint : $($stopwatch.ElapsedMilliseconds)ms"
}
```

---

## Debugging Tips

1. **View Full Response:** Pipe response to `ConvertFrom-Json | ConvertTo-Json -Depth 10`
2. **See Headers:** Add `-i` flag to curl command
3. **Verbose Output:** Add `2>&1` to see all output
4. **Pretty JSON:** Use `ConvertFrom-Json | ConvertTo-Json`
5. **Extract Fields:** Use `| Select-Object -ExpandProperty fieldname`

---

**Last Updated:** December 10, 2025  
**Version:** 1.0  
**Tested On:** Windows PowerShell 5.1+
