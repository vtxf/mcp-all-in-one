# self-config-tools-testing

## 概述
本规范定义了mcp-all-in-one自我配置工具的STDIO模式测试方案，包括所有4个自我配置工具的详细测试用例，确保配置管理功能的完整性和可靠性。

## 测试环境配置

### 基本要求
- Node.js版本：22+
- mcp-all-in-one版本：1.0.0+
- MCP协议版本：2025-06-18
- 测试模式：STDIO模式

### 测试配置文件
```json
{
  "testEnvironment": "node",
  "testTimeout": 60000,
  "coverageReporters": ["text", "lcov", "html"],
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/index.ts"
  ]
}
```

### 测试环境变量
```bash
MCP_TEST_MODE=true
MCP_LOG_LEVEL=info
NODE_ENV=test
MCP_CONFIG_PATH=./example.mcp.json
```

## 测试配置文件

### 基础测试配置 (example.mcp.json)
```json
{
  "mcpServers": {
    "Time": {
      "command": "uvx",
      "args": [
        "mcp-server-time",
        "--local-timezone=Asia/Shanghai"
      ],
      "env": {}
    },
    "zhipu-web-search": {
      "type": "http",
      "url": "https://open.bigmodel.cn/api/mcp/web_search_prime/mcp",
      "headers": {
        "Authorization": "Bearer ${Z_AI_API_KEY}"
      }
    }
  }
}
```

### 测试用配置文件 (test-config.json)
```json
{
  "mcpServers": {
    "test-filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/tmp"],
      "env": {}
    }
  }
}
```

## 自我配置工具测试用例

### 工具1: mcp-all-in-one-validate-mcp-config

#### 1.1 验证当前配置文件
**测试场景：** 验证当前正在使用的MCP配置文件

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "mcp-all-in-one-validate-mcp-config",
    "arguments": {}
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"mcp-all-in-one-validate-mcp-config","arguments":{}}}
```

**预期输出：**
```json
{
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"valid\": true,\n  \"errors\": [],\n  \"configPath\": \"./example.mcp.json\"\n}"
      }
    ]
  },
  "jsonrpc": "2.0",
  "id": 1
}
```

#### 1.2 验证指定配置文件
**测试场景：** 验证指定的MCP配置文件

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "mcp-all-in-one-validate-mcp-config",
    "arguments": {
      "config-file": "./test-config.json"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"mcp-all-in-one-validate-mcp-config","arguments":{"config-file":"./test-config.json"}}}
```

**预期输出：**
```json
{
  "result": {
    "valid": true,
    "errors": [],
    "configPath": "./test-config.json"
  },
  "jsonrpc": "2.0",
  "id": 2
}
```

#### 1.3 验证无效配置文件
**测试场景：** 验证包含错误的配置文件

**测试配置文件 (invalid-config.json)：**
```json
{
  "mcpServers": {
    "invalid-service": {
      "type": "invalid-type"
    }
  }
}
```

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "mcp-all-in-one-validate-mcp-config",
    "arguments": {
      "config-file": "./invalid-config.json"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"mcp-all-in-one-validate-mcp-config","arguments":{"config-file":"./invalid-config.json"}}}
```

**预期输出：**
```json
{
  "result": {
    "valid": false,
    "errors": [
      "/mcpServers/invalid-service/type: must be equal to one of the allowed values [stdio, http, sse]"
    ],
    "configPath": "./invalid-config.json"
  },
  "jsonrpc": "2.0",
  "id": 3
}
```

#### 1.4 验证不存在的配置文件
**测试场景：** 验证不存在的配置文件

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "mcp-all-in-one-validate-mcp-config",
    "arguments": {
      "config-file": "./nonexistent-config.json"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"mcp-all-in-one-validate-mcp-config","arguments":{"config-file":"./nonexistent-config.json"}}}
```

**预期输出：**
```json
{
  "result": {
    "valid": false,
    "errors": [
      "ENOENT: no such file or directory, open './nonexistent-config.json'"
    ],
    "configPath": "./nonexistent-config.json"
  },
  "jsonrpc": "2.0",
  "id": 4
}
```

### 工具2: mcp-all-in-one-show-mcp-config

