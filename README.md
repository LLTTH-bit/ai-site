# LLTTH-AI-site

私有 AI 对话平台，支持多轮对话、流式输出、深浅主题切换和管理后台。

## 特性

- 🔐 **单一管理员** - 仅管理员可管理用户
- 💬 **AI 对话** - 多轮对话、SSE 流式输出、Markdown 渲染
- 🌓 **主题切换** - 深色/浅色模式，流畅过渡动画
- 📊 **用量统计** - Token 消耗追踪、用户排行
- 🛡️ **管理后台** - 用户管理、聊天记录审计
- 🚀 **一键部署** - PM2 部署

## 技术栈

- **框架**: Next.js 15 + TypeScript + Turbopack
- **数据库**: SQLite (Prisma ORM)
- **认证**: iron-session
- **UI**: Tailwind CSS + shadcn/ui
- **部署**: PM2 + Nginx

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 生成 Prisma 客户端
npx prisma generate

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

### 服务器部署

```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 安装 PM2
npm install -g pm2

# 克隆项目
cd /var/www
git clone https://github.com/LLTTH-bit/ai-site.git
cd ai-site

# 配置环境变量
cp .env.example .env
nano .env

# 构建并启动
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 start npm --name "ai-site" -- start

# 配置 Nginx 反向代理
```

## 环境变量配置

```bash
# Session 密钥（生成: openssl rand -base64 32）
SESSION_SECRET="your-secret-key"

# 数据库（SQLite）
DATABASE_URL="file:./dev.db"

# AI API 配置（SiliconFlow）
AI_API_BASE_URL="https://api.siliconflow.cn/v1"
AI_API_KEY="your-api-key"

# 模型配置
DEFAULT_MODEL="Qwen/Qwen2.5-7B-Instruct"
MAX_TOKENS_PER_REQUEST=4096
DAILY_TOKEN_LIMIT=100000
MAX_MESSAGE_LENGTH=10000

# 管理员
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

## 默认管理员

首次部署后，使用以下账号登录：

- **邮箱**: cuber936bit@163.com
- **密码**: admin123

登录后可在管理后台修改密码。

## 项目结构

```
ai-site/
├── app/                    # Next.js 应用
│   ├── (auth)/login/      # 登录页
│   ├── (main)/            # 主应用（需登录）
│   │   ├── chat/          # 对话页面
│   │   └── sidebar-wrapper.tsx
│   ├── admin/             # 管理后台
│   └── api/               # API 路由
├── components/            # React 组件
│   ├── theme-toggle.tsx  # 主题切换
│   └── ...
├── lib/                   # 工具函数
│   ├── session.ts        # Session 管理
│   └── prisma.ts         # Prisma 客户端
├── prisma/
│   ├── schema.prisma     # 数据库模型
│   └── dev.db            # SQLite 数据库
└── public/
    └── star.ico          # 网站图标
```

## 主要功能

### 登录页
- 深色/浅色主题切换，带流畅动画
- 显示 LLTTH 品牌文字
- 使用 star.ico 图标

### 对话页面
- 侧边栏显示对话历史
- 支持 Markdown 渲染代码高亮
- 流式 AI 回复
- 主题切换

### 管理后台
- **仪表盘**: 用户统计、对话统计、Token 消耗
- **用户管理**: 添加/编辑/删除用户
- **对话管理**: 查看用户对话记录
- **用量统计**: Token 使用分析

## 部署到阿里云

```bash
# 连接服务器
ssh root@your-server-ip

# 配置安全组
# 开放端口: 22, 80, 443, 3000

# 克隆并部署
cd /var/www
git clone https://github.com/LLTTH-bit/ai-site.git
cd ai-site
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 start npm --name "ai-site" -- start

# 配置 Nginx
apt-get install -y nginx
```

## 技术方案

详细技术设计见 [技术方案-v2.md](技术方案-v2.md)

## License

MIT
