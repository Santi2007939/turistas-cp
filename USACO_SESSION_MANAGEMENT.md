# USACO Session Management - Implementation Guide

## Overview

This document describes the USACO session management feature that allows teams to create, manage, and share IDE sessions with pre-configured code templates.

## Features

### 1. Session Properties

Each session includes:
- **Name**: Descriptive name for the session (e.g., "Practice Session 1", "Contest Prep")
- **Link**: URL to the USACO IDE session
- **Created At**: Timestamp when the session was created

### 2. Session Management Operations

#### Add Session
Team leaders and coaches can add new sessions with two options:

**Option A: Auto-generate Link**
- Automatically creates a USACO IDE permalink
- Pre-loads the team's custom code template
- Supports C++, Java, and Python
- Uses the USACO permalink service integration

**Option B: Manual Link**
- Manually provide an existing USACO IDE link
- Useful for sharing pre-existing sessions
- Link validation ensures proper URL format

#### Edit Session
- Update the session name
- Link URL remains unchanged
- Only accessible to team leaders/coaches

#### Delete Session
- Remove sessions that are no longer needed
- Confirmation dialog prevents accidental deletion
- Only accessible to team leaders/coaches

### 3. User Interface

#### Team Detail Page Components

**Service Integrations Section**
```
┌─────────────────────────────────────┐
│ 💻 USACO IDE Sessions               │
│ Manage shareable IDE links          │
│ with code templates                 │
│                                     │
│ [Add Session] [View Templates]      │
└─────────────────────────────────────┘
```

**Code Sessions List**
```
┌─────────────────────────────────────────────────────────┐
│ Practice Session 1                                      │
│ Created Jan 5, 2026                                     │
│                        [Open IDE] [Rename] [Delete]     │
├─────────────────────────────────────────────────────────┤
│ Contest Preparation                                     │
│ Created Jan 4, 2026                                     │
│                        [Open IDE] [Rename] [Delete]     │
└─────────────────────────────────────────────────────────┘
```

#### Add Session Modal
```
┌──────────────────────────────────────┐
│ Add Code Session                      │
│                                       │
│ Session Name:                         │
│ ┌──────────────────────────────────┐ │
│ │ Practice Session 1               │ │
│ └──────────────────────────────────┘ │
│                                       │
│ ○ Auto-generate link with template   │
│ ○ Provide custom link                │
│                                       │
│ Language: [C++ ▼]                     │
│                                       │
│              [Cancel] [Add Session]   │
└──────────────────────────────────────┘
```

## Backend Implementation

### Database Schema

**TeamConfig Model** (`server/src/models/TeamConfig.js`)

```javascript
codeSessions: [{
  name: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}]
```

### API Endpoints

#### 1. Add Code Session
```
POST /api/team/:id/code-sessions
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Practice Session 1",
  "link": "https://ide.usaco.guide/abc123"
}

Response (201):
{
  "success": true,
  "message": "Code session added successfully",
  "data": {
    "team": { /* updated team object */ }
  }
}
```

#### 2. Update Code Session
```
PUT /api/team/:id/code-sessions/:sessionId
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Updated Session Name"
}

Response (200):
{
  "success": true,
  "message": "Code session updated successfully",
  "data": {
    "team": { /* updated team object */ }
  }
}
```

#### 3. Delete Code Session
```
DELETE /api/team/:id/code-sessions/:sessionId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Code session deleted successfully",
  "data": {
    "team": { /* updated team object */ }
  }
}
```

### Authorization

All session management operations require:
- User must be authenticated (JWT token)
- User must be a team leader, coach, or admin
- Rate limiting: 10 requests per minute per user

### Input Validation

- **Session Name**: Required, non-empty string
- **Link**: Required, valid URL format
- **Session ID**: Must be a valid MongoDB ObjectId
- **Team ID**: Must be a valid MongoDB ObjectId

## Frontend Implementation

### Components

**TeamDetailComponent** (`client/src/app/features/team/team-detail.component.ts`)

Key methods:
- `openAddSessionModal()`: Opens the add session modal
- `addSession()`: Creates a new session (auto or manual)
- `openRenameSessionModal(session)`: Opens rename modal with current name
- `renameSession()`: Updates session name
- `deleteSession(sessionId)`: Deletes a session with confirmation

### Services

**TeamService** (`client/src/app/core/services/team.service.ts`)

```typescript
// Add code session
addCodeSession(teamId: string, name: string, link: string): Observable<TeamResponse>

// Update code session name
updateCodeSession(teamId: string, sessionId: string, name: string): Observable<TeamResponse>

// Delete code session
deleteCodeSession(teamId: string, sessionId: string): Observable<TeamResponse>
```

**IntegrationsService** (`client/src/app/core/services/integrations.service.ts`)

```typescript
// Create USACO IDE permalink with team template
createUsacoPermalink(language: string, teamId?: string): Observable<UsacoPermalinkResponse>

// Get code template for language
getCodeTemplate(language: string, teamId?: string): Observable<any>
```

## USACO Permalink Integration

