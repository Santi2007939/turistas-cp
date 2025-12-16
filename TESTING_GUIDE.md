# Testing Guide - Admin Panel Access and User Approval

## Overview
This guide provides step-by-step instructions to test the admin panel access and user approval system.

## Prerequisites

### Environment Setup
1. MongoDB instance running (local or cloud)
2. Node.js installed (v18+ recommended)
3. Clean database (recommended for testing)

### Configuration

Create `.env` file in `server/` directory:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/turistas_cp
JWT_SECRET=your-secret-key-for-testing
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=12345678901234567890123456789012
CLIENT_URL=http://localhost:4200
```

### Installation
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Test Scenarios

### Scenario 1: First User Registration (Admin)

**Purpose**: Verify that the first user becomes an admin with immediate access

**Steps**:
1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the client (in another terminal):
   ```bash
   cd client
   npm start
   ```

3. Navigate to `http://localhost:4200/auth/register`

4. Register with the following data:
   ```
   Username: admin
   Email: admin@test.com
   Password: admin123
   Full Name: Admin User
   ```

5. **Expected Results**:
   - ✅ Registration succeeds
   - ✅ User is automatically logged in (receives token)
   - ✅ Redirected to `/admin` (Admin Dashboard)
   - ✅ Admin panel shows with "User Management" section
   - ✅ Can see the admin user in the user list
   - ✅ Admin has role="admin", isActive=true, isCurrentMember=true

**API Verification**:
```bash
# Register first user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@test.com",
    "password": "admin123",
    "fullName": "Admin User"
  }'

# Expected response:
{
  "success": true,
  "message": "Admin account created successfully",
  "data": {
    "user": {
      "id": "...",
      "username": "admin",
      "email": "admin@test.com",
      "fullName": "Admin User",
      "role": "admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Scenario 2: Student Registration (Inactive by Default)

**Purpose**: Verify that new students are created as inactive and cannot access the platform

**Steps**:
1. Navigate to `http://localhost:4200/auth/register`

2. Register a new student:
   ```
   Username: student1
   Email: student1@test.com
   Password: student123
   Full Name: Student One
   Codeforces Handle: student1_cf
   ```

3. **Expected Results**:
   - ✅ Registration succeeds
   - ✅ Message shown: "Usuario registrado exitosamente. Tu cuenta está pendiente de aprobación"
   - ✅ User is NOT automatically logged in (no token)
   - ✅ Redirected to `/auth/login` with success message

**API Verification**:
```bash
# Register student
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "email": "student1@test.com",
    "password": "student123",
    "fullName": "Student One",
    "codeforcesHandle": "student1_cf"
  }'

# Expected response:
{
  "success": true,
  "message": "Usuario registrado exitosamente. Tu cuenta está pendiente de aprobación",
  "data": {
    "user": {
      "id": "...",
      "username": "student1",
      "email": "student1@test.com",
      "fullName": "Student One",
      "role": "student",
      "isActive": false
    },
    "token": undefined  // No token provided
  }
}
```

---

### Scenario 3: Inactive Student Login Attempt

**Purpose**: Verify that inactive students cannot login and see appropriate message

**Steps**:
1. Navigate to `http://localhost:4200/auth/login`

2. Attempt to login with student credentials:
   ```
   Email: student1@test.com
   Password: student123
   ```

3. **Expected Results**:
   - ❌ Login fails
   - ✅ Error message shown: "Tu cuenta está pendiente de aprobación por un administrador"
   - ✅ User remains on login page
   - ✅ No access to platform features

**API Verification**:
```bash
# Try to login as inactive student
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@test.com",
    "password": "student123"
  }'

# Expected response (403 Forbidden):
{
  "success": false,
  "message": "Tu cuenta está pendiente de aprobación por un administrador",
  "code": "ACCOUNT_PENDING_APPROVAL"
}
```

---

### Scenario 4: Admin Approves Student

**Purpose**: Verify that admin can approve students from the admin panel

**Steps**:
1. Login as admin at `http://localhost:4200/auth/login`
   ```
   Email: admin@test.com
   Password: admin123
   ```

2. **Expected Results**:
   - ✅ Login succeeds
   - ✅ Redirected to `/admin` (Admin Dashboard)

3. In the User Management table:
   - ✅ See student1 with Status: "Inactive" (red badge)
   - ✅ See "✓ Approve" button next to student1

4. Click "✓ Approve" button for student1

5. **Expected Results**:
   - ✅ Success message: "User approved successfully"
   - ✅ Table refreshes
   - ✅ student1 now shows Status: "Active" (green badge)
   - ✅ "✓ Approve" button changes to "✗ Deactivate"

**API Verification**:
```bash
# First, login as admin to get token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' | jq -r '.data.token')

# Get list of users
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Approve student (replace USER_ID with actual student ID)
curl -X PUT http://localhost:3000/api/users/USER_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}'

# Expected response:
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "user": {
      "_id": "...",
      "username": "student1",
      "isActive": true,
      ...
    }
  }
}
```

