# 命令行接口规范

## 最终用户命令行界面

### 主命令结构
```
mcp-all-in-one [global-options] <command> [command-options]
mcp-all-in-one [global-options] --<global-flag> [flag-options]
```

**说明:**
- `<command>` 模式：用于 stdio、http、sse 等子命令
- `--<global-flag>` 模式：用于 --validate-mcp-config、--show-mcp-config-schema 等全局配置命令

### 全局选项 (Global Options)
| 选项 | 简写 | 类型 | 默认值 | 描述 |
|------|------|------|--------|------|
| `--help` | `-h` | flag | - | 显示帮助信息 |
| `--version` | `-V` | flag | - | 显示版本号 |

### 子命令 (Subcommands) 和全局标志 (Global Flags)

#### 1. stdio - 标准输入输出模式
```
mcp-all-in-one stdio [options]
```

**选项:**
| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--mcp-config` | string | `~/.mcp-all-in-one/mcp.json` | MCP配置文件路径 |
| `--log-level` | string | `info` | 日志级别，可选值：error、warn、info、debug，默认为info |
| `--silent` | flag | false | 启用静默模式，完全禁用日志输出 |

**示例:**
```bash
# 使用默认配置
mcp-all-in-one stdio

# 使用自定义MCP配置文件
mcp-all-in-one stdio --mcp-config ./my-config.json

# 设置日志级别为debug
mcp-all-in-one stdio --log-level debug

# 启用静默模式
mcp-all-in-one stdio --silent

```

#### 2. http - HTTP服务器模式
```
mcp-all-in-one http [options]
```

**选项:**
| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--mcp-config` | string | `~/.mcp-all-in-one/mcp.json` | MCP配置文件路径 |
| `--port` | number | 3095 | HTTP服务端口 |
| `--host` | string | 127.0.0.1 | 绑定主机地址 |
| `--cors` | boolean | true | 启用CORS跨域支持 |
| `--cors-origin` | string | * | CORS允许的源地址 |
| `--log-level` | string | `info` | 日志级别，可选值：error、warn、info、debug，默认为info |
| `--silent` | flag | false | 启用静默模式，完全禁用日志输出 |

**示例:**
```bash
# 默认配置启动HTTP服务
mcp-all-in-one http

# 指定端口和主机
mcp-all-in-one http --port 8080 --host 0.0.0.0

# 启用CORS支持
mcp-all-in-one http --cors --cors-origin "http://localhost:3000"

# 设置日志级别为error，只显示错误
mcp-all-in-one http --log-level error

# 启用静默模式，不输出任何日志
mcp-all-in-one http --silent
```

#### 3. sse - Server-Sent Events模式
```
mcp-all-in-one sse [options]
```

**选项:**
| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--mcp-config` | string | `~/.mcp-all-in-one/mcp.json` | MCP配置文件路径 |
| `--port` | number | 3095 | SSE服务端口 |
| `--host` | string | 127.0.0.1 | 绑定主机地址 |
| `--cors` | boolean | false | 启用CORS跨域支持 |
| `--log-level` | string | `info` | 日志级别，可选值：error、warn、info、debug，默认为info |
| `--silent` | flag | false | 启用静默模式，完全禁用日志输出 |

**示例:**
```bash
# 默认配置启动SSE服务
mcp-all-in-one sse

# 自定义端口
mcp-all-in-one sse --port 9095

# 启用跨域支持
mcp-all-in-one sse --cors

# 设置日志级别为warn
mcp-all-in-one sse --log-level warn
```

#### 4. 全局配置命令

##### --validate-mcp-config - 验证MCP配置文件
```bash
mcp-all-in-one --validate-mcp-config [path]
```

**参数:**
| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `path` | string | 否 | `~/.mcp-all-in-one/mcp.json` | MCP配置文件路径 |

**描述:** 验证指定的mcp.json文件是否符合规范，检查格式和必需字段。

**示例:**
```bash
# 使用默认MCP配置文件
mcp-all-in-one --validate-mcp-config

