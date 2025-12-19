/**
 * Script to initialize the default "Team Turistas" team
 * Run this script once to set up the default team
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
import TeamConfig from '../src/models/TeamConfig.js';
import User from '../src/models/User.js';

const TEAM_NAME = 'Team Turistas';

async function initializeTeamTuristas() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if Team Turistas already exists
    let team = await TeamConfig.findOne({ name: TEAM_NAME });
    
    if (team) {
      console.log(`Team "${TEAM_NAME}" already exists!`);
      console.log(`Team ID: ${team._id}`);
      return team;
    }

    // Find the first admin user to be the coach
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('Warning: No admin user found. Team will be created without a coach.');
      console.log('You can assign a coach later by updating the team.');
    }

    // Load default code template from plantilla.txt
    let codeTemplate = '';
    const templatePath = path.join(__dirname, '..', 'plantilla.txt');
    
    try {
      codeTemplate = fs.readFileSync(templatePath, 'utf8');
      console.log('Loaded code template from plantilla.txt');
    } catch (err) {
      console.log('Warning: Could not load plantilla.txt, using empty template');
    }

    // Create Team Turistas
    const teamData = {
      name: TEAM_NAME,
      description: 'Equipo oficial de programación competitiva Team Turistas. ¡Bienvenidos todos los miembros!',
      coach: adminUser ? adminUser._id : null,
      members: adminUser ? [{
        userId: adminUser._id,
        role: 'leader',
        joinedAt: new Date()
      }] : [],
      maxMembers: 50,
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
      links: {
        whatsappGroup: process.env.TEAM_WHATSAPP_GROUP || '',
        discordServer: process.env.TEAM_DISCORD_SERVER || ''
      },
      codeTemplate: codeTemplate
    };

    team = await TeamConfig.create(teamData);
    
    console.log('✅ Team Turistas created successfully!');
    console.log(`Team ID: ${team._id}`);
    console.log(`Team Name: ${team.name}`);
    console.log(`Coach: ${adminUser ? adminUser.username : 'None'}`);
    console.log(`Members: ${team.members.length}`);
    console.log(`WhatsApp: ${team.links.whatsappGroup || 'Not set'}`);
    console.log(`Discord: ${team.links.discordServer || 'Not set'}`);
    console.log(`Code Template: ${codeTemplate ? 'Loaded' : 'Empty'}`);
    
    return team;

  } catch (error) {
    console.error('Error initializing Team Turistas:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the initialization
initializeTeamTuristas()
  .then(() => {
    console.log('Initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Initialization failed:', error);
    process.exit(1);
  });
