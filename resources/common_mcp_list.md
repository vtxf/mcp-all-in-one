# 常用MCP服务列表

本文档收集了常用的MCP(Model Context Protocol)服务，供开发者参考和使用。

## 开发工具类

### 1. 文件系统访问
- **名称**: File System MCP Server
- **功能**: 提供文件系统访问能力，允许AI读取、写入和操作文件
- **适用场景**: 代码编辑、文件管理、文档处理
- **安装方式**: `npm install @modelcontextprotocol/server-filesystem`
- **配置示例**:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-filesystem/dist/index.js"],
      "env": {
        "FILESYSTEM_ROOT": "/path/to/allowed/directory"
      }
    }
  }
}
```

### 2. Git操作
- **名称**: Git MCP Server
- **功能**: 提供Git仓库操作能力，包括提交、分支、合并等
- **适用场景**: 版本控制、代码管理
- **安装方式**: `npm install @modelcontextprotocol/server-git`
- **配置示例**:
```json
{
  "mcpServers": {
    "git": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-git/dist/index.js"],
      "env": {
        "GIT_REPO_PATH": "/path/to/git/repository"
      }
    }
  }
}
```

### 3. 数据库操作
- **名称**: SQLite MCP Server
- **功能**: 提供SQLite数据库访问能力
- **适用场景**: 数据查询、数据分析
- **安装方式**: `npm install @modelcontextprotocol/server-sqlite`
- **配置示例**:
```json
{
  "mcpServers": {
    "sqlite": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-sqlite/dist/index.js"],
      "env": {
        "SQLITE_DB_PATH": "/path/to/database.db"
      }
    }
  }
}
```

## 生产力工具类

### 4. 时间和日期
- **名称**: Time MCP Server
- **功能**: 提供时间查询、时区转换、日期计算等功能
- **适用场景**: 日程管理、时间规划
- **安装方式**: `npm install @modelcontextprotocol/server-time`
- **配置示例**:
```json
{
  "mcpServers": {
    "time": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-time/dist/index.js"]
    }
  }
}
```

### 5. 天气信息
- **名称**: Weather MCP Server
- **功能**: 提供天气查询、预报等功能
- **适用场景**: 出行规划、活动安排
- **安装方式**: `npm install @modelcontextprotocol/server-weather`
- **配置示例**:
```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-weather/dist/index.js"],
      "env": {
        "WEATHER_API_KEY": "your-api-key"
      }
    }
  }
}
```

### 6. 网络搜索
- **名称**: Web Search MCP Server
- **功能**: 提供网络搜索能力，获取最新信息
- **适用场景**: 信息查询、研究分析
- **安装方式**: `npm install @modelcontextprotocol/server-web-search`
- **配置示例**:
```json
{
  "mcpServers": {
    "web-search": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-web-search/dist/index.js"],
      "env": {
        "SEARCH_API_KEY": "your-search-api-key"
      }
    }
  }
}
```

## 通信与协作类

### 7. 邮件服务
- **名称**: Email MCP Server
- **功能**: 提供邮件发送、接收和管理功能
- **适用场景**: 邮件自动化、通知系统
- **安装方式**: `npm install @modelcontextprotocol/server-email`
- **配置示例**:
```json
{
  "mcpServers": {
    "email": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-email/dist/index.js"],
      "env": {
        "EMAIL_HOST": "smtp.example.com",
        "EMAIL_USER": "your-email@example.com",
        "EMAIL_PASSWORD": "your-password"
      }
    }
  }
}
```

### 8. Slack集成
- **名称**: Slack MCP Server
- **功能**: 提供Slack消息发送、频道管理等功能
- **适用场景**: 团队协作、通知推送
- **安装方式**: `npm install @modelcontextprotocol/server-slack`
- **配置示例**:
```json
{
  "mcpServers": {
    "slack": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-slack/dist/index.js"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token"
      }
    }
  }
}
```

## 数据分析与可视化类

### 9. 数据处理
- **名称**: Data Processing MCP Server
- **功能**: 提供数据清洗、转换、分析等功能
- **适用场景**: 数据科学、商业分析
- **安装方式**: `npm install @modelcontextprotocol/server-data-processing`
- **配置示例**:
```json
{
  "mcpServers": {
    "data-processing": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-data-processing/dist/index.js"]
    }
  }
}
```

### 10. 图表生成
- **名称**: Chart Generation MCP Server
- **功能**: 提供各种图表生成能力
- **适用场景**: 数据可视化、报告生成
- **安装方式**: `npm install @modelcontextprotocol/server-chart`
- **配置示例**:
```json
{
  "mcpServers": {
    "chart": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-chart/dist/index.js"]
    }
  }
}
```

## AI与机器学习类

### 11. 模型调用
- **名称**: Model Invocation MCP Server
- **功能**: 提供多种AI模型调用能力
- **适用场景**: AI应用开发、模型比较
- **安装方式**: `npm install @modelcontextprotocol/server-model-invocation`
- **配置示例**:
```json
{
  "mcpServers": {
    "model-invocation": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-model-invocation/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key",
        "ANTHROPIC_API_KEY": "your-anthropic-api-key"
      }
    }
  }
}
```

### 12. 图像处理
- **名称**: Image Processing MCP Server
- **功能**: 提供图像处理、分析和生成能力
- **适用场景**: 图像编辑、计算机视觉
- **安装方式**: `npm install @modelcontextprotocol/server-image-processing`
- **配置示例**:
```json
{
  "mcpServers": {
    "image-processing": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-image-processing/dist/index.js"]
    }
  }
}
```

## 系统管理类

### 13. 系统监控
- **名称**: System Monitoring MCP Server
- **功能**: 提供系统资源监控、性能分析等功能
- **适用场景**: 系统管理、性能优化
- **安装方式**: `npm install @modelcontextprotocol/server-system-monitor`
- **配置示例**:
```json
{
  "mcpServers": {
    "system-monitor": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-system-monitor/dist/index.js"]
    }
  }
}
```

### 14. 日志分析
- **名称**: Log Analysis MCP Server
- **功能**: 提供日志收集、解析和分析功能
- **适用场景**: 故障排查、系统审计
- **安装方式**: `npm install @modelcontextprotocol/server-log-analysis`
- **配置示例**:
```json
{
  "mcpServers": {
    "log-analysis": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-log-analysis/dist/index.js"],
      "env": {
        "LOG_PATH": "/path/to/log/directory"
      }
    }
  }
}
```

## MCP资源网站
https://github.com/punkpeye/awesome-mcp-servers
https://bigmodel.cn/marketplace/index/mcp
https://www.modelscope.cn/mcp
https://mcp.higress.ai/
https://mcp.so/
https://smithery.ai/
https://glama.ai/mcp/servers
https://www.pulsemcp.com/
https://mcp.composio.dev/

## 使用建议

1. **按需选择**: 根据实际需求选择合适的MCP服务，避免安装过多不必要的服务
2. **安全考虑**: 对于涉及敏感数据的服务，确保配置适当的安全措施
3. **性能优化**: 对于资源密集型服务，考虑资源限制和缓存策略
4. **定期更新**: 保持MCP服务更新，以获取最新功能和安全修复

## 贡献指南

如果您发现其他有用的MCP服务或有改进建议，欢迎提交PR或Issue来完善此列表。

## 参考资源

- [MCP官方文档](https://modelcontextprotocol.io/)
- [MCP服务器开发指南](https://modelcontextprotocol.io/docs/concepts/servers)
- [MCP社区资源](https://github.com/modelcontextprotocol/servers)