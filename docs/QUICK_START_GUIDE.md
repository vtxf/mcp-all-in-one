# mcp-all-in-one Quick Start Guide

This guide will help you quickly get started with mcp-all-in-one, merging multiple MCP services into a unified service and managing them through self-configuration features.

For Chinese documentation, see [QUICK_START_GUIDE_zh-CN.md](./QUICK_START_GUIDE_zh-CN.md).

## Installation

### Install via npm

```bash
npm install -g mcp-all-in-one
```

### Install via yarn

```bash
yarn global add mcp-all-in-one
```

### Verify Installation

```bash
mcp-all-in-one --version
```

## Quick Start

### 1. Create Configuration File

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

### 2. Validate Configuration

```bash
mcp-all-in-one --validate-mcp-config
```

### 3. Start Service

#### STDIO Mode (Recommended for IDE)

```bash
mcp-all-in-one stdio
```

#### HTTP Mode (Recommended for Web Applications)

```bash
mcp-all-in-one http --port 3095
```


## Configure in IDE

### Claude Code Configuration

1. Open Claude Code settings
2. Find MCP server configuration
3. Add the following configuration:

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

### Cursor Configuration

1. Open Cursor settings
2. Search for "MCP"
3. Add the following configuration:

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

## Use Self-Configuration Features

After starting mcp-all-in-one, the following tools are automatically available:

1. **View Current Configuration**:
   ```
   Use tool: mcp-all-in-one-show-mcp-config
   ```

2. **Validate Configuration**:
   ```
   Use tool: mcp-all-in-one-validate-mcp-config
   ```

3. **View Configuration Schema**:
   ```
   Use tool: mcp-all-in-one-show-mcp-config-schema
   ```

4. **Set New Configuration**:
   ```
   Use tool: mcp-all-in-one-set-mcp-config
   Parameters: {
     "config-content": "{\"mcpServers\":{\"filesystem\":{\"command\":\"npx\",\"args\":[\"-y\",\"@modelcontextprotocol/server-filesystem\",\".\"]}}}"
   }
   ```

## Common Configuration Examples

### Filesystem Service

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

### Time Service

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

### Web Search Service

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


## Mixed Configuration Example

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

## Environment Variables

mcp-all-in-one supports the following environment variables:

- `MCP_CONFIG`: Specify default configuration file path
- `MCP_LOG_LEVEL`: Set log level (error|warn|info|debug)
- `MCP_SILENT`: Enable silent mode (true|false)

Example:

```bash
# Use custom configuration file
MCP_CONFIG=./my-config.json mcp-all-in-one stdio

# Enable debug logging
MCP_LOG_LEVEL=debug mcp-all-in-one stdio

# Silent mode
MCP_SILENT=true mcp-all-in-one stdio
```

## Troubleshooting

### 1. Configuration File Validation Failed

```bash
mcp-all-in-one --validate-mcp-config
```

### 2. View Detailed Logs

```bash
mcp-all-in-one stdio --log-level debug
```

### 3. Check Service Status

#### HTTP Mode

```bash
curl http://localhost:3095/health
curl http://localhost:3095/status
```


### 4. Common Issues

#### Issue: Service Startup Failed

**Solution**:
1. Check if configuration file format is correct
2. Confirm all dependent services are installed
3. View logs for detailed error information

#### Issue: Some Services Fail to Connect

**Solution**:
1. Check network connection
2. Verify authentication information is correct
3. Confirm target service is available

#### Issue: Configuration Changes Not Taking Effect

**Solution**:
1. Restart mcp-all-in-one service
2. Confirm configuration file path is correct
3. Validate new configuration is valid

## Next Steps

Now that you have successfully set up mcp-all-in-one, you can:

1. Explore more MCP services and add them to your configuration
2. Learn about advanced configuration options
3. Integrate into your development workflow
4. Contribute code or report issues

## More Resources

- [Complete Documentation](../README.md)
- [IDE Configuration Guide](./IDE_CONFIGURATION_GUIDE.md)
- [Self-Configuration Feature Guide](./SELF_CONFIGURATION_GUIDE.md)
- [GitHub Repository](https://github.com/your-username/mcp-all-in-one)

If you have questions, please submit an Issue or contact the maintainer.