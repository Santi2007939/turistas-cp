# Team Turistas - Quick Start Guide

## For Administrators

### Initial Setup (One-Time)

1. **Set Environment Variables**
   ```bash
   cd server
   nano .env
   ```
   
   Add these lines:
   ```env
   TEAM_NAME=Team Turistas
   TEAM_WHATSAPP_GROUP=https://chat.whatsapp.com/YOUR_ACTUAL_LINK
   TEAM_DISCORD_SERVER=https://discord.gg/YOUR_ACTUAL_LINK
   ```

2. **Initialize Team Turistas**
   ```bash
   npm run init:team
   ```
   
   You should see:
   ```
   ✅ Team Turistas created successfully!
   Team ID: [some-id]
   Team Name: Team Turistas
   Coach: [your-admin-username]
   Members: 1
   ```

3. **Configure Links (Optional)**
   
   If you didn't set up links in step 1, you can add them later through the UI:
   - Log in as admin/team leader
   - Navigate to Team section
   - Click "Add" next to WhatsApp or Discord
   - Paste your invite links

### Customizing Code Template

Option 1: Edit plantilla.txt before initialization
```bash
cd server
nano plantilla.txt
# Edit your C++ template
npm run init:team
```

Option 2: Edit through UI after initialization
- Navigate to Team Turistas page
- Click "Edit Code Template"
- Paste your template
- Click "Save Template"

## For Regular Users

### Joining Team Turistas

1. **From Dashboard**
   - Log in to the platform
   - Click the "👥 Team Turistas" card

2. **From Navbar**
   - Click "Team" in the top navigation

3. **Join the Team**
   - You'll see the Team Turistas page
   - Click the "Join Team" button
   - You're now a member!

### Using Team Features

#### Accessing Group Chats

**WhatsApp**
- Find "WhatsApp Group" section
- Click "Open" button
- Opens in new tab

**Discord**
- Find "Discord Server" section  
- Click "Open" button
- Opens in new tab

#### Creating USACO IDE Links

1. Select your language (C++, Java, or Python)
2. Click "Create IDE Link"
3. Wait a moment for the link to generate
4. Copy the link from the modal
5. Share with your team!

The link will have your team's code template already loaded.

#### Creating Excalidraw Rooms

1. Click "Create Room" in the Excalidraw card
2. Enter a room name (e.g., "Binary Tree Study Session")
3. Click "Create"
4. Room is saved and accessible to all team members

#### Viewing RPC Contests

1. Click "View Contests" in RPC Contests card
2. Browse upcoming contests
3. Click "Register" on any contest to sign up
4. Opens contest registration page in new tab

### Tips

- **Stay Connected**: Join both WhatsApp and Discord for different types of communication
- **Use Templates**: The USACO IDE links come with your team's code template pre-loaded
- **Collaborate**: Excalidraw rooms are great for explaining algorithms visually
- **Stay Updated**: Check RPC contests regularly to not miss important competitions

## For Team Leaders

### Managing Links

**WhatsApp Group**
1. Get your WhatsApp group invite link
2. Navigate to Team Turistas page
3. Click "Add/Edit" next to WhatsApp Group
4. Paste the link: `https://chat.whatsapp.com/...`
5. Click "Save"

**Discord Server**
1. Get your Discord server invite link
2. Navigate to Team Turistas page  
3. Click "Add/Edit" next to Discord Server
4. Paste the link: `https://discord.gg/...`
5. Click "Save"

### Managing Code Template

1. Navigate to Team Turistas page
2. Scroll to USACO IDE section
3. Click "Edit Code Template"
4. Update the template code
5. Click "Save Template"

This template will be used for all new USACO IDE links.

### Team Statistics

Keep track of team progress in the statistics section:
- **Total Problems Solved**: Aggregate of all member submissions
- **Total Contests**: Number of contests participated in
- **Average Rating**: Team's average competitive programming rating

## Common Tasks

### "I want to practice with my team"

1. Create a USACO IDE link with your language
2. Share the link in WhatsApp/Discord
3. Everyone gets the same template to start with
4. Code together and share solutions

### "I want to explain an algorithm"

1. Create an Excalidraw room with a descriptive name
2. Share the room link with your team
3. Draw diagrams, write pseudocode
4. Collaborate in real-time

### "I want to join an upcoming contest"

1. Click "View Contests" in RPC section
2. Find the contest you want to join
3. Click "Register"
4. Complete registration on RPC website

### "I want to leave the team"

1. Navigate to Team Turistas page
2. Scroll to bottom
3. Click "Leave Team"
4. Confirm when prompted

**Note**: If you're the only team leader, you can't leave until you assign another leader.

## Troubleshooting

### "Team Turistas not found"

**Solution**: Contact an administrator to run the initialization:
```bash
cd server
npm run init:team
```

### "Cannot join team"

**Possible Causes**:
- Team is full (max 50 members by default)
- Team doesn't allow join requests
- You're already a member

**Solution**: Contact a team leader or admin

### "Links not working"

**Check**:
- Are the links configured? (Ask team leader)
- Is the link format correct?
  - WhatsApp: `https://chat.whatsapp.com/...`
  - Discord: `https://discord.gg/...`

**Solution**: Team leader should update the links through the UI

### "Rate limit error"

**Message**: "Too many team join/leave requests"

**Solution**: Wait 60 seconds before trying again. You can make up to 5 join/leave requests per minute.

### "Code template is empty"

**Solution**: Team leader should:
1. Click "Edit Code Template"
2. Add the template code
3. Click "Save Template"

## Support

For additional help:
- Contact team leaders
- Create an issue on GitHub
- Check the full documentation:
  - [TEAM_TURISTAS_SETUP.md](./TEAM_TURISTAS_SETUP.md)
  - [TEAM_TURISTAS_UI_GUIDE.md](./TEAM_TURISTAS_UI_GUIDE.md)

---

**Version**: 1.0  
**Last Updated**: December 19, 2025  
**Platform**: Turistas CP - Team Turistas