#### 2.1 显示当前配置
**测试场景：** 显示当前正在使用的MCP配置

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "mcp-all-in-one-show-mcp-config",
    "arguments": {}
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"mcp-all-in-one-show-mcp-config","arguments":{}}}
```

**预期输出：**
```json
{
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"config\": {\n    \"mcpServers\": {\n      \"Time\": {\n        \"command\": \"uvx\",\n        \"args\": [\n          \"mcp-server-time\",\n          \"--local-timezone=Asia/Shanghai\"\n        ],\n        \"env\": {}\n      },\n      \"zhipu-web-search\": {\n        \"type\": \"http\",\n        \"url\": \"https://open.bigmodel.cn/api/mcp/web_search_prime/mcp\",\n        \"headers\": {\n          \"Authorization\": \"Bearer [实际的API密钥值]\"\n        }\n      }\n    }\n  },\n  \"configPath\": \"./example.mcp.json\",\n  \"envExpanded\": true\n}"
      }
    ]
  },
  "jsonrpc": "2.0",
  "id": 5
}
```

#### 2.2 显示指定配置文件
**测试场景：** 显示指定的MCP配置文件内容

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "mcp-all-in-one-show-mcp-config",
    "arguments": {
      "config-file": "./test-config.json"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"mcp-all-in-one-show-mcp-config","arguments":{"config-file":"./test-config.json"}}}
```

**预期输出：**
```json
{
  "result": {
    "config": {
      "mcpServers": {
        "test-filesystem": {
          "command": "npx",
          "args": [
            "@modelcontextprotocol/server-filesystem",
            "/tmp"
          ],
          "env": {}
        }
      }
    },
    "configPath": "./test-config.json",
    "envExpanded": true
  },
  "jsonrpc": "2.0",
  "id": 6
}
```

### 工具3: mcp-all-in-one-show-mcp-config-schema

