#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const startPort = parseInt(process.env.PORT) || 3000;

async function runInitDatabase() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['--yes', 'tsx', join(process.cwd(), 'src', 'initDatabase.ts')], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        PORT: startPort.toString(),
      },
    });

    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Database initialization failed with exit code ${code}`));
      }
    });
  });
}

try {
  console.log('🔧 Initializing database...\n');
  
  try {
    await runInitDatabase();
    console.log('\n✅ Database initialization completed\n');
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    process.exit(1);
  }

  const portFile = join(process.cwd(), '.port');
  const portContent = readFileSync(portFile, 'utf-8');
  const resolvedPort = parseInt(portContent.trim());
  unlinkSync(portFile);
  
  console.log(`🚀 Starting Next.js dev server on port ${resolvedPort}...`);
  console.log(`📍 Your app will be available at http://localhost:${resolvedPort}\n`);
  
  const nextDev = spawn('next', ['dev', '-p', resolvedPort.toString()], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: resolvedPort.toString(),
    },
  });
  
  nextDev.on('error', (err) => {
    console.error('❌ Failed to start Next.js:', err);
    process.exit(1);
  });
  
  nextDev.on('exit', (code) => {
    process.exit(code || 0);
  });
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    nextDev.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    nextDev.kill('SIGTERM');
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
