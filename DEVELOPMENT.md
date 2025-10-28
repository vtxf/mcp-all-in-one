# MCP All-in-One 开发调试指南

本文档提供了 MCP All-in-One 项目的完整开发调试指南，包括常用命令、测试方法和问题解决方案。

## 目录

- [快速开始](#快速开始)
- [开发模式](#开发模式)
- [命令行测试](#命令行测试)
- [配置文件管理](#配置文件管理)
- [服务模式测试](#服务模式测试)
- [调试技巧](#调试技巧)
- [常见问题](#常见问题)
- [日志分析](#日志分析)

## 快速开始

### 环境要求

- Node.js >= 22.0.0
- npm 或 yarn
- TypeScript (已配置)

### 安装依赖

```bash
npm install
```

### 基本开发命令

```bash
# 开发模式运行
npm run dev

# 构建项目
npm run build

# 启动生产版本
npm start
```

## 开发模式

### 1. 基本开发模式

```bash
# 启动开发模式（使用 tsx 直接运行源码）
npm run dev

# 或者使用监听模式（文件变化自动重启）
npm run dev:watch
```

### 2. 直接使用 tsx（推荐用于调试）

```bash
# 直接运行，绕过 npm
npx tsx src/index.ts --help

# 运行特定命令
npx tsx src/index.ts stdio --log-level debug
```

## 命令行测试

### 基本命令测试

```bash
# 显示主帮助信息
npm run dev -- --help

# 检查版本
npm run dev -- --version

# 直接使用 tsx（推荐，避免调试器干扰）
npx tsx src/index.ts --help
```

### 子命令帮助

```bash
# STDIO 模式帮助
npm run dev -- stdio --help
npx tsx src/index.ts stdio --help

# HTTP 模式帮助
npm run dev -- http --help
npx tsx src/index.ts http --help

# SSE 模式帮助
npm run dev -- sse --help
npx tsx src/index.ts sse --help
```

## 配置文件管理

### 1. 创建测试配置文件

```bash
# 创建简单测试配置
cat > test.mcp.json << 'EOF'
{
    "mcpServers": {
        "filesystem": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "."],
            "timeout": 30000,
            "restart": true
        }
    }
}
EOF
```

### 2. 配置验证

```bash
# 验证配置文件
npm run dev -- --validate-mcp-config ./test.mcp.json
npx tsx src/index.ts --validate-mcp-config ./test.mcp.json

# 显示配置内容
npm run dev -- --show-mcp-config ./test.mcp.json
npx tsx src/index.ts --show-mcp-config ./test.mcp.json

# 显示配置 Schema（可能有路径问题）
npm run dev -- --show-mcp-config-schema
npx tsx src/index.ts --show-mcp-config-schema
```

### 3. 错误配置测试

```bash
# 测试不存在的配置文件
npm run dev -- --validate-mcp-config ./nonexistent.json

# 创建无效配置文件测试
cat > invalid.json << 'EOF'
{
    "mcpServers": {
        "invalid": {
            "command": "test"
        }
    },
    "invalidField": "this should not be here"
}
EOF

# 验证无效配置
npm run dev -- --validate-mcp-config ./invalid.json

# 清理测试文件
rm test.mcp.json invalid.json
```

## 服务模式测试

### 1. STDIO 模式测试

```bash
# 启动 STDIO 模式（需要 MCP 客户端连接）
npm run dev -- stdio --mcp-config ./test.mcp.json --log-level debug
npx tsx src/index.ts stdio --mcp-config ./test.mcp.json --log-level debug

# 静默模式
npm run dev -- stdio --mcp-config ./test.mcp.json --silent
npx tsx src/index.ts stdio --mcp-config ./test.mcp.json --silent

```

### 2. HTTP 模式测试

```bash
# 启动 HTTP 服务器（默认端口 3095）
npm run dev -- http --mcp-config ./test.mcp.json --log-level debug
npx tsx src/index.ts http --mcp-config ./test.mcp.json --log-level debug

# 自定义端口和主机
npm run dev -- http --mcp-config ./test.mcp.json --port 8080 --host 0.0.0.0
npx tsx src/index.ts http --mcp-config ./test.mcp.json --port 8080 --host 0.0.0.0

# 启用 CORS
npm run dev -- http --mcp-config ./test.mcp.json --cors --cors-origin "*"
npx tsx src/index.ts http --mcp-config ./test.mcp.json --cors --cors-origin "*"

# 后台启动 HTTP 服务器（Linux/Mac）
npm run dev -- http --mcp-config ./test.mcp.json --port 3095 &
```

### 3. SSE 模式测试

```bash
# 启动 SSE 服务器（默认端口 3096）
npm run dev -- sse --mcp-config ./test.mcp.json --log-level debug
npx tsx src/index.ts sse --mcp-config ./test.mcp.json --log-level debug

# 自定义心跳间隔
npm run dev -- sse --mcp-config ./test.mcp.json --heartbeat-interval 10000
npx tsx src/index.ts sse --mcp-config ./test.mcp.json --heartbeat-interval 10000
```

### 4. HTTP 服务测试

当 HTTP 服务器启动后，可以测试以下端点：

```bash
# 测试健康检查（可能返回 404，这是已知问题）
curl -s http://127.0.0.1:3095/health

# 测试根路径（可能返回 404）
curl -s http://127.0.0.1:3095/

# 测试状态端点（可能返回 404）
curl -s http://127.0.0.1:3095/status

# 使用 PowerShell 测试（Windows）
try {
    Invoke-RestMethod -Uri 'http://127.0.0.1:3095/health' -Method Get
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
```

## 调试技巧

### 1. 日志级别调试

```bash
# 详细调试日志
npm run dev -- stdio --log-level debug

# 不同日志级别
npm run dev -- stdio --log-level error
npm run dev -- stdio --log-level warn
npm run dev -- stdio --log-level info
npm run dev -- stdio --log-level debug
```

### 2. 后台服务管理

```bash
# 启动后台服务（Linux/Mac）
npm run dev -- http --mcp-config ./test.mcp.json --port 3095 &

# 查看后台服务输出
jobs

# 停止后台服务
kill %1

# 或者查找进程并终止
ps aux | grep "tsx src/index.ts"
kill <PID>
```

### 3. 环境变量设置

```bash
# 清除可能干扰的 Node.js 选项
export NODE_OPTIONS=""

# 设置环境变量（如果配置文件需要）
export API_KEY="your-api-key"
npm run dev -- stdio --mcp-config ./config-with-env.json

# Windows PowerShell
$env:NODE_OPTIONS=""
$env:API_KEY="your-api-key"
npm run dev -- stdio --mcp-config ./config-with-env.json
```

### 4. 构建和测试生产版本

```bash
# 构建项目
npm run build

# 测试生产版本
npm start -- stdio --mcp-config ./test.mcp.json

# 验证构建结果
ls -la dist/
```

## 常见问题

### 1. 调试器干扰问题

**问题**：执行 `npm run dev -- --help` 时显示 npm 帮助而不是程序帮助

**解决方案**：
```bash
# 方法1：直接使用 tsx
npx tsx src/index.ts --help

# 方法2：清除环境变量
export NODE_OPTIONS=""
npm run dev -- --help

# 方法3：使用不同的命令格式
npm run dev "--help"
npm run-script dev -- --help
```

### 2. SSE 模式启动错误

**问题**：`Cannot read properties of null (reading 'setRequestHandler')`

**状态**：这是代码问题，需要在 BaseMcpServer.ts 中修复

**临时解决方案**：使用 STDIO 或 HTTP 模式进行开发

### 3. 服务类型识别问题

**问题**：日志显示 "类型: undefined"

**状态**：配置文件中缺少 type 字段导致的警告

**解决方案**：在配置文件中明确指定类型：
```json
{
    "mcpServers": {
        "filesystem": {
            "type": "stdio",
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
        }
    }
}
```

### 4. HTTP 路由 404 问题

**问题**：/health、/status 等端点返回 404

**状态**：路由配置问题，需要在 HTTP 服务器中添加这些端点

### 5. Schema 文件路径问题

**问题**：无法读取 schemas/mcp.schema.json

**解决方案**：检查文件是否存在，或使用绝对路径

## 日志分析

### 1. 启动日志解读

```bash
# 正常启动日志示例
[2025-10-26T00:29:32.942Z] [INFO] [Command:http] 启动HTTP模式MCP服务
[2025-10-26T00:29:32.945Z] [INFO] [Command:http] 配置文件加载成功
[2025-10-26T00:29:32.973Z] [INFO] [Command:http] 配置验证通过
[2025-10-26T00:29:32.985Z] [INFO] [McpServer:HttpServer] HTTP服务器已启动
```

### 2. 错误日志解读

```bash
# 配置错误
[ERROR] [Command:config] 环境变量错误: API_KEY - 环境变量未定义

# 服务连接错误
[ERROR] [McpProxy] 服务初始化失败
[WARN] [McpServer:HttpServer] 跳过非HTTP类型服务
```

### 3. 性能监控

```bash
# 启动时间监控
"uptime": 0.3499989

# 服务统计
"services": {
    "totalServices": 1,
    "connectedServices": 1,
    "availableTools": 2,
    "availableResources": 1,
    "availablePrompts": 1
}
```

## 配置文件示例

### 1. 基本 STDIO 配置

```json
{
    "mcpServers": {
        "filesystem": {
            "type": "stdio",
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "."],
            "env": {
                "NODE_ENV": "development"
            },
            "timeout": 30000,
            "restart": true,
            "restartDelay": 5000
        }
    }
}
```

### 2. HTTP 服务配置

```json
{
    "mcpServers": {
        "web-search": {
            "type": "http",
            "url": "https://api.example.com/mcp",
            "headers": {
                "Authorization": "Bearer ${API_KEY}",
                "Content-Type": "application/json"
            },
            "timeout": 15000,
            "retries": 3,
            "retryDelay": 1000
        }
    }
}
```

### 3. SSE 服务配置

```json
{
    "mcpServers": {
        "browser-tools": {
            "type": "sse",
            "url": "http://localhost:9222/sse",
            "headers": {
                "User-Agent": "mcp-all-in-one/1.0.0"
            },
            "reconnectInterval": 5000,
            "maxRetries": 3,
            "timeout": 30000
        }
    }
}
```

### 4. 混合服务配置

```json
{
    "mcpServers": {
        "filesystem": {
            "type": "stdio",
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
        },
        "web-search": {
            "type": "http",
            "url": "https://api.example.com/mcp",
            "headers": {
                "Authorization": "Bearer ${API_KEY}"
            }
        },
        "browser-tools": {
            "type": "sse",
            "url": "http://localhost:9222/sse"
        }
    }
}
```

## 开发建议

1. **优先使用 `npx tsx`**：避免调试器干扰，获得更直接的反馈
2. **使用详细日志**：开发时使用 `--log-level debug` 获得更多信息
3. **创建测试配置**：为不同场景创建专用的测试配置文件
4. **逐步测试**：先测试配置验证，再测试服务启动
5. **监控日志**：关注警告和错误信息，及时发现问题

## 清理命令

```bash
# 清理测试文件
rm -f test.mcp.json invalid.json

# 清理 node_modules（如果需要重新安装）
rm -rf node_modules package-lock.json
npm install

# 清理构建文件
rm -rf dist
```

---

如有其他问题或需要补充的内容，请随时更新此文档。