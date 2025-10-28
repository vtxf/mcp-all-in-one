# MCP自我配置工具规范

## 功能概述

为mcp-all-in-one添加MCP自我配置功能，提供四个MCP工具用于配置管理。

## 当前配置的定义和获取机制

### 当前配置的定义
- **当前配置**指的是启动mcp-all-in-one服务时实际使用的MCP配置文件
- 当前配置通过命令行参数`--mcp-config <path>`指定，或使用默认路径
- 当前配置文件路径在服务启动时确定，并在整个服务生命周期内保持不变

### 当前配置文件路径的确定规则
1. **显式指定**: 用户通过`--mcp-config`参数指定具体路径
2. **默认路径**: 未指定时使用`~/.mcp-all-in-one/mcp.json`
3. **路径解析**: 支持相对路径、绝对路径和`~`开头的路径
4. **实际路径**: 使用ConfigLoader.resolveConfigPath()解析后的绝对路径

### 当前配置存储要求
- 所有MCP服务器类必须存储当前配置文件路径
- 配置文件路径在服务器构造函数中传入并存储为实例属性
- 自我配置工具通过服务器实例获取当前配置文件路径

### 当前配置的使用场景
当MCP客户端调用自我配置工具且不提供`config-file`参数时：
- 工具应该使用当前服务的配置文件路径
- 确保操作的是服务实际使用的配置文件
- 提供一致的用户体验，避免用户需要记住配置文件路径

## ADDED Requirements

### 1. 配置验证工具

#### Requirement: MCP服务器必须提供validate-mcp-config工具
**描述**: mcp-all-in-one作为MCP服务器时，必须提供validate-mcp-config工具，用于验证MCP配置文件的正确性。

#### Scenario: 验证当前配置文件
- **WHEN** MCP客户端调用validate-mcp-config工具，不提供config-file参数时
- **THEN** 工具应该验证当前mcp-all-in-one服务使用的配置文件，并返回验证结果

#### Scenario: 验证指定配置文件
- **WHEN** MCP客户端调用validate-mcp-config工具，提供config-file参数时
- **THEN** 工具应该验证指定的配置文件，并返回验证结果，包括具体的错误位置和信息

### 2. 配置显示工具

#### Requirement: MCP服务器必须提供show-mcp-config工具
**描述**: mcp-all-in-one作为MCP服务器时，必须提供show-mcp-config工具，用于显示MCP配置文件内容。

#### Scenario: 显示当前配置
- **WHEN** MCP客户端调用show-mcp-config工具，不提供config-file参数时
- **THEN** 工具应该返回当前mcp-all-in-one服务使用的配置文件内容，环境变量应该被替换为实际值

#### Scenario: 显示指定配置文件
- **WHEN** MCP客户端调用show-mcp-config工具，提供config-file参数时
- **THEN** 工具应该返回指定配置文件的内容，如果文件不存在则返回错误

### 3. 配置Schema工具

#### Requirement: MCP服务器必须提供show-mcp-config-schema工具
**描述**: mcp-all-in-one作为MCP服务器时，必须提供show-mcp-config-schema工具，用于获取MCP配置的JSON Schema。

#### Scenario: 获取配置Schema
- **WHEN** MCP客户端调用show-mcp-config-schema工具时
- **THEN** 工具应该返回完整的MCP配置JSON Schema，包括所有字段定义和验证规则

### 4. 配置设置工具

#### Requirement: MCP服务器必须提供set-mcp-config工具
**描述**: mcp-all-in-one作为MCP服务器时，必须提供set-mcp-config工具，用于动态设置MCP配置。

#### Scenario: 设置当前配置
- **WHEN** MCP客户端调用set-mcp-config工具，不提供config-file参数时
- **THEN** 工具应该修改当前mcp-all-in-one服务使用的配置文件，创建备份，并提醒用户需要手动重启服务

#### Scenario: 设置指定配置文件
- **WHEN** MCP客户端调用set-mcp-config工具，提供config-file参数时
- **THEN** 工具应该修改指定的配置文件，创建备份，如果修改的是当前使用的配置，则提醒用户需要手动重启服务

## 工具定义

### 1. validate-mcp-config

**工具名称**: `validate-mcp-config`

**参数**:
```json
{
  "properties": {
    "config-file": {
      "type": "string",
      "description": "配置文件路径，未指定时验证当前服务使用的配置文件"
    }
  },
  "type": "object"
}
```