### Auto-generation Flow

1. User selects "Auto-generate link" option
2. User selects programming language (C++, Java, Python)
3. Frontend calls `createUsacoPermalink(language, teamId)`
4. Backend retrieves team's custom code template
5. Puppeteer automates USACO IDE:
   - Opens https://ide.usaco.guide
   - Creates new file
   - Pastes team template code
   - Captures the generated permalink URL
6. Returns permalink to frontend
7. Frontend adds session with generated link

### Manual Link Flow

1. User selects "Provide custom link" option
2. User pastes existing USACO IDE URL
3. Frontend validates URL format
4. Adds session with provided link

## Security Considerations

### Authentication & Authorization
- ✅ All endpoints protected with JWT authentication
- ✅ Team leader/coach/admin authorization enforced
- ✅ Rate limiting prevents abuse (10 req/min)

### Input Validation
- ✅ Session names validated (required, non-empty)
- ✅ URLs validated (proper format)
- ✅ XSS protection via parameterized queries
- ✅ MongoDB injection prevention via Mongoose

### Resource Protection
- ✅ Users can only manage sessions for their teams
- ✅ Admins have override access for moderation
- ✅ Session IDs validated before operations

## Usage Examples

### Example 1: Adding a Session with Auto-generation

```typescript
// In TeamDetailComponent
openAddSessionModal(): void {
  this.newSessionName = '';
  this.sessionLinkOption = 'auto';
  this.selectedLanguage = 'cpp';
  this.showAddSessionModal = true;
}

addSession(): void {
  if (this.sessionLinkOption === 'auto') {
    // Auto-generate link
    this.integrationsService.createUsacoPermalink(this.selectedLanguage, this.teamId)
      .subscribe({
        next: (response) => {
          if (response.ok && response.url) {
            // Add session with generated link
            this.teamService.addCodeSession(this.teamId, this.newSessionName, response.url)
              .subscribe({
                next: (teamResponse) => {
                  this.team = teamResponse.data.team;
                  this.showAddSessionModal = false;
                }
              });
          }
        }
      });
  }
}
```

### Example 2: Renaming a Session

```typescript
openRenameSessionModal(session: any): void {
  this.renameSessionId = session._id;
  this.renameSessionName = session.name;
  this.showRenameSessionModal = true;
}

renameSession(): void {
  this.teamService.updateCodeSession(this.teamId, this.renameSessionId, this.renameSessionName)
    .subscribe({
      next: (response) => {
        this.team = response.data.team;
        this.showRenameSessionModal = false;
      }
    });
}
```

### Example 3: Deleting a Session

```typescript
deleteSession(sessionId: string): void {
  if (!confirm('Are you sure you want to delete this code session?')) {
    return;
  }

  this.teamService.deleteCodeSession(this.teamId, sessionId)
    .subscribe({
      next: (response) => {
        this.team = response.data.team;
      }
    });
}
```

## Best Practices

### For Users
1. Use descriptive session names (e.g., "Week 1 Practice", "DP Contest Prep")
2. Auto-generate links when you want the team template pre-loaded
3. Use manual links to share existing sessions
4. Delete old sessions to keep the list organized

### For Developers
1. Always validate user input on both frontend and backend
2. Use rate limiting to prevent abuse
3. Handle USACO permalink service failures gracefully
4. Provide clear error messages to users
5. Log session operations for audit trail

## Testing

### Manual Testing Checklist

- [ ] Create session with auto-generated link
- [ ] Create session with manual link
- [ ] Rename existing session
- [ ] Delete session with confirmation
- [ ] Verify only team leaders see edit buttons
- [ ] Test with different languages (C++, Java, Python)
- [ ] Verify links open in new tab
- [ ] Check session persistence after page reload

### Automated Testing

See `/tmp/test-session-management.md` for comprehensive test plan.

## Troubleshooting

### Session Not Being Added
- Check user is team leader/coach
- Verify JWT token is valid
- Check network requests in browser DevTools
- Verify backend server is running

### USACO Link Generation Fails
- Check `CHROME_PATH` environment variable
- Verify Puppeteer dependencies installed
- Check USACO IDE website is accessible
- Review timeout settings (default 60s)

### Session Not Appearing in List
- Refresh the page
- Check browser console for errors
- Verify session was saved to database
- Check team object includes codeSessions array

## Future Enhancements

Potential improvements for future versions:

1. **Session Analytics**: Track how often each session is accessed
2. **Session Templates**: Save commonly used session configurations
3. **Bulk Operations**: Add/delete multiple sessions at once
4. **Session Sharing**: Share sessions across teams
5. **Version History**: Track changes to session links
6. **Collaborative Editing**: Real-time code collaboration in sessions
7. **Session Tags**: Categorize sessions by topic/difficulty
8. **Scheduled Sessions**: Auto-create sessions for scheduled events

## Support

For issues or questions:
- Review this documentation
- Check application logs for detailed errors
- Open an issue on the repository
- Contact the development team

## License

This feature is part of the Turistas CP project and follows the same MIT license.
