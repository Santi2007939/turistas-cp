/**
 * Team Turistas Initialization Service
 * Handles automatic initialization of Team Turistas on backend startup
 */

import TeamConfig from '../models/TeamConfig.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize Team Turistas if it doesn't exist
 * This function is safe to call multiple times - it won't create duplicates
 */
export async function initializeTeamTuristas() {
  try {
    const teamName = process.env.TEAM_NAME || 'Team Turistas';
    
    // Check if Team Turistas already exists
    const existingTeam = await TeamConfig.findOne({ name: teamName });
    
    if (existingTeam) {
      console.log(`✅ ${teamName} already exists (ID: ${existingTeam._id})`);
      return existingTeam;
    }

    console.log(`🔧 Initializing ${teamName}...`);

    // Find the first admin user to be the coach
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log(`⚠️  No admin user found. ${teamName} will be created without a coach.`);
      console.log(`   An admin can be assigned as coach later via the admin panel.`);
    }

    // Load default code template from plantilla.txt
    let codeTemplate = '';
    const templatePath = path.join(__dirname, '..', '..', 'plantilla.txt');
    
    try {
      if (fs.existsSync(templatePath)) {
        // Check file size before reading (max 100KB to prevent DoS)
        const stats = fs.statSync(templatePath);
        if (stats.size > 100000) {
          console.log('   ⚠️  plantilla.txt is too large (max 100KB), using empty template');
        } else {
          codeTemplate = fs.readFileSync(templatePath, 'utf8');
          console.log('   ✓ Loaded code template from plantilla.txt');
        }
      }
    } catch (err) {
      console.log('   ⚠️  Could not load plantilla.txt, using empty template');
    }

    // Get all current members (users with isCurrentMember flag, excluding admins)
    const currentMembers = await User.find({ 
      isCurrentMember: true,
      role: { $ne: 'admin' }
    });

    // Prepare team data
    const teamData = {
      name: teamName,
      description: process.env.TEAM_DESCRIPTION || 'Equipo oficial de programación competitiva Team Turistas. ¡Bienvenidos todos los miembros!',
      coach: adminUser ? adminUser._id : null,
      members: currentMembers.map((member, index) => ({
        userId: member._id,
        isActive: index < 3, // First 3 members are active
        joinedAt: new Date()
      })),
      maxMembers: Math.min(parseInt(process.env.TEAM_MAX_MEMBERS, 10) || 50, 50),
      settings: {
        isPublic: true,
        allowJoinRequests: true,
        sharedRoadmap: true,
        sharedCalendar: true
      },
      statistics: {
        totalProblemsSolved: 0,
        totalContests: 0,
        averageRating: 0
      },
      excalidrawRooms: [],
      excalidrawSessions: [],
      links: {
        whatsappGroup: process.env.TEAM_WHATSAPP_GROUP && 
                      process.env.TEAM_WHATSAPP_GROUP !== 'https://chat.whatsapp.com/your-group-link' 
          ? process.env.TEAM_WHATSAPP_GROUP 
          : undefined,
        discordServer: process.env.TEAM_DISCORD_SERVER && 
                      process.env.TEAM_DISCORD_SERVER !== 'https://discord.gg/your-server-link'
          ? process.env.TEAM_DISCORD_SERVER 
          : undefined
      },
      codeTemplate: codeTemplate
    };

    // Create the team
    const team = await TeamConfig.create(teamData);
    
    console.log(`✅ ${teamName} created successfully!`);
    console.log(`   Team ID: ${team._id}`);
    console.log(`   Coach: ${adminUser ? adminUser.username : 'None (will be assigned later)'}`);
    console.log(`   Members: ${team.members.length}`);
    console.log(`   WhatsApp: ${team.links.whatsappGroup || 'Not configured'}`);
    console.log(`   Discord: ${team.links.discordServer || 'Not configured'}`);
    
    return team;

  } catch (error) {
    console.error('❌ Error initializing Team Turistas:', error.message);
    // Don't throw - we want the server to start even if team init fails
    // Users can manually initialize via the init:team script
    return null;
  }
}

/**
 * Verify Team Turistas exists and return it
 */
export async function getTeamTuristas() {
  const teamName = process.env.TEAM_NAME || 'Team Turistas';
  return await TeamConfig.findOne({ name: teamName });
}
