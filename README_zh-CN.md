# mcp-all-in-one

[![npm version](https://badge.fury.io/js/mcp-all-in-one.svg)](https://badge.fury.io/js/mcp-all-in-one)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个强大的MCP（Model Context Protocol）服务聚合器，能够将多个MCP服务合并为一个统一的MCP服务，并提供自我配置功能。

[MCP配置太痛苦？试试mcp-all-in-one](./docs/MCP配置太痛苦？试试mcp-all-in-one%21.md)

For English documentation, see [README.md](./README.md).

## ✨ 核心特性

### 🔄 多服务聚合
- **统一接口**：将多个MCP服务合并为一个MCP服务，简化配置和管理
- **多协议支持**：支持stdio、HTTP两种通信协议
- **透明代理**：客户端无需感知后端有多个服务，所有工具调用自动路由到对应服务

### 🛠️ 自我配置
- **内置配置工具**：提供专门的MCP工具用于配置管理
- **动态配置**：无需手动编辑文件，通过MCP工具直接修改配置
- **配置验证**：实时验证配置正确性，避免配置错误

### 🌟 其他特性
- 🪟 **Windows兼容**：自动处理Windows平台的命令执行问题
- ⚙️ **配置驱动**：通过JSON配置文件管理MCP服务
- 🛡️ **类型安全**：完全使用TypeScript开发
- 🔄 **自动重连**：支持服务异常时的自动重连机制
- 📊 **状态监控**：实时监控所有MCP服务的运行状态

## 🚀 快速开始

快速开始，只需三步：

1. 在MCP客户端配置mcp-all-in-one

claude code中配置：
```
claude mcp add mcp-all-in-one -s user -- npx -y mcp-all-in-one@latest stdio
```

cursor/trae/cherry studio中等客户端的配置：
```json
{
  "mcpServers": {
    "mcp-all-in-one": {
      "command": "npx",
      "args": ["-y", "mcp-all-in-one@latest","stdio"]
    }
  }
}
```

2. 在MCP客户端通过对话让mcp-all-in-one配置自己的MCP
```
mcp-all-in-one中配置Fetch工具：uvx mcp-server-fetch
mcp-all-in-one中配置chrome-devtools：npx -y chrome-devtools-mcp@latest
查看mcp-all-in-one中的mcp配置
删掉mcp-all-in-one中的chrome-devtools工具
```

3. 重启MCP客户端的MCP服务，新工具即可使用啦

## 📚 文档

- [快速开始指南](./docs/QUICK_START_GUIDE_zh-CN.md) - 快速上手mcp-all-in-one
- [IDE配置指南](./docs/IDE_CONFIGURATION_GUIDE_zh-CN.md) - 在Claude Code和Cursor中配置mcp-all-in-one的详细指南
- [自我配置功能详解](./docs/SELF_CONFIGURATION_GUIDE_zh-CN.md) - 如何使用mcp-all-in-one的自我配置功能
- [MCP资源列表](./resources/common_mcp_list.md) - 常用MCP工具列表

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [Model Context Protocol](https://modelcontextprotocol.io/)