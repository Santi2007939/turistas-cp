#!/usr/bin/env node

/**
 * Test script for USACO Permalink Service
 * 
 * Usage:
 *   node server/scripts/get-usaco-link-server.js [language]
 * 
 * Examples:
 *   node server/scripts/get-usaco-link-server.js
 *   node server/scripts/get-usaco-link-server.js cpp
 *   node server/scripts/get-usaco-link-server.js py
 */

import usacoPermalinkService from '../src/services/usaco-permalink.service.js';

async function main() {
  const language = process.argv[2] || 'cpp';
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        USACO Permalink Service Test                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // Test 1: Get service status
  console.log('📊 Service Status:');
  console.log('─────────────────────────────────────────────────────────────');
  const status = usacoPermalinkService.getStatus();
  console.log(JSON.stringify(status, null, 2));
  console.log();
  
  // Test 2: Generate permalink
  console.log(`🔗 Generating permalink for language: ${language}`);
  console.log('─────────────────────────────────────────────────────────────');
  console.log('Please wait... (this may take up to 30 seconds)\n');
  
  const startTime = Date.now();
  
  try {
    const result = await usacoPermalinkService.getPermalink(language, {
      headless: true,
      timeout: 30000
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (result.ok) {
      console.log('✅ Success!');
      console.log(`   URL: ${result.url}`);
      console.log(`   Duration: ${duration}s`);
    } else {
      console.log('❌ Failed');
      console.log(`   Reason: ${result.reason}`);
      console.log(`   Duration: ${duration}s`);
      process.exit(1);
    }
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('❌ Error occurred');
    console.log(`   Error: ${error.message}`);
    console.log(`   Duration: ${duration}s`);
    process.exit(1);
  }
  
  console.log();
  console.log('─────────────────────────────────────────────────────────────');
  console.log('Test completed successfully!');
  console.log('═════════════════════════════════════════════════════════════\n');
}

// Run the test
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
