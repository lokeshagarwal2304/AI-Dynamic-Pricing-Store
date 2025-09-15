# Role-Based Access Control (RBAC) Implementation

This document describes the role-based access control implementation for the AI-Driven Dynamic Pricing E-commerce Platform.

## Overview

The RBAC system ensures that only users with the "admin" role can access administrative functionalities, while regular users are restricted to standard features.

## Backend Implementation (FastAPI)

### 1. JWT Authentication with Roles

**Location**: `backend/main.py`

- **JWT Token Enhancement**: JWT tokens now include the user's role in the payload
- **Login Endpoint**: Modified to include role from the database in the JWT token
- **Register Endpoint**: Sets default role as "user" and includes it in JWT

```python
# JWT payload now includes role
access_token = create_access_token(
    data={"sub": user["username"], "role": user["role"]}, 
    expires_delta=access_token_expires
)
```

### 2. Admin Role Dependency

**Location**: `backend/main.py` (lines 262-291)

The `require_admin_role` dependency:
- Extracts and validates JWT from Authorization header
- Decodes token to verify authenticity
- Checks if user role is "admin"
- Raises HTTPException with 403 Forbidden if not admin
- Raises HTTPException with 401 Unauthorized if token is invalid

```python
def require_admin_role(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to require admin role from JWT token"""
    # Validates JWT and checks for admin role
    # Returns user info if admin, raises 403 if not admin
```

### 3. Protected Admin Endpoints

The following endpoints are now protected with `require_admin_role`:

- **POST /train** - Model retraining (line 735)
- **POST /upload-data** - Data upload and training (line 744)

```python
@app.post("/train")
async def retrain_model(admin_user: dict = Depends(require_admin_role)):
    """Retrain the model (admin only)"""

@app.post("/upload-data")
async def upload_data(file: UploadFile = File(...), admin_user: dict = Depends(require_admin_role)):
    """Upload new training data (admin only)"""
```

## Frontend Implementation (React)

### 1. Global User State

**Location**: `frontend/src/contexts/AuthContext.tsx`

The AuthContext provides:
- User information including role
- `isAdmin` computed property for easy role checking
- Persistent authentication state via cookies

```typescript
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean; // Computed from user.role === 'admin'
  // ... other methods
}
```

### 2. Conditional Navigation Rendering

**Location**: `frontend/src/components/layout/Header.tsx` (lines 36-39)

Navigation links are conditionally rendered based on user role:

```typescript
const navigation = [
  { name: 'Products', href: '/', current: isActive('/') || isActive('/products'), icon: '📦' },
  ...(isAdmin ? [
    { name: 'Dashboard', href: '/dashboard', current: isActive('/dashboard'), icon: '📊' },
    { name: 'Performance', href: '/performance', current: isActive('/performance'), icon: '📈' },
  ] : []),
];
```

### 3. AdminProtectedRoute Component

**Location**: `frontend/src/components/auth/AdminProtectedRoute.tsx`

This component:
- Checks authentication status and role
- Shows loading spinner during verification
- Redirects to login if not authenticated
- Redirects to homepage if not admin
- Renders protected content only for admin users

```typescript
const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};
```

### 4. Protected Routing

**Location**: `frontend/src/App.tsx`

Admin routes are wrapped with `AdminProtectedRoute`:

```typescript
// Dashboard routes (admin only)
<Route path="/dashboard" element={
  <AdminProtectedRoute>
    <AdminDashboard />
  </AdminProtectedRoute>
} />

<Route path="/performance" element={
  <AdminProtectedRoute>
    <ModelPerformance />
  </AdminProtectedRoute>
} />

// Additional admin routes
<Route path="/admin/dashboard" element={
  <AdminProtectedRoute>
    <AdminDashboard />
  </AdminProtectedRoute>
} />
```

## Database Schema

**Location**: `backend/database.py`

The User model includes a role field:

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    # ... other fields
    role = Column(String, default="user")  # "user" or "admin"
    # ... relationships
```

## Testing the Implementation

### 1. Create Test Users

Run the admin creation script:

```bash
cd backend
python create_admin.py
```

This creates:
- **Admin User**: `admin` / `admin123` (role: "admin")
- **Regular User**: `testuser` / `user123` (role: "user")

### 2. Test Scenarios

**Admin User Test:**
1. Login with admin credentials
2. Navigate to Dashboard (should be accessible)
3. Access admin API endpoints (should work)

**Regular User Test:**
1. Login with regular user credentials
2. Try to access `/dashboard` (should redirect to homepage)
3. Try to call admin API endpoints (should return 403 Forbidden)

**Unauthenticated User Test:**
1. Try to access `/dashboard` without login (should redirect to login)
2. Try to call any protected endpoint (should return 401 Unauthorized)

### 3. API Testing

You can test the API endpoints using curl or any HTTP client:

```bash
# Login and get JWT token
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Test admin endpoint with JWT token
curl -X POST "http://localhost:8000/train" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Security Features

### 1. JWT Token Validation
- Tokens are validated for authenticity using HMAC signature
- Expiration times are enforced
- Role information is embedded in the token payload

### 2. Multiple Protection Layers
- **Backend**: API endpoint protection via dependencies
- **Frontend**: Route protection via React components
- **UI**: Conditional rendering based on user role

### 3. Secure Defaults
- New users are assigned "user" role by default
- Admin access requires explicit role assignment
- Failed authorization attempts return appropriate HTTP status codes

## Error Handling

### Backend Error Responses

```json
// 401 Unauthorized (invalid/missing token)
{
  "detail": "Could not validate credentials"
}

// 403 Forbidden (valid token, insufficient permissions)
{
  "detail": "Admin access required"
}
```

### Frontend Error Handling

- Loading states during authentication verification
- Automatic redirects for unauthorized access attempts
- Clear visual feedback for permission-related issues

## Best Practices Implemented

1. **Principle of Least Privilege**: Users only get necessary permissions
2. **Defense in Depth**: Multiple layers of protection
3. **Secure by Default**: Conservative permission model
4. **Clear Error Messages**: Helpful but not revealing sensitive information
5. **Consistent UX**: Smooth redirects and loading states

## Configuration

### Environment Variables

For production deployment, consider these environment variables:

```bash
# JWT Settings
JWT_SECRET_KEY="your-very-secure-secret-key"
JWT_ALGORITHM="HS256"
JWT_EXPIRE_MINUTES=30

# Database
DATABASE_URL="your-production-database-url"
```

### Production Considerations

1. **Change Default Passwords**: Update the default admin password
2. **Use Strong JWT Secrets**: Generate cryptographically secure keys
3. **Enable HTTPS**: Ensure all communication is encrypted
4. **Rate Limiting**: Implement API rate limiting for admin endpoints
5. **Audit Logging**: Log admin actions for security monitoring

## Troubleshooting

### Common Issues

1. **403 Forbidden on Admin Endpoints**: Check user role in database
2. **Token Expired Errors**: User needs to login again
3. **Navigation Not Updating**: Clear browser cache/cookies
4. **Database Connection Issues**: Verify database is running and accessible

### Debug Steps

1. Check JWT token payload in browser developer tools
2. Verify user role in database directly
3. Check server logs for authentication errors
4. Test API endpoints independently with tools like Postman

This implementation provides a robust, secure, and user-friendly role-based access control system for your AI-powered e-commerce platform.