#!/usr/bin/env node

/**
 * 同步版本号到 wxt.config.ts
 * 由 release-it 在 after:bump 钩子调用
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const version = process.argv[2]

if (!version) {
  console.error('Usage: node sync-wxt-version.js <version>')
  process.exit(1)
}

const wxtPath = resolve(__dirname, '../wxt.config.ts')
const content = readFileSync(wxtPath, 'utf-8')
const updated = content.replace(/version:\s*['"][^'"]+['"]/, `version: '${version}'`)
writeFileSync(wxtPath, updated)

console.log(`✔ wxt.config.ts 版本已同步为 ${version}`)