**返回值**:
```json
{
  "type": "object",
  "properties": {
    "valid": {
      "type": "boolean",
      "description": "配置是否有效"
    },
    "errors": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "验证错误列表"
    },
    "config-path": {
      "type": "string",
      "description": "验证的配置文件路径"
    }
  }
}
```

### 2. show-mcp-config

**工具名称**: `show-mcp-config`

**参数**:
```json
{
  "properties": {
    "config-file": {
      "type": "string",
      "description": "配置文件路径，未指定时显示当前服务使用的配置文件"
    }
  },
  "type": "object"
}
```

**返回值**:
```json
{
  "type": "object",
  "properties": {
    "config": {
      "description": "配置内容"
    },
    "config-path": {
      "type": "string",
      "description": "配置文件路径"
    },
    "env-expanded": {
      "type": "boolean",
      "description": "环境变量是否已展开"
    }
  }
}
```

### 3. show-mcp-config-schema

**工具名称**: `show-mcp-config-schema`

**参数**: 无

**返回值**:
```json
{
  "type": "object",
  "properties": {
    "schema": {
      "description": "MCP配置的JSON Schema"
    },
    "schema-version": {
      "type": "string",
      "description": "Schema版本"
    }
  }
}
```

### 4. set-mcp-config

**工具名称**: `set-mcp-config`

**参数**:
```json
{
  "properties": {
    "config-file": {
      "type": "string",
      "description": "配置文件路径，未指定时修改当前服务使用的配置文件"
    },
    "config-content": {
      "type": "string",
      "description": "新的配置内容（JSON字符串）"
    }
  },
  "required": ["config-content"],
  "type": "object"
}
```

**返回值**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "description": "设置是否成功"
    },
    "config-path": {
      "type": "string",
      "description": "修改的配置文件路径"
    },
    "backup-path": {
      "type": "string",
      "description": "备份文件路径"
    },
    "restart-required": {
      "type": "boolean",
      "description": "是否需要重启服务"
    },
    "restart-message": {
      "type": "string",
      "description": "重启提示信息"
    },
    "errors": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "错误列表"
    }
  }
}
```

## 错误处理

### 1. 文件访问错误
- **文件不存在**: 返回明确的错误信息，包括文件路径
- **权限不足**: 返回权限错误，建议用户检查文件权限
- **JSON格式错误**: 返回具体的JSON解析错误和行号信息

### 2. 配置验证错误
- **格式错误**: 返回详细的验证错误，包括字段路径和错误原因
- **环境变量错误**: 返回缺失或无效的环境变量信息

### 3. 配置设置错误
- **写入失败**: 返回写入失败的具体原因
- **备份失败**: 如果备份创建失败，应该中止操作并返回错误
- **重启提醒**: 如果修改的是当前使用的配置，必须在返回结果中包含重启提示信息和重启建议命令

## 安全考虑

### 1. 文件访问限制
- 只允许修改用户目录下的文件
- 禁止修改系统关键文件
- 检查文件路径是否在允许的范围内

### 2. 备份机制
- 每次修改前必须创建备份
- 备份文件应该有时间戳
- 保留多个备份版本以便恢复

### 3. 配置验证
- 所有新配置必须通过验证才能写入
- 验证失败时不应修改原配置文件
- 提供详细的验证错误信息

### 4. 重启提醒机制
- 修改当前使用的配置后必须提醒用户重启
- 提供具体的重启命令建议
- 不尝试自动重载，保持服务稳定性

### 5. 当前配置路径存储
- 服务器启动时必须确定并存储实际使用的配置文件路径
- 配置文件路径应该是解析后的绝对路径
- 自我配置工具必须通过服务器实例获取当前配置路径
- 禁止使用默认路径推断，必须使用实际传入的配置文件路径

## 性能要求

### 1. 响应时间
- 配置验证应该在1秒内完成
- 配置显示应该在500毫秒内完成
- 配置设置应该在2秒内完成

### 2. 并发处理
- 支持多个MCP客户端同时调用工具
- 配置设置操作应该串行化，避免冲突
- 使用适当的锁机制保护配置文件

### 3. 资源使用
- 工具调用不应占用过多内存
- 大配置文件的处理应该流式化
- 及时释放文件句柄和其他资源