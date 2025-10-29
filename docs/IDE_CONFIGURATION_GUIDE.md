# Guide to Configuring mcp-all-in-one in IDEs

This guide provides detailed instructions on how to configure mcp-all-in-one in various IDEs, allowing you to use multiple MCP services without configuring each service individually.

For Chinese documentation, see [IDE_CONFIGURATION_GUIDE_zh-CN.md](./IDE_CONFIGURATION_GUIDE_zh-CN.md).

## Why Use mcp-all-in-one?

1. **Simplified Configuration**: Configure only one MCP service in your IDE instead of multiple
2. **Unified Management**: All MCP service configurations are centralized in one file
3. **Flexible Combination**: Freely combine different types of MCP services (stdio, HTTP)
4. **Environment Isolation**: Manage different environment configurations through environment variables
5. **Hot Updates**: Dynamically modify configuration through self-configuration tools without restarting IDE

## General Configuration Steps

Regardless of which IDE you use, the basic steps for configuring mcp-all-in-one are the same:

1. **Install mcp-all-in-one**
   ```bash
   npm install -g mcp-all-in-one
   ```

2. **Create MCP Configuration File**
   Create a JSON file (e.g., `mcp.json`) and configure all the MCP services you need:
   ```json
   {
       "mcpServers": {
           "filesystem": {
               "command": "npx",
               "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
           },
           "web-search": {
               "type": "http",
               "url": "https://api.example.com/mcp",
               "headers": {
                   "Authorization": "Bearer ${API_KEY}"
               }
           },
           "time": {
               "command": "uvx",
               "args": ["mcp-server-time", "--local-timezone=Asia/Shanghai"]
           }
       }
   }
   ```

3. **Configure MCP Service in IDE**
   Configure the IDE to use mcp-all-in-one as the sole MCP service, pointing to the configuration file you created.

## Claude Code Configuration

1. Open Claude Code
2. Click the settings icon in the bottom left, or use shortcut `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)
3. Find the "MCP" or "Model Context Protocol" section in settings
4. Add the following configuration:

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

5. Save settings and restart Claude Code

### Advanced Configuration

You can use environment variables to manage configurations for different environments:

```json
{
  "mcpServers": {
    "mcp-all-in-one": {
      "command": "mcp-all-in-one",
      "args": ["stdio", "--mcp-config", "${MCP_CONFIG_PATH}"]
    }
  }
}
```

Then set the environment variable before starting Claude Code:
```bash
export MCP_CONFIG_PATH=/path/to/your/mcp.json
```

## Cursor Configuration

1. Open Cursor
2. Click the gear icon in the bottom left, or use menu `File > Preferences > Settings`
3. Type "MCP" or "Model Context Protocol" in the search box
4. Find the MCP server configuration section
5. Add the following configuration:

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

6. Save settings and restart Cursor

### Using Configuration Files

You can also save the MCP configuration to a separate file, then specify that file in Cursor:

1. Create an MCP configuration file (e.g., `cursor-mcp.json`):
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

2. Specify that file in Cursor settings:
   ```json
   {
     "mcp.configFile": "/path/to/cursor-mcp.json"
   }
   ```

## Other IDE Configurations

### VS Code

Although VS Code doesn't directly support MCP yet, you can use mcp-all-in-one through the following methods:

1. Install VS Code extensions that support MCP (if available)
2. Configure mcp-all-in-one according to the extension's instructions

### Other MCP-Supporting IDEs

For other IDEs that support MCP, configuration steps are usually similar to Claude Code or Cursor:

1. Find the MCP configuration section
2. Add mcp-all-in-one as an MCP service
3. Specify the configuration file path

## Configuration File Best Practices

### 1. Use Environment Variables

Use environment variables in configuration files to make them more flexible:

```json
{
    "mcpServers": {
        "api-service": {
            "type": "http",
            "url": "https://${API_HOST}/mcp",
            "headers": {
                "Authorization": "Bearer ${API_KEY}"
            }
        }
    }
}
```

### 2. Separate Sensitive Information

Don't write sensitive information like API keys directly in configuration files:

```bash
# Set environment variables
export API_KEY="your-api-key"
export API_HOST="api.example.com"
```

### 3. Use Different Configuration Files

Create different configuration files for different environments:

```bash
# Development environment
mcp-all-in-one stdio --mcp-config ./configs/dev.json

