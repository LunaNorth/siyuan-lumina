#!/bin/bash

# Git自动提交脚本
# 用法: ./git-update.sh "提交信息"

# 检查是否提供了提交信息
if [ -z "$1" ]; then
    echo "请输入提交信息:"
    read commit_msg
else
    commit_msg="$1"
fi

# 如果还是没有提交信息，使用默认值
if [ -z "$commit_msg" ]; then
    commit_msg="自动提交 $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 执行Git操作
echo "正在添加所有文件..."
git add .

echo "正在提交更改，信息: $commit_msg"
git commit -m "$commit_msg"

echo "正在推送到远程仓库..."
git push origin main

echo "✅ 完成！"