# Testing Guide: Problem Library and Roadmap Selectors

## Overview
This guide provides comprehensive testing instructions for the Problem Library and Roadmap Selectors feature implementation.

## Prerequisites
- Node.js and npm installed
- MongoDB instance running
- Environment variables configured in `server/.env`
- Two or more test user accounts

## Setup

### 1. Install Dependencies
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Start the Application
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm start
```

## Backend API Testing

### Problem Library Endpoints

#### 1. Test Personal Problems Endpoint
**Endpoint**: `GET /api/problems/personal/:userId`

**Test Case 1: Get own personal problems**
```bash
# Login and get token
TOKEN="your_jwt_token"
USER_ID="your_user_id"

# Make request
curl -X GET \
  http://localhost:3000/api/problems/personal/$USER_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Expected Result**: Returns list of personal problems for the user
**Status Code**: 200

**Test Case 2: Attempt to access another user's personal problems**
```bash
OTHER_USER_ID="another_user_id"

curl -X GET \
  http://localhost:3000/api/problems/personal/$OTHER_USER_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Expected Result**: Authorization error message
**Status Code**: 403

#### 2. Test Team Problems Endpoint
**Endpoint**: `GET /api/problems/team`

**Test Case**: Get all team problems
```bash
curl -X GET \
  http://localhost:3000/api/problems/team \
  -H "Authorization: Bearer $TOKEN"
```
**Expected Result**: Returns list of all team problems
**Status Code**: 200

#### 3. Test Members Problems Endpoint
**Endpoint**: `GET /api/problems/members/:userId`

**Test Case 1: Get other members' problems with valid userId**
```bash
curl -X GET \
  http://localhost:3000/api/problems/members/$USER_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Expected Result**: Returns list of problems from other members (excluding current user)
**Status Code**: 200

**Test Case 2: Attempt with different userId**
```bash
curl -X GET \
  http://localhost:3000/api/problems/members/$OTHER_USER_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Expected Result**: Authorization error message
**Status Code**: 403

#### 4. Test Problem Creation
**Endpoint**: `POST /api/problems`

**Test Case 1: Create personal problem**
```bash
curl -X POST \
  http://localhost:3000/api/problems \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Two Sum",
    "platform": "leetcode",
    "difficulty": "easy",
    "owner": "personal",
    "tags": ["arrays", "hash-table"]
  }'
```
**Expected Result**: Problem created successfully
**Status Code**: 201

**Test Case 2: Create team problem**
```bash
curl -X POST \
  http://localhost:3000/api/problems \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Merge Sort Implementation",
    "platform": "custom",
    "difficulty": "medium",
    "owner": "team",
    "tags": ["sorting", "divide-conquer"]
  }'
```
**Expected Result**: Problem created successfully
**Status Code**: 201

#### 5. Test Problem Edit Restrictions
**Endpoint**: `PUT /api/problems/:id`

**Test Case 1: Edit own personal problem**
```bash
PROBLEM_ID="personal_problem_id"

curl -X PUT \
  http://localhost:3000/api/problems/$PROBLEM_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "difficulty": "hard"
  }'
```
**Expected Result**: Problem updated successfully
**Status Code**: 200

**Test Case 2: Attempt to edit another user's personal problem**
```bash
OTHER_PROBLEM_ID="other_user_personal_problem_id"

curl -X PUT \
  http://localhost:3000/api/problems/$OTHER_PROBLEM_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "difficulty": "hard"
  }'
```
**Expected Result**: Not authorized error
**Status Code**: 403

**Test Case 3: Edit team problem**
```bash
TEAM_PROBLEM_ID="team_problem_id"

curl -X PUT \
  http://localhost:3000/api/problems/$TEAM_PROBLEM_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "difficulty": "very-hard"
  }'
```
**Expected Result**: Problem updated successfully (any user can edit team problems)
**Status Code**: 200

### Roadmap Endpoints

#### 1. Test Personal Roadmap Endpoint
**Endpoint**: `GET /api/roadmap/personal/:userId`

**Test Case 1: Get own roadmap**
```bash
curl -X GET \
  http://localhost:3000/api/roadmap/personal/$USER_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Expected Result**: Returns personal roadmap
**Status Code**: 200

**Test Case 2: Attempt to access another user's roadmap**
```bash
curl -X GET \
  http://localhost:3000/api/roadmap/personal/$OTHER_USER_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Expected Result**: Authorization error
**Status Code**: 403

#### 2. Test Members Roadmaps Endpoint
**Endpoint**: `GET /api/roadmap/members/:userId`

**Test Case 1: Get other members' roadmaps**
```bash
curl -X GET \
  http://localhost:3000/api/roadmap/members/$USER_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Expected Result**: Returns roadmaps from other members
**Status Code**: 200

**Test Case 2: Attempt with different userId**
```bash
curl -X GET \
  http://localhost:3000/api/roadmap/members/$OTHER_USER_ID \
  -H "Authorization: Bearer $TOKEN"
```
**Expected Result**: Authorization error
**Status Code**: 403

## Frontend UI Testing

### Problem Library Component Testing

#### Test 1: Selector Functionality
1. Navigate to `/problems`
2. Verify the selector shows three options: "Mi cuenta", "Equipo", "Miembros"
3. Select "Mi cuenta" - verify only personal problems are displayed
4. Select "Equipo" - verify team problems are displayed
5. Select "Miembros" - verify other members' problems are displayed

#### Test 2: Problem Display
1. For each problem card, verify:
   - Title is displayed
   - Description is shown (or "Sin descripción")
   - Difficulty badge shows correct color
   - Platform badge is displayed
   - Owner badge (Personal/Equipo) is shown
   - Tags are displayed (max 3 visible)
   - Created by information shows username

