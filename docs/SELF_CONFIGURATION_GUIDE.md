# mcp-all-in-one Self-Configuration Feature Guide

mcp-all-in-one provides powerful self-configuration features that allow you to manage configurations directly through MCP tools without manually editing files. This feature enables you to dynamically add, remove, or modify MCP service configurations in your IDE, greatly improving work efficiency.

For Chinese documentation, see [SELF_CONFIGURATION_GUIDE_zh-CN.md](./SELF_CONFIGURATION_GUIDE_zh-CN.md).

## Self-Configuration Tools Overview

After you start mcp-all-in-one, the following tools are automatically available and integrated into your MCP tool list:

1. **mcp-all-in-one-show-mcp-config** - Display current MCP configuration file content
2. **mcp-all-in-one-validate-mcp-config** - Validate the correctness of MCP configuration file
3. **mcp-all-in-one-show-mcp-config-schema** - Display JSON Schema for MCP configuration
4. **mcp-all-in-one-set-mcp-config** - Set MCP configuration

## Detailed Tool Descriptions

### 1. mcp-all-in-one-show-mcp-config

Display the content of the current MCP configuration file.

**Parameters**:
- `config-file` (optional): MCP configuration file path, displays currently used configuration file if not specified

**Usage Examples**:
```
Use tool: mcp-all-in-one-show-mcp-config
```

Or specify a specific configuration file:
```
Use tool: mcp-all-in-one-show-mcp-config
Parameters: {
  "config-file": "/path/to/your/mcp.json"
}
```

**Return Result**:
```json
{
  "config": {
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
      }
    }
  },
  "configPath": "/path/to/your/mcp.json"
}
```

### 2. mcp-all-in-one-validate-mcp-config

Validate the correctness of MCP configuration file, checking if format and content meet requirements.

**Parameters**:
- `config-file` (optional): MCP configuration file path, validates currently used configuration file if not specified

**Usage Examples**:
```
Use tool: mcp-all-in-one-validate-mcp-config
```

Or specify a specific configuration file:
```
Use tool: mcp-all-in-one-validate-mcp-config
Parameters: {
  "config-file": "/path/to/your/mcp.json"
}
```

**Return Result**:
```json
{
  "valid": true,
  "errors": [],
  "configPath": "/path/to/your/mcp.json"
}
```

If configuration has errors:
```json
{
  "valid": false,
  "errors": [
    "mcpServers.web-search.url: must be a valid URI",
    "mcpServers.filesystem.timeout: must be >= 1000"
  ],
  "configPath": "/path/to/your/mcp.json"
}
```

### 3. mcp-all-in-one-show-mcp-config-schema

Display JSON Schema for MCP configuration, helping you understand the correct configuration format.

**Parameters**: None

**Usage Examples**:
```
Use tool: mcp-all-in-one-show-mcp-config-schema
```

**Return Result**:
```json
{
  "schema": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "vtxf/mcp-all-in-one/schema/mcpServers.schema.json",
    "title": "MCP Servers Configuration Schema",
    "description": "Schema for MCP server configurations",
    "type": "object",
    "required": ["mcpServers"],
    "properties": {
      "mcpServers": {
        "type": "object",
        "description": "MCP servers configuration object",
        // ... More schema content
      }
    }
  },
  "schemaVersion": "http://json-schema.org/draft-07/schema#"
}
```

### 4. mcp-all-in-one-set-mcp-config

Set MCP configuration, can add new services, modify existing services, or delete services.

**Parameters**:
- `config-content` (required): New MCP configuration content (JSON string)
- `config-file` (optional): MCP configuration file path, modifies currently used configuration file if not specified

**Usage Examples**:
```
Use tool: mcp-all-in-one-set-mcp-config
Parameters: {
  "config-content": "{\"mcpServers\":{\"filesystem\":{\"command\":\"npx\",\"args\":[\"-y\",\"@modelcontextprotocol/server-filesystem\",\".\"]}}}",
  "config-file": "/path/to/your/mcp.json"
}
```

