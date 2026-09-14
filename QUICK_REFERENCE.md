## Admin Panel - Quick Reference Guide

### Setup & Configuration

**Environment Setup:**
1. Open `src/utils/apiConfig.js`
2. Select the appropriate BASE_API_URL for your environment
3. Restart the development server if needed

**Authentication:**
- Login at `/login` page
- Token automatically stored in localStorage
- Token used in all protected API calls via Authorization header

---

### API Endpoints Cheat Sheet

#### Auth
- `POST /api/auth/login` - User login

#### Jobs
- `GET /api/jobs` - List jobs (paginated)
- `POST /api/jobs` - Create job (requires auth)
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job (requires auth)
- `DELETE /api/jobs/:id` - Delete job (requires auth)

#### Departments
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department (requires auth)
- `DELETE /api/departments/:id` - Delete department (requires auth)

#### News
- `GET /api/news` - List news articles
- `POST /api/news` - Create news article
- `GET /api/news/:id` - Get article details
- `PUT /api/news/:id` - Update article
- `DELETE /api/news/:id` - Delete article

---

### Validation Functions

**Import validators:**
```javascript
import validators from '../utils/validators';
```

**Available validators:**

| Function | Usage | Returns |
|----------|-------|---------|
| `validateLogin()` | `validators.validateLogin({email, password})` | `{isValid, errors}` |
| `validateJobCreate()` | `validators.validateJobCreate(jobData)` | `{isValid, errors}` |
| `validateJobUpdate()` | `validators.validateJobUpdate(jobData)` | `{isValid, errors}` |
| `validateDepartment()` | `validators.validateDepartment({name})` | `{isValid, errors}` |
| `validateNews()` | `validators.validateNews({title, content, author})` | `{isValid, errors}` |
| `validateFile()` | `validators.validateFile(file, 'image/*', 5*1024*1024)` | `{isValid, error}` |
| `isValidEmail()` | `validators.isValidEmail(email)` | boolean |
| `isValidPassword()` | `validators.isValidPassword(password)` | boolean |

---

### Component Usage Examples

#### Login Component
```javascript
import validators from '../utils/validators';

const handleSubmit = async (e) => {
    const validation = validators.validateLogin({email, password});
    if (!validation.isValid) {
        setErrors(validation.errors);
        return;
    }
    // Proceed with login
};
```

#### Job Creation
```javascript
import validators from '../utils/validators';

const handleFileChange = (e) => {
    const file = e.target.files[0];
    const validation = validators.validateFile(file, 'image/*', 5*1024*1024);
    if (!validation.isValid) {
        setErrors([validation.error]);
    }
};

const handleSubmit = async (e) => {
    const validation = validators.validateJobCreate(job);
    if (!validation.isValid) {
        setErrors(validation.errors);
        return;
    }
    // Proceed with API call
};
```

#### Department Management
```javascript
const handleSubmit = async (e) => {
    const validation = validators.validateDepartment({name: departmentName});
    if (!validation.isValid) {
        setErrors(validation.errors);
        return;
    }
    // Proceed with creation
};
```

---

### File Upload Rules

| Field | Max Size | Type | Required |
|-------|----------|------|----------|
| Job Image | 5MB | image/* | Yes |
| Job Logo | 5MB | image/* | No |
| News Image | 5MB | image/* | Yes |
| Department Logo | N/A | N/A | No |

---

### Common Errors & Solutions

**"Authentication token not found"**
- Solution: User must login first
- Fix: Clear localStorage, login again

**"File type error" on upload**
- Solution: Ensure file is an image (PNG, JPG, WebP, GIF)
- Fix: Select a valid image file

**"File too large" error**
- Solution: File exceeds 5MB limit
- Fix: Compress image or select smaller file

**Validation shows before API call**
- This is expected - validates data client-side before sending
- Check error messages and correct input

**Missing required fields**
- Required fields marked with * in forms
- Fill all marked fields before submitting

---

### LocalStorage Keys

The app uses localStorage for:
- `token` - JWT authentication token (saved on login)
- `userEmail` - Logged-in user email (optional, for display)

**Clear storage (for logout):**
```javascript
localStorage.removeItem('token');
localStorage.removeItem('userEmail');
```

---

### API Request Headers

**Protected Endpoints (require auth):**
```
Authorization: Bearer <JWT_TOKEN>
```

**File Upload Endpoints:**
```
Content-Type: multipart/form-data
Authorization: Bearer <JWT_TOKEN> (if required)
```

**JSON Endpoints:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN> (if required)
```

---

### Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Created (POST) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (no permission) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Server Error |

---

### Testing Quick Commands

**Test Login (PowerShell):**
```powershell
$body = @{
    email = "user@example.com"
    password = "password123"
} | ConvertTo-Json

curl.exe -X POST "http://localhost:5000/api/auth/login" `
  -H "Content-Type: application/json" `
  -d $body
```

**Test Get Jobs:**
```powershell
curl.exe "http://localhost:5000/api/jobs?page=1&limit=10"
```

**Test Create Job (with auth):**
```powershell
$token = "YOUR_JWT_TOKEN_HERE"

curl.exe -X POST "http://localhost:5000/api/jobs" `
  -H "Authorization: Bearer $token" `
  -F "positionName=Developer" `
  -F "company=ACME" `
  -F "salary=5-8 LPA" `
  -F "location=Pune" `
  -F "qualification=Bachelor's" `
  -F "companyOverview=Great company" `
  -F "image=@C:\path\to\image.jpg"
```

---

### Page Navigation

| Page | Route | Purpose |
|------|-------|---------|
| Login | `/` | User authentication |
| Home | `/home` | Dashboard/Home page |
| Add Job | `/add-job` | Create new job posting |
| Job List | `/list-jobs` | View/Edit/Delete jobs |
| Update Job | `/update-job/:id` | Edit specific job |
| Add Department | `/add-department` | Create new department |
| Department List | `/list-departments` | View/Delete departments |
| Add News | `/add-news` | Create news article |
| News List | `/list-news` | View/Delete news |
| Admin News | `/admin-news` | Admin news management (modal) |

---

### Developer Workflow

1. **Make changes** to a component
2. **Save file** - Hot reload enabled
3. **Test in browser** - View updates immediately
4. **Check console** for errors - F12 to open DevTools
5. **Validate data** - Use validators before API calls
6. **Check localStorage** - F12 → Application → Local Storage

---

### Performance Tips

1. **Lazy Load Images:** Consider adding image lazy loading
2. **Pagination:** Always use pagination for lists
3. **Caching:** Consider caching department list in state
4. **Debouncing:** For search/filter inputs
5. **Code Splitting:** Split large pages into components

---

### Security Best Practices

1. **Never log tokens** - Don't console.log sensitive data
2. **Validate all inputs** - Use validators consistently
3. **Clear tokens on logout** - Remove from localStorage
4. **HTTPS only** - Use HTTPS in production
5. **CORS handling** - Backend should handle CORS properly

---

### Useful Development Resources

- **Validator Tests:** Check `src/utils/validators.js`
- **API Config:** `src/utils/apiConfig.js`
- **Component Examples:** Each page component shows implementation
- **Error Handling:** Check component state management for errors

---

### Contact & Support

For API issues or validation problems:
1. Check the error message displayed
2. Refer to `API_IMPLEMENTATION_GUIDE.md`
3. Review component implementation examples
4. Check browser console for detailed errors (F12)

---

**Last Updated:** December 10, 2025  
**Version:** 1.0
