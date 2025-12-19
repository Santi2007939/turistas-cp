# Team Turistas - Automatic Initialization

## Overview

Team Turistas is automatically initialized when the backend server starts. This ensures that the team panel always loads successfully without requiring manual setup.

## How It Works

1. **Automatic Initialization**: When the backend connects to the database, it automatically checks if Team Turistas exists.
2. **Safe Initialization**: If Team Turistas doesn't exist, it's created with default settings.
3. **No Duplicates**: If Team Turistas already exists, it's left unchanged - no duplicates are created.
4. **Graceful Failure**: If initialization fails (e.g., no database connection), the server still starts, and users can manually initialize the team later.

## Configuration

Configure Team Turistas through environment variables in `.env` file:

```env
# Team Configuration
TEAM_NAME=Team Turistas
TEAM_DESCRIPTION=Equipo oficial de programación competitiva Team Turistas. ¡Bienvenidos todos los miembros!
TEAM_MAX_MEMBERS=50
TEAM_WHATSAPP_GROUP=https://chat.whatsapp.com/your-actual-group-link
TEAM_DISCORD_SERVER=https://discord.gg/your-actual-server-link
```

## Features Included

Team Turistas comes preconfigured with:

1. **Communication Links**
   - WhatsApp Group (configurable via env)
   - Discord Server (configurable via env)

2. **Service Integrations**
   - USACO IDE with code template from `plantilla.txt`
   - Excalidraw for collaborative diagrams
   - RPC Contest schedule and registration

3. **Team Settings**
   - Public team (anyone can view)
   - Join requests enabled
   - Shared roadmap and calendar
   - Max 50 members (configurable)

4. **Default Code Template**
   - Loaded from `server/plantilla.txt`
   - Used when creating USACO IDE links
   - Editable by team leaders through the UI

## Manual Initialization (Alternative)

If you need to manually initialize or re-initialize Team Turistas, you can use the provided script:

```bash
cd server
npm run init:team
```

This is useful for:
- Testing the initialization process
- Setting up Team Turistas in a development environment
- Debugging issues

## Troubleshooting

### Team Panel Shows "Team Turistas not found"

**Possible Causes:**
1. Database connection failed during initialization
2. Environment variables not properly configured
3. Database permissions issues

**Solutions:**
1. Check server logs for initialization messages
2. Verify `MONGODB_URI` in `.env` is correct
3. Run manual initialization: `npm run init:team`
4. Restart the server to trigger auto-initialization

### Team Settings Not Applied

**Solution:**
1. Update the `.env` file with correct values
2. Restart the server to apply changes
3. Or update team settings through the admin panel or team detail page

### Code Template Not Loaded

**Solution:**
1. Verify `server/plantilla.txt` exists
2. Check file permissions
3. Restart the server to reload the template
4. Or upload a new template through the team detail page

## Admin Access

The first admin user in the database becomes the team coach automatically. To assign a different coach:

1. Log in as an admin
2. Navigate to the team detail page
3. Update the coach through the admin panel (if implemented)

## Security Notes

- Team links (WhatsApp, Discord) are stored in the database
- Only team leaders can edit team links and templates
- All users can view and join Team Turistas (public team)
- Rate limiting is applied to join/leave operations (5 per minute)