**Return Result**:
```json
{
  "success": true,
  "configPath": "/path/to/your/mcp.json",
  "backupPath": "/path/to/your/mcp.json.backup.2023-12-01T10-30-00-000Z",
  "restartRequired": true,
  "restartMessage": "MCP configuration updated. Please restart mcp-all-in-one service to apply new configuration. Use the following command to restart:\nmcp-all-in-one stdio --mcp-config /path/to/your/mcp.json",
  "errors": []
}
```

If configuration has errors:
```json
{
  "success": false,
  "configPath": "/path/to/your/mcp.json",
  "errors": [
    "mcpServers.web-search.url: must be a valid URI"
  ],
  "restartRequired": false,
  "restartMessage": ""
}
```

## Configuration Workflow

### Basic Workflow

1. **View Current Configuration**: Use `mcp-all-in-one-show-mcp-config` to understand current configuration
2. **Plan Modifications**: Use `mcp-all-in-one-show-mcp-config-schema` to understand configuration format
3. **Validate New Configuration**: Use `mcp-all-in-one-validate-mcp-config` to validate new configuration
4. **Apply Configuration**: Use `mcp-all-in-one-set-mcp-config` to apply new configuration
5. **Restart Service**: Restart mcp-all-in-one service according to prompts to apply new configuration

### Example: Adding New MCP Service

Suppose you want to add a time service to existing configuration:

1. **View Current Configuration**:
   ```
   Use tool: mcp-all-in-one-show-mcp-config
   ```

2. **Prepare New Configuration** (Add time service based on current configuration):
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
       }
     }
   }
   ```

3. **Apply New Configuration**:
   ```
   Use tool: mcp-all-in-one-set-mcp-config
   Parameters: {
     "config-content": "{\"mcpServers\":{\"filesystem\":{\"command\":\"npx\",\"args\":[\"-y\",\"@modelcontextprotocol/server-filesystem\",\".\"]},\"time\":{\"command\":\"uvx\",\"args\":[\"mcp-server-time\",\"--local-timezone=Asia/Shanghai\"]}}}"
   }
   ```

4. **Restart Service** (According to returned prompts):
   ```
   mcp-all-in-one stdio --mcp-config /path/to/your/mcp.json
   ```

### Example: Temporarily Disabling Service

If you want to temporarily disable a service without deleting it:

1. **View Current Configuration**:
   ```
   Use tool: mcp-all-in-one-show-mcp-config
   ```

2. **Modify Configuration** (Rename service with "_disabled" suffix):
   ```
   Use tool: mcp-all-in-one-set-mcp-config
   Parameters: {
     "config-content": "{\"mcpServers\":{\"filesystem_disabled\":{\"command\":\"npx\",\"args\":[\"-y\",\"@modelcontextprotocol/server-filesystem\",\".\"]}}}"
   }
   ```

3. **Restart Service** (According to returned prompts)

### Example: Service Failover Configuration

Configure primary and backup services to achieve high availability:

1. **View Current Configuration**:
   ```
   Use tool: mcp-all-in-one-show-mcp-config
   ```

2. **Modify Configuration** (Add backup service):
   ```
   Use tool: mcp-all-in-one-set-mcp-config
   Parameters: {
     "config-content": "{\"mcpServers\":{\"primary-search\":{\"type\":\"http\",\"url\":\"https://primary.example.com/mcp\",\"timeout\":5000},\"backup-search\":{\"type\":\"http\",\"url\":\"https://backup.example.com/mcp\",\"timeout\":5000}}}"
   }
   ```

3. **Restart Service** (According to returned prompts)

## Advanced Usage

### 1. Batch Configuration Modification

You can use scripts or tools to batch generate configurations, then apply them all at once:

```python
# Python example: Generate configuration
import json

config = {
    "mcpServers": {
        "filesystem": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
        }
    }
}

