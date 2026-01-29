#!/usr/bin/env node

/**
 * Production server script that finds an available port and starts Next.js
 */

import { spawn } from 'child_process';
import findAvailablePort from './find-port.mjs';

const startPort = parseInt(process.env.PORT) || 3000;

try {
  console.log(`🔍 Checking for available port starting from ${startPort}...`);
  
  const port = await findAvailablePort(startPort);
  
  console.log(`✅ Found available port: ${port}`);
  console.log(`🚀 Starting Next.js production server on port ${port}...`);
  console.log(`📍 Your app will be available at http://localhost:${port}\n`);
  
  // Start Next.js production server with the found port
  const nextStart = spawn('next', ['start', '-p', port.toString()], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: port.toString(),
    },
  });
  
  nextStart.on('error', (err) => {
    console.error('❌ Failed to start Next.js:', err);
    process.exit(1);
  });
  
  nextStart.on('exit', (code) => {
    process.exit(code || 0);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    nextStart.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    nextStart.kill('SIGTERM');
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
