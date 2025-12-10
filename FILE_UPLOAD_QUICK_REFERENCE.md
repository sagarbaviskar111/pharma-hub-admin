# File Upload Implementation - Quick Reference

## What Changed

Your frontend now has:

1. **File Validation** - Checks file type and size before upload
2. **FormData Building** - Constructs multipart data correctly with exact field names
3. **413 Error Handling** - Shows user-friendly message when file is too large
4. **Size Debugging** - Logs file sizes to console for troubleshooting
5. **10MB Default Limit** - Frontend allows up to 10MB (configurable)

---

## File Upload Flow (Updated)

```
User selects file
        ↓
Front validates: Is it an image? Is it < 10MB?
        ↓
If NO → Show error to user
If YES → Continue
        ↓
Build FormData with correct field names
        ↓
Log file size to console (for debugging)
        ↓
Send POST/PUT to backend with proper headers
        ↓
Backend receives and validates size (checks MAX_FILE_SIZE from .env)
        ↓
If file > MAX_FILE_SIZE → Return 413 error
If OK → Process upload to Cloudinary
        ↓
Return 200 success or error message
```

---

## How Each Component Works

### AddJob.js - Create New Job with Image + Logo

**Key Changes:**
- `validateFiles()` helper function validates both image and logo
- `buildJobFormData()` constructs FormData with all required fields
- Logs file sizes: `image size: 2456789 bytes logo size: 1234567 bytes`
- Catches 413 error: "File too large. Server rejected payload..."

**Usage Example:**
```javascript
const [imageFile, setImageFile] = useState(null);
const [logoFile, setLogoFile] = useState(null);

const handleImageChange = (e) => {
  const file = e.target.files[0];
  setImageFile(file); // validateFiles() runs in handleSubmit
};

const handleLogoChange = (e) => {
  const file = e.target.files[0];
  setLogoFile(file);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Validates both files are images and < 10MB
    validateFiles(imageFile, logoFile, 10 * 1024 * 1024);
    
    // Builds FormData with correct field names
    const formData = buildJobFormData(job, imageFile, logoFile);
    
    // Upload with proper headers
    const response = await fetch(`${BASE_API_URL}/api/jobs`, {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 413) {
      // Server rejected - file too large
      showError('File too large. Try compressing images.');
    }
  } catch (error) {
    // Frontend validation failed or upload error
    showError(error.message);
  }
};
```

### UpdateJob.js - Update Existing Job

**Key Changes:**
- Same file validation as AddJob
- Improved FormData building (skips empty fields)
- Logs total payload size
- Handles 413 errors

**Example:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    validateFiles(imageFile, logoFile);
    
    const formData = buildJobFormData(job, imageFile, logoFile);
    
    // Log payload size
    let totalSize = 0;
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) totalSize += pair[1].size;
    }
    console.log('Payload file size:', totalSize, 'bytes');
    
    const response = await fetch(`${BASE_API_URL}/api/jobs/${id}`, {
      method: 'PUT',
      body: formData,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 413) {
      throw new Error('File too large');
    }
  } catch (error) {
    setErrors([error.message]);
  }
};
```

### AdminArticleForm.js - Create/Edit News Articles

**Key Changes:**
- File limit updated from 5MB to 10MB
- 413 error handling added
- Proper try-catch-finally structure

**Example:**
```javascript
const handleFormSubmit = async (values) => {
  setValidationErrors([]);
  setLoading(true);
  
  try {
    // Validate article data (title, content, author required)
    const validation = validators.validateNews(values);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    // For new articles, image is required
    if (!editingNews && !selectedImage) {
      throw new Error('Image file is required for new articles (max 10MB)');
    }
    
    // Validate image size (10MB limit)
    if (selectedImage) {
      const imageValidation = validators.validateFile(
        selectedImage, 
        'image/*', 
        10 * 1024 * 1024
      );
      if (!imageValidation.isValid) {
        throw new Error(imageValidation.error);
      }
    }
    
    // Build FormData
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('content', values.content);
    formData.append('author', values.author);
    if (selectedImage) formData.append('image', selectedImage);
    
    // Debug log
    console.log('Uploading news image size:', selectedImage?.size, 'bytes');
    
    // Upload
    const response = await fetch(`${BASE_API_URL}/api/news`, {
      method: 'POST',
      body: formData
    });
    
    // Handle 413 specifically
    if (response.status === 413) {
      throw new Error('File too large. Server rejected payload. Try compressing image.');
    }
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to save news');
    }
    
    message.success('News added successfully');
    fetchNews();
    
  } catch (error) {
    setValidationErrors([error.message]);
  } finally {
    setLoading(false);
  }
};
```

---

## uploadHelper.js - Reusable Utilities

The new `src/utils/uploadHelper.js` provides these functions:

### `validateFiles(imageFile, logoFile, maxSizeBytes = 10MB)`
Validates both files are images and within size limit.
```javascript
import { validateFiles } from '../utils/uploadHelper';

