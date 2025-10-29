# mcp-all-in-one 快速开始指南

本指南将帮助您快速开始使用 mcp-all-in-one，将多个MCP服务合并为一个统一的服务，并通过自我配置功能进行管理。

For English documentation, see [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md).

## 安装

### 通过npm安装 | Install via npm

```bash
npm install -g mcp-all-in-one
```

### 通过yarn安装 | Install via yarn

```bash
yarn global add mcp-all-in-one
```

### 验证安装 | Verify Installation

```bash
mcp-all-in-one --version
```

## 快速开始 | Quick Start

### 1. 创建配置文件 | Create Configuration File

创建一个基本的配置文件 `~/.mcp-all-in-one/mcp.json`：

Create a basic configuration file `~/.mcp-all-in-one/mcp.json`:

```bash
mkdir -p ~/.mcp-all-in-one
cat > ~/.mcp-all-in-one/mcp.json << EOF
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "time": {
      "command": "uvx",
      "args": ["mcp-server-time", "--local-timezone=Asia/Shanghai"]
    }
  }
}
EOF
```

### 2. 验证配置 | Validate Configuration

```bash
mcp-all-in-one --validate-mcp-config
```

### 3. 启动服务 | Start Service

#### STDIO模式（推荐用于IDE）| STDIO Mode (Recommended for IDE)

```bash
mcp-all-in-one stdio
```

#### HTTP模式（推荐用于Web应用）| HTTP Mode (Recommended for Web Applications)

```bash
mcp-all-in-one http --port 3095
```


## 在IDE中配置 | Configure in IDE

### Claude Code配置 | Claude Code Configuration

1. 打开Claude Code设置 | Open Claude Code settings
2. 找到MCP服务器配置 | Find MCP server configuration
3. 添加以下配置 | Add the following configuration:

```json
{
  "mcpServers": {
    "mcp-all-in-one": {
      "command": "mcp-all-in-one",
      "args": ["stdio", "--mcp-config", "/path/to/your/mcp.json"]
    }
  }
}
```

### Cursor配置 | Cursor Configuration

1. 打开Cursor设置 | Open Cursor settings
2. 搜索"MCP" | Search for "MCP"
3. 添加以下配置 | Add the following configuration:

```json
{
  "mcpServers": {
    "mcp-all-in-one": {
      "command": "mcp-all-in-one",
      "args": ["stdio", "--mcp-config", "/path/to/your/mcp.json"]
    }
  }
}
```

## 使用自我配置功能 | Use Self-Configuration Features

启动mcp-all-in-one后，以下工具会自动可用：
After starting mcp-all-in-one, the following tools are automatically available:

1. **查看当前配置 | View Current Configuration**：
   ```
   使用工具: mcp-all-in-one-show-mcp-config
   ```

2. **验证配置 | Validate Configuration**：
   ```
   使用工具: mcp-all-in-one-validate-mcp-config
   ```

3. **查看配置Schema | View Configuration Schema**：
   ```
   使用工具: mcp-all-in-one-show-mcp-config-schema
   ```

4. **设置新配置 | Set New Configuration**：
   ```
   使用工具: mcp-all-in-one-set-mcp-config
   参数: {
     "config-content": "{\"mcpServers\":{\"filesystem\":{\"command\":\"npx\",\"args\":[\"-y\",\"@modelcontextprotocol/server-filesystem\",\".\"]}}}"
   }
   ```

## 常用配置示例 | Common Configuration Examples

### 文件系统服务 | Filesystem Service

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

### 时间服务 | Time Service

```json
{
  "mcpServers": {
    "time": {
      "command": "uvx",
      "args": ["mcp-server-time", "--local-timezone=Asia/Shanghai"]
    }
  }
}
```

### Web搜索服务 | Web Search Service

```json
{
  "mcpServers": {
    "web-search": {
      "type": "http",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```


## 混合配置示例 | Mixed Configuration Example

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "time": {
      "command": "uvx",
      "args": ["mcp-server-time", "--local-timezone=Asia/Shanghai"]
    },
    "web-search": {
      "type": "http",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

## 环境变量 | Environment Variables

mcp-all-in-one支持以下环境变量：
mcp-all-in-one supports the following environment variables:

- `MCP_CONFIG`: 指定默认配置文件路径 | Specify default configuration file path
- `MCP_LOG_LEVEL`: 设置日志级别 (error|warn|info|debug) | Set log level (error|warn|info|debug)
- `MCP_SILENT`: 启用静默模式 (true|false) | Enable silent mode (true|false)

示例 | Example:

```bash
# 使用自定义配置文件 | Use custom configuration file
MCP_CONFIG=./my-config.json mcp-all-in-one stdio

# 启用调试日志 | Enable debug logging
MCP_LOG_LEVEL=debug mcp-all-in-one stdio

# 静默模式 | Silent mode
MCP_SILENT=true mcp-all-in-one stdio
```

## 故障排除 | Troubleshooting

### 1. 配置文件验证失败 | Configuration File Validation Failed

```bash
mcp-all-in-one --validate-mcp-config
```

### 2. 查看详细日志 | View Detailed Logs

```bash
mcp-all-in-one stdio --log-level debug
```

### 3. 检查服务状态 | Check Service Status

#### HTTP模式 | HTTP Mode

```bash
curl http://localhost:3095/health
curl http://localhost:3095/status
```


### 4. 常见问题 | Common Issues

#### 问题：服务启动失败 | Issue: Service Startup Failed

**解决方案 | Solution**：
1. 检查配置文件格式是否正确 | Check if configuration file format is correct
2. 确认所有依赖的服务已安装 | Confirm all dependent services are installed
3. 查看日志获取详细错误信息 | View logs for detailed error information

#### 问题：某些服务连接失败 | Issue: Some Services Fail to Connect

**解决方案 | Solution**：
1. 检查网络连接 | Check network connection
2. 验证认证信息是否正确 | Verify authentication information is correct
3. 确认目标服务是否可用 | Confirm target service is available

#### 问题：配置更改不生效 | Issue: Configuration Changes Not Taking Effect

**解决方案 | Solution**：
1. 重启mcp-all-in-one服务 | Restart mcp-all-in-one service
2. 确认配置文件路径是否正确 | Confirm configuration file path is correct
3. 验证新配置是否有效 | Validate new configuration is valid

## 下一步 | Next Steps

现在您已经成功设置了mcp-all-in-one，可以：
Now that you have successfully set up mcp-all-in-one, you can:

1. 探索更多MCP服务并添加到配置中 | Explore more MCP services and add them to your configuration
2. 了解高级配置选项 | Learn about advanced configuration options
3. 集成到您的开发工作流中 | Integrate into your development workflow
4. 贡献代码或报告问题 | Contribute code or report issues

## 更多资源 | More Resources

- [完整文档 | Complete Documentation](../README.md)
- [IDE配置指南 | IDE Configuration Guide](./IDE_CONFIGURATION_GUIDE.md)
- [自我配置功能详解 | Self-Configuration Feature Guide](./SELF_CONFIGURATION_GUIDE.md)
- [GitHub仓库 | GitHub Repository](https://github.com/your-username/mcp-all-in-one)

如有问题，请提交Issue或联系维护者。
If you have questions, please submit an Issue or contact the maintainer.