# mcp-all-in-one

[![npm version](https://badge.fury.io/js/mcp-all-in-one.svg)](https://badge.fury.io/js/mcp-all-in-one)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful MCP (Model Context Protocol) service aggregator that combines multiple MCP services into a single unified MCP service with self-configuration capabilities.

一个强大的MCP（Model Context Protocol）服务聚合器，能够将多个MCP服务合并为一个统一的MCP服务，并提供自我配置功能。
中文版请看 [README_zh-CN.md](./README_zh-CN.md).

## ✨ Core Features

### 🔄 Multi-Service Aggregation
- **Unified Interface**: Combine multiple MCP services into a single MCP service, simplifying configuration and management
- **Multi-Protocol Support**: Supports two communication protocols: stdio and HTTP
- **Transparent Proxy**: Clients don't need to be aware of multiple backend services, all tool calls are automatically routed to the corresponding service

### 🛠️ Self-Configuration
- **Built-in Configuration Tools**: Provide dedicated MCP tools for configuration management
- **Dynamic Configuration**: Modify configuration directly through MCP tools without manual file editing
- **Configuration Validation**: Real-time configuration validation to avoid configuration errors

### 🌟 Other Features
- 🪟 **Windows Compatible**: Automatically handles command execution issues on Windows platform
- ⚙️ **Configuration-Driven**: Manage MCP services through JSON configuration files
- 🛡️ **Type Safe**: Fully developed with TypeScript
- 🔄 **Auto-Reconnect**: Support automatic reconnection mechanism when services fail
- 📊 **Status Monitoring**: Real-time monitoring of all MCP services' running status

## 🚀 Quick Start

Get started in just three steps:

1. Configure mcp-all-in-one in your MCP client

For Claude Code:
```
claude mcp add mcp-all-in-one -s user -- npx -y mcp-all-in-one@latest stdio
```

For clients like Cursor/Trae/Cherry Studio:
```json
{
  "mcpServers": {
    "mcp-all-in-one": {
      "command": "npx",
      "args": ["mcp-all-in-one@latest","stdio"]
    }
  }
}
```

2. Configure your MCPs through conversation in the MCP client
```
Configure Fetch tool in mcp-all-in-one: uvx mcp-server-fetch
Configure chrome-devtools in mcp-all-in-one: npx chrome-devtools-mcp@latest
View mcp configuration in mcp-all-in-one
Remove chrome-devtools tool from mcp-all-in-one
```

3. Restart the MCP service in your MCP client, and the new tools will be ready to use!

## 📚 Documentation

- [Quick Start Guide](./docs/QUICK_START_GUIDE.md) - Quick getting started with mcp-all-in-one
- [IDE Configuration Guide](./docs/IDE_CONFIGURATION_GUIDE.md) - Detailed guide for configuring mcp-all-in-one in Claude Code and Cursor
- [Self-Configuration Feature Guide](./docs/SELF_CONFIGURATION_GUIDE.md) - How to use mcp-all-in-one's self-configuration features

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT License

## 🔗 Related Links

- [Model Context Protocol](https://modelcontextprotocol.io/)