#### 3.1 显示MCP配置Schema
**测试场景：** 显示MCP配置的完整JSON Schema

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "mcp-all-in-one-show-mcp-config-schema",
    "arguments": {}
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"mcp-all-in-one-show-mcp-config-schema","arguments":{}}}
```

**预期输出：**
```json
{
  "result": {
    "schema": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "$id": "vtxf/mcp-all-in-one/schema/mcpServers.schema.json",
      "title": "MCP Servers Configuration Schema",
      "description": "Schema for MCP server configurations",
      "type": "object",
      "required": ["mcpServers"],
      "properties": {
        "mcpServers": {
          "type": "object",
          "description": "MCP servers configuration object",
          "patternProperties": {
            "^[^\\s\\$\\{\\}]+$": {
              "type": "object",
              "description": "Individual MCP server configuration",
              "oneOf": [
                {"$ref": "#/definitions/stdioServer"},
                {"$ref": "#/definitions/httpServer"},
                {"$ref": "#/definitions/sseServer"}
              ]
            }
          },
          "additionalProperties": false
        }
      },
      "additionalProperties": false,
      "definitions": {
        "stdioServer": {
          "type": "object",
          "description": "STDIO MCP server configuration",
          "required": ["command"],
          "properties": {
            "type": {"type": "string", "description": "Server type", "const": "stdio"},
            "command": {"type": "string", "description": "Command to start the MCP server"},
            "args": {"type": "array", "description": "Command arguments", "items": {"type": "string"}, "default": []},
            "env": {"type": "object", "description": "Environment variables", "patternProperties": {"^[A-Z_][A-Z0-9_]*$": {"type": "string"}}, "additionalProperties": false},
            "cwd": {"type": "string", "description": "Working directory", "default": "."}
        },
        "httpServer": {
          "type": "object",
          "description": "HTTP MCP server configuration",
          "required": ["type", "url"],
          "properties": {
            "type": {"type": "string", "description": "Server type", "const": "http"},
            "url": {"type": "string", "description": "HTTP server URL", "format": "uri"},
            "headers": {"type": "object", "description": "HTTP headers", "patternProperties": {"^[^\\s\\$\\{\\}]+$": {"type": "string"}}, "additionalProperties": false},
                        "retries": {"type": "integer", "description": "Number of retry attempts", "minimum": 0, "maximum": 10, "default": 3},
            "retryDelay": {"type": "integer", "description": "Delay between retries in milliseconds", "minimum": 100, "maximum": 60000, "default": 1000}
          }
        },
        "sseServer": {
          "type": "object",
          "description": "SSE MCP server configuration",
          "required": ["type", "url"],
          "properties": {
            "type": {"type": "string", "description": "Server type", "const": "sse"},
            "url": {"type": "string", "description": "SSE server URL", "format": "uri"},
            "headers": {"type": "object", "description": "SSE connection headers", "patternProperties": {"^[^\\s\\$\\{\\}]+$": {"type": "string"}}, "additionalProperties": false},
            "reconnectInterval": {"type": "integer", "description": "Reconnection interval in milliseconds", "minimum": 100, "maximum": 300000, "default": 1000},
            "maxRetries": {"type": "integer", "description": "Maximum reconnection attempts", "minimum": 0, "maximum": 100, "default": 5}
        }
      }
    },
    "schemaVersion": "http://json-schema.org/draft-07/schema#"
  },
  "jsonrpc": "2.0",
  "id": 7
}
```

### 工具4: mcp-all-in-one-set-mcp-config

#### 4.1 创建新配置文件
**测试场景：** 创建新的MCP配置文件

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "tools/call",
  "params": {
    "name": "mcp-all-in-one-set-mcp-config",
    "arguments": {
      "config-file": "./new-test-config.json",
      "config-content": "{\"mcpServers\":{\"test-memory\":{\"command\":\"npx\",\"args\":[\"@modelcontextprotocol/server-memory\"],\"env\":{}}}}"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":8,"method":"tools/call","params":{"name":"mcp-all-in-one-set-mcp-config","arguments":{"config-file":"./new-test-config.json","config-content":"{\"mcpServers\":{\"test-memory\":{\"command\":\"npx\",\"args\":[\"@modelcontextprotocol/server-memory\"],\"env\":{}}}"}}}
```

**预期输出：**
```json
{
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"success\": true,\n  \"configPath\": \"./new-test-config.json\",\n  \"backupPath\": \"\",\n  \"restartRequired\": false,\n  \"restartMessage\": \"MCP配置文件已更新\",\n  \"errors\": []\n}"
      }
    ]
  },
  "jsonrpc": "2.0",
  "id": 8
}
```

#### 4.2 修改当前配置文件
**测试场景：** 修改当前正在使用的配置文件

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 9,
  "method": "tools/call",
  "params": {
    "name": "mcp-all-in-one-set-mcp-config",
    "arguments": {
      "config-content": "{\"mcpServers\":{\"updated-time\":{\"command\":\"uvx\",\"args\":[\"mcp-server-time\",\"--local-timezone=UTC\"],\"env\":{}}}}"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":9,"method":"tools/call","params":{"name":"mcp-all-in-one-set-mcp-config","arguments":{"config-content":"{\"mcpServers\":{\"updated-time\":{\"command\":\"uvx\",\"args\":[\"mcp-server-time\",\"--local-timezone=UTC\"],\"env\":{}}}"}}}
```

**预期输出：**
```json
{
  "result": {
    "success": true,
    "configPath": "./example.mcp.json",
    "backupPath": "./example.mcp.json.backup.2025-10-27T12-45-30-123Z",
    "restartRequired": true,
    "restartMessage": "MCP配置已更新。请重启mcp-all-in-one服务以应用新配置。使用以下命令重启:\nmcp-all-in-one stdio -c ./example.mcp.json",
    "errors": []
  },
  "jsonrpc": "2.0",
  "id": 9
}
```

#### 4.3 设置无效配置内容
**测试场景：** 尝试设置包含错误的配置内容

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 10,
  "method": "tools/call",
  "params": {
    "name": "mcp-all-in-one-set-mcp-config",
    "arguments": {
      "config-file": "./invalid-update.json",
      "config-content": "{\"mcpServers\":{\"broken\":{\"type\":\"invalid\"}}}"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":10,"method":"tools/call","params":{"name":"mcp-all-in-one-set-mcp-config","arguments":{"config-file":"./invalid-update.json","config-content":"{\"mcpServers\":{\"broken\":{\"type\":\"invalid\"}}}"}}}
```

**预期输出：**
```json
{
  "result": {
    "success": false,
    "configPath": "./invalid-update.json",
    "errors": [
      "/mcpServers/broken/type: must be equal to one of the allowed values [stdio, http, sse]"
    ],
    "restartRequired": false,
    "restartMessage": ""
  },
  "jsonrpc": "2.0",
  "id": 10
}
```

#### 4.4 设置无效JSON格式
**测试场景：** 尝试设置无效的JSON格式内容

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 11,
  "method": "tools/call",
  "params": {
    "name": "mcp-all-in-one-set-mcp-config",
    "arguments": {
      "config-file": "./json-error.json",
      "config-content": "{\"mcpServers\":{\"invalid\":{missing_quotes: true}}}"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":11,"method":"tools/call","params":{"name":"mcp-all-in-one-set-mcp-config","arguments":{"config-file":"./json-error.json","config-content":"{\"mcpServers\":{\"invalid\":{missing_quotes: true}}}"}}}
```

**预期输出：**
```json
{
  "result": {
    "success": false,
    "configPath": "./json-error.json",
    "errors": [
      "MCP配置内容不是有效的JSON格式: Expected property name or '}' in JSON at position 32"
    ],
    "restartRequired": false,
    "restartMessage": ""
  },
  "jsonrpc": "2.0",
  "id": 11
}
```

#### 4.5 缺少必需参数
**测试场景：** 调用工具时缺少必需参数

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "method": "tools/call",
  "params": {
    "name": "mcp-all-in-one-set-mcp-config",
    "arguments": {
      "config-file": "./missing-param.json"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":12,"method":"tools/call","params":{"name":"mcp-all-in-one-set-mcp-config","arguments":{"config-file":"./missing-param.json"}}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "error": {
    "code": -32602,
    "message": "Invalid params: Missing required parameter 'config-content'",
    "data": {
      "parameter": "config-content"
    }
  }
}
```

## 错误处理测试

### 5.1 工具名称错误
**测试场景：** 调用不存在的自我配置工具

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 13,
  "method": "tools/call",
  "params": {
    "name": "mcp-all-in-one-nonexistent-tool",
    "arguments": {}
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":13,"method":"tools/call","params":{"name":"mcp-all-in-one-nonexistent-tool","arguments":{}}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 13,
  "error": {
    "code": -32601,
    "message": "Tool 'mcp-all-in-one-nonexistent-tool' not found"
  }
}
```

### 5.2 协议错误处理
**测试场景：** 发送无效的JSON-RPC请求

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 14,
  "method": "tools/call",
  "params": {
    "name": "mcp-all-in-one-validate-mcp-config",
    "arguments": {
      "config-file": null
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":14,"method":"tools/call","params":{"name":"mcp-all-in-one-validate-mcp-config","arguments":{"config-file":null}}}
```

**预期输出：**
```json
{
  "result": {
    "valid": false,
    "errors": [
      "config-file parameter must be a string"
    ],
    "configPath": "null"
  },
  "jsonrpc": "2.0",
  "id": 14
}
```

## 复合场景测试

### 6.1 配置管理工作流
**测试场景：** 完整的配置管理工作流测试

**6.1.1 查看当前配置**
```json
{"jsonrpc":"2.0","id":15,"method":"tools/call","params":{"name":"mcp-all-in-one-show-mcp-config","arguments":{}}}
```

**6.1.2 验证当前配置**
```json
{"jsonrpc":"2.0","id":16,"method":"tools/call","params":{"name":"mcp-all-in-one-validate-mcp-config","arguments":{}}}
```

**6.1.3 创建新配置**
```json
{"jsonrpc":"2.0","id":17,"method":"tools/call","params":{"name":"mcp-all-in-one-set-mcp-config","arguments":{"config-file":"./workflow-test.json","config-content":"{\"mcpServers\":{\"workflow-test\":{\"command\":\"echo\",\"args\":[\"test\"],\"env\":{}}}"}}}
```

**6.1.4 验证新配置**
```json
{"jsonrpc":"2.0","id":18,"method":"tools/call","params":{"name":"mcp-all-in-one-validate-mcp-config","arguments":{"config-file":"./workflow-test.json"}}}
```

**6.1.5 查看Schema**
```json
{"jsonrpc":"2.0","id":19,"method":"tools/call","params":{"name":"mcp-all-in-one-show-mcp-config-schema","arguments":{}}}
```

### 6.2 错误恢复测试
**测试场景：** 测试各种错误情况下的恢复能力

**6.2.1 文件权限错误**
```json
{"jsonrpc":"2.0","id":20,"method":"tools/call","params":{"name":"mcp-all-in-one-set-mcp-config","arguments":{"config-file":"/root/protected.json","config-content":"{\"mcpServers\":{}}"}}}
```

**6.2.2 磁盘空间不足（模拟）**
```json
{"jsonrpc":"2.0","id":21,"method":"tools/call","params":{"name":"mcp-all-in-one-set-mcp-config","arguments":{"config-file":"./huge-config.json","config-content":"{\"mcpServers\":{\"huge\":{\"data\":\"" + "x".repeat(1000000) + "\"}}"}}}
```

## 性能测试

### 7.1 大配置文件处理
**测试场景：** 处理包含大量服务的配置文件

**大型配置文件 (large-config.json)：**
```json
{
  "mcpServers": {
    "service1": {"command": "echo", "args": ["1"]},
    "service2": {"command": "echo", "args": ["2"]},
    "service3": {"command": "echo", "args": ["3"]},
    "...": "...（更多服务）...",
    "service100": {"command": "echo", "args": ["100"]}
  }
}
```

**输入：**
```json
{"jsonrpc":"2.0","id":22,"method":"tools/call","params":{"name":"mcp-all-in-one-validate-mcp-config","arguments":{"config-file":"./large-config.json"}}}
```

**性能要求：**
- 验证时间 < 5秒
- 内存使用 < 100MB
- 响应时间 < 10秒

### 7.2 并发请求测试
**测试场景：** 同时发送多个自我配置工具调用

**并发请求：**
- 10个validate-mcp-config请求
- 5个show-mcp-config请求
- 3个set-mcp-config请求
- 2个show-mcp-config-schema请求

**性能要求：**
- 所有请求都能正确处理
- 没有请求丢失或重复处理
- 平均响应时间 < 2秒

## 安全性测试

### 8.1 路径遍历攻击防护
**测试场景：** 尝试通过配置文件路径进行路径遍历攻击

**恶意输入：**
```json
{"jsonrpc":"2.0","id":23,"method":"tools/call","params":{"name":"mcp-all-in-one-show-mcp-config","arguments":{"config-file":"../../../etc/passwd"}}}
```

**预期输出：**
```json
{
  "result": {
    "valid": false,
    "errors": [
      "路径遍历检测：不允许访问系统敏感文件"
    ],
    "configPath": "../../../etc/passwd"
  },
  "jsonrpc": "2.0",
  "id": 23
}
```

### 8.2 敏感信息泄露防护
**测试场景：** 验证敏感信息（如API密钥）被正确遮蔽

**验证点：**
- API密钥在显示配置时被遮蔽为`[REDACTED]`
- 错误消息中不包含敏感信息
- 日志中不记录完整的敏感配置

## 测试实施指南

### 测试套件结构
```
tests/
├── self-config-tools/
│   ├── validate-mcp-config.test.ts
│   ├── show-mcp-config.test.ts
│   ├── show-mcp-config-schema.test.ts
│   ├── set-mcp-config.test.ts
│   ├── integration.test.ts
│   ├── performance.test.ts
│   ├── security.test.ts
│   └── fixtures/
│       ├── example.mcp.json
│       ├── test-config.json
│       ├── invalid-config.json
│       └── large-config.json
```

### 测试执行顺序
1. **基础功能测试**：验证每个工具的基本功能
2. **错误处理测试**：验证各种错误场景
3. **集成测试**：验证复合工作流
4. **性能测试**：验证大数据量和并发处理
5. **安全性测试**：验证安全防护措施
6. **回归测试**：确保修改不影响现有功能

### 测试数据管理
- 提供完整的测试配置文件集合
- 自动创建和清理测试文件
- 支持参数化测试用例
- 实现测试隔离和并行执行

### 持续集成集成
- 在CI/CD管道中运行完整测试套件
- 生成详细的测试报告和覆盖率报告
- 自动化性能回归检测
- 集成安全扫描工具

## 测试报告格式

### 测试结果摘要
```
自我配置工具测试报告
===================

总测试用例: 47
通过: 45
失败: 2
跳过: 0
覆盖率: 98.5%
执行时间: 3分12秒

工具覆盖:
✅ mcp-all-in-one-validate-mcp-config: 12/12 通过
✅ mcp-all-in-one-show-mcp-config: 10/10 通过
✅ mcp-all-in-one-show-mcp-config-schema: 8/8 通过
❌ mcp-all-in-one-set-mcp-config: 15/17 通过
```

### 失败用例详情
```
用例ID: SCT_042
描述: 大配置文件性能测试
失败原因: 响应时间超过阈值(5s)
实际时间: 7.8s
配置大小: 2.3MB
服务数量: 100个

用例ID: SCT_045
描述: 并发请求处理
失败原因: 2个请求处理失败
失败请求: set-mcp-config并发冲突
错误详情: 文件锁定冲突
```

### 性能指标
```
平均响应时间:
  validate-mcp-config: 245ms
  show-mcp-config: 156ms
  show-mcp-config-schema: 89ms
  set-mcp-config: 1.2s

P95响应时间: 2.1s
P99响应时间: 4.8s
吞吐量: 45 req/s
内存使用峰值: 156MB
```

## 维护和更新

### 规范版本控制
- 版本号：v1.0.0
- 每次功能更新时同步更新测试规范
- 维护向后兼容性测试用例
- 记录工具变更对测试的影响

### 测试用例维护
- 定期审查和更新测试数据
- 优化测试执行效率
- 添加新的边界条件测试
- 更新安全性测试用例

这个测试规范提供了mcp-all-in-one自我配置工具的全面测试覆盖，确保配置管理功能的可靠性、性能和安全性。