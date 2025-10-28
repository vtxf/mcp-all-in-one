# 常用MCP服务列表

本文档收集了常用的MCP(Model Context Protocol)服务，供开发者参考和使用。

## 开发工具类

### 1. 上下文管理
- **名称**: context7
- **功能**: 提供上下文管理服务
- **适用场景**: 上下文管理、对话历史记录
- **安装方式**: `npx -y @upstash/context7-mcp@latest`
- **配置示例**:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": [
        "-y",
        "@upstash/context7-mcp@latest"
      ]
    }
  }
}
```

### 2. 网络请求
- **名称**: Fetch
- **功能**: 提供网络请求获取能力
- **适用场景**: 数据获取、API调用、网络资源访问
- **安装方式**: `uvx mcp-server-fetch`
- **配置示例**:
```json
{
  "mcpServers": {
    "Fetch": {
      "command": "uvx",
      "args": [
        "mcp-server-fetch"
      ]
    }
  }
}
```

### 3. 时间服务
- **名称**: Time
- **功能**: 提供时间查询和时区转换功能
- **适用场景**: 日程管理、时间规划、时区转换
- **安装方式**: `uvx mcp-server-time`
- **配置示例**:
```json
{
  "mcpServers": {
    "Time": {
      "command": "uvx",
      "args": [
        "mcp-server-time",
        "--local-timezone=Asia/Shanghai"
      ]
    }
  }
}
```

## 生产力工具类

### 4. 百度地图
- **名称**: baidu-map
- **功能**: 提供百度地图相关服务
- **适用场景**: 地图查询、路径规划、位置服务
- **安装方式**: `npx -y @baidumap/mcp-server-baidu-map`
- **配置示例**:
```json
{
  "mcpServers": {
    "baidu-map": {
      "command": "npx",
      "args": [
        "-y",
        "@baidumap/mcp-server-baidu-map"
      ]
    }
  }
}
```

### 5. GitHub集成
- **名称**: github
- **功能**: 提供GitHub仓库操作能力
- **适用场景**: 代码管理、Issue处理、仓库操作
- **安装方式**: `npx -y @modelcontextprotocol/server-github`
- **配置示例**:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ]
    }
  }
}
```

### 6. Chrome开发者工具
- **名称**: chrome-devtools
- **功能**: 提供Chrome开发者工具集成
- **适用场景**: 网页调试、性能分析、前端开发
- **安装方式**: `npx -y chrome-devtools-mcp@latest`
- **配置示例**:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "-e \"C:/Program Files/Google/Chrome/Application/chrome.exe\""
      ]
    }
  }
}
```

### 7. Obsidian集成
- **名称**: obsidian-mcp
- **功能**: 提供Obsidian笔记软件集成
- **适用场景**: 笔记管理、知识库操作、文档整理
- **安装方式**: `npx -y @jianruidutong/obsidian-mcp`
- **配置示例**:
```json
{
  "mcpServers": {
    "obsidian-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@jianruidutong/obsidian-mcp"
      ]
    }
  }
}
```

## 云服务类

### 8. 阿里云网络搜索
- **名称**: aliyun-web-search
- **功能**: 提供阿里云网络搜索服务
- **适用场景**: 信息查询、网络搜索、实时信息获取
- **连接类型**: SSE (Server-Sent Events)
- **配置示例**:
```json
{
  "mcpServers": {
    "aliyun-web-search": {
      "type": "sse",
      "url": "https://dashscope.aliyuncs.com/api/v1/mcps/WebSearch/sse",
      "headers": {
        "Authorization": "Bearer ${DASHSCOPE_API_KEY}"
      }
    }
  }
}
```

### 9. 阿里云语音识别
- **名称**: aliyun-paraformer-asr
- **功能**: 提供阿里云语音识别服务
- **适用场景**: 语音转文字、会议记录、音频处理
- **连接类型**: SSE (Server-Sent Events)
- **配置示例**:
```json
{
  "mcpServers": {
    "aliyun-paraformer-asr": {
      "type": "sse",
      "url": "https://dashscope.aliyuncs.com/api/v1/mcps/SpeechToText/sse",
      "headers": {
        "Authorization": "Bearer ${DASHSCOPE_API_KEY}"
      }
    }
  }
}
```

### 10. 阿里云文本转语音
- **名称**: aliyun-tts
- **功能**: 提供阿里云文本转语音服务
- **适用场景**: 语音合成、音频生成、无障碍服务
- **连接类型**: SSE (Server-Sent Events)
- **配置示例**:
```json
{
  "mcpServers": {
    "aliyun-tts": {
      "type": "sse",
      "url": "https://dashscope.aliyuncs.com/api/v1/mcps/QwenTextToSpeech/sse",
      "headers": {
        "Authorization": "Bearer ${DASHSCOPE_API_KEY}"
      }
    }
  }
}
```

### 11. 阿里云Atlas模型
- **名称**: aliyun-atlasmcp
- **功能**: 提供阿里云Atlas模型服务
- **适用场景**: AI模型调用、自然语言处理、智能分析
- **连接类型**: SSE (Server-Sent Events)
- **配置示例**:
```json
{
  "mcpServers": {
    "aliyun-atlasmcp": {
      "type": "sse",
      "url": "https://dashscope.aliyuncs.com/api/v1/mcps/atlasmcp/sse",
      "headers": {
        "Authorization": "Bearer ${DASHSCOPE_API_KEY}"
      }
    }
  }
}
```

## AI与机器学习类

### 12. 智谱AI视觉理解
- **名称**: zhipu-vision
- **功能**: 提供智谱AI视觉理解服务
- **适用场景**: 图像分析、视觉理解、多模态AI
- **连接类型**: stdio
- **配置示例**:
```json
{
  "mcpServers": {
    "zhipu-vision": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@z_ai/mcp-server"
      ],
      "env": {
        "Z_AI_MODE": "ZHIPU"
      }
    }
  }
}
```

### 13. 智谱AI网络搜索
- **名称**: zhipu-web-search
- **功能**: 提供智谱AI网络搜索服务
- **适用场景**: 智能搜索、信息检索、实时问答
- **连接类型**: HTTP
- **配置示例**:
```json
{
  "mcpServers": {
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

## 环境变量配置

使用上述配置前，需要设置以下环境变量：

```bash
# 阿里云服务API密钥
export DASHSCOPE_API_KEY="your-dashscope-api-key"

# 智谱AI API密钥
export Z_AI_API_KEY="your-zhipu-api-key"
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
5. **环境变量**: 确保所有需要API密钥的服务都正确配置了相应的环境变量

## 贡献指南

如果您发现其他有用的MCP服务或有改进建议，欢迎提交PR或Issue来完善此列表。

## 参考资源

- [MCP官方文档](https://modelcontextprotocol.io/)
- [MCP服务器开发指南](https://modelcontextprotocol.io/docs/concepts/servers)
- [MCP社区资源](https://github.com/modelcontextprotocol/servers)