# Backend Setup & Testing Commands (PowerShell)

## Quick Setup Commands

### 1. Create/Update Backend .env File

```powershell
# Navigate to backend
cd d:\privete\backend

# Create or edit .env file
notepad .env
```

**Copy this content into .env:**
```
PORT=5000
BODY_LIMIT=20mb
MAX_FILE_SIZE=20971520
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### 2. Restart Backend Server

```powershell
cd d:\privete\backend

# Stop current server (if running)
# Press Ctrl+C in terminal

# Clear cache
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
npm install

# Start server
npm start
```

### 3. Verify .env is Being Read

```powershell
cd d:\privete\backend
node -e "require('dotenv').config(); console.log('BODY_LIMIT:', process.env.BODY_LIMIT); console.log('MAX_FILE_SIZE:', process.env.MAX_FILE_SIZE);"
```

**Should output:**
```
BODY_LIMIT: 20mb
MAX_FILE_SIZE: 20971520
```

---

## Testing Commands

### Test 1: Check if Port is In Use

```powershell
# Check port 5000
netstat -ano | findstr :5000

# Example output:
# TCP    127.0.0.1:5000         0.0.0.0:0              LISTENING       12345

# Kill process if needed (replace 12345 with actual PID)
taskkill /PID 12345 /F
```

### Test 2: Verify Backend is Running

```powershell
# Make a test request
curl http://localhost:5000/api/jobs -Headers @{"Authorization"="Bearer test_token"}

# Or use Invoke-WebRequest (PowerShell native)
Invoke-WebRequest -Uri "http://localhost:5000/api/jobs" -Method GET -Headers @{"Authorization"="Bearer test_token"}
```

### Test 3: Test File Upload (10MB Limit)

```powershell
# Create a test file (smaller than 10MB)
$testFile = "C:\temp\test_image.png"
$bytes = New-Object byte[] 1024000  # 1MB file
[System.IO.File]::WriteAllBytes($testFile, $bytes)

# Upload using PowerShell
$filePath = "C:\temp\test_image.png"
$uri = "http://localhost:5000/api/jobs"
$token = "your_auth_token_here"

$headers = @{
    "Authorization" = "Bearer $token"
}

$form = @{
    company = "Test Company"
    positionName = "Test Position"
    qualification = "Bachelor's"
    experience = "2 years"
    salary = "5-8 LPA"
    location = "Mumbai"
    companyOverview = "Test overview"
    image = Get-Item -Path $filePath
}

Invoke-RestMethod -Uri $uri -Method Post -Form $form -Headers $headers
```

### Test 4: Test 413 Error (File Too Large)

```powershell
# Create a 25MB test file
$testFile = "C:\temp\test_large.png"
$bytes = New-Object byte[] 26214400  # 25MB file
[System.IO.File]::WriteAllBytes($testFile, $bytes)

# Try uploading (should get 413 if MAX_FILE_SIZE=20MB)
$form = @{
    company = "Test Company"
    positionName = "Test Position"
    image = Get-Item -Path $testFile
}

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/jobs" -Method Post -Form $form -Headers $headers
} catch {
    Write-Host "Error Status: $($_.Exception.Response.StatusCode)"
    # Should show: 413
}
```

### Test 5: Monitor Server Logs

```powershell
# Start server with live logs
cd d:\privete\backend
npm start 2>&1 | Tee-Object -FilePath server.log

# In another PowerShell window, monitor the log
Get-Content -Path server.log -Wait
```

---

## File Size Conversion Helper

```powershell
# Function to convert MB to bytes
function ConvertMBtoBytes {
    param([int]$MB)
    return $MB * 1024 * 1024
}

# Example usage
ConvertMBtoBytes 5      # 5242880
ConvertMBtoBytes 10     # 10485760
ConvertMBtoBytes 20     # 20971520
ConvertMBtoBytes 50     # 52428800
ConvertMBtoBytes 100    # 104857600

# Use in .env:
# MAX_FILE_SIZE=20971520  (from ConvertMBtoBytes 20)
```

---

## Environment Variable Verification

```powershell
# Read .env file
Get-Content "d:\privete\backend\.env"

# Verify Node is reading env vars
cd d:\privete\backend
node -e "
require('dotenv').config();
console.log('PORT:', process.env.PORT);
console.log('BODY_LIMIT:', process.env.BODY_LIMIT);
console.log('MAX_FILE_SIZE:', process.env.MAX_FILE_SIZE);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
"
```

---

## Clear Cache & Rebuild

```powershell
# Complete clean rebuild
cd d:\privete\backend

# Stop server (Ctrl+C)

# Clear caches
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
Remove-Item .env.local -Force

# Reinstall
npm install

# Restart
npm start
```

---

## Check Nginx (if applicable)

```powershell
# Check if nginx is running
Get-Process nginx -ErrorAction SilentlyContinue

# On Linux/WSL:
# sudo systemctl status nginx
# sudo nginx -t  # Test config
# sudo systemctl reload nginx  # Reload after config change
```

---

## Frontend Testing in Console

```javascript
// Open browser console (F12) and run these:

