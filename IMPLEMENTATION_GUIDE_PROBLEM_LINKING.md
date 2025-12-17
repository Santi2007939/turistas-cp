# Problem Linking Enhancement - Implementation Guide

## Overview
This guide documents the enhanced problem linking functionality for roadmap subtopics.

## Changes Made

### Backend Changes

#### 1. PersonalNode Model (`server/src/models/PersonalNode.js`)
Updated the `linkedProblems` field in the subtopic schema to store full problem metadata:

```javascript
linkedProblems: [{
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'very-hard'],
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}]
```

**Benefits:**
- Stores problem metadata directly with the link
- Reduces database queries when displaying linked problems
- Allows custom metadata per subtopic (e.g., different difficulty assessment)

#### 2. Roadmap Routes (`server/src/routes/roadmap.routes.js`)
Updated the populate call to handle nested problemId population:
```javascript
.populate(['themeId', 'subtopics.linkedProblems.problemId'])
```

### Frontend Changes

#### 1. RoadmapService (`client/src/app/core/services/roadmap.service.ts`)
Added new interface for linked problems:

```typescript
export interface LinkedProblem {
  _id?: string;
  problemId: string;
  title: string;
  description?: string;
  link?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  addedAt?: Date;
}
```

Updated `Subtopic` interface to use the new `LinkedProblem` type.

#### 2. SubtopicDetailComponent (`client/src/app/features/roadmap/subtopic-detail.component.ts`)

**Enhanced Problem Display:**
- Replaced simple problem ID list with rich problem cards
- Shows title, description, difficulty badge, and action buttons
- Color-coded difficulty levels:
  - Easy: Green
  - Medium: Yellow
  - Hard: Orange
  - Very Hard: Red

**Problem Picker Modal:**
- Search and filter available problems
- Filter by difficulty and view (personal/team)
- Prevent duplicate linking
- Pre-fill metadata from selected problem
- Allow customization of title, description, link, and difficulty

**New Methods:**
- `openProblemPicker()` - Opens the problem selection modal
- `loadAvailableProblems()` - Loads problems based on selected view
- `filterProblems()` - Filters problems by search query and difficulty
- `selectProblemForLinking()` - Selects a problem and pre-fills metadata
- `confirmProblemLink()` - Links the problem with metadata to the subtopic
- `removeProblemFromSubtopic()` - Removes a linked problem
- `navigateToFilteredProblems()` - Navigates to problems library with subtopic filter
- `getDifficultyLabel()` - Converts difficulty code to Spanish label

#### 3. ProblemsLibraryComponent (`client/src/app/features/problems/problems-library.component.ts`)

**Subtopic Filtering:**
- Added support for `subtopic` query parameter
- Displays a filter banner when viewing problems for a specific subtopic
- Shows subtopic name and provides "Clear filter" button
- Filters problems to show only those linked to the selected subtopic

**New Methods:**
- `loadSubtopicInfo()` - Loads subtopic name and linked problem IDs
- `filterProblemsBySubtopic()` - Filters problems by linked problem IDs
- `clearSubtopicFilter()` - Removes the subtopic filter

## User Workflows

### Workflow 1: Linking a Problem to a Subtopic

1. Navigate to Roadmap → Select a theme → View subtopics
2. Click on the "Problemas" tab for a subtopic
3. Click "➕ Vincular problema" button
4. In the modal:
   - Search for problems by name or platform
   - Filter by difficulty and view (personal/team)
   - Select a problem from the list
5. Review and customize the metadata:
   - Title (pre-filled)
   - Description (optional)
   - Link (pre-filled if available)
   - Difficulty (pre-filled based on rating)
6. Click "Vincular problema" to confirm

The problem will now appear as a card in the subtopic's problems tab.

### Workflow 2: Viewing Linked Problems

1. Navigate to Roadmap → Select a theme → View subtopics
2. Click on the "Problemas" tab for a subtopic
3. View problem cards with:
   - Title
   - Description (if provided)
   - Difficulty badge (color-coded)
   - Links to: external problem page, problem details page
4. Click "Ver todos →" to view all linked problems in the Problems Library

### Workflow 3: Managing Linked Problems

**Remove a problem:**
- Click the 🗑️ button on a problem card
- Confirm the removal

**Navigate to problem details:**
- Click "Ver detalles" link on a problem card

**Open external problem:**
- Click "🔗 Abrir" link on a problem card (if link is provided)

## Features Implemented

### ✅ Problem Linking with Metadata
- Link existing problems to roadmap subtopics
- Store title, description, link, and difficulty for each linked problem
- Prevent duplicate problem linking

### ✅ Problem Picker Modal
- Search problems by name or platform
- Filter by difficulty level
- Filter by view (personal/team)
- Preview and customize metadata before linking

### ✅ Rich Problem Display
- Show problem cards with full metadata
- Color-coded difficulty badges
- Quick action buttons (open link, view details, remove)

### ✅ Navigation to Filtered Problems
- "Ver todos →" button in subtopic problems tab
- Navigate to Problems Library with subtopic filter applied
- Clear filter to return to full problems view

### ✅ Duplicate Prevention
- Check if problem is already linked before allowing linking
- Show error message if duplicate detected

### ✅ Clean UI/UX
- Consistent styling with existing components
- Clear visual feedback for actions
- Responsive design

## Technical Notes

### Data Structure
Linked problems are stored as embedded documents within subtopics, containing both a reference to the Problem document (via `problemId`) and denormalized metadata. This design choice:
- Reduces database queries when displaying subtopics
- Allows per-subtopic customization of problem metadata
- Maintains referential integrity via the `problemId` reference

### Performance Considerations
- Problem filtering in the Problems Library uses in-memory filtering
- For larger datasets, consider implementing a backend API endpoint for filtered queries
- The current implementation loads the entire roadmap to extract linked problem IDs

### Future Enhancements
1. Add backend API endpoint: `GET /api/roadmap/subtopic/:subtopicId/problems`
2. Show linked subtopics in problem cards in Problems Library
3. Add batch linking of multiple problems
4. Add problem recommendations based on subtopic content
5. Add sorting options for linked problems (by difficulty, date added, etc.)

## Testing Checklist

- [ ] Link a problem to a subtopic
- [ ] Verify problem card displays correctly with all metadata
- [ ] Test duplicate prevention
- [ ] Navigate to filtered problems view
- [ ] Clear subtopic filter
- [ ] Remove a linked problem
- [ ] Test search and filtering in problem picker
- [ ] Test with different difficulty levels
- [ ] Test with personal and team problems
- [ ] Test UI responsiveness on mobile devices
- [ ] Verify no TypeScript compilation errors
- [ ] Verify no console errors in browser

## Security Considerations

- Problem linking respects existing permission model
- Users can only link problems they can view
- Users can only modify their own roadmap subtopics
- No SQL injection risks (using Mongoose with proper validation)
- No XSS risks (Angular automatically sanitizes template bindings)
