#!/usr/bin/env bun

/**
 * 发布脚本 - 自动化版本更新和 Git 操作
 *
 * 功能:
 * - 交互式选择版本升级类型
 * - 自动更新 package.json 和 wxt.config.ts 中的版本号
 * - 提交更改并创建 Git 标签
 *
 * 用法: bun run release
 */

import { $ } from 'bun'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
} as const

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✔${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
}

interface Version {
  major: number
  minor: number
  patch: number
}

function parseVersion(version: string): Version {
  const [major, minor, patch] = version.split('.').map(Number)
  return { major, minor, patch }
}

function formatVersion(v: Version): string {
  return `${v.major}.${v.minor}.${v.patch}`
}

function bumpVersion(current: Version, type: 'major' | 'minor' | 'patch'): Version {
  switch (type) {
    case 'major':
      return { major: current.major + 1, minor: 0, patch: 0 }
    case 'minor':
      return { major: current.major, minor: current.minor + 1, patch: 0 }
    case 'patch':
      return { major: current.major, minor: current.minor, patch: current.patch + 1 }
  }
}

function getCurrentVersion(): string {
  const packagePath = resolve(import.meta.dir, '../package.json')
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))
  return packageJson.version
}

function updatePackageVersion(newVersion: string): void {
  const packagePath = resolve(import.meta.dir, '../package.json')
  const content = readFileSync(packagePath, 'utf-8')
  const updated = content.replace(/"version":\s*"[^"]+"/, `"version": "${newVersion}"`)
  writeFileSync(packagePath, updated)
}

function updateWxtVersion(newVersion: string): void {
  const wxtPath = resolve(import.meta.dir, '../wxt.config.ts')
  const content = readFileSync(wxtPath, 'utf-8')
  const updated = content.replace(/version:\s*['"][^'"]+['"]/, `version: '${newVersion}'`)
  writeFileSync(wxtPath, updated)
}

async function isGitClean(): Promise<boolean> {
  const result = await $`git status --porcelain`.quiet()
  return result.stdout.toString().trim() === ''
}

async function prompt(question: string): Promise<string> {
  process.stdout.write(question)
  for await (const line of console) {
    return line.trim()
  }
  return ''
}

async function selectVersion(currentVersion: string): Promise<string | null> {
  const current = parseVersion(currentVersion)

  const options = [
    { type: 'patch' as const, version: formatVersion(bumpVersion(current, 'patch')) },
    { type: 'minor' as const, version: formatVersion(bumpVersion(current, 'minor')) },
    { type: 'major' as const, version: formatVersion(bumpVersion(current, 'major')) },
  ]

  console.log('')
  console.log(`${colors.cyan}当前版本: ${colors.reset}${currentVersion}`)
  console.log('')
  console.log(`${colors.dim}选择新版本:${colors.reset}`)
  console.log('')

  options.forEach((opt, index) => {
    const typeLabel = opt.type.padEnd(5)
    console.log(`  ${colors.cyan}${index + 1}${colors.reset}) ${typeLabel}  ${currentVersion} → ${colors.green}${opt.version}${colors.reset}`)
  })

  console.log(`  ${colors.cyan}4${colors.reset}) custom 自定义版本`)
  console.log(`  ${colors.cyan}0${colors.reset}) cancel 取消`)
  console.log('')

  const choice = await prompt(`${colors.blue}?${colors.reset} 请选择 [1-4, 0]: `)

  switch (choice) {
    case '1':
      return options[0].version
    case '2':
      return options[1].version
    case '3':
      return options[2].version
    case '4': {
      const customVersion = await prompt(`${colors.blue}?${colors.reset} 输入版本号 (x.y.z): `)
      if (!/^\d+\.\d+\.\d+$/.test(customVersion)) {
        log.error('无效的版本号格式')
        return null
      }
      return customVersion
    }
    case '0':
    case '':
      return null
    default:
      log.error('无效的选择')
      return null
  }
}

async function main() {
  console.log('')
  console.log(`${colors.cyan}━━━ New Tab Extension Release ━━━${colors.reset}`)

  // 检查 Git 状态
  if (!(await isGitClean())) {
    log.warn('工作区有未提交的更改')
    const confirm = await prompt('是否继续? (y/N): ')
    if (confirm.toLowerCase() !== 'y') {
      log.info('已取消')
      process.exit(0)
    }
  }

  // 获取当前版本
  const currentVersion = getCurrentVersion()

  // 选择新版本
  const newVersion = await selectVersion(currentVersion)
  if (!newVersion) {
    log.info('已取消')
    process.exit(0)
  }

  console.log('')
  log.info(`准备发布 v${newVersion}`)

  // 确认发布
  const confirm = await prompt(`${colors.blue}?${colors.reset} 确认发布? (y/N): `)
  if (confirm.toLowerCase() !== 'y') {
    log.info('已取消')
    process.exit(0)
  }

  console.log('')

  // 更新版本号
  log.info('更新版本号...')
  updatePackageVersion(newVersion)
  updateWxtVersion(newVersion)
  log.success('版本号已更新')

  // Git 操作
  log.info('提交更改...')
  await $`git add package.json wxt.config.ts CHANGELOG.md`.quiet()
  await $`git commit -m ${'chore: release v' + newVersion}`.quiet()
  log.success('更改已提交')

  log.info(`创建标签 v${newVersion}...`)
  await $`git tag -a ${'v' + newVersion} -m ${'Release v' + newVersion}`.quiet()
  log.success('标签已创建')

  console.log('')
  log.success('发布准备完成!')
  console.log('')
  console.log(`${colors.dim}下一步操作:${colors.reset}`)
  console.log('')
  console.log(`  1. 更新 ${colors.cyan}CHANGELOG.md${colors.reset} 添加版本变更说明`)
  console.log(`  2. 推送到远程仓库:`)
  console.log(`     ${colors.dim}git push origin main${colors.reset}`)
  console.log(`     ${colors.dim}git push origin v${newVersion}${colors.reset}`)
  console.log('')
  console.log(`${colors.green}推送标签后，GitHub Actions 将自动构建并创建 Release${colors.reset}`)
  console.log('')
}

main().catch((err) => {
  log.error(err.message)
  process.exit(1)
})
