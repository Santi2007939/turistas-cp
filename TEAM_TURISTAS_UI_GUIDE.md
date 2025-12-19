# Team Turistas - User Interface Guide

This guide describes the user interface for the Team Turistas section.

## Navigation Flow

### 1. From Dashboard
- User sees "👥 Team Turistas" card on the dashboard
- Card is clickable and fully active (no longer grayed out)
- Clicking redirects to Team Turistas detail page

### 2. From Navbar
- "Team" link in the navigation bar
- Clicking redirects to `/team` which automatically redirects to Team Turistas detail page

## Team Turistas Detail Page

The main Team Turistas page displays comprehensive team information and tools.

### Header Section
- **Team Name**: "Team Turistas" displayed prominently
- **Team Description**: Brief description of the team
- **Back to Dashboard**: Button to return to the main dashboard

### Team Statistics (3-column grid on desktop, stacked on mobile)
- **Total Problems Solved**: Aggregate count of problems solved by team
- **Total Contests**: Number of contests participated in
- **Average Rating**: Team's average competitive programming rating

### Team Members Section
- Lists all team members with their:
  - Username
  - Join date
  - Role (Leader or Member)
- Shows current count vs max members (e.g., "15 / 50")

### Team Links Section
Two group communication options:

#### WhatsApp Group
- 💬 WhatsApp Group icon and label
- **"Open" button**: Opens WhatsApp group (if link is configured)
- **"Add/Edit" button**: For team leaders to add or update the link

#### Discord Server
- 💬 Discord Server icon and label
- **"Open" button**: Opens Discord server (if link is configured)
- **"Add/Edit" button**: For team leaders to add or update the link

### Service Integrations (2-column grid on tablet, single column on mobile)

#### 1. USACO IDE Card (Blue theme)
- **Icon**: 💻
- **Description**: "Create shareable IDE links with your team's code template"
- **Language Selector**: Dropdown with options:
  - C++
  - Java
  - Python
- **"Create IDE Link" button**: Generates a shareable IDE link with template preloaded
- **"Edit Code Template" button**: For team leaders to customize the default template

**How it works:**
1. Select a programming language
2. Click "Create IDE Link"
3. A modal appears with the shareable link
4. The link includes the team's code template pre-filled
5. Share the link with team members for practice sessions

#### 2. Excalidraw Card (Purple theme)
- **Icon**: ✏️
- **Description**: "Collaborate on diagrams and visualizations"
- **"Create Room" button**: Opens modal to create a new collaboration room

**How it works:**
1. Click "Create Room"
2. Enter a room name (e.g., "Binary Tree Study Session")
3. Room is created and saved to team
4. All team members can access saved rooms

#### 3. RPC Contests Card (Amber theme)
- **Icon**: 🏆
- **Description**: "View schedule and register for contests"
- **"View Contests" button**: Opens modal with upcoming RPC contests

**How it works:**
1. Click "View Contests"
2. See list of upcoming RPC contests with:
   - Contest name
   - Start time
   - Duration
   - Registration link
3. Click "Register" on any contest to open registration page

### Collaboration Rooms Section
(Appears only if team has created Excalidraw rooms)
- Lists all saved Excalidraw rooms
- Each room shows:
  - Room name
  - Creation date
  - "Open Room" button to access the whiteboard

### Team Settings Section
Displays current team configuration:
- **Shared Roadmap**: Yes/No
- **Shared Calendar**: Yes/No
- **Max Members**: Current limit

### Actions Section
- **"Join Team" button**: For users not yet in the team
- **"Leave Team" button**: For current members (leaders can't leave if they're the only leader)

## Modal Dialogs

### 1. Edit WhatsApp Link Modal
- Title: "Edit WhatsApp Group Link"
- Input field for URL (e.g., `https://chat.whatsapp.com/...`)
- "Cancel" and "Save" buttons

### 2. Edit Discord Link Modal
- Title: "Edit Discord Server Link"
- Input field for URL (e.g., `https://discord.gg/...`)
- "Cancel" and "Save" buttons

### 3. Edit Code Template Modal
- Title: "Edit Code Template"
- Large textarea (20 rows) for code
- Explanation text about template usage
- "Cancel" and "Save Template" buttons

### 4. Create Excalidraw Room Modal
- Title: "Create Excalidraw Room"
- Input field for room name
- "Cancel" and "Create" buttons

### 5. RPC Contests Modal
- Title: "RPC Contest Schedule"
- Loading state or list of contests
- Each contest card shows:
  - Contest name
  - Start time
  - Duration
  - "Register" button
- "Close" button at bottom

### 6. USACO Link Result Modal
- Title: "USACO IDE Link Created"
- Description about sharing the link
- The generated URL (clickable)
- "Copy Link" and "Close" buttons

## Responsive Design

### Mobile (< 768px)
- All sections stack vertically
- Service cards in single column
- Statistics in single column
- Full-width buttons

### Tablet (768px - 1024px)
- Service cards in 2 columns
- Statistics in 3 columns
- Optimized spacing

### Desktop (> 1024px)
- Service cards in 2 columns (RPC below USACO/Excalidraw)
- Statistics in 3 columns
- Maximum width container with horizontal padding

## User Permissions

### All Users
- View all team information
- Join the team (if not full and allows join requests)
- Leave the team (if member and not sole leader)
- Access all service integrations
- View group links
- Open Excalidraw rooms

### Team Leaders and Admins
All of the above, plus:
- Edit WhatsApp group link
- Edit Discord server link
- Edit code template

## Color Scheme

- **Primary Actions**: Blue (`bg-blue-500`)
- **WhatsApp**: Green (`bg-green-500`)
- **Discord**: Indigo (`bg-indigo-500`)
- **USACO IDE**: Blue (`bg-blue-50` border-blue-200`)
- **Excalidraw**: Purple (`bg-purple-50` border-purple-200`)
- **RPC Contests**: Amber (`bg-amber-50` border-amber-200`)
- **Secondary Actions**: Gray (`bg-gray-500`)
- **Danger Actions**: Red (`bg-red-500`)

## Loading and Error States

### Loading States
- "Loading Team Turistas..." with spinner
- "Creating..." on buttons during operations
- "Loading contests..." in RPC modal

### Error States
- Red alert boxes with error messages
- Inline validation errors
- Retry buttons where appropriate

## Accessibility Features

- All interactive elements are keyboard accessible
- Color contrast meets WCAG standards
- Loading states with descriptive text
- Clear button labels and actions
- Modal dialogs can be closed by clicking outside or pressing escape

## Tips for Users

1. **First Time Setup**: Team leaders should configure WhatsApp and Discord links first
2. **Code Template**: Customize the template to match your team's coding style
3. **Practice Sessions**: Use USACO IDE links to practice together with the same template
4. **Whiteboard**: Create Excalidraw rooms for collaborative problem-solving
5. **Contests**: Check RPC contests regularly to not miss important competitions
6. **Stay Connected**: Join both WhatsApp and Discord for different types of communication
