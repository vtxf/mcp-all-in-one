# 自我配置工具测试规范

## 概述

本目录包含mcp-all-in-one自我配置工具的完整测试规范，涵盖所有4个自我配置工具的STDIO模式测试用例。

## 工具列表

1. **mcp-all-in-one-validate-mcp-config** - 验证MCP配置文件的正确性
2. **mcp-all-in-one-show-mcp-config** - 显示MCP配置文件内容
3. **mcp-all-in-one-show-mcp-config-schema** - 显示MCP配置的JSON Schema
4. **mcp-all-in-one-set-mcp-config** - 设置MCP配置

## 文件结构

```
self-config-tools-testing/
├── spec.md                    # 主测试规范文档
├── README.md                  # 本文件
├── test-config.json          # 测试用配置文件
├── invalid-config.json       # 无效配置文件（用于错误测试）
└── examples/                 # 测试示例目录
    ├── basic-usage.md        # 基本使用示例
    ├── error-handling.md     # 错误处理示例
    └── performance.md        # 性能测试示例
```

## 测试执行

### 前置条件

1. 确保mcp-all-in-one已构建：
```bash
npm run build
```

2. 准备测试环境：
```bash
cd openspec/specs/self-config-tools-testing
```

### 基本测试流程

1. **启动STDIO模式服务：**
```bash
node ../../dist/index.js stdio -c ../../example.mcp.json
```

2. **发送测试请求：**
将测试用例中的JSON输入复制到终端，观察输出结果

3. **验证结果：**
对比实际输出与预期输出，确保功能正常

### 自动化测试

可以使用以下脚本进行自动化测试：

```bash
# 运行所有自我配置工具测试
npm run test:self-config-tools

# 运行特定工具测试
npm run test:validate-config
npm run test:show-config
npm run test:show-schema
npm run test:set-config
```

## 测试覆盖

### 功能测试
- ✅ 基本功能验证
- ✅ 参数验证
- ✅ 错误处理
- ✅ 边界条件测试

### 集成测试
- ✅ 工作流测试
- ✅ 多工具协作
- ✅ 配置文件管理

### 性能测试
- ✅ 大配置文件处理
- ✅ 并发请求处理
- ✅ 响应时间测试

### 安全测试
- ✅ 路径遍历防护
- ✅ 敏感信息遮蔽
- ✅ 输入验证

## 测试数据

### 配置文件
- `example.mcp.json` - 主配置文件（位于项目根目录）
- `test-config.json` - 基础测试配置
- `invalid-config.json` - 无效配置测试

### 环境变量
- `MCP_TEST_MODE=true` - 启用测试模式
- `MCP_LOG_LEVEL=info` - 设置日志级别
- `NODE_ENV=test` - 设置Node.js环境

## 故障排除

### 常见问题

1. **工具未找到错误**
   - 确保mcp-all-in-one版本支持自我配置工具
   - 检查服务是否正确启动

2. **配置文件路径错误**
   - 使用相对路径时确保正确的工作目录
   - 检查文件是否存在且可读

3. **权限问题**
   - 确保对配置文件目录有读写权限
   - 检查备份文件创建权限

### 调试技巧

1. **启用详细日志：**
```bash
MCP_LOG_LEVEL=debug node ../../dist/index.js stdio -c ../../example.mcp.json
```

2. **检查配置文件：**
```json
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"mcp-all-in-one-show-mcp-config","arguments":{}}}
```

3. **验证配置：**
```json
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"mcp-all-in-one-validate-mcp-config","arguments":{}}}
```

## 贡献指南

### 添加新测试用例

1. 在`spec.md`中添加测试用例描述
2. 提供输入和预期输出
3. 更新测试覆盖范围
4. 添加相应的测试数据文件

### 更新规范

1. 修改`spec.md`中的相关内容
2. 更新版本号
3. 添加变更记录
4. 通知团队成员

## 版本历史

- **v1.0.0** (2025-10-27) - 初始版本，包含4个自我配置工具的完整测试规范

## 联系信息

如有问题或建议，请联系：
- 项目维护者：vtxf <vtxf@qq.com>
- 项目地址：https://github.com/vtxf/mcp-all-in-one