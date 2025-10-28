# Schema 参考文件

本目录包含 mcp-all-in-one 项目的JSON Schema定义文件，用于配置验证和开发工具支持。

## 文件说明

### mcp.schema.json
MCP配置文件的完整JSON Schema定义。

**用途**:
- 验证 `mcp.json` 配置文件格式
- 提供配置编辑器的智能提示
- 生成配置文件模板
- 确保配置文件的一致性

**结构**:
```json
{
  "mcpServers": {
    "server-name": {
      "type": "stdio|http|sse",
      // 服务配置参数
    }
  }
}
```

### cli.schema.json
CLI命令行参数的完整JSON Schema定义。

**用途**:
- 验证命令行参数格式
- 生成自动补全脚本
- 提供命令行帮助信息
- 确保参数的一致性

**结构**:
- `global`: 全局CLI配置
- `commands`: 子命令定义 (stdio/http/sse)
- `globalFlags`: 全局标志命令

### cli.example.json
CLI命令行参数的详细使用示例。

**用途**:
- 提供各种命令的使用示例
- 展示参数解析结果
- 说明错误情况和约束
- 提供高级使用场景

**结构**:
- `stdio`: STDIO模式使用示例
- `http`: HTTP模式使用示例
- `sse`: SSE模式使用示例
- `globalFlags`: 全局标志命令示例
- `helpAndVersion`: 帮助和版本信息示例
- `errorCases`: 错误情况示例
- `advancedUsage`: 高级使用示例
- `parameterReference`: 参数详细说明

## 使用方法

### 1. 配置文件验证
```bash
# 使用 ajv 等工具验证配置文件
npx ajv validate -s mcp.schema.json -d config.json
```

### 2. IDE 集成
在 VSCode 中安装 JSON Schema 扩展，然后在项目根目录创建 `.vscode/settings.json`:

```json
{
  "json.schemas": [
    {
      "fileMatch": ["mcp.json"],
      "schema": "./openspec/specs/directory-structure/refs/schemas/mcp.schema.json"
    }
  ]
}
```

### 3. CLI参数参考
查看 `cli.example.json` 获取详细的命令行使用示例：
```bash
# 查看HTTP模式使用示例
cat openspec/specs/directory-structure/refs/schemas/cli.example.json | jq '.examples.http'

# 查看配置管理命令示例
cat openspec/specs/directory-structure/refs/schemas/cli.example.json | jq '.examples.globalFlags'

# 查看错误情况示例
cat openspec/specs/directory-structure/refs/schemas/cli.example.json | jq '.examples.errorCases'
```

### 4. 代码生成
使用这些schema可以生成：
- TypeScript 类型定义
- 配置验证代码
- 命令行解析器
- 自动补全脚本

## 版本信息

- Schema 版本: 1.0.0
- JSON Schema 规范: Draft 07
- 兼容 Node.js 22+
- 依赖 ajv 8+ 进行验证

## 更新记录

当项目功能更新时，需要同步更新这些schema文件：

1. **新增MCP服务类型**: 更新 `mcp.schema.json` 中的 `definitions`
2. **新增命令行参数**: 更新 `cli.schema.json` 中的 `commands` 或 `globalFlags`
3. **修改配置结构**: 更新相应的schema定义和示例

## 注意事项

- 所有字符串值都支持环境变量替换，格式为 `${VARIABLE_NAME}`
- 端口号范围: 1024-65535
- 超时时间单位: 毫秒
- 服务器名称必须符合正则表达式: `^[^\s\$\{\}]+$`

## 示例配置

详细的配置示例请参考各个schema文件中的 `examples` 部分。