#### Test 3: Edit Button Visibility
1. In "Mi cuenta" view:
   - Verify "Editar" button is visible for personal problems
   - Click "Ver Problema" link - verify it opens the problem URL

2. In "Equipo" view:
   - Verify "Editar" button is visible for all team problems

3. In "Miembros" view:
   - Verify "Editar" button is NOT visible for other members' problems

#### Test 4: Add Problem Modal
1. Click "Agregar Problema" button
2. Verify modal opens with all fields:
   - Título (required)
   - Descripción
   - Plataforma dropdown
   - URL
   - Dificultad dropdown
   - Owner dropdown (Personal/Equipo)
   - Tags input
3. Fill in required fields and submit
4. Verify problem is added and displayed in the correct view

#### Test 5: Empty State
1. If no problems exist in a view:
   - Verify empty state message is shown
   - In "Mi cuenta" view, verify "Agregar Primer Problema" button is displayed

### Roadmap Component Testing

#### Test 1: Selector Functionality
1. Navigate to `/roadmap`
2. Verify the selector shows two options: "Mi roadmap", "Miembros"
3. Select "Mi roadmap" - verify personal roadmap is displayed
4. Select "Miembros" - verify other members' roadmaps are displayed

#### Test 2: Roadmap Display
1. For each roadmap node, verify:
   - Theme name is displayed
   - Status badge shows correct color
   - Category badge is displayed
   - Difficulty badge is displayed
   - Progress bar shows correct percentage
   - Notes are displayed (if any)
   - Last practiced date is shown (if available)

#### Test 3: Edit Button Visibility
1. In "Mi roadmap" view:
   - Verify "Update" and "Remove" buttons are visible
   - Click "Update" - verify modal opens with current values

2. In "Miembros" view:
   - Verify "Update" and "Remove" buttons are NOT visible
   - Verify member username is displayed

#### Test 4: Add Theme Functionality
1. In "Mi roadmap" view, click "Add Theme to Roadmap"
2. Verify modal opens with theme selector
3. Select a theme and click "Add to Roadmap"
4. Verify theme is added to roadmap

#### Test 5: Update Progress Modal
1. Click "Update" on a roadmap node
2. Verify modal shows:
   - Status dropdown
   - Progress input (0-100)
   - Notes textarea
3. Update values and save
4. Verify changes are reflected in the roadmap

### Navigation Testing

#### Test 1: Dashboard Navigation
1. Navigate to `/dashboard`
2. Verify navigation bar shows: Dashboard, Themes, Roadmap, Problems
3. Verify "Team" link is NOT present
4. Click each link and verify correct page loads

#### Test 2: Dashboard Cards
1. Verify dashboard shows cards for:
   - Learning Themes
   - My Roadmap
   - Problems (not grayed out)
   - Team Turistas (grayed out, not clickable)
2. Click each clickable card and verify correct navigation

## Error Handling Testing

### Test 1: Network Errors
1. Disconnect from network
2. Try to load problems or roadmap
3. Verify error message is displayed

### Test 2: Authentication Errors
1. Clear localStorage (logout)
2. Try to access `/problems` or `/roadmap`
3. Verify redirect to login page

### Test 3: Invalid Data
1. Try to create a problem without required fields
2. Verify validation errors are shown
3. Try to set progress > 100
4. Verify validation prevents invalid values

## Performance Testing

### Test 1: Load Time
1. Create 50+ problems
2. Navigate to problems library
3. Verify page loads within 2 seconds

### Test 2: Switching Views
1. Switch between "Mi cuenta", "Equipo", "Miembros"
2. Verify each switch completes within 1 second

## Security Testing

### Test 1: Authorization Bypass Attempt
1. Manually modify API request to use another userId
2. Verify 403 error is returned

### Test 2: XSS Prevention
1. Try to add a problem with `<script>alert('xss')</script>` in title
2. Verify the script is not executed and is displayed as text

### Test 3: CSRF Protection
1. Verify all API calls include Bearer token
2. Verify requests without token are rejected

## Browser Compatibility Testing

Test the application in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Verify all functionality works in each browser.

## Mobile Responsiveness Testing

1. Open application on mobile device or use browser dev tools
2. Verify:
   - Navigation is accessible
   - Cards are properly sized
   - Modals are usable
   - Buttons are touchable
   - Text is readable

## Automated Testing Recommendations

### Unit Tests to Add
```typescript
// problems-library.component.spec.ts
describe('ProblemsLibraryComponent', () => {
  it('should load personal problems', () => {});
  it('should load team problems', () => {});
  it('should show edit button for editable problems', () => {});
  it('should hide edit button for non-editable problems', () => {});
});

// roadmap.component.spec.ts
describe('RoadmapComponent', () => {
  it('should load personal roadmap', () => {});
  it('should show edit buttons in personal view', () => {});
  it('should hide edit buttons in members view', () => {});
});
```

### Integration Tests to Add
```javascript
// problems.routes.test.js
describe('Problem Routes', () => {
  it('should prevent accessing other users personal problems', () => {});
  it('should allow editing own personal problems', () => {});
  it('should prevent editing other users personal problems', () => {});
});
```

## Test Results Documentation

### Test Execution Checklist
- [ ] All backend API endpoints tested
- [ ] All frontend components tested
- [ ] Authorization checks verified
- [ ] Edit restrictions confirmed
- [ ] Error handling validated
- [ ] Security tests passed
- [ ] Browser compatibility confirmed
- [ ] Mobile responsiveness verified

### Known Issues
Document any issues found during testing here.

### Test Environment
- Node.js version: _______
- MongoDB version: _______
- Browser versions: _______
- Test date: _______
- Tester: _______

## Conclusion

This testing guide ensures comprehensive validation of the Problem Library and Roadmap Selectors feature. All tests should be executed before deploying to production.
