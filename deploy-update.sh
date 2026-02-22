#!/bin/bash

echo "========== 开始更新网站 =========="

# 保持数据库不变，只更新代码
cd /var/www/ai-site

# 拉取最新代码（不更新数据库文件）
echo "正在拉取代码..."
git fetch origin main
git pull origin main

# 重新构建
echo "正在构建..."
npm run build

# 重启服务
echo "正在重启服务..."
pm2 restart ai-site
pm2 save

echo "========== 更新完成！ =========="
echo "访问 http://59.110.8.222:3000"
