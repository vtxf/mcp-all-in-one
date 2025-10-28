# Test Sample Specification

这个目录包含了用于测试mcp-all-in-one项目的测试样例规范。

## 文件说明

- `spec.md` - 测试样例规范文档，定义了基于example.mcp.json的具体测试场景
- `README.md` - 本文件，说明如何使用测试样例

## 测试配置文件

本测试样例使用 `openspec/specs/constitution/example.mcp.json` 作为测试配置文件，该文件包含：
- zhipu-web-search (HTTP类型)
- context7 (npx命令类型)
- Time (uvx命令类型)
- Filesystem (npx命令类型)
- chrome-devtools (npx命令类型)

## 测试执行

### 1. stdio模式测试
```bash
mcp-all-in-one stdio --mcp-config openspec/specs/constitution/example.mcp.json
```

### 2. HTTP模式测试
```bash
mcp-all-in-one http --mcp-config openspec/specs/constitution/example.mcp.json --port 8080 --host 127.0.0.1 --cors true
```

### 3. SSE模式测试
```bash
mcp-all-in-one sse --mcp-config openspec/specs/constitution/example.mcp.json --port 8081
```

### 4. 环境变量测试
```bash
# Windows PowerShell
$env:Z_AI_API_KEY="test_key_123"
mcp-all-in-one stdio --mcp-config openspec/specs/constitution/example.mcp.json

# Linux/Mac
export Z_AI_API_KEY="test_key_123"
mcp-all-in-one stdio --mcp-config openspec/specs/constitution/example.mcp.json
```

### 5. 默认配置文件测试
```bash
mcp-all-in-one stdio
```

## 预期结果

请参考 spec.md 文件中每个测试场景的"预期输出"部分。