// Test 1: Check file sizes
const file = document.querySelector('input[type="file"]').files[0];
console.log('File size:', file.size, 'bytes');
console.log('File size in MB:', (file.size / 1024 / 1024).toFixed(2), 'MB');

// Test 2: Check validators are imported
console.log('validators:', typeof validators);
console.log('validateFile:', typeof validators.validateFile);

// Test 3: Manual file validation
const validation = validators.validateFile(file, 'image/*', 10 * 1024 * 1024);
console.log('Validation result:', validation);

// Test 4: Check auth token
console.log('Token:', localStorage.getItem('token'));

// Test 5: Check API URL
console.log('API URL:', BASE_API_URL);
```

---

## Debugging Commands

### View System Info

```powershell
# Node and npm versions
node --version
npm --version

# Current directory
pwd

# List files in directory
ls d:\privete\backend
ls d:\privete\admin\admin-panel\src\utils

# Check if files exist
Test-Path "d:\privete\backend\.env"
Test-Path "d:\privete\admin\admin-panel\src\utils\uploadHelper.js"
```

### View Network Activity (Windows)

```powershell
# Monitor port 5000 connections
netstat -ano | findstr :5000

# Monitor all connections
Get-NetTCPConnection -LocalPort 5000

# Get process info
Get-Process | where {$_.Handles -gt 900} | Format-Table Name, Handles
```

### Clean Logs & Start Fresh

```powershell
cd d:\privete\backend

# Clear old logs
Remove-Item *.log -Force

# Start with clean output
cls
npm start

# Redirect output to file for analysis
npm start > server.log 2>&1
```

---

## Troubleshooting Commands

### Issue: Port Already in Use

```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID 2345 /F

# Or kill all node processes
taskkill /F /IM node.exe
```

### Issue: Module Not Found

```powershell
cd d:\privete\backend

# Check node_modules
ls node_modules | grep express
ls node_modules | grep multer
ls node_modules | grep mongoose

# If missing, reinstall
npm install express multer mongoose dotenv
```

### Issue: .env Not Being Read

```powershell
# Verify .env file exists and has content
Get-Content "d:\privete\backend\.env"

# Check permissions
ls -Force "d:\privete\backend\.env"

# Restart node to pick up .env
# Kill current process and restart npm start
```

### Issue: Frontend Can't Reach Backend

```powershell
# Check if backend is running
curl http://localhost:5000/api/jobs -v

# Check firewall
Get-NetFirewallRule -DisplayName "*5000*"

# Check CORS if needed
# Ensure backend has:
# app.use(cors());
```

---

## Performance Monitoring

```powershell
# Monitor CPU and memory of Node process
Get-Process node | Select-Object Name, CPU, Memory, Handles

# Start Node with memory limit
node --max-old-space-size=2048 index.js

# Or in npm:
npm start
# Node uses available memory by default
```

---

## Quick Reference - File Locations

```
Backend Root:         d:\privete\backend
Backend Config:       d:\privete\backend\.env
Backend App:          d:\privete\backend\index.js or app.js

Frontend Root:        d:\privete\admin\admin-panel
Frontend Validators:  d:\privete\admin\admin-panel\src\utils\validators.js
Frontend Upload Helper: d:\privete\admin\admin-panel\src\utils\uploadHelper.js
Frontend AddJob:      d:\privete\admin\admin-panel\src\pages\AddJob.js
Frontend UpdateJob:   d:\privete\admin\admin-panel\src\pages\UpdateJob.js
Frontend News:        d:\privete\admin\admin-panel\src\pages\AdminArticleForm.js

Documentation:
  BACKEND_ENV_SETUP.md
  FILE_UPLOAD_QUICK_REFERENCE.md
  UPLOAD_IMPLEMENTATION_SUMMARY.md
  BACKEND_SETUP_COMMANDS.md (this file)
```

---

## One-Command Setup

```powershell
# Complete backend setup in one go
cd d:\privete\backend; `
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue; `
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue; `
npm install; `
$env:BODY_LIMIT='20mb'; `
$env:MAX_FILE_SIZE='20971520'; `
npm start
```

---

## Summary

**To get backend running:**
1. Create `.env` with BODY_LIMIT and MAX_FILE_SIZE
2. Run `npm install`
3. Run `npm start`
4. Test with curl or Postman

**To test uploads:**
1. Upload file < 10MB → Should succeed (200)
2. Upload file > 20MB → Should fail (413)
3. Check console logs for file sizes
4. Check Network tab for headers

**To debug issues:**
1. Check port is not in use: `netstat -ano | findstr :5000`
2. Verify .env is read: `node -e "require('dotenv').config(); console.log(process.env.MAX_FILE_SIZE)"`
3. Check logs: Monitor console while making requests
4. Test endpoint: `curl http://localhost:5000/api/jobs`

---

## Next Steps

- [ ] Update backend `.env` with BODY_LIMIT and MAX_FILE_SIZE
- [ ] Restart backend server
- [ ] Test file upload in frontend
- [ ] Check console logs for file sizes
- [ ] Verify in Network tab
- [ ] Test with large file to verify 413 handling
