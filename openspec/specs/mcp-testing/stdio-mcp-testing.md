# STDIO MCP服务测试规范

## 概述
本规范定义了STDIO模式MCP（Model Context Protocol）服务的全面测试方案，包括所有协议功能的输入输出测试用例，确保MCP服务的完整性和兼容性。

## 测试环境配置

### 基本要求
- Node.js版本：22+
- TypeScript版本：最新版
- 测试框架：Jest或类似框架
- MCP SDK版本：最新版

### 测试配置文件
```json
{
  "testEnvironment": "node",
  "testTimeout": 30000,
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
MCP_LOG_LEVEL=debug
NODE_ENV=test
```

## MCP协议测试用例

### 1. 初始化协议测试

#### 1.1 服务器初始化
**测试场景：** 服务器启动和初始化协议握手

**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "tools": {},
      "resources": {},
      "prompts": {},
      "logging": {}
    },
    "clientInfo": {
      "name": "test-client",
      "version": "1.0.0"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{"tools":{},"resources":{},"prompts":{},"logging":{}},"clientInfo":{"name":"test-client","version":"1.0.0"}}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "tools": {
        "listChanged": true
      },
      "resources": {
        "subscribe": true,
        "listChanged": true
      },
      "prompts": {
        "listChanged": true
      },
      "logging": {}
    },
    "serverInfo": {
      "name": "mcp-all-in-one",
      "version": "1.0.0"
    }
  }
}
```

#### 1.2 初始化通知
**输入：**
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","method":"notifications/initialized"}
```

**预期输出：** 无响应（仅服务器内部状态更新）

### 2. 工具协议测试

#### 2.1 工具列表查询
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "example_tool",
        "description": "示例工具",
        "inputSchema": {
          "type": "object",
          "properties": {
            "param1": {
              "type": "string",
              "description": "参数1"
            }
          },
          "required": ["param1"]
        }
      }
    ]
  }
}
```

#### 2.2 工具调用
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 16,
  "method": "tools/call",
  "params": {
    "name": "example_tool",
    "arguments": {
      "param1": "test_value"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":16,"method":"tools/call","params":{"name":"example_tool","arguments":{"param1":"test_value"}}}
{"jsonrpc":"2.0","id":16,"method":"tools/call","params":{"name":"mcp-all-in-one-show-mcp-config","arguments":{}}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "工具执行结果"
      }
    ],
    "isError": false
  }
}
```

#### 2.3 工具调用错误处理
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "nonexistent_tool",
    "arguments": {}
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"nonexistent_tool","arguments":{}}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "error": {
    "code": -32601,
    "message": "Tool nonexistent_tool not found",
    "data": {
      "tool": "nonexistent_tool"
    }
  }
}
```

### 3. 资源协议测试

#### 3.1 资源列表查询
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "resources/list",
  "params": {}
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":5,"method":"resources/list","params":{}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "resources": [
      {
        "uri": "example://test/resource1",
        "name": "测试资源1",
        "description": "这是一个测试资源",
        "mimeType": "text/plain"
      }
    ]
  }
}
```

#### 3.2 资源读取
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "resources/read",
  "params": {
    "uri": "example://test/resource1"
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":6,"method":"resources/read","params":{"uri":"example://test/resource1"}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "result": {
    "contents": [
      {
        "uri": "example://test/resource1",
        "mimeType": "text/plain",
        "text": "这是资源的内容"
      }
    ]
  }
}
```

#### 3.3 资源模板列表
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "resources/templates/list",
  "params": {}
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":7,"method":"resources/templates/list","params":{}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "result": {
    "resourceTemplates": [
      {
        "uriTemplate": "example://test/{id}",
        "name": "测试模板",
        "description": "测试资源模板",
        "mimeType": "text/plain"
      }
    ]
  }
}
```

#### 3.4 资源订阅
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "resources/subscribe",
  "params": {
    "uri": "example://test/resource1"
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":8,"method":"resources/subscribe","params":{"uri":"example://test/resource1"}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 8,
  "result": {}
}
```

### 4. 提示协议测试

#### 4.1 提示列表查询
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 9,
  "method": "prompts/list",
  "params": {}
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":9,"method":"prompts/list","params":{}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 9,
  "result": {
    "prompts": [
      {
        "name": "example_prompt",
        "description": "示例提示",
        "arguments": [
          {
            "name": "context",
            "description": "上下文信息",
            "required": true
          }
        ]
      }
    ]
  }
}
```

