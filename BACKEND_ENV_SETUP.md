# Backend Configuration Guide - File Upload Size Limits

## Frontend Implementation Summary

The frontend has been updated with:

✅ **File Validation** - Validates files before upload with detailed error messages
✅ **FormData Building** - Constructs FormData with exact backend field names
✅ **413 Error Handling** - Catches payload-too-large errors and shows user-friendly messages
✅ **Upload Debugging** - Logs file sizes to console for troubleshooting
✅ **Size Limits** - Default 10MB limit on frontend, configurable per component

### Updated Components:
1. **AddJob.js** - Job creation with image + logo upload
2. **UpdateJob.js** - Job update with image handling
3. **AdminArticleForm.js** - News article with image upload
4. **validators.js** - File validation updated to 10MB default
5. **uploadHelper.js** - NEW utility module with reusable upload functions

---

## Backend Configuration - .env Changes Required

### For Local Development (localhost:5000)

Create or edit `.env` file in your **backend root directory** (`d:/privete/backend/.env`):

```env
# Server Port
PORT=5000

# File Upload Limits
BODY_LIMIT=20mb
MAX_FILE_SIZE=20971520

# Database & Auth (keep existing settings)
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

**Key Values:**
- `BODY_LIMIT=20mb` - Express server body size limit (accepts: 1mb, 5mb, 20mb, 50mb, 100mb, etc.)
- `MAX_FILE_SIZE=20971520` - Multer file size limit in bytes (20 * 1024 * 1024 = 20,971,520 bytes = 20MB)

### Common Size Conversions:
```
5 MB    = 5242880 bytes
10 MB   = 10485760 bytes
20 MB   = 20971520 bytes (recommended default)
50 MB   = 52428800 bytes
100 MB  = 104857600 bytes
```

---

## Restart Backend Server (PowerShell)

After updating .env file:

```powershell
# Navigate to backend directory
cd d:\privete\backend

# Stop current server (Ctrl+C if running)

# Clear node_modules cache
Remove-Item node_modules -Recurse -Force
npm install

# Start server with new env variables
npm start

# OR if using nodemon (watches for changes)
npm run dev
```

### Verify Server Started:
```powershell
# Server should log:
# ✓ Server listening on port 5000
# ✓ MongoDB connected
# ✓ MAX_FILE_SIZE: 20971520 (if logged)
```

---

## Nginx Configuration (if using reverse proxy)

If your backend is behind **nginx**, update `/etc/nginx/nginx.conf` or site config:

```nginx
http {
    client_max_body_size 20M;  # Match your backend MAX_FILE_SIZE
    
    server {
        listen 80;
        server_name api.example.com;
        
        location / {
            proxy_pass http://localhost:5000;
            proxy_buffering off;
            proxy_request_buffering off;
        }
    }
}
```

Then reload nginx:
```bash
sudo nginx -s reload
```

---

## Frontend Testing Checklist

✅ **Step 1: Log File Sizes**
Open browser DevTools (F12) → Console → Try uploading a file
You should see: `Uploading - image size: 2456789 bytes logo size: 1234567 bytes`

✅ **Step 2: Test Small File**
- Upload a file < 1MB
- Should succeed without errors
- Verify in database/Cloudinary

✅ **Step 3: Test Large File**
- Create a 15MB test image
- If backend MAX_FILE_SIZE=20MB, should succeed
- If set to 5MB, should show: "File too large. Server rejected payload..."

✅ **Step 4: Check Request Headers**
DevTools → Network tab → Click request → Headers tab
Should see: `Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...`
Should NOT manually set Content-Type (browser sets it automatically)

✅ **Step 5: Verify FormData Fields**
DevTools → Network tab → Click request → Request payload section
Should show all fields: company, positionName, image, logo, responsibilities (multiple), skills (multiple), etc.

---

## Common Issues & Solutions

### Issue: 413 Payload Too Large Error

**Cause:** File size exceeds server limit

**Solutions:**
1. Increase MAX_FILE_SIZE in .env:
   ```env
   MAX_FILE_SIZE=52428800  # 50 MB instead of 20 MB
   ```

2. Compress image on frontend (Optional):
   ```bash
   npm install browser-image-compression
   ```
   Then use in component:
   ```javascript
   import { compressImageIfNeeded } from '../utils/uploadHelper';
   const compressed = await compressImageIfNeeded(imageFile, 2); // max 2MB
   ```

3. If behind nginx, update `client_max_body_size`:
   ```nginx
   client_max_body_size 50M;
   ```

### Issue: "File size must be less than 10 MB" on Frontend

**Cause:** Frontend validator rejecting file

**Solutions:**
1. Check file actual size:
   ```javascript
   console.log(file.size / 1024 / 1024, 'MB');  // Should be < 10
   ```

2. Update validator limit in AddJob.js:
   ```javascript
   validateFiles(imageFile, logoFile, 15 * 1024 * 1024);  // 15MB
   ```

### Issue: "Cannot read properties of undefined"

**Cause:** validators module not imported correctly

**Solutions:**
```javascript
// Correct:
import validators from '../utils/validators';

// Then use:
validators.validateFile(file, 'image/*', 10 * 1024 * 1024);
```

### Issue: FormData Fields Not Matching Backend

**Cause:** Field names in FormData don't match backend expectations

**Solutions:**
Check backend endpoint accepts these exact fields:
- `company`, `positionName`, `qualification`, `experience`, `salary`, `location`
- `responsibilities` (multiple values, same key name)
- `skills` (multiple values, same key name)
- `image`, `logo` (file fields)
- `email`, `tags`, `applylink`, `companyOverview`, `department`
- `driveLocation`, `driveDate`, `driveTime`, `driveContactPerson`, `driveContactNumber`
- `applicationDeadline`, `type`

Update FormData builder in uploadHelper.js if backend field names differ.

---

## Next Steps

1. ✅ Update backend .env with `BODY_LIMIT` and `MAX_FILE_SIZE`
2. ✅ Restart backend server
3. ✅ Test upload with small file (< 1MB)
4. ✅ Test upload with large file (5-15MB)
5. ✅ Monitor browser console for file size logs
6. ✅ Check Network tab for correct Content-Type header
7. ✅ Verify FormData fields in request payload

---

## Quick Reference: Field Name Mappings

### Job Upload Fields (AddJob, UpdateJob):
```
Text Fields: company, positionName, qualification, experience, salary, location, 
             applylink, tags, companyOverview, email, driveLocation, driveDate, 
             driveTime, driveContactPerson, driveContactNumber, type, department, 
             applicationDeadline

Array Fields: responsibilities[] (multiple), skills[] (multiple)

File Fields: image, logo
```

### News Upload Fields (AdminArticleForm):
```
Text Fields: title, content, author
File Fields: image
```

---

## Debugging Commands

```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process on port 5000
taskkill /PID <PID> /F

# Check .env is being read
cd d:\privete\backend
node -e "require('dotenv').config(); console.log('MAX_FILE_SIZE:', process.env.MAX_FILE_SIZE)"

# View logs while server runs
npm start 2>&1 | Tee-Object -FilePath debug.log
```

---

## Files Modified in Frontend

1. `src/pages/AddJob.js` - Added validateFiles(), buildJobFormData(), improved error handling
2. `src/pages/UpdateJob.js` - Added 413 error handling, payload size logging
3. `src/pages/AdminArticleForm.js` - Updated file size to 10MB, added 413 handling
4. `src/utils/validators.js` - Updated default file size to 10MB
5. `src/utils/uploadHelper.js` - NEW file with reusable upload utilities

All changes are backward compatible and follow the exact requirements from the API specification.
