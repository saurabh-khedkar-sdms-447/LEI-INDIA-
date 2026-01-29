#!/usr/bin/env node

import net from 'net';

/**
 * Finds an available port starting from a given port number
 * @param {number} startPort - The port to start checking from (default: 3000)
 * @returns {Promise<number>} - The first available port
 */
async function findAvailablePort(startPort = 3000) {
  return new Promise((resolve, reject) => {
    const checkPort = (port) => {
      const server = net.createServer();
      
      server.listen(port, () => {
        server.once('close', () => {
          resolve(port);
        });
        server.close();
      });
      
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          // Port is in use, try next port
          checkPort(port + 1);
        } else {
          reject(err);
        }
      });
    };
    
    checkPort(startPort);
  });
}

// If run directly, find and print the port
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('find-port.mjs')) {
  const startPort = parseInt(process.argv[2]) || 3000;
  findAvailablePort(startPort)
    .then(port => {
      console.log(port);
      process.exit(0);
    })
    .catch(err => {
      console.error('Error finding available port:', err);
      process.exit(1);
    });
}

export default findAvailablePort;
