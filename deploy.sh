#!/bin/bash

# 构建和启动 AI Site

cd /var/www/ai-site

echo "========== 安装依赖 =========="
npm install

echo "========== 生成 Prisma Client =========="
npx prisma generate

echo "========== 初始化数据库 =========="
npx prisma db push

echo "========== 填充种子数据 =========="
npm run db:seed

echo "========== 构建项目 =========="
npm run build

echo "========== 启动服务 =========="
pm2 start npm --name "ai-site" -- start
pm2 save

echo "========== 查看运行状态 =========="
pm2 list

echo ""
echo "========== 部署完成！ =========="
echo "访问 http://你的服务器IP:3000"
echo "管理员账号: admin@example.com / admin123"
