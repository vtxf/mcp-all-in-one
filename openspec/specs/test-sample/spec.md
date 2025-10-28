# test-sample

## ADDED Requirements

### Requirement: 基于简化MCP配置的stdio模式功能测试
系统 SHALL 支持通过stdio模式测试简化的MCP配置文件中两个服务的功能。

#### Scenario: stdio模式简化MCP服务测试
- **输入**: `mcp-all-in-one stdio --mcp-config openspec/specs/test-sample/mcp.json`
- **操作过程**:
  1. 启动stdio模式服务
  2. 发送一系列JSON-RPC请求测试所有MCP标准服务

- **预期输出**:

**1. initialize请求**
```json
// 输入
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "tools": {},
      "roots": {},
      "sampling": {}
    },
    "clientInfo": {
      "name": "test-client",
      "version": "1.0.0"
    }
  }
}

// 预期输出
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "tools": {
        "listChanged": true
      },
      "roots": {},
      "sampling": {}
    },
    "serverInfo": {
      "name": "mcp-all-in-one",
      "version": "1.0.0"
    }
  }
}
```

**2. initialized通知**
```json
// 输入
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}

// 预期输出：无响应（通知不需要响应）
```

**3. list_tools请求**
```json
// 输入
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}

// 预期输出（包含2个MCP服务的工具，使用"服务名__工具名"命名规则避免冲突）
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      // Time服务工具（来自mcp-server-time）
      {
        "name": "Time__get_current_time",
        "description": "[Time] Get the current time in a specified timezone",
        "inputSchema": {
          "type": "object",
          "properties": {
            "timezone": {
              "type": "string",
              "description": "IANA timezone identifier (e.g., 'Asia/Shanghai')"
            }
          }
        }
      },
      // zhipu-web-search服务工具（来自Zhipu AI MCP）
      {
        "name": "zhipu-web-search__web_search",
        "description": "[zhipu-web-search] Search the web using Zhipu AI",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search query"
            },
            "num_results": {
              "type": "number",
              "description": "Number of results to return (default: 10)"
            }
          },
          "required": ["query"]
        }
      }
    ]
  }
}
```

**4. 调用Time服务工具**
```json
// 输入
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "Time__get_current_time",
    "arguments": {
      "timezone": "Asia/Shanghai"
    }
  }
}

// 预期输出
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "2025-10-25T16:30:00.000+08:00"
      }
    ]
  }
}
```

**5. 调用zhipu-web-search服务工具**
```json
// 输入（需要设置有效的 Z_AI_API_KEY 环境变量）
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "zhipu-web-search__web_search",
    "arguments": {
      "query": "Model Context Protocol",
      "num_results": 3
    }
  }
}

// 预期输出（当Z_AI_API_KEY有效时）
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Web search results for 'Model Context Protocol':\n1. [Title] [URL] [Snippet]\n2. [Title] [URL] [Snippet]\n3. [Title] [URL] [Snippet]"
      }
    ]
  }
}

// 预期输出（当Z_AI_API_KEY无效或未设置时）
{
  "jsonrpc": "2.0",
  "id": 4,
  "error": {
    "code": -32603,
    "message": "Authentication failed: Invalid or missing Z_AI_API_KEY",
    "data": {
      "service": "zhipu-web-search"
    }
  }
}
```

**6.1 无效工具调用**
```json
// 输入
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "nonexistent_tool",
    "arguments": {}
  }
}

// 预期输出
{
  "jsonrpc": "2.0",
  "id": 5,
  "error": {
    "code": -32601,
    "message": "Tool 'nonexistent_tool' not found"
  }
}
```

**6.2 工具参数验证错误**
```json
// 输入
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "zhipu-web-search__web_search",
    "arguments": {}
  }
}

// 预期输出
{
  "jsonrpc": "2.0",
  "id": 6,
  "error": {
    "code": -32602,
    "message": "Invalid params: Missing required parameter 'query'",
    "data": {
      "parameter": "query"
    }
  }
}
```

**6.3 无效的JSON-RPC方法**
```json
// 输入
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "invalid/method",
  "params": {}
}

// 预期输出
{
  "jsonrpc": "2.0",
  "id": 7,
  "error": {
    "code": -32601,
    "message": "Method 'invalid/method' not found"
  }
}
```

**7. 服务器生命周期测试**

**7.1 正常关闭**
```json
// 输入
{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "shutdown"
}

// 预期输出
{
  "jsonrpc": "2.0",
  "id": 8,
  "result": {}
}
```

**7.2 退出通知**
```json
// 输入
{
  "jsonrpc": "2.0",
  "method": "notifications/exit"
}

// 预期输出：无响应，服务器应正常退出
```

## 测试要求说明

### 协议合规性
- 所有JSON-RPC请求必须遵循MCP协议2025-06-18版本规范
- 请求和响应必须符合JSON-RPC 2.0格式
- 错误码必须使用标准的JSON-RPC错误码

### 工具命名规则
- **代理层工具命名**: 使用`服务名__工具名`格式，避免不同MCP服务间的工具名冲突
- **服务名映射**:
  - `Time__get_current_time` → 对应Time服务的`get_current_time`工具
  - `zhipu-web-search__web_search` → 对应zhipu-web-search服务的`web_search`工具
- **描述格式**: 工具描述应包含服务标识，格式为`[服务名] 原始描述`
- **内部映射**: mcp-all-in-one服务需要维护工具名映射表，将代理工具名转发给对应的MCP服务

### 服务可用性测试
- 测试应验证所有配置在mcp.json中的2个MCP服务是否成功加载
- 每个服务的工具都应该出现在tools/list的响应中
- 服务启动失败不应影响整体代理服务

### 环境依赖说明
- **zhipu-web-search**: 需要有效的Z_AI_API_KEY环境变量，用于智谱AI搜索服务
- **Time**: 使用uvx命令，需要Python环境和mcp-server-time包

### 测试执行顺序
1. 初始化协议握手
2. 获取工具列表（应包含2个工具）
3. 测试Time服务工具调用
4. 测试zhipu-web-search服务工具调用
5. 测试错误处理场景
6. 正常关闭连接

### 预期结果验证
- 所有成功的工具调用都应返回包含content数组的结果
- content数组中的每个元素都应有type字段和相应的内容
- 错误响应应包含正确的错误码和描述性消息
- 服务器不应因单个服务错误而崩溃