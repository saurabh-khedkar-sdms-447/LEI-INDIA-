#!/usr/bin/env node
/**
 * Script to help replace console.log/error/warn calls with logger
 * This script identifies files that still use console.* and provides guidance
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = join(__dirname, '..')

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx'], excludeDirs = ['node_modules', '.next', '.git']) {
  const files = []
  
  function walk(currentDir) {
    const entries = readdirSync(currentDir)
    
    for (const entry of entries) {
      const fullPath = join(currentDir, entry)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        if (!excludeDirs.some(exclude => entry.includes(exclude))) {
          walk(fullPath)
        }
      } else if (stat.isFile()) {
        const ext = extname(entry)
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  }
  
  walk(dir)
  return files
}

function findConsoleUsage(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const matches = []
  
  lines.forEach((line, index) => {
    if (/console\.(log|error|warn|info|debug)/.test(line)) {
      matches.push({
        line: index + 1,
        content: line.trim(),
      })
    }
  })
  
  return matches
}

const files = findFiles(projectRoot)
const filesWithConsole = []

for (const file of files) {
  const matches = findConsoleUsage(file)
  if (matches.length > 0) {
    filesWithConsole.push({
      file: file.replace(projectRoot + '/', ''),
      matches,
    })
  }
}

if (filesWithConsole.length === 0) {
  console.log('✅ No console.* calls found!')
  process.exit(0)
}

console.log(`\n📋 Found ${filesWithConsole.length} files with console.* calls:\n`)

for (const { file, matches } of filesWithConsole) {
  console.log(`\n📄 ${file}`)
  matches.forEach(({ line, content }) => {
    console.log(`   Line ${line}: ${content.substring(0, 80)}${content.length > 80 ? '...' : ''}`)
  })
}

console.log(`\n\n💡 To replace these:\n`)
console.log(`1. Import logger: import { log } from '@/lib/logger'`)
console.log(`2. Replace:`)
console.log(`   - console.log(...) → log.info(...)`)
console.log(`   - console.error(...) → log.error(...)`)
console.log(`   - console.warn(...) → log.warn(...)`)
console.log(`   - console.debug(...) → log.debug(...)`)

process.exit(0)
