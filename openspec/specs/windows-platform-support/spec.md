# Windows平台支持规范

## 注意
当前文件是Windows平台支持的专门规范文件，本文件中的所有内容必须严格遵守。

## 目标
确保mcp-all-in-one在Windows平台上能够正确执行stdio类型的MCP服务，解决Windows系统下命令执行环境限制导致的问题。

## 问题描述

### Windows系统下的限制
在Windows系统中，当程序在stdio模式下运行时，直接执行某些命令（如`npx`、`npm`、`python`等）可能会失败，原因包括：

1. **环境限制**：stdio模式缺乏完整的Shell环境
2. **PATH解析问题**：无法正确查找和执行需要通过PATH定位的程序
3. **命令解析机制**：Windows特定的命令行解析机制在受限环境中无法正常工作

### 现象表现
- 执行命令时提示"不是内部或外部命令，也不是可运行的程序或批处理文件"
- 程序没有任何输出直接退出
- 在普通命令行中可以正常运行的命令在MCP环境中失败

## 解决方案

### 核心策略：Windows平台自动添加cmd /c前缀

在代码实现中，当检测到当前平台为Windows时，自动为stdio类型的MCP服务命令添加 `cmd /c` 前缀。

## 代码实现规范

### 1. 平台检测
```typescript
function isWindows(): boolean {
  return process.platform === 'win32';
}
```

### 2. 命令包装实现
```typescript
function wrapCommandForWindows(
  command: string,
  args: string[]
): { command: string; args: string[] } {

  // 非Windows平台不处理
  if (process.platform !== 'win32') {
    return { command, args };
  }

  // Windows平台自动添加cmd /c前缀
  return {
    command: 'cmd',
    args: ['/c', command, ...args]
  };
}
```

### 3. 完整的命令执行实现
```typescript
import { spawn } from 'child_process';

interface CommandResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  error?: Error;
}

async function executeMcpServer(
  originalCommand: string,
  originalArgs: string[],
  options: {
    cwd?: string;
    env?: Record<string, string>;
    timeout?: number;
  } = {}
): Promise<CommandResult> {

  // 1. 包装命令以支持Windows
  const { command, args } = wrapCommandForWindows(originalCommand, originalArgs);

  // 2. 执行命令
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: options.timeout || 30000
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        stdout,
        stderr
      });
    });

    child.on('error', (error) => {
      resolve({
        success: false,
        error
      });
    });
  });
}
```

### 4. MCP服务器连接实现
```typescript
async function connectToStdioServer(
  serverConfig: {
    command: string;
    args: string[];
    cwd?: string;
    env?: Record<string, string>;
    timeout?: number;
  }
): Promise<MCPClient> {

  // 包装命令以支持Windows
  const { command, args } = wrapCommandForWindows(
    serverConfig.command,
    serverConfig.args
  );

  // 使用@modelcontextprotocol/sdk连接
  const transport = new StdioClientTransport({
    command,
    args,
    cwd: serverConfig.cwd,
    env: serverConfig.env
  });

  const client = new MCPClient(transport);
  await client.connect();

  return client;
}
```

## 何时添加cmd /c前缀

### 需要添加前缀的命令类型
- **Node.js工具**：`npx`、`npm`、`node`
- **Python工具**：`python`、`pip`、`uvx`、`uv`
- **版本控制**：`git`
- **包管理器**：`yarn`、`pnpm`、`conda`
- **开发工具**：`cargo`、`go`、`java`、`mvn`
- **任何需要通过PATH查找的可执行程序**

### 不需要添加前缀的情况
- **绝对路径**：`"C:\\Program Files\\nodejs\\node.exe"`
- **相对路径**：`"./node_modules/.bin/server"`
- **Windows内部命令**：`cmd`、`ping`、`ipconfig`、`dir`、`copy`

### 自动判断逻辑（可选优化）
```typescript
function needsShellPrefix(command: string): boolean {
  // 绝对路径不需要
  if (path.isAbsolute(command)) {
    return false;
  }

  // 相对路径不需要
  if (command.startsWith('./') || command.startsWith('../')) {
    return false;
  }

  // 包含路径分隔符的不需要
  if (command.includes('/') || command.includes('\\')) {
    return false;
  }

  // Windows内置命令不需要
  const windowsInternalCommands = ['ping', 'ipconfig', 'dir', 'copy', 'del'];
  if (windowsInternalCommands.includes(command.toLowerCase())) {
    return false;
  }

  // 其他情况需要添加前缀
  return true;
}

function wrapCommandForWindows(
  command: string,
  args: string[]
): { command: string; args: string[] } {

  if (process.platform !== 'win32' || !needsShellPrefix(command)) {
    return { command, args };
  }

  return {
    command: 'cmd',
    args: ['/c', command, ...args]
  };
}
```

