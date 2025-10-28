# Core MCP Proxy Design Document

## 架构设计

### 系统架构概述
mcp-all-in-one采用分层架构设计，主要包括以下层次：

1. **CLI层** - 处理命令行参数和用户交互
2. **核心层** - 配置管理、代理逻辑、工具函数
3. **MCP服务器层** - 对外提供聚合的MCP服务
4. **MCP客户端层** - 连接各个独立的MCP服务

### 核心组件设计

#### 1. 配置管理系统
- **ConfigLoader**: 负责加载和解析MCP配置文件
- **ConfigValidator**: 使用JSON Schema验证配置文件
- 支持环境变量替换
- 自动创建默认配置文件

#### 2. MCP代理系统
- **McpProxy**: 主代理类，负责请求路由和响应聚合
- **ServiceManager**: 管理所有MCP服务的生命周期
- 支持多种传输协议的统一处理

#### 3. 传输协议支持
- **STDIO**: 使用MCP SDK的StdioServerTransport和StdioClientTransport
- **HTTP**: 使用Express + MCP SDK的HttpServerTransport和HttpClientTransport
- **SSE**: 使用Express + MCP SDK的SseServerTransport和SseClientTransport

#### 4. Windows平台支持
- 自动检测Windows平台
- 为stdio命令添加cmd /c前缀
- 确保跨平台兼容性

### 技术栈选择
- **运行时**: Node.js 22 + TypeScript
- **MCP SDK**: @modelcontextprotocol/sdk ^1.20.2
- **Web框架**: Express ^5.0.1 (仅用于HTTP/SSE模式)
- **命令行**: Commander ^14.0.1
- **配置验证**: Ajv ^8.17.1

### 项目结构
按照directory-structure规范，创建完整的模块化目录结构，每个功能模块独立目录，职责单一。

## 实现策略

### 最小可用版本(MVP)
1. 实现基础项目结构和配置
2. 实现配置文件加载和验证
3. 实现简单的stdio模式支持
4. 实现基础的命令行接口
5. 添加Windows平台支持

### 扩展功能
1. 添加HTTP模式支持
2. 添加SSE模式支持
3. 完善错误处理
4. 优化性能和稳定性

## 关键设计决策

### 1. 使用官方MCP SDK
选择使用官方@modelcontextprotocol/sdk作为核心依赖，确保与MCP协议的完全兼容性。

### 2. 模块化架构
采用模块化设计，每个功能模块独立，便于测试和维护。

### 3. 配置驱动
所有服务配置来自JSON配置文件，支持环境变量替换，提供灵活的配置管理。

### 4. 跨平台支持
特别考虑Windows平台的特殊性，确保在所有主要操作系统上都能正常运行。