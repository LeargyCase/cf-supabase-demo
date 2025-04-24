# Cloudflare Pages + Supabase 演示

这是一个使用 Cloudflare Pages 部署前端，并与 Supabase 数据库交互的简单演示项目。

## 功能

- 展示与 Supabase 的连接性测试
- 允许用户添加新消息到数据库
- 从数据库获取消息列表并显示
- 支持实时消息更新

## 配置步骤

### 1. Supabase 设置

1. 创建 Supabase 账户并创建新项目
2. 在 SQL 编辑器中创建 messages 表:

```sql
CREATE TABLE messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. 获取 Supabase URL 和匿名密钥（项目设置 > API）
4. 在 `src/App.tsx` 文件中更新 `supabaseUrl` 和 `supabaseKey` 变量

### 2. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 3. Cloudflare Pages 部署

1. 在 GitHub 上创建仓库并推送代码
2. 登录 Cloudflare Pages 仪表板
3. 点击 "创建应用程序" 并连接 GitHub 仓库
4. 设置构建配置:
   - 构建命令: `npm run build`
   - 输出目录: `dist`
5. 添加环境变量（可选）:
   - VITE_SUPABASE_URL: 你的 Supabase URL
   - VITE_SUPABASE_ANON_KEY: 你的 Supabase 匿名密钥
6. 部署应用

## 注意事项

- 确保在 Supabase 项目中配置了正确的安全策略
- 在生产环境中，应将 Supabase 凭据设置为环境变量
- 添加适当的身份验证机制以增强安全性

## 技术栈

- React + TypeScript
- Vite
- Supabase 客户端
- Cloudflare Pages 