## 测试要求

### 单元测试
```typescript
describe('Windows Platform Support', () => {
  beforeEach(() => {
    // 模拟Windows平台
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      writable: true
    });
  });

  test('should wrap npx command with cmd prefix', () => {
    const result = wrapCommandForWindows('npx', ['@modelcontextprotocol/server-filesystem']);

    expect(result.command).toBe('cmd');
    expect(result.args).toEqual(['/c', 'npx', '@modelcontextprotocol/server-filesystem']);
  });

  test('should not wrap absolute path commands', () => {
    const result = wrapCommandForWindows('C:\\Program Files\\app\\server.exe', []);

    expect(result.command).toBe('C:\\Program Files\\app\\server.exe');
    expect(result.args).toEqual([]);
  });

  test('should not wrap relative path commands', () => {
    const result = wrapCommandForWindows('./node_modules/.bin/server', ['--port', '8080']);

    expect(result.command).toBe('./node_modules/.bin/server');
    expect(result.args).toEqual(['--port', '8080']);
  });
});
```

### 集成测试
```typescript
describe('Windows Integration Tests', () => {
  test('should start npx server on Windows', async () => {
    if (process.platform !== 'win32') {
      return; // 跳过非Windows平台
    }

    const result = await executeMcpServer('npx', ['--version']);

    expect(result.success).toBe(true);
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
  });
});
```

## 错误处理

### 常见错误及处理
```typescript
async function executeWithRetry(
  command: string,
  args: string[],
  maxRetries: number = 2
): Promise<CommandResult> {

  let lastError: Error | null = null;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await executeMcpServer(command, args);
      if (result.success) {
        return result;
      }
      lastError = new Error(result.stderr || 'Command failed');
    } catch (error) {
      lastError = error as Error;
    }

    // 如果不是第一次尝试，等待一下再重试
    if (i < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw lastError || new Error('Unknown error');
}
```

### 错误日志记录
```typescript
function logCommandExecution(
  originalCommand: string,
  originalArgs: string[],
  wrappedCommand: string,
  wrappedArgs: string[],
  result: CommandResult
) {
  if (process.env.LOG_LEVEL === 'debug') {
    console.debug(`[Windows] Original command: ${originalCommand} ${originalArgs.join(' ')}`);
    console.debug(`[Windows] Wrapped command: ${wrappedCommand} ${wrappedArgs.join(' ')}`);
    console.debug(`[Windows] Result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  }

  if (!result.success) {
    console.error(`[Windows] Command failed: ${originalCommand} ${originalArgs.join(' ')}`);
    console.error(`[Windows] Error: ${result.stderr || result.error?.message}`);
  }
}
```

## 性能考虑

### CMD启动开销
- CMD启动速度快，资源占用少
- 无需检测Shell可用性，简化实现
- 长时间运行的MCP服务，启动开销可忽略

### 内存使用
- Shell包装会额外占用少量内存
- 对于大量并发MCP服务，需要考虑资源限制

## 安全考虑

### 命令注入防护
```typescript
function sanitizeArgs(args: string[]): string[] {
  return args.map(arg => {
    // 转义特殊字符
    return arg.replace(/["%&|<>^]/g, '^$&');
  });
}

function wrapCommandForWindowsSecure(
  command: string,
  args: string[]
): { command: string; args: string[] } {

  if (process.platform !== 'win32' || !needsShellPrefix(command)) {
    return { command, args: sanitizeArgs(args) };
  }

  return {
    command: 'cmd',
    args: ['/c', command, ...sanitizeArgs(args)]
  };
}
```

## 故障排除

### 常见问题及解决方案

#### 1. PATH环境变量问题
```
错误：找不到命令 'npx'
解决：确保Node.js和npm已正确安装并添加到PATH
检查方法：在cmd中执行 where npx
```

#### 2. 权限不足
```
错误：访问被拒绝
解决：以管理员身份运行或检查文件权限
确保用户对执行目录有读写权限
```

#### 3. 命令执行失败
```
错误：命令执行返回非零退出码
解决：检查MCP服务是否正确安装
尝试在cmd中手动执行完整命令进行调试
```

### 调试模式
启用详细日志记录：
```bash
mcp-all-in-one stdio --log-level debug --mcp-config config.json
```

## 版本兼容性承诺
- 保持向后兼容性，现有配置无需修改
- Windows支持完全透明，用户无需感知
- 新功能通过代码实现，不影响配置格式