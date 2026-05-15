#!/bin/bash

# Git 强制推送脚本（本地优先，不拉取远程）
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
echo "⚠️  警告：将强制推送本地内容到远程，远程上未被拉取的提交会丢失！"
read -p "确认继续？(y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

echo "正在添加所有文件..."
git add .

echo "正在提交更改: $commit_msg"
git commit -m "$commit_msg"

echo "正在强制推送到远程仓库（本地优先）..."
git push --force-with-lease origin "$branch"

if [ $? -eq 0 ]; then
    echo "✅ 强制推送完成！"
else
    echo "❌ 强制推送失败，可能需要使用更危险的 git push -f"
    exit 1
fi