# MCP工具映射表示例

本文档说明mcp-all-in-one服务如何实现工具名映射，以避免多个MCP服务间的工具名冲突。

## 映射规则

### 命名规则
- **代理工具名**: `{serviceName}__{toolName}`
- **服务名**: 来自mcp.json中的服务键名
- **工具名**: 来自MCP服务的原始工具名

### 映射表示例

基于`openspec/specs/test-sample/mcp.json`配置：

```json
{
  "toolMapping": {
    "Time__get_current_time": {
      "service": "Time",
      "originalTool": "get_current_time",
      "proxyTool": "Time__get_current_time"
    },
    "zhipu-web-search__web_search": {
      "service": "zhipu-web-search",
      "originalTool": "web_search",
      "proxyTool": "zhipu-web-search__web_search"
    }
  }
}
```

## 实现逻辑

### 1. 工具列表合并 (tools/list)
```typescript
// 收集所有MCP服务的工具
const allTools = [];
for (const [serviceName, mcpService] of mcpServers) {
  const tools = await mcpService.listTools();
  for (const tool of tools.tools) {
    // 创建代理工具
    const proxyTool = {
      ...tool,
      name: `${serviceName}__${tool.name}`,
      description: `[${serviceName}] ${tool.description}`
    };
    allTools.push(proxyTool);

    // 记录映射关系
    toolMapping[proxyTool.name] = {
      service: serviceName,
      originalTool: tool.name,
      proxyTool: proxyTool.name
    };
  }
}
```

### 2. 工具调用转发 (tools/call)
```typescript
async function callTool(name: string, arguments: any) {
  const mapping = toolMapping[name];
  if (!mapping) {
    throw new Error(`Tool '${name}' not found`);
  }

  // 获取对应的MCP服务
  const mcpService = mcpServers.get(mapping.service);
  if (!mcpService) {
    throw new Error(`Service '${mapping.service}' not available`);
  }

  // 转发工具调用
  return await mcpService.callTool({
    name: mapping.originalTool,
    arguments
  });
}
```

### 3. 错误处理
- 工具不存在时，返回标准的JSON-RPC错误码 -32601
- 服务不可用时，返回 -32603 并包含服务信息
- 参数验证错误应包含原始工具的参数信息

## 测试验证

测试用例应验证：
1. 工具列表包含重命名后的工具
2. 工具调用能正确转发到对应服务
3. 错误处理包含正确的服务信息
4. 映射关系在服务重启后保持一致

## 扩展性考虑

当添加新的MCP服务时：
- 自动检查工具名冲突
- 按相同规则生成代理工具名
- 更新工具映射表
- 确保向后兼容性