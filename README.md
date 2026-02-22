# 私有 AI 对话网站

一个面向小团队的白名单制 AI 对话平台，支持多轮对话、流式输出、用量统计和管理后台。

## 特性

- 🔐 **白名单注册** - 仅预批准邮箱可注册
- 💬 **AI 对话** - 多轮对话、SSE 流式输出、Markdown 渲染
- 📊 **用量统计** - Token 消耗追踪、用户排行
- 🛡️ **管理后台** - 用户管理、白名单管理、聊天记录审计
- 🐳 **一键部署** - Docker Compose 单机部署

## 技术栈

- **框架**: Next.js 15 + TypeScript
- **数据库**: PostgreSQL 16
- **认证**: iron-session + bcryptjs
- **ORM**: Prisma
- **UI**: Tailwind CSS + shadcn/ui
- **部署**: Docker Compose

## 快速开始

### 1. 准备服务器

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
```

### 2. 部署应用

```bash
# 克隆项目
git clone <your-repo>
cd ai-chat-site

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库密码、Session 密钥、AI API 等

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f app
```

### 3. 访问应用

- 打开浏览器访问 `http://your-server-ip`
- 使用 `.env` 中配置的 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 登录
- 在管理后台添加白名单用户

## 环境变量配置

```bash
# 数据库（Docker 内部网络）
DATABASE_URL="postgresql://ai_chat_user:password@db:5432/ai_chat_db"

# Session 密钥（生成: openssl rand -base64 32）
SESSION_SECRET="your-secret-key"

# AI API 配置
AI_API_BASE_URL="https://your-api.com"
AI_API_KEY="your-api-key"

# 初始管理员
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me"
```

## 项目结构

```
ai-chat-site/
├── app/                    # Next.js 应用
│   ├── api/               # API 路由
│   └── ...
├── components/            # React 组件
├── lib/                   # 工具函数
│   ├── session.ts        # Session 管理
│   ├── password.ts       # 密码加密
│   └── prisma.ts         # Prisma 客户端
├── prisma/
│   ├── schema.prisma     # 数据库模型
│   └── seed.ts           # 初始化数据
├── docker-compose.yml    # Docker 部署配置
├── Dockerfile            # 应用构建配置
└── nginx.conf            # Nginx 配置
```

## 文档

- [技术方案 v2.0](技术方案-v2.md) - 详细技术设计
- [部署准备清单](部署准备清单.md) - 所需资源和费用
- [方案对比与迁移](方案对比与迁移.md) - 与 Supabase 方案对比

## License

MIT
