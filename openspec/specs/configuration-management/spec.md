# 配置管理规范

## MCP配置文件结构和内容

### 默认MCP配置文件位置
```
~/.mcp-all-in-one/mcp.json
```

### MCP配置文件完整结构
根据constitution中的mcp.schema.json，MCP配置文件应采用以下结构：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "."],
      "env": {},
      "cwd": ".",
      "timeout": 30000,
      "restart": true,
      "restartDelay": 5000
    },
    "web-api": {
      "type": "http",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      },
      "timeout": 10000,
      "retries": 3,
      "retryDelay": 1000
    },
    "browser": {
      "type": "sse",
      "url": "http://localhost:9222/sse",
      "headers": {
        "User-Agent": "mcp-all-in-one/1.0.0"
      },
      "reconnectInterval": 1000,
      "maxRetries": 5,
      "timeout": 30000
    }
  }
}
```

### 配置项详细说明

#### 1. mcpServers - MCP服务器配置
根级别的mcpServers对象包含所有要代理的MCP服务配置，每个服务使用唯一的服务器名称作为键。
支持三种类型的MCP服务器：

##### 1.1 stdio类型服务器
**注意**: stdio类型服务器的type字段可以省略，默认为"stdio"

```json
{
  "command": "npx",
  "args": ["@modelcontextprotocol/server-filesystem", "."],
  "env": {
    "NODE_ENV": "production"
  },
  "cwd": ".",
  "timeout": 30000,
  "restart": true,
  "restartDelay": 5000
}
```

| 字段 | 类型 | 默认值 | 必需 | 描述 |
|------|------|--------|------|------|
| type | string | "stdio" | 否 | 服务器类型，省略时默认为"stdio" |
| command | string | - | 是 | 启动命令 |
| args | string[] | [] | 否 | 命令参数 |
| env | object | {} | 否 | 环境变量，只允许大写字母、数字、下划线 |
| cwd | string | "." | 否 | 工作目录 |
| timeout | number | 30000 | 否 | 连接超时(毫秒)，范围1000-300000 |
| restart | boolean | true | 否 | 失败时自动重启 |
| restartDelay | number | 5000 | 否 | 重启延迟(毫秒)，范围100-60000 |

##### 1.2 http类型服务器
```json
{
  "type": "http",
  "url": "https://api.example.com/mcp",
  "headers": {
    "Authorization": "Bearer ${API_KEY}",
    "Content-Type": "application/json"
  },
  "timeout": 10000,
  "retries": 3,
  "retryDelay": 1000
}
```

| 字段 | 类型 | 默认值 | 必需 | 描述 |
|------|------|--------|------|------|
| type | string | - | 是 | 服务器类型，固定为"http" |
| url | string | - | 是 | 服务URL，必须是有效的URI格式 |
| headers | object | {} | 否 | HTTP请求头，只允许字母、数字、下划线、连字符 |
| timeout | number | 10000 | 否 | 请求超时(毫秒)，范围1000-300000 |
| retries | number | 3 | 否 | 重试次数，范围0-10 |
| retryDelay | number | 1000 | 否 | 重试延迟(毫秒)，范围100-60000 |

##### 1.3 sse类型服务器
```json
{
  "type": "sse",
  "url": "http://localhost:9222/sse",
  "headers": {
    "User-Agent": "mcp-all-in-one/1.0.0"
  },
  "reconnectInterval": 1000,
  "maxRetries": 5,
  "timeout": 30000
}
```

| 字段 | 类型 | 默认值 | 必需 | 描述 |
|------|------|--------|------|------|
| type | string | - | 是 | 服务器类型，固定为"sse" |
| url | string | - | 是 | SSE服务URL，必须是有效的URI格式 |
| headers | object | {} | 否 | 连接请求头，只允许字母、数字、下划线、连字符 |
| reconnectInterval | number | 1000 | 否 | 重连间隔(毫秒)，范围100-300000 |
| maxRetries | number | 5 | 否 | 最大重试次数，范围0-100 |
| timeout | number | 30000 | 否 | 连接超时(毫秒)，范围1000-300000 |

### 服务器配置通过命令行参数处理

根据constitution，服务器相关配置通过命令行参数传递，不存储在MCP配置文件中：

#### 1. http子命令
```bash
mcp-all-in-one http --mcp-config <mcp-config-file> --port <port> --host <host> --cors <cors>
```
- `--port <port>`: HTTP服务端口号，默认3095
- `--host <host>`: HTTP服务IP地址，默认127.0.0.1
- `--cors <cors>`: 是否开启CORS，默认false

#### 2. sse子命令
```bash
mcp-all-in-one sse --mcp-config <mcp-config-file> --port <port> --host <host> --cors <cors>
```
- `--port <port>`: HTTP服务端口号，默认3095
- `--host <host>`: HTTP服务IP地址，默认127.0.0.1
- `--cors <cors>`: 是否开启CORS，默认false

#### 3. stdio子命令
```bash
mcp-all-in-one stdio --mcp-config <mcp-config-file>
```
- stdio模式不需要服务器配置参数

### 配置模板

#### 1. 最小配置模板
```json
{
  "mcpServers": {}
}
```

#### 2. 基础配置模板
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "."]
    }
  }
}
```