#### 4.2 获取提示
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 10,
  "method": "prompts/get",
  "params": {
    "name": "example_prompt",
    "arguments": {
      "param1": "test_value"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":10,"method":"prompts/get","params":{"name":"example_prompt","arguments":{"param1":"test_value"}}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 10,
  "result": {
    "description": "生成的提示描述",
    "messages": [
      {
        "role": "user",
        "content": {
          "type": "text",
          "text": "这是一个示例提示，基于上下文：测试上下文"
        }
      }
    ]
  }
}
```

### 5. 日志协议测试

#### 5.1 设置日志级别 - debug
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 11,
  "method": "logging/setLevel",
  "params": {
    "level": "debug"
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":11,"method":"logging/setLevel","params":{"level":"debug"}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 11,
  "result": {
    "success": true,
    "level": "debug",
    "message": "Log level set to debug"
  }
}
```

#### 5.2 设置日志级别 - info
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "method": "logging/setLevel",
  "params": {
    "level": "info"
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":12,"method":"logging/setLevel","params":{"level":"info"}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 12,
  "result": {
    "success": true,
    "level": "info",
    "message": "Log level set to info"
  }
}
```

#### 5.3 设置日志级别 - warn
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 13,
  "method": "logging/setLevel",
  "params": {
    "level": "warn"
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":13,"method":"logging/setLevel","params":{"level":"warn"}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 13,
  "result": {
    "success": true,
    "level": "warn",
    "message": "Log level set to warn"
  }
}
```

#### 5.4 设置日志级别 - error
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 14,
  "method": "logging/setLevel",
  "params": {
    "level": "error"
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":14,"method":"logging/setLevel","params":{"level":"error"}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 14,
  "result": {
    "success": true,
    "level": "error",
    "message": "Log level set to error"
  }
}
```

#### 5.5 无效日志级别测试 - 应返回错误
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 15,
  "method": "logging/setLevel",
  "params": {
    "level": "invalid_level"
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":15,"method":"logging/setLevel","params":{"level":"invalid_level"}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 15,
  "error": {
    "code": -32603,
    "message": "Invalid log level: invalid_level. Valid levels are: debug, info, warn, error"
  }
}
```

#### 5.6 缺少level参数测试 - 应返回错误
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 16,
  "method": "logging/setLevel",
  "params": {
    // 缺少level参数
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":16,"method":"logging/setLevel","params":{}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 16,
  "error": {
    "code": -32603,
    "message": "Invalid log level: undefined. Valid levels are: debug, info, warn, error"
  }
}
```

#### 5.7 空level参数测试 - 应返回错误
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 17,
  "method": "logging/setLevel",
  "params": {
    "level": ""
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":17,"method":"logging/setLevel","params":{"level":""}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 17,
  "error": {
    "code": -32603,
    "message": "Invalid log level: . Valid levels are: debug, info, warn, error"
  }
}
```

#### 5.8 null level参数测试 - 应返回错误
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 18,
  "method": "logging/setLevel",
  "params": {
    "level": null
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":18,"method":"logging/setLevel","params":{"level":null}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 18,
  "error": {
    "code": -32603,
    "message": "Invalid log level: null. Valid levels are: debug, info, warn, error"
  }
}
```

#### 5.9 测试日志级别设置后验证 - 先设置为debug，然后调用工具
**输入1（设置日志级别）：**
```json
{
  "jsonrpc": "2.0",
  "id": 19,
  "method": "logging/setLevel",
  "params": {
    "level": "debug"
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":19,"method":"logging/setLevel","params":{"level":"debug"}}
```

**预期输出1：**
```json
{
  "jsonrpc": "2.0",
  "id": 19,
  "result": {
    "success": true,
    "level": "debug",
    "message": "Log level set to debug"
  }
}
```

**输入2（调用工具验证debug日志）：**
```json
{
  "jsonrpc": "2.0",
  "id": 20,
  "method": "tools/list",
  "params": {}
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":20,"method":"tools/list","params":{}}
```

**预期输出2：** 应该在服务器端看到debug级别的日志输出

#### 5.10 测试日志级别设置后验证 - 设置为error，然后调用工具
**输入1（设置日志级别）：**
```json
{
  "jsonrpc": "2.0",
  "id": 21,
  "method": "logging/setLevel",
  "params": {
    "level": "error"
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":21,"method":"logging/setLevel","params":{"level":"error"}}
```

**预期输出1：**
```json
{
  "jsonrpc": "2.0",
  "id": 21,
  "result": {
    "success": true,
    "level": "error",
    "message": "Log level set to error"
  }
}
```

**输入2（调用工具验证日志级别）：**
```json
{
  "jsonrpc": "2.0",
  "id": 22,
  "method": "tools/list",
  "params": {}
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":22,"method":"tools/list","params":{}}
```

**预期输出2：** 服务器端应该只输出error级别的日志，debug/info/warn级别的日志应该被过滤

### 6. 基础协议补充测试

#### 6.1 Ping测试
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 23,
  "method": "ping"
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":23,"method":"ping"}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 23,
  "result": {}
}
```

#### 6.2 取消通知
**输入：**
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/cancelled",
  "params": {
    "requestId": "req-456",
    "reason": "用户主动取消"
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","method":"notifications/cancelled","params":{"requestId":"req-456","reason":"用户主动取消"}}
```

**预期输出：** 无响应（仅服务器内部状态更新）

#### 6.3 进度通知
**服务器发送给客户端的通知：**
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/progress",
  "params": {
    "progressToken": "token123",
    "progress": 0.5,
    "total": 100,
    "message": "正在处理中..."
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"token123","progress":0.5,"total":100,"message":"正在处理中..."}}
```

### 7. 资源管理补充测试

#### 7.1 资源取消订阅
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 24,
  "method": "resources/unsubscribe",
  "params": {
    "uri": "example://test/resource1"
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":24,"method":"resources/unsubscribe","params":{"uri":"example://test/resource1"}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 24,
  "result": {}
}
```

#### 7.2 资源列表变更通知
**服务器发送给客户端的通知：**
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/resources/list_changed"
}
```

#### 7.3 资源更新通知
**服务器发送给客户端的通知：**
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/resources/updated",
  "params": {
    "uri": "example://test/resource1"
  }
}
```

### 8. 动态列表变更通知测试

#### 8.1 工具列表变更通知
**服务器发送给客户端的通知：**
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/tools/list_changed"
}
```

#### 8.2 提示列表变更通知
**服务器发送给客户端的通知：**
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/prompts/list_changed"
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","method":"notifications/prompts/list_changed"}
```

### 9. 日志功能补充测试

#### 9.1 日志消息通知
**服务器发送给客户端的通知：**
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/message",
  "params": {
    "level": "info",
    "logger": "test-logger",
    "data": "这是一条测试日志消息"
  }
}
```

#### 9.2 日志消息通知（带对象数据）
**服务器发送给客户端的通知：**
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/message",
  "params": {
    "level": "error",
    "logger": "error-logger",
    "data": {
      "error": "测试错误",
      "code": 500,
      "details": "错误详细信息"
    }
  }
}
```

### 10. 自动补全功能测试

#### 10.1 提示参数自动补全
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 25,
  "method": "completion/complete",
  "params": {
    "ref": {
      "type": "ref/prompt",
      "name": "example_prompt"
    },
    "argument": {
      "name": "context",
      "value": "test"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":25,"method":"completion/complete","params":{"ref":{"type":"ref/prompt","name":"example_prompt"},"argument":{"name":"context","value":"test"}}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 25,
  "result": {
    "completion": {
      "values": ["test context", "testing", "test data"],
      "total": 3,
      "hasMore": false
    }
  }
}
```

#### 10.2 资源模板参数自动补全
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 26,
  "method": "completion/complete",
  "params": {
    "ref": {
      "type": "ref/resource",
      "uri": "example://test/{id}"
    },
    "argument": {
      "name": "id",
      "value": "resource"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":26,"method":"completion/complete","params":{"ref":{"type":"ref/resource","uri":"example://test/{id}"},"argument":{"name":"id","value":"resource"}}}
```

#### 10.3 带上下文的自动补全
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 27,
  "method": "completion/complete",
  "params": {
    "ref": {
      "type": "ref/resource",
      "uri": "example://test/{category}/{id}"
    },
    "argument": {
      "name": "id",
      "value": "test"
    },
    "context": {
      "arguments": {
        "category": "documents"
      }
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":27,"method":"completion/complete","params":{"ref":{"type":"ref/resource","uri":"example://test/{category}/{id}"},"argument":{"name":"id","value":"test"},"context":{"arguments":{"category":"documents"}}}}
```

### 11. 根目录管理测试

#### 11.1 获取根目录列表
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 28,
  "method": "roots/list"
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":28,"method":"roots/list"}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 28,
  "result": {
    "roots": [
      {
        "uri": "file:///Users/test/project",
        "name": "test-project"
      },
      {
        "uri": "file:///Users/test/documents",
        "name": "documents"
      }
    ]
  }
}
```

#### 11.2 根目录列表变更通知
**服务器发送给客户端的通知：**
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/roots/list_changed"
}
```

### 12. 采样功能测试

#### 12.1 创建消息采样请求
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 29,
  "method": "sampling/createMessage",
  "params": {
    "messages": [
      {
        "role": "user",
        "content": {
          "type": "text",
          "text": "请简单介绍一下人工智能"
        }
      }
    ],
    "modelPreferences": {
      "hints": [
        {
          "name": "gpt-4"
        }
      ],
      "costPriority": 0.5,
      "speedPriority": 0.3,
      "intelligencePriority": 0.8
    },
    "systemPrompt": "你是一个有用的AI助手。",
    "includeContext": "thisServer",
    "temperature": 0.7,
    "maxTokens": 100,
    "stopSequences": ["\n\n", "###"],
    "metadata": {
      "requestId": "test-sampling-1"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":29,"method":"sampling/createMessage","params":{"messages":[{"role":"user","content":{"type":"text","text":"请简单介绍一下人工智能"}}],"modelPreferences":{"hints":[{"name":"gpt-4"}],"costPriority":0.5,"speedPriority":0.3,"intelligencePriority":0.8},"systemPrompt":"你是一个有用的AI助手。","includeContext":"thisServer","temperature":0.7,"maxTokens":100,"stopSequences":["\n\n","###"],"metadata":{"requestId":"test-sampling-1"}}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 29,
  "result": {
    "role": "assistant",
    "content": {
      "type": "text",
      "text": "人工智能（AI）是计算机科学的一个分支..."
    },
    "model": "gpt-4",
    "stopReason": "maxTokens"
  }
}
```

#### 12.2 采样请求（包含图像内容）
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 30,
  "method": "sampling/createMessage",
  "params": {
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "请描述这张图片的内容"
          },
          {
            "type": "image",
            "data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==",
            "mimeType": "image/png"
          }
        ]
      }
    ],
    "maxTokens": 50
  }
}
```

### 13. 信息采集功能测试

#### 13.1 创建信息采集请求（字符串类型）
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 31,
  "method": "elicitation/create",
  "params": {
    "message": "请提供您的姓名以便个性化服务",
    "requestedSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "title": "姓名",
          "description": "请输入您的姓名",
          "minLength": 1,
          "maxLength": 50
        }
      },
      "required": ["name"]
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":31,"method":"elicitation/create","params":{"message":"请提供您的姓名以便个性化服务","requestedSchema":{"type":"object","properties":{"name":{"type":"string","title":"姓名","description":"请输入您的姓名","minLength":1,"maxLength":50}},"required":["name"]}}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 31,
  "result": {
    "action": "accept",
    "content": {
      "name": "张三"
    }
  }
}
```

#### 13.2 创建信息采集请求（数字类型）
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 32,
  "method": "elicitation/create",
  "params": {
    "message": "请设置任务的超时时间（秒）",
    "requestedSchema": {
      "type": "object",
      "properties": {
        "timeout": {
          "type": "integer",
          "title": "超时时间",
          "description": "任务执行的最大时间限制",
          "minimum": 1,
          "maximum": 3600
        }
      },
      "required": ["timeout"]
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":32,"method":"elicitation/create","params":{"message":"请设置任务的超时时间（秒）","requestedSchema":{"type":"object","properties":{"timeout":{"type":"integer","title":"超时时间","description":"任务执行的最大时间限制","minimum":1,"maximum":3600}},"required":["timeout"]}}}
```

#### 13.3 创建信息采集请求（布尔类型）
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 33,
  "method": "elicitation/create",
  "params": {
    "message": "是否启用调试模式？",
    "requestedSchema": {
      "type": "object",
      "properties": {
        "debugMode": {
          "type": "boolean",
          "title": "调试模式",
          "description": "启用后将显示详细的调试信息",
          "default": false
        }
      },
      "required": ["debugMode"]
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":33,"method":"elicitation/create","params":{"message":"是否启用调试模式？","requestedSchema":{"type":"object","properties":{"debugMode":{"type":"boolean","title":"调试模式","description":"启用后将显示详细的调试信息","default":false}},"required":["debugMode"]}}}
```

#### 13.4 创建信息采集请求（枚举类型）
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 34,
  "method": "elicitation/create",
  "params": {
    "message": "请选择日志级别",
    "requestedSchema": {
      "type": "object",
      "properties": {
        "logLevel": {
          "type": "string",
          "title": "日志级别",
          "description": "选择系统日志记录的级别",
          "enum": ["debug", "info", "warn", "error"],
          "enumNames": ["调试", "信息", "警告", "错误"]
        }
      },
      "required": ["logLevel"]
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":34,"method":"elicitation/create","params":{"message":"请选择日志级别","requestedSchema":{"type":"object","properties":{"logLevel":{"type":"string","title":"日志级别","description":"选择系统日志记录的级别","enum":["debug","info","warn","error"],"enumNames":["调试","信息","警告","错误"]}},"required":["logLevel"]}}}
```

#### 13.5 创建信息采集请求（多字段组合）
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 35,
  "method": "elicitation/create",
  "params": {
    "message": "请配置数据库连接参数",
    "requestedSchema": {
      "type": "object",
      "properties": {
        "host": {
          "type": "string",
          "title": "主机地址",
          "description": "数据库服务器地址",
          "format": "uri"
        },
        "port": {
          "type": "integer",
          "title": "端口号",
          "description": "数据库服务端口",
          "minimum": 1,
          "maximum": 65535,
          "default": 5432
        },
        "database": {
          "type": "string",
          "title": "数据库名",
          "description": "要连接的数据库名称",
          "minLength": 1
        },
        "sslEnabled": {
          "type": "boolean",
          "title": "启用SSL",
          "description": "是否启用SSL加密连接",
          "default": true
        }
      },
      "required": ["host", "database"]
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":35,"method":"elicitation/create","params":{"message":"请配置数据库连接参数","requestedSchema":{"type":"object","properties":{"host":{"type":"string","title":"主机地址","description":"数据库服务器地址","format":"uri"},"port":{"type":"integer","title":"端口号","description":"数据库服务端口","minimum":1,"maximum":65535,"default":5432},"database":{"type":"string","title":"数据库名","description":"要连接的数据库名称","minLength":1},"sslEnabled":{"type":"boolean","title":"启用SSL","description":"是否启用SSL加密连接","default":true}},"required":["host","database"]}}}
```

### 14. 通知协议测试

### 7. 错误处理测试

#### 7.1 无效JSON-RPC请求
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 23,
  "method": "invalid_method",
  "params": {}
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":23,"method":"unknown/method"}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 23,
  "error": {
    "code": -32601,
    "message": "Method not found"
  }
}
```

#### 7.2 参数验证错误
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 24,
  "method": "tools/call",
  "params": {
    "name": "example_tool"
    // 缺少必需的arguments参数
  }
}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 24,
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": {
      "details": "Missing required parameter: arguments"
    }
  }
}
```

#### 7.3 协议版本不兼容
**输入：**
```json
{
  "jsonrpc": "2.0",
  "id": 25,
  "method": "initialize",
  "params": {
    "protocolVersion": "2020-01-01", // 不支持的版本
    "capabilities": {},
    "clientInfo": {
      "name": "test-client",
      "version": "1.0.0"
    }
  }
}
```

**单行版本（控制台输入）：**
```json
{"jsonrpc":"2.0","id":25,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"clientInfo":{"name":"test-client","version":"1.0.0"}}}
```

**预期输出：**
```json
{
  "jsonrpc": "2.0",
  "id": 25,
  "error": {
    "code": -32000,
    "message": "Unsupported protocol version: 2020-01-01"
  }
}
```

### 8. 并发和性能测试

#### 8.1 并发请求处理
**场景：** 同时发送10个工具调用请求
- 验证所有请求都能正确处理
- 验证响应顺序不一定与请求顺序一致
- 验证没有请求丢失或重复处理

#### 8.2 大数据量处理
**场景：** 处理大量资源或工具列表
- 测试1000+工具的列表查询
- 测试大内容资源的读取
- 验证内存使用和响应时间

#### 8.3 长时间连接测试
**场景：** 保持连接30分钟
- 发送周期性心跳请求
- 验证连接稳定性
- 测试资源清理和内存管理

### 9. 安全性测试

#### 9.1 恶意输入测试
**测试用例：**
- 超长字符串参数
- 特殊字符和Unicode输入
- 嵌套深度过大的JSON对象
- 恶意脚本注入尝试

#### 9.2 权限验证
**测试用例：**
- 未授权的资源访问尝试
- 超出权限范围的操作
- 敏感信息泄露检查

### 10. 错误恢复测试

#### 10.1 网络中断恢复
**场景：** 模拟网络中断和恢复
- 验证重连机制
- 验证状态恢复
- 验证未完成请求的处理

#### 10.2 服务崩溃恢复
**场景：** 模拟服务进程崩溃
- 验证自动重启
- 验证数据完整性
- 验证客户端重连流程

## 测试实施指南

### 测试套件结构
```
tests/
├── unit/                 # 单元测试
│   ├── initialization.test.ts
│   ├── ping.test.ts
│   ├── tools.test.ts
│   ├── resources.test.ts
│   ├── prompts.test.ts
│   ├── logging.test.ts
│   ├── completion.test.ts
│   ├── roots.test.ts
│   ├── sampling.test.ts
│   ├── elicitation.test.ts
│   └── notifications.test.ts
├── integration/          # 集成测试
│   ├── end-to-end.test.ts
│   ├── concurrency.test.ts
│   ├── performance.test.ts
│   └── full-protocol.test.ts
├── security/             # 安全测试
│   ├── input-validation.test.ts
│   ├── authorization.test.ts
│   └── injection-attacks.test.ts
└── utils/                # 测试工具
    ├── mock-server.ts
    ├── test-client.ts
    ├── test-data-generator.ts
    └── helpers.ts
```

### 测试数据管理
- 使用固定测试数据确保可重复性
- 提供数据生成工具支持压力测试
- 实现测试数据清理机制

### 持续集成集成
- 在CI/CD管道中运行完整测试套件
- 生成覆盖率报告和质量指标
- 自动化回归测试

## 测试报告格式

### 测试结果摘要
```
总测试用例: 215
通过: 212
失败: 3
跳过: 0
覆盖率: 97.8%
执行时间: 3分15秒

协议覆盖情况:
✅ 初始化协议: 100%覆盖
✅ 基础协议: 100%覆盖 (ping, 取消通知, 进度通知)
✅ 工具协议: 100%覆盖 (包括列表变更通知)
✅ 资源协议: 100%覆盖 (包括订阅/取消订阅, 变更通知)
✅ 提示协议: 100%覆盖 (包括列表变更通知)
✅ 日志协议: 100%覆盖 (包括消息通知)
✅ 自动补全协议: 100%覆盖
✅ 根目录管理协议: 100%覆盖 (包括变更通知)
✅ 采样协议: 100%覆盖
✅ 信息采集协议: 100%覆盖
```

### 失败用例详情
```
用例ID: TC_023
描述: 大数据量工具列表查询
失败原因: 响应时间超过阈值(5s)
实际时间: 7.2s
重试次数: 3
```

### 性能指标
```
平均响应时间: 125ms
P95响应时间: 450ms
P99响应时间: 1.2s
吞吐量: 800 req/s
内存使用峰值: 256MB
```

## 维护和更新

### 规范版本控制
- 每次MCP协议更新时同步更新测试规范
- 维护向后兼容性测试用例
- 记录协议变更对测试的影响

### 测试用例维护
- 定期审查和更新测试数据
- 优化测试执行效率
- 添加新的边界条件测试

这个测试规范提供了全面的STDIO MCP服务测试覆盖，确保服务的可靠性、性能和安全性。