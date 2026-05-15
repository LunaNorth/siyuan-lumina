#!/bin/bash

# Git 强制推送脚本（以本地优先，直接使用 -f）
# 用法: ./git-force-push.sh "提交信息"

# 获取提交信息
if [ -z "$1" ]; then
    echo "请输入提交信息:"
    read commit_msg
else
    commit_msg="$1"
fi

if [ -z "$commit_msg" ]; then
    commit_msg="强制推送 $(date '+%Y-%m-%d %H:%M:%S')"
fi

branch=$(git symbolic-ref --short HEAD 2>/dev/null)
if [ -z "$branch" ]; then
    branch="main"
fi

echo "当前分支: $branch"
echo "⚠️  严重警告：将无条件强制推送本地内容到远程！"
echo "    远程上所有与本地不同的提交（包括其他人或之前未拉取的提交）都会永久丢失！"
read -p "确认继续？(y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

echo "正在添加所有文件..."
git add .

echo "正在提交更改: $commit_msg"
git commit -m "$commit_msg"

echo "正在强制推送（git push -f）..."
git push -f origin "$branch"

if [ $? -eq 0 ]; then
    echo "✅ 强制推送完成！"
else
    echo "❌ 推送失败，请检查网络或仓库权限"
    exit 1
fi