# 验证默认MCP配置文件（显式指定）
mcp-all-in-one --validate-mcp-config ~/.mcp-all-in-one/mcp.json

# 验证自定义MCP配置文件
mcp-all-in-one --validate-mcp-config ./my-config.json
```

##### --show-mcp-config-schema - 显示MCP配置文件schema
```bash
mcp-all-in-one --show-mcp-config-schema
```

**描述:** 打印mcp.json文件的JSON Schema内容，用于了解MCP配置文件的结构和规范。

**示例:**
```bash
# 显示MCP配置文件schema
mcp-all-in-one --show-mcp-config-schema
```

##### --show-mcp-config - 显示MCP配置文件内容
```bash
mcp-all-in-one --show-mcp-config [path]
```

**参数:**
| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `path` | string | 否 | `~/.mcp-all-in-one/mcp.json` | MCP配置文件路径 |

**描述:** 打印指定mcp.json文件的内容，格式化为易读的JSON格式。

**示例:**
```bash
# 使用默认MCP配置文件
mcp-all-in-one --show-mcp-config

# 显示默认MCP配置文件内容（显式指定）
mcp-all-in-one --show-mcp-config ~/.mcp-all-in-one/mcp.json

# 显示自定义MCP配置文件内容
mcp-all-in-one --show-mcp-config ./my-config.json
```

##### --set-mcp-config - 设置MCP配置文件
```bash
mcp-all-in-one --set-mcp-config [path]
```

**参数:**
| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `path` | string | 否 | `~/.mcp-all-in-one/mcp.json` | MCP配置文件路径 |

**描述:** 通过标准输入重写指定的mcp.json文件。从标准输入读取新的配置内容并写入文件。

**示例:**
```bash
# 使用默认MCP配置文件
echo '{"mcpServers": {"example": {"command": "node", "args": ["server.js"]}}}' | mcp-all-in-one --set-mcp-config

# 通过管道设置配置到默认文件
cat new-config.json | mcp-all-in-one --set-mcp-config

# 通过重定向设置配置到默认文件
mcp-all-in-one --set-mcp-config < new-config.json

# 通过管道设置配置到指定文件
cat new-config.json | mcp-all-in-one --set-mcp-config ~/.mcp-all-in-one/mcp.json

# 通过重定向设置配置到指定文件
mcp-all-in-one --set-mcp-config ~/.mcp-all-in-one/mcp.json < new-config.json

# 通过heredoc设置配置
mcp-all-in-one --set-mcp-config << 'EOF'
{
  "mcpServers": {
    "example": {
      "command": "node",
      "args": ["server.js"]
    }
  }
}
EOF
```

### 专用术语和名词解释

#### MCP相关术语
- **MCP Server**: 提供MCP协议服务的服务器进程
- **Transport**: 通信协议类型 (stdio, http, sse)

#### 配置相关术语
- **Configuration File**: JSON格式的MCP配置文件，定义MCP服务器集合
- **Environment Variable**: 环境变量，用于配置值替换 (如 `${API_KEY}`)
- **Default Config Path**: 默认MCP配置文件路径 `~/.mcp-all-in-one/mcp.json`

#### 日志相关术语
- **Log Level**: 日志级别，控制输出日志的详细程度 (error, warn, info, debug)
- **Silent Mode**: 静默模式，完全禁用所有日志输出，优先级高于其他日志参数

#### 命令行术语
- **Global Options**: 全局选项，适用于所有子命令
- **Global Flags**: 全局标志，独立执行的命令 (如 --validate-mcp-config, --show-mcp-config-schema)
- **Subcommand**: 子命令，如 stdio, http, sse
- **Flag**: 布尔标志，不需要参数值 (如 --help, --version, --silent)
- **Argument**: 命令参数，需要指定值 (如 --port 8080)

#### 日志级别说明
- **error**: 只输出错误日志
- **warn**: 输出警告及以上级别的日志
- **info**: 输出信息及以上级别的日志（默认级别）
- **debug**: 输出所有级别的日志，包括调试信息

