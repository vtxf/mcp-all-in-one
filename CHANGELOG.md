# 变更记录

## [1.1.0] - 2025-01-28

### 重大变更 (Breaking Changes)
- 移除SSE（Server-Sent Events）支持
- 简化为仅支持stdio和HTTP两种通信协议
- 移除所有SSE相关的代码和配置选项

### 移除
- SSE服务器实现 (`SseMcpServer`)
- SSE客户端实现 (`SseMcpClient`)
- SSE命令行接口 (`sse` 命令)
- SSE配置类型 (`SseServerConfig`)
- SSE传输类型 (`SseTransportConnection`)
- 所有文档中的SSE引用和示例

### 更新
- 更新所有README文档，移除SSE相关说明
- 更新CLI帮助信息，移除SSE命令
- 更新类型定义，移除SSE枚举值
- 更新MCP客户端工厂，移除SSE客户端创建逻辑
- 简化配置验证，移除SSE配置检查
- 移除所有TypeScript编译错误和类型引用
- 验证构建和基本功能正常运行

### 优化
- 简化代码结构，提高维护性
- 减少依赖复杂度
- 聚焦于核心stdio和HTTP协议支持
- 提升项目稳定性和可靠性

### 移除
- SSE服务器实现 (`SseMcpServer`)
- SSE客户端实现 (`SseMcpClient`)
- SSE命令行接口 (`sse` 命令)
- SSE配置类型 (`SseServerConfig`)
- SSE传输类型 (`SseTransportConnection`)
- 所有文档中的SSE引用和示例

### 更新
- 更新所有README文档，移除SSE相关说明
- 更新CLI帮助信息，移除SSE命令
- 更新类型定义，移除SSE枚举值
- 更新MCP客户端工厂，移除SSE客户端创建逻辑
- 简化配置验证，移除SSE配置检查

### 优化
- 简化代码结构，提高维护性
- 减少依赖复杂度
- 聚焦于核心stdio和HTTP协议支持

## [1.0.0] - 2025-01-25

### 新增
- 初始版本发布
- 实现基础MCP代理功能
- 支持stdio、HTTP、SSE三种通信协议
- Windows平台特殊支持（cmd /c前缀）
- 配置文件加载和验证
- 命令行接口（stdio模式和配置管理）
- 基础日志系统
- 服务状态监控和管理
- 环境变量替换支持
- TypeScript类型支持

### 特性
- 🔗 多协议MCP服务聚合
- 🪟 Windows平台自动兼容
- ⚙️ JSON配置文件管理
- 🛡️ 完整的TypeScript类型支持
- 📊 实时服务状态监控
- 🔄 自动服务重连机制

### 技术栈
- Node.js 22+
- TypeScript 5.9+
- @modelcontextprotocol/sdk 1.20.2
- Express 5.0.1
- Commander 14.0.1
- Ajv 8.17.1

### 配置示例
```json
{
    "mcpServers": {
        "filesystem": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
        }
    }
}
```