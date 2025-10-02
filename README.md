# Aether

Aether 是一个完整、可部署的 Gemini 聊天机器人 Web 应用程序，使用 Next.js 和 TypeScript 构建。它具有使用 TailwindCSS 设计的现代化、响应式用户界面，并且可以直接部署到 Vercel。

## 功能特性

- **流式响应**: 从 Gemini API 实时流式传输消息。
- **多模态对话**: 支持文本和图片输入。
- **Google 搜索 grounding**: 通过来自 Google 搜索的最新信息（包括引用）来增强响应。
- **会话管理**: 通过简单的会话机制维护对话历史记录。
- **响应式界面**: 简洁、极简的单页界面，为桌面、平板和移动设备优化。
- **深色模式**: 支持浅色和深色主题。
- **安全**: 您的 API 密钥在服务器端保持安全，绝不会暴露给客户端。
- **访问密码**: 可选的密码保护，以限制对应用的访问。

## 技术栈

- **框架**: [Next.js](https://nextjs.org/) (App Router)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **AI**: [Google AI for Developers JS SDK](https://github.com/google/generative-ai-js) (`@google/genai`)
- **样式**: [Tailwind CSS](https://tailwindcss.com/) with [Shadcn/ui](https://ui.shadcn.com/)
- **图标**: [Lucide React](https://lucide.dev/)

## 本地开发

按照以下说明在本地运行项目以进行开发和测试。

### 1. 克隆仓库

```bash
git clone https://github.com/laorent/ether.git
cd Aether
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置环境变量

通过复制示例文件，在项目根目录中创建一个 `.env.local` 文件：

```bash
cp .env.local.example .env.local
```

现在，打开 `.env.local` 并添加您的 Google AI API 密钥。您可以从 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取密钥。

```
# .env.local

# 必需：您的 Google AI API 密钥
GEMINI_API_KEY="your_api_key_here"

# 可选：用于访问应用的密码
AETHER_PASSWORD="your_access_password"

# 可选：指定要使用的 Gemini 模型（默认为 gemini-2.5-flash）
GEMINI_MODEL="gemini-2.5-flash"
```

### 4. 运行开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)（或您终端中指定的端口）以查看正在运行的应用程序。

## 测试步骤

1.  **启动服务**: 运行 `npm run dev`。
2.  **打开浏览器**: 导航到 `http://localhost:3000`。
3.  **输入密码 (如果已设置)**: 如果您设置了 `AETHER_PASSWORD`，请输入密码以访问聊天界面。
4.  **发送文本问题**: 输入一个问题，例如“关于AI的最新消息是什么？”，然后按 Enter。您应该会看到响应流式传输进来。响应底部还应包含来自 Google 搜索 grounding 工具的引用链接。
5.  **上传图片**: 点击回形针图标，选择一张图片，然后提问，例如“这张图片里有什么？”。模型应该会描述图片内容。
6.  **清除对话**: 点击顶部的“清除对话”按钮并确认。聊天记录将被清除，开始一个新的会话。
7.  **测试深色模式**: 点击顶部的太阳/月亮图标，在浅色和深色主题之间切换。

## 在 Vercel 上部署

此应用程序已针对在 [Vercel](https://vercel.com/) 上部署进行了优化。

1.  **推送您的代码**到 Git 仓库（例如 GitHub, GitLab, Bitbucket）。
2.  在 Vercel 上**导入您的项目**。
3.  **设置环境变量**: 在您的 Vercel 项目仪表板中，转到 `Settings > Environment Variables` 并添加您的环境变量。
    -   `GEMINI_API_KEY`: 您的 Google AI API 密钥。
    -   `AETHER_PASSWORD`: (可选) 设置一个访问密码。
    -   `GEMINI_MODEL`: (可选) 指定要使用的 Gemini 模型，例如 `gemini-pro-vision`。
4.  **部署**。Vercel 会自动检测到您正在使用 Next.js，并处理构建和部署过程。
