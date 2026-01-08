#!/bin/bash

# New Tab Extension 发布脚本
# 用法: ./scripts/release.sh [major|minor|patch] 或 ./scripts/release.sh <version>

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✔${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✖${NC} $1"; exit 1; }

# 获取当前版本
get_current_version() {
    grep '"version"' package.json | head -1 | sed -E 's/.*"version": "([^"]+)".*/\1/'
}

# 计算新版本
calculate_new_version() {
    local current=$1
    local bump_type=$2

    IFS='.' read -r major minor patch <<< "$current"

    case $bump_type in
        major)
            echo "$((major + 1)).0.0"
            ;;
        minor)
            echo "${major}.$((minor + 1)).0"
            ;;
        patch)
            echo "${major}.${minor}.$((patch + 1))"
            ;;
        *)
            # 如果不是 bump 类型，假设是直接指定的版本号
            if [[ $bump_type =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
                echo "$bump_type"
            else
                error "无效的版本参数: $bump_type (使用 major, minor, patch 或 x.y.z 格式)"
            fi
            ;;
    esac
}

# 更新 package.json 中的版本
update_package_version() {
    local new_version=$1
    sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$new_version\"/" package.json
}

# 更新 wxt.config.ts 中的版本
update_wxt_version() {
    local new_version=$1
    sed -i "s/version: '[^']*'/version: '$new_version'/" wxt.config.ts
}

# 主流程
main() {
    # 检查参数
    if [ -z "$1" ]; then
        echo "用法: $0 [major|minor|patch|<version>]"
        echo ""
        echo "示例:"
        echo "  $0 patch     # 1.0.0 -> 1.0.1"
        echo "  $0 minor     # 1.0.0 -> 1.1.0"
        echo "  $0 major     # 1.0.0 -> 2.0.0"
        echo "  $0 1.2.3     # 直接设置为 1.2.3"
        exit 1
    fi

    # 检查是否在 git 仓库中
    if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        error "当前目录不是 git 仓库"
    fi

    # 检查工作区是否干净
    if [ -n "$(git status --porcelain)" ]; then
        warn "工作区有未提交的更改"
        read -p "是否继续? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    # 获取版本信息
    CURRENT_VERSION=$(get_current_version)
    NEW_VERSION=$(calculate_new_version "$CURRENT_VERSION" "$1")

    info "当前版本: $CURRENT_VERSION"
    info "新版本: $NEW_VERSION"
    echo ""

    read -p "确认发布 v$NEW_VERSION? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "已取消"
        exit 0
    fi

    # 更新版本号
    info "更新版本号..."
    update_package_version "$NEW_VERSION"
    update_wxt_version "$NEW_VERSION"
    success "版本号已更新"

    # 构建测试
    info "构建扩展..."
    bun run build
    success "Chrome 构建完成"
    bun run build:firefox
    success "Firefox 构建完成"

    # 创建 zip 包
    info "创建发布包..."
    bun run zip
    bun run zip:firefox
    success "发布包已创建"

    # Git 操作
    info "提交更改..."
    git add package.json wxt.config.ts CHANGELOG.md
    git commit -m "chore: release v$NEW_VERSION"
    success "更改已提交"

    info "创建标签 v$NEW_VERSION..."
    git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
    success "标签已创建"

    echo ""
    success "发布准备完成!"
    echo ""
    info "下一步操作:"
    echo "  1. 更新 CHANGELOG.md 添加版本变更说明"
    echo "  2. 推送到远程仓库:"
    echo "     git push origin main"
    echo "     git push origin v$NEW_VERSION"
    echo ""
    info "推送标签后，GitHub Actions 将自动创建 Release"
}

main "$@"
