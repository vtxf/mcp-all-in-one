# Project Context

## Purpose
mcp-all-in-one是一个统一的MCP（Model Context Protocol）服务代理，将多个MCP服务合并成一个统一的服务入口。支持stdio、http、sse三种通信协议，可以接入多种类型的MCP服务并提供统一的对外接口。

主要目标：
- 简化MCP服务的部署和管理
- 支持多种通信协议的统一接入
- 提供高可用性和可扩展性的MCP服务代理
- 降低MCP服务的使用门槛

## Tech Stack
- **运行时**: Node.js 22+ (TypeScript)
- **核心依赖**: @modelcontextprotocol/sdk (最新版本)
- **Web框架**: Express.js (用于HTTP和SSE服务)
- **命令行工具**: Commander.js
- **日志系统**: Winston
- **配置验证**: Ajv (JSON Schema验证)
- **测试框架**: Jest
- **代码质量**: ESLint + Prettier
- **构建工具**: TypeScript + tsx

## Project Conventions

### Code Style
- 使用4个空格进行代码缩进
- 类名使用PascalCase命名，首字母大写
- 函数和变量使用camelCase命名
- 常量使用UPPER_SNAKE_CASE命名
- 每个类一个文件，文件名与类名保持一致
- 使用`export class`导出类，不使用`export default`
- 所有代码必须包含详细的中文注释

### Architecture Patterns
- **代理模式**: 统一的MCP服务代理架构
- **适配器模式**: 为不同协议类型实现专用适配器
- **配置驱动**: 基于JSON MCP配置文件的服务管理

### Testing Strategy
- 单元测试覆盖核心功能模块（覆盖率≥80%）
- 集成测试验证不同类型MCP服务的连接和通信
- MCP配置文件验证测试确保格式正确性
- 错误处理和异常情况的专门测试
- 使用Jest进行测试管理和覆盖率分析

### Git Workflow
- 遵循约定式提交规范
- 主要分支: main (生产), develop (开发)
- 功能分支: feature/功能名称
- 修复分支: fix/问题描述
- 所有提交必须通过代码质量检查和测试
- 必须在CHANGELOG.md中记录重要变更

## Domain Context
**MCP (Model Context Protocol)** 是一个标准化的协议，用于AI助手与外部工具和服务之间的通信。

**关键概念**:
- **MCP Server**: 提供特定功能的工具或服务
- **MCP Client**: 使用MCP服务的应用程序
- **Transport**: 通信协议（stdio、http、sse）
- **Schema**: 定义服务接口和参数的数据结构

**使用场景**:
- 文件系统操作
- 数据库访问
- API调用
- 系统管理任务
- 开发工具集成

## Important Constraints
- **性能**: 必须支持多个MCP服务并发连接
- **稳定性**: 提供完善的错误处理、自动重连和错误恢复机制
- **可靠性**: 99.9%的服务可用性，支持故障转移
- **兼容性**: 必须与MCP官方协议完全兼容
- **可维护性**: 代码结构清晰，文档完整

## External Dependencies
- **@modelcontextprotocol/sdk**: MCP官方SDK，提供协议实现
- **Express.js**: Web框架，用于HTTP和SSE服务
- **Node.js内置模块**: 优先使用内置模块而非第三方库
- **JSON Schema**: MCP配置文件格式验证
- **环境变量**: 支持配置中的环境变量替换
- **文件系统**: MCP配置文件管理和监控

## 核心注意事项
- ** 你写的所有规范和代码必须事先读取并严格遵守specs/contituion/spec.md文件中的内容
- ** 严禁瞎编乱造，你在编写其他规范文件时，一旦有和specs/contituion/spec.md冲突的地方，应该立即修正并严格遵守。如果你无法做到严格遵守，应该立即停止编写并告诉我，让我来做决断！
