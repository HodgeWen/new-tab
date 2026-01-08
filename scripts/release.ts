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
import chalk from 'chalk'
import { confirm, select, input } from '@inquirer/prompts'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

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

async function main() {
  console.log()
  console.log(chalk.cyan.bold('━━━ New Tab Extension Release ━━━'))
  console.log()

  // 检查 Git 状态
  if (!(await isGitClean())) {
    console.log(chalk.yellow('⚠ 工作区有未提交的更改'))
    const shouldContinue = await confirm({
      message: '是否继续?',
      default: false,
    })
    if (!shouldContinue) {
      console.log(chalk.gray('已取消'))
      process.exit(0)
    }
    console.log()
  }

  // 获取当前版本
  const currentVersion = getCurrentVersion()
  const current = parseVersion(currentVersion)

  console.log(`${chalk.dim('当前版本:')} ${chalk.white.bold(currentVersion)}`)
  console.log()

  // 计算各版本选项
  const patchVersion = formatVersion(bumpVersion(current, 'patch'))
  const minorVersion = formatVersion(bumpVersion(current, 'minor'))
  const majorVersion = formatVersion(bumpVersion(current, 'major'))

  // 选择版本类型
  const versionChoice = await select({
    message: '选择新版本',
    choices: [
      {
        name: `patch  ${chalk.gray(currentVersion)} → ${chalk.green(patchVersion)}`,
        value: patchVersion,
        description: '修复问题，小改动',
      },
      {
        name: `minor  ${chalk.gray(currentVersion)} → ${chalk.green(minorVersion)}`,
        value: minorVersion,
        description: '新增功能，向后兼容',
      },
      {
        name: `major  ${chalk.gray(currentVersion)} → ${chalk.green(majorVersion)}`,
        value: majorVersion,
        description: '重大更新，可能不兼容',
      },
      {
        name: `custom ${chalk.gray('自定义版本号')}`,
        value: 'custom',
        description: '手动输入版本号',
      },
    ],
  })

  let newVersion: string

  if (versionChoice === 'custom') {
    newVersion = await input({
      message: '输入版本号 (x.y.z)',
      validate: (value) => {
        if (!/^\d+\.\d+\.\d+$/.test(value)) {
          return '请输入有效的版本号格式 (例如: 1.2.3)'
        }
        if (value === currentVersion) {
          return `版本号不能与当前版本相同 (${currentVersion})`
        }
        return true
      },
    })
  } else {
    newVersion = versionChoice
  }

  console.log()
  console.log(`${chalk.blue('ℹ')} 准备发布 ${chalk.cyan.bold(`v${newVersion}`)}`)

  // 确认发布
  const shouldRelease = await confirm({
    message: '确认发布?',
    default: true,
  })

  if (!shouldRelease) {
    console.log(chalk.gray('已取消'))
    process.exit(0)
  }

  console.log()

  // 更新版本号
  console.log(`${chalk.blue('ℹ')} 更新版本号...`)
  updatePackageVersion(newVersion)
  updateWxtVersion(newVersion)
  console.log(`${chalk.green('✔')} 版本号已更新`)

  // Git 提交
  console.log(`${chalk.blue('ℹ')} 提交更改...`)
  await $`git add package.json wxt.config.ts CHANGELOG.md`.quiet()

  try {
    await $`git commit -m ${'chore: release v' + newVersion}`.quiet()
    console.log(`${chalk.green('✔')} 更改已提交`)
  } catch (error) {
    // 检查是否因为没有更改而失败
    const status = await $`git status --porcelain`.quiet()
    if (status.stdout.toString().trim() === '') {
      console.log(`${chalk.yellow('⚠')} 没有需要提交的更改，跳过提交`)
    } else {
      throw new Error(`Git 提交失败: ${(error as Error).message}`)
    }
  }

  // 创建标签
  console.log(`${chalk.blue('ℹ')} 创建标签 ${chalk.cyan(`v${newVersion}`)}...`)

  try {
    await $`git tag -a ${'v' + newVersion} -m ${'Release v' + newVersion}`.quiet()
    console.log(`${chalk.green('✔')} 标签已创建`)
  } catch (error) {
    // 检查标签是否已存在
    const tagExists = await $`git tag -l ${'v' + newVersion}`.quiet()
    if (tagExists.stdout.toString().trim()) {
      throw new Error(`标签 v${newVersion} 已存在，请选择其他版本号`)
    }
    throw new Error(`创建标签失败: ${(error as Error).message}`)
  }

  console.log()
  console.log(chalk.green.bold('✔ 发布准备完成!'))
  console.log()
  console.log(chalk.dim('下一步操作:'))
  console.log()
  console.log(`  1. 更新 ${chalk.cyan('CHANGELOG.md')} 添加版本变更说明`)
  console.log(`  2. 推送到远程仓库:`)
  console.log(chalk.gray(`     git push origin main`))
  console.log(chalk.gray(`     git push origin v${newVersion}`))
  console.log()
  console.log(chalk.green('推送标签后，GitHub Actions 将自动构建并创建 Release'))
  console.log()
}

main().catch((err) => {
  console.log(`${chalk.red('✖')} ${err.message}`)
  process.exit(1)
})