# Test environment
mcp-all-in-one stdio --mcp-config ./configs/test.json

# Production environment
mcp-all-in-one stdio --mcp-config ./configs/prod.json
```

### 4. Use Relative Paths

Use relative paths in configuration files to make them more portable:

```json
{
    "mcpServers": {
        "filesystem": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "./workspace"]
        }
    }
}
```

## Troubleshooting

### 1. Check Configuration File

Use mcp-all-in-one's built-in validation tool to check configuration files:

```bash
mcp-all-in-one --validate-mcp-config /path/to/your/mcp.json
```

### 2. View Logs

Enable debug logging to get more information:

```json
{
  "mcpServers": {
    "mcp-all-in-one": {
      "command": "mcp-all-in-one",
      "args": ["stdio", "--mcp-config", "/path/to/your/mcp.json", "--log-level", "debug"]
    }
  }
}
```

### 3. Check Paths

Ensure all paths are absolute paths or correct relative paths:

```bash
# Use absolute paths
/path/to/your/mcp.json

# Or use paths relative to user home directory
~/mcp.json
```

### 4. Permission Issues

Ensure mcp-all-in-one has permission to access the configuration file and all related resources:

```bash
# Check file permissions
ls -la /path/to/your/mcp.json

# Modify permissions if needed
chmod 644 /path/to/your/mcp.json
```

## Using Self-Configuration Tools

Once mcp-all-in-one is running in your IDE, you can use the built-in self-configuration tools to manage configurations:

1. **View Current Configuration**:
   ```
   Use tool: mcp-all-in-one-show-mcp-config
   ```

2. **Validate Configuration**:
   ```
   Use tool: mcp-all-in-one-validate-mcp-config
   ```

3. **Modify Configuration**:
   ```
   Use tool: mcp-all-in-one-set-mcp-config
   Parameters: {
     "config-content": "{\"mcpServers\":{\"filesystem\":{\"command\":\"npx\",\"args\":[\"-y\",\"@modelcontextprotocol/server-filesystem\",\".\"]}}}"
   }
   ```

4. **View Configuration Format**:
   ```
   Use tool: mcp-all-in-one-show-mcp-config-schema
   ```

## Advanced Usage

### 1. Dynamically Add Services

You can dynamically add new MCP services at runtime:

1. Use `mcp-all-in-one-show-mcp-config` to get current configuration
2. Add new service configuration
3. Use `mcp-all-in-one-set-mcp-config` to apply new configuration
4. Restart mcp-all-in-one service

### 2. Service Failover

Configure primary and backup services to achieve high availability:

```json
{
    "mcpServers": {
        "primary-search": {
            "type": "http",
            "url": "https://primary.example.com/mcp"
        },
        "backup-search": {
            "type": "http",
            "url": "https://backup.example.com/mcp"
        }
    }
}
```

### 3. Conditional Services

Enable different services based on environment variables:

```json
{
    "mcpServers": {
        "dev-tools": {
            "command": "npx",
            "args": ["@modelcontextprotocol/server-dev-tools"],
            "env": {
                "NODE_ENV": "development"
            },
            "disabled": "${NODE_ENV !== 'development'}"
        }
    }
}
```

## Summary

Using mcp-all-in-one can greatly simplify the process of configuring multiple MCP services in IDEs. By merging multiple services into one unified service, you can:

1. Reduce IDE configuration complexity
2. Centrally manage all MCP services
3. Use self-configuration tools to dynamically manage configurations
4. Achieve more flexible workflows

We hope this guide helps you better use mcp-all-in-one! If you have any questions or suggestions, feel free to submit an Issue or Pull Request.