---

### Scenario 5: Approved Student Login

**Purpose**: Verify that approved students can now access the platform

**Steps**:
1. Logout (if logged in as admin)

2. Navigate to `http://localhost:4200/auth/login`

3. Login with student credentials:
   ```
   Email: student1@test.com
   Password: student123
   ```

4. **Expected Results**:
   - ✅ Login succeeds
   - ✅ Redirected to `/dashboard` (Student Dashboard)
   - ✅ Can see student features (Themes, Roadmap, Team, etc.)
   - ✅ Can navigate to different sections
   - ✅ Cannot access `/admin` route

**API Verification**:
```bash
# Login as approved student
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@test.com",
    "password": "student123"
  }'

# Expected response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "username": "student1",
      "email": "student1@test.com",
      "fullName": "Student One",
      "role": "student",
      "codeforcesHandle": "student1_cf",
      "isActive": true,
      "isCurrentMember": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Scenario 6: Admin Deactivates Student

**Purpose**: Verify that admin can deactivate active students

**Steps**:
1. Login as admin

2. In the User Management table, find student1

3. Click "✗ Deactivate" button

4. **Expected Results**:
   - ✅ Success message: "User deactivated successfully"
   - ✅ student1 status changes to "Inactive"
   - ✅ Button changes to "✓ Approve"

5. Try to access platform as student1 (should fail with pending approval message)

---

### Scenario 7: Current Member Management

**Purpose**: Verify that admin can mark/unmark students as current members

**Steps**:
1. Login as admin

2. In the User Management table, find student1

3. Click "☆ Mark Member" button

4. **Expected Results**:
   - ✅ Success message: "User marked as current member"
   - ✅ Current Member status changes to "Yes" (green badge)
   - ✅ Button changes to "★ Remove Member"

5. Click "★ Remove Member" button

6. **Expected Results**:
   - ✅ Success message: "User removed from current members"
   - ✅ Current Member status changes to "No" (gray badge)
   - ✅ Button changes to "☆ Mark Member"

---

## Edge Cases

### Test: Admin Cannot Be Deactivated
1. Login as admin
2. Try to deactivate admin account
3. **Expected**: No deactivate button should appear for admin users

### Test: Direct URL Access (Unauthorized)
1. As unauthenticated user, try to access:
   - `http://localhost:4200/admin`
   - `http://localhost:4200/dashboard`
2. **Expected**: Redirected to `/auth/login`

### Test: Student Cannot Access Admin Panel
1. Login as student
2. Manually navigate to `http://localhost:4200/admin`
3. **Expected**: May need additional admin guard (not implemented in this PR)

---

## Automated Testing

### Using curl/bash script

Create `test-auth-flow.sh`:
```bash
#!/bin/bash

API_URL="http://localhost:3000"

echo "1. Register Admin..."
ADMIN_RESPONSE=$(curl -s -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@test.com","password":"admin123"}')
echo $ADMIN_RESPONSE | jq .

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.data.token')
echo "Admin Token: $ADMIN_TOKEN"

echo -e "\n2. Register Student..."
STUDENT_RESPONSE=$(curl -s -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","email":"student1@test.com","password":"student123"}')
echo $STUDENT_RESPONSE | jq .

echo -e "\n3. Try to login as inactive student..."
curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@test.com","password":"student123"}' | jq .

echo -e "\n4. Get users list..."
USERS_RESPONSE=$(curl -s -X GET $API_URL/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $USERS_RESPONSE | jq .

STUDENT_ID=$(echo $USERS_RESPONSE | jq -r '.data.users[] | select(.username=="student1") | .id')
echo "Student ID: $STUDENT_ID"

echo -e "\n5. Approve student..."
curl -s -X PUT $API_URL/api/users/$STUDENT_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": true}' | jq .

echo -e "\n6. Login as approved student..."
curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@test.com","password":"student123"}' | jq .

echo -e "\nAll tests completed!"
```

Run with: `bash test-auth-flow.sh`

---

## Success Criteria

All scenarios should pass with expected results:
- ✅ First user becomes admin automatically
- ✅ New students are inactive by default
- ✅ Inactive students cannot login
- ✅ Admin can approve/deactivate users
- ✅ Approved students can login
- ✅ Admin redirects to admin panel
- ✅ Students redirect to dashboard
- ✅ Current member status can be toggled

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution**: Ensure MongoDB is running and `MONGODB_URI` in `.env` is correct

### Issue: "JWT must be provided"
**Solution**: Check that `JWT_SECRET` is set in `.env`

### Issue: "CORS error in browser"
**Solution**: Verify `CLIENT_URL` in `.env` matches your frontend URL

### Issue: "Cannot POST /api/auth/register"
**Solution**: Ensure server is running on correct port (default: 3000)

### Issue: Admin panel not loading
**Solution**: Check browser console for errors, ensure Angular build succeeded