#### 3. 多类型配置模板
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "."],
      "cwd": "./src"
    },
    "web-search": {
      "type": "http",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      },
      "timeout": 15000
    },
    "browser": {
      "type": "sse",
      "url": "http://localhost:9222/sse",
      "reconnectInterval": 5000,
      "maxRetries": 3
    }
  }
}
```

### 配置验证规则

#### 1. 必需字段验证
- 每个MCP服务器必须包含有效的配置
- `type: "stdio"` 必须包含 `command` 字段
- `type: "http"` 和 `type: "sse"` 必须包含 `url` 字段

#### 2. 类型验证
- 环境变量名必须符合`^[A-Z_][A-Z0-9_]*$`模式
- URL字段必须是有效的URI格式
- HTTP头名称必须符合`^[^\s\$\{\}]+$`模式
- 数值字段必须在schema定义的范围内

#### 3. 服务器名称验证
- 服务器名称必须符合`^[^\s\$\{\}]+$`模式
- 服务器名称在MCP配置文件中必须唯一

### 错误消息格式

#### MCP配置文件错误
```
Config validation failed:
- mcpServers.api-server.type: Invalid type. Must be one of: stdio, http, sse
- mcpServers.filesystem.timeout: Must be between 1000 and 300000, got 999999
- mcpServers.web-api.url: Invalid URL format
```

#### 环境变量错误
```
Environment variable error:
- API_KEY: Required environment variable not found
- DATABASE_URL: Invalid URL format in environment variable
```

#### 服务器名称错误
```
Server name error:
- Server name "123invalid" must start with a letter
- Server name "test-server" already exists
```

### 配置文件自动创建机制

根据constitution要求，当指定的MCP配置文件不存在时，程序必须自动创建配置文件模板：

#### 1. 自动创建流程
1. **检查配置文件存在性**: 程序启动时检查指定路径的配置文件是否存在
2. **创建目录结构**: 如果配置目录不存在，自动创建完整目录路径
3. **生成默认配置**: 使用最小配置模板创建初始配置文件
4. **权限设置**: 确保配置文件具有适当的读写权限

#### 2. 默认配置文件内容
当自动创建配置文件时，使用以下最小配置模板：

```json
{
  "mcpServers": {}
}
```

#### 3. 自动创建的触发条件
- 使用`--mcp-config`参数指定的文件不存在
- 默认路径`~/.mcp-all-in-one/mcp.json`不存在
- 配置文件路径指向的目录不存在

#### 4. 自动创建的错误处理
- **目录创建失败**: 记录错误日志并退出程序
- **文件写入失败**: 记录错误日志并退出程序
- **权限不足**: 记录错误日志并提供用户手动创建指导

### 环境变量处理规则

#### 1. 环境变量语法
- **格式**: `${VARIABLE_NAME}`
- **支持位置**: 配置文件中的所有字符串值字段
- **嵌套支持**: 不支持环境变量嵌套展开

#### 2. 环境变量命名规范
- **命名规则**: 必须符合`^[A-Z_][A-Z0-9_]*$`模式
- **字符要求**: 只能包含大写字母、数字、下划线
- **起始字符**: 必须以字母或下划线开头

#### 3. 环境变量验证
- **存在性检查**: 引用的环境变量必须存在
- **值验证**: 环境变量值不能为空字符串
- **类型检查**: 环境变量值符合目标字段的类型要求

#### 4. 环境变量错误处理
- **缺失环境变量**: 程序启动时报错退出，显示缺失的环境变量名
- **无效环境变量值**: 记录警告日志并使用字段默认值
- **类型转换失败**: 记录错误日志并退出程序

### Schema引用说明

本MCP配置文件严格遵循openspec/specs/constitution/mcp.schema.json中定义的JSON Schema。所有配置项都必须符合该schema的验证规则。