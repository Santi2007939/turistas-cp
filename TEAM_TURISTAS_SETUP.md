# Team Turistas Setup Guide

This guide explains how to set up and configure the Team Turistas section of the platform.

## Overview

The platform has been configured to use a **single team structure** for "Team Turistas". Users can no longer create multiple teams - there is only one team that all users can join.

## Initial Setup

### 1. Configure Environment Variables

Edit your `.env` file in the `server` directory with the following Team Turistas specific variables:

```env
# Team Turistas Links
TEAM_WHATSAPP_GROUP=https://chat.whatsapp.com/your-actual-group-link
TEAM_DISCORD_SERVER=https://discord.gg/your-actual-server-link
```

Replace the placeholder URLs with your actual WhatsApp and Discord invite links.

### 2. Initialize Team Turistas

Run the initialization script to create the default Team Turistas team:

```bash
cd server
node scripts/init-team-turistas.js
```

This script will:
- Create the "Team Turistas" team if it doesn't exist
- Set the first admin user as the team coach
- Load the default code template from `plantilla.txt`
- Configure the WhatsApp and Discord links from environment variables
- Set team settings (public, allows join requests, shared roadmap/calendar)

**Note:** If Team Turistas already exists, the script will detect it and not create a duplicate.

### 3. Customize Code Template

The default code template is stored in `server/plantilla.txt`. This template is used when creating USACO IDE links for team members.

To customize it:
1. Edit `server/plantilla.txt` with your preferred C++ template
2. Re-run the initialization script, or
3. Update it through the Team Turistas detail page (team leaders only)

## Features

### For All Members

- **View Team Information**: See team statistics, members, and settings
- **Join Team**: Any user can join Team Turistas (if not already a member)
- **Leave Team**: Members can leave the team (leaders cannot leave if they're the only leader)
- **Access Group Links**: View and join WhatsApp and Discord groups

### Service Integrations

1. **USACO IDE**
   - Create shareable IDE links with team code template
   - Supports C++, Java, and Python
   - Template can be edited by team leaders

2. **Excalidraw**
   - Create collaborative drawing/whiteboard rooms
   - Rooms are saved and accessible to all team members

3. **RPC Contests**
   - View upcoming RPC (Red de Programación Competitiva) contests
   - Direct registration links

### For Team Leaders

Team leaders (and admins) have additional permissions:
- Edit WhatsApp group link
- Edit Discord server link
- Edit code template
- Manage team settings

## Navigation

Users can access Team Turistas through:
1. **Dashboard**: Click the "👥 Team Turistas" card
2. **Navbar**: Click "Team" in the navigation menu
3. **Direct URL**: `/team` automatically redirects to Team Turistas detail page

## Technical Details

### Backend Endpoints

- `GET /api/team` - Get all teams (returns Team Turistas)
- `GET /api/team/:id` - Get team details
- `POST /api/team/:id/join` - Join the team
- `POST /api/team/:id/leave` - Leave the team
- `PUT /api/team/:id/links` - Update WhatsApp/Discord links (leaders only)
- `PUT /api/team/:id/template` - Update code template (leaders only)

### Frontend Components

- `TeamListComponent` - Redirects to Team Turistas detail page
- `TeamDetailComponent` - Main team view with all features
- `TeamCreateComponent` - Removed from user routes (admin only)

### Database Model

The `TeamConfig` model includes:
- Basic info: name, description, coach
- Members array with roles (leader/member)
- Settings: public, join requests, shared roadmap/calendar
- Statistics: problems solved, contests, average rating
- Links: WhatsApp, Discord
- Code template
- Excalidraw rooms

## Responsive Design

All team section pages are fully responsive:
- Mobile: Single column layout
- Tablet (md): 2 columns for service cards
- Desktop (lg): 3 columns for larger grids

## Troubleshooting

### Team Turistas not found
- Run the initialization script: `node scripts/init-team-turistas.js`
- Check that MongoDB connection is working
- Verify environment variables are set correctly

### Cannot join team
- Check that team is set to allow join requests
- Verify you're not already a member
- Ensure team hasn't reached max members (default: 50)

### Links not working
- Update environment variables in `.env`
- Re-run initialization script or update through the UI
- Verify URLs follow correct format:
  - WhatsApp: `https://chat.whatsapp.com/...`
  - Discord: `https://discord.gg/...` or `https://discord.com/invite/...`

### Code template not loading
- Verify `plantilla.txt` exists in server directory
- Check file permissions
- Update template through the UI (team leaders)

## Security Notes

- Only team leaders and admins can edit team links and templates
- Join/leave operations are authenticated
- Team creation is restricted to admin users only
- Code templates are limited to 100KB

## Future Enhancements

Potential improvements for the Team Turistas section:
- Team announcements/news feed
- Practice session scheduler
- Team performance analytics
- Integration with Codeforces team features
- Virtual contest organization tools
