#!/usr/bin/env node

import { spawn } from 'child_process';
import { access, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const startPort = parseInt(process.env.PORT) || 3000;

/**
 * Check if a production build exists
 */
async function buildExists() {
  try {
    await access(join(process.cwd(), '.next', 'BUILD_ID'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Run a command and wait for it to complete
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

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

  const hasBuild = await buildExists();
  
  if (!hasBuild) {
    console.log('📦 No production build found. Building the app...\n');
    try {
      await runCommand('next', ['build']);
      console.log('\n✅ Build completed successfully!\n');
    } catch (error) {
      console.error('\n❌ Build failed:', error.message);
      process.exit(1);
    }
  }

  const portFile = join(process.cwd(), '.port');
  const portContent = readFileSync(portFile, 'utf-8');
  const resolvedPort = parseInt(portContent.trim());
  unlinkSync(portFile);
  
  console.log(`🚀 Starting Next.js production server on port ${resolvedPort}...`);
  console.log(`📍 Your app will be available at http://localhost:${resolvedPort}\n`);
  
  const nextStart = spawn('next', ['start', '-p', resolvedPort.toString()], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: resolvedPort.toString(),
    },
  });
  
  nextStart.on('error', (err) => {
    console.error('❌ Failed to start Next.js:', err);
    process.exit(1);
  });
  
  nextStart.on('exit', (code) => {
    process.exit(code || 0);
  });
  
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