# Add multiple services
services = [
    {"name": "time", "command": "uvx", "args": ["mcp-server-time", "--local-timezone=Asia/Shanghai"]},
    {"name": "web-search", "type": "http", "url": "https://api.example.com/mcp"}
]

for service in services:
    config["mcpServers"][service["name"]] = service

# Convert to JSON string
config_str = json.dumps(config)

# Use mcp-all-in-one-set-mcp-config in IDE to apply this configuration
print(f"Use tool: mcp-all-in-one-set-mcp-config")
print(f"Parameters: {{")
print(f'  "config-content": "{config_str}"')
print(f"}}")
```

### 2. Environment-Specific Configuration

Apply different configurations based on different environments:

```
Use tool: mcp-all-in-one-set-mcp-config
Parameters: {
  "config-content": "{\"mcpServers\":{\"filesystem\":{\"command\":\"npx\",\"args\":[\"-y\",\"@modelcontextprotocol/server-filesystem\",\".\"],\"env\":{\"NODE_ENV\":\"${NODE_ENV:-development}\"}}}}",
  "config-file": "./configs/${NODE_ENV:-development}.json"
}
```

### 3. Configuration Template Management

Create configuration templates and apply them as needed:

1. **Create Base Template**:
   ```
   Use tool: mcp-all-in-one-set-mcp-config
   Parameters: {
     "config-content": "{\"mcpServers\":{}}",
     "config-file": "./templates/base.json"
   }
   ```

2. **Create Specific Configuration Based on Template**:
   ```
   Use tool: mcp-all-in-one-show-mcp-config
   Parameters: {
     "config-file": "./templates/base.json"
   }
   ```

3. **Modify and Apply**:
   ```
   Use tool: mcp-all-in-one-set-mcp-config
   Parameters: {
     "config-content": "{\"mcpServers\":{\"filesystem\":{\"command\":\"npx\",\"args\":[\"-y\",\"@modelcontextprotocol/server-filesystem\",\".\"]}}}",
     "config-file": "./configs/production.json"
   }
   ```

## Best Practices

### 1. Configuration Backup

mcp-all-in-one automatically creates backups when you modify configurations, backup files are named in the format:
`filename.backup.timestamp`

For example: `mcp.json.backup.2023-12-01T10-30-00-000Z`

### 2. Configuration Validation

Before applying new configuration, always use `mcp-all-in-one-validate-mcp-config` to validate configuration:

```
Use tool: mcp-all-in-one-validate-mcp-config
Parameters: {
  "config-file": "/path/to/your/mcp.json"
}
```

### 3. Progressive Modification

For complex configuration changes, it's recommended to adopt a progressive approach:

1. First apply small-scale changes
2. Verify if changes take effect
3. Continue with the next round of changes

### 4. Environment Variable Usage

Use environment variables in configuration to make it more flexible:

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

## Troubleshooting

### 1. Configuration Not Taking Effect

If configuration changes don't take effect:

1. Confirm mcp-all-in-one service has been restarted
2. Check if configuration file path is correct
3. Verify if configuration format is correct

### 2. JSON Format Error

If you encounter JSON format errors:

1. Use `mcp-all-in-one-validate-mcp-config` to validate configuration
2. Check escape characters in JSON string
3. Ensure all quotes and brackets match

### 3. Service Connection Failed

If service connection fails:

1. Check if service configuration is correct
2. Verify network connection and authentication information
3. Check mcp-all-in-one logs for more information

## Summary

mcp-all-in-one's self-configuration feature provides powerful and flexible configuration management capabilities, enabling you to dynamically manage MCP services in your IDE without manually editing configuration files. By properly using these tools, you can:

1. Quickly add, remove, or modify MCP services
2. Validate configuration correctness
3. Manage configurations for different environments
4. Achieve service failover and high availability

We hope this guide helps you better use mcp-all-in-one's self-configuration features! If you have any questions or suggestions, feel free to submit an Issue or Pull Request.