try {
  validateFiles(imageFile, logoFile, 10 * 1024 * 1024);
  // Files are valid, proceed
} catch (error) {
  console.error(error.message); // "Image exceeds max size of 10MB..."
}
```

### `buildJobFormData(values, imageFile, logoFile)`
Builds FormData with exact backend field names.
```javascript
import { buildJobFormData } from '../utils/uploadHelper';

const formData = buildJobFormData(jobData, image, logo);
// FormData now has: company, positionName, image, logo, 
// responsibilities (array), skills (array), etc.
```

### `uploadJobFetch(values, imageFile, logoFile, token)`
Complete fetch-based upload with error handling.
```javascript
import { uploadJobFetch } from '../utils/uploadHelper';

try {
  const result = await uploadJobFetch(jobData, image, logo, authToken);
  console.log('Uploaded:', result);
} catch (error) {
  if (error.message.includes('413')) {
    // File too large
  }
}
```

### `validateFile(file, fileType, maxSizeBytes)`
Generic file validator (used by validators.js).
```javascript
import { validateFile } from '../utils/uploadHelper';

const validation = validateFile(file, 'image/*', 10 * 1024 * 1024);
if (!validation.isValid) {
  console.error(validation.error); // "File must be of type image/*"
}
```

---

## Backend .env Setup

### Current Settings (Update These):

**Before:**
```env
# Not specified, using defaults
```

**After (Required):**
```env
PORT=5000
BODY_LIMIT=20mb
MAX_FILE_SIZE=20971520
```

**Byte Conversions:**
- 5 MB = 5242880
- 10 MB = 10485760
- 20 MB = 20971520  ← recommended
- 50 MB = 52428800
- 100 MB = 104857600

### Restart Backend:
```powershell
cd d:\privete\backend
npm stop                    # Or Ctrl+C
npm install                 # Clear cache
npm start                   # Or: npm run dev
```

---

## Testing File Uploads

### Step 1: Enable Console Logging
Open browser DevTools (F12) → Console tab

### Step 2: Try Upload
Upload a file in your app

### Step 3: Check Logs
Should see:
```
Uploading - image size: 2456789 bytes logo size: 1234567 bytes
```

### Step 4: Check Network Tab
DevTools → Network tab → Find request
- Headers: `Authorization: Bearer token123...`
- Content-Type: `multipart/form-data; boundary=----WebKitFormBoundary...`
- Status: Should be 200 (success) or 413 (too large)

### Step 5: Test 413 Error
1. Set backend MAX_FILE_SIZE=5242880 (5MB)
2. Upload 10MB file
3. Should see: "File too large. Server rejected payload..."

### Step 6: Test Success
1. Upload file < MAX_FILE_SIZE
2. Should see: "Job added successfully!" or "News added successfully!"

---

## Common Error Messages Users Will See

| Error | Cause | Solution |
|-------|-------|----------|
| "Image must be an image file" | File is not image/png, jpg, gif, etc. | Choose an image file |
| "Image exceeds max size of 10MB. Current: 15.5MB" | File too large for frontend | Choose smaller image or compress |
| "File too large. Server rejected payload..." | Backend MAX_FILE_SIZE exceeded | Wait for admin to increase limit |
| "Email is required" | Missing email field | Fill in all required fields |
| "Image file is required" | No image selected for new job | Select an image file |
| "An error occurred while saving..." | Network error or server error | Check console and try again |

---

## Implementation Summary

**Files Modified:**
- ✅ `src/pages/AddJob.js` - Added validateFiles(), buildJobFormData(), 413 handling
- ✅ `src/pages/UpdateJob.js` - Added 413 error handling, payload logging
- ✅ `src/pages/AdminArticleForm.js` - Updated 10MB limit, 413 handling
- ✅ `src/utils/validators.js` - Updated default file size limit
- ✅ `src/utils/uploadHelper.js` - NEW reusable upload utilities

**Features Added:**
- ✅ File type validation (must be image)
- ✅ File size validation (10MB default)
- ✅ Proper FormData construction
- ✅ 413 error handling with user message
- ✅ File size logging to console
- ✅ Try-catch-finally error handling
- ✅ Disabled submit during upload

**Ready to Test:**
1. Update backend .env with BODY_LIMIT and MAX_FILE_SIZE
2. Restart backend server
3. Test file upload in frontend (AddJob, UpdateJob, AdminArticleForm)
4. Check console logs for file sizes
5. Test with files > 5MB to verify proper handling

All changes follow REST API best practices and match the provided specification exactly.
