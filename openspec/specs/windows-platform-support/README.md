# Windows平台支持规范

## 概述

本规范解决了mcp-all-in-one在Windows平台上stdio模式MCP服务的命令执行问题。**核心是在代码实现中自动处理，用户配置无需任何改动。**

## 核心原则

### ✅ 正确的做法
- **代码层面处理**：检测到Windows平台时自动添加 `cmd /c` 前缀
- **配置透明**：用户的MCP配置文件完全不需要改动
- **统一接口**：Windows用户使用相同的配置文件

### ❌ 错误的做法
- 添加Windows特殊配置字段
- 创建Windows特殊配置文件
- 要求用户修改配置以支持Windows

## 代码实现要点

### 核心函数
```typescript
function wrapCommandForWindows(command: string, args: string[]) {
  // Windows平台自动添加cmd /c前缀
  if (process.platform === 'win32') {
    return {
      command: 'cmd',
      args: ['/c', command, ...args]
    };
  }
  // 其他平台直接返回
  return { command, args };
}
```

### 何时添加cmd /c前缀
- ✅ `npx`, `npm`, `python`, `git` 等需要PATH查找的命令
- ❌ 绝对路径 `C:\Program Files\app.exe`
- ❌ 相对路径 `./node_modules/.bin/server`
- ❌ Windows内置命令 `ping`, `ipconfig`

## 文件结构

```
windows-platform-support/
├── spec.md                    # 详细的技术实现规范
├── README.md                  # 本文件，概述和要点
├── schemas.bak/              # 已废弃的Schema文件（保留用于参考）
└── example-windows.mcp.json.bak  # 已废弃的示例文件（保留用于参考）
```

## 开发者须知

1. **用户配置不变**：不要修改任何用户的MCP配置文件
2. **代码透明处理**：所有Windows特殊处理都在代码层面完成
3. **向后兼容**：确保现有用户无需任何改动即可在Windows上使用

## 测试验证

```bash
# 在Windows上测试
mcp-all-in-one stdio --mcp-config your-existing-config.json

# 应该正常工作，无需任何特殊配置
```

## 总结

Windows支持应该是完全透明的，用户根本不需要知道这个功能的存在。所有的复杂性都应该在代码层面解决。