# constitution

## 注意
当前文件是项目的constitution文件，本文件中的所有内容必须严格遵守。

## 目标
将多个MCP服务合并成一个。比如读取指定的某个mcp的配置文件，然后将该配置文件中所有的mcp合并成一个，再对外提供服务。
需要可以接入http/sse/stdio类型的MCP服务，同时对外提供一个http/sse/stdio类型的服务。

## 解决的痛点
用户在使用Claude Code、Codex等AI工具，他们作为MCP客户端，往往会用到非常多的MCP服务。
每个MCP客户端都需要重复配置很多MCP服务，配置命令和配置文件还都有很大差别，对用户来说是一个非常麻烦的事情。
本项目就是为了解决这个痛点。把若干个MCP服务配置到一个mcp.json文件中，通过mcp-all-in-one合并成一个MCP服务。
之后在不同的MCP客户端使用时，每个客户端都只需要配置一个MCP服务即可！这将节省用户大量时间。

## 命令
mcp-all-in-one [subcommand]
子命令有 http/sse/stdio

### stdio子命令
mcp-all-in-one stdio --mcp-config <mcp-config-file> --log-level <log-level> --silent

参数
- `--mcp-config <mcp-config-file>`：指定MCP配置文件的路径，未配置时则指向默认使用用户目录下.mcp-all-in-one/mcp.json。该文件未创建时需要自动创建
- `--log-level <log-level>`：指定日志级别，可选值为：error、warn、info、debug，默认为info
- `--silent`：启用静默模式，完全禁用日志输出，优先级高于--log-level

### http子命令
mcp-all-in-one http --mcp-config <mcp-config-file> --port <port> --host <host> --cors <cors> --log-level <log-level> --silent

参数
- `--mcp-config <mcp-config-file>`：指定MCP配置文件的路径，未配置时则指向默认使用用户目录下.mcp-all-in-one/mcp.json。该文件未创建时需要自动创建
- `--port <port>`：指定HTTP服务的端口号，默认值为3095。
- `--host <host>`：指定HTTP服务的IP地址，默认值为127.0.0.1。
- `--cors <cors>`：指定是否开启CORS，默认值为false。
- `--log-level <log-level>`：指定日志级别，可选值为：error、warn、info、debug，默认为info
- `--silent`：启用静默模式，完全禁用日志输出，优先级高于--log-level

### sse子命令
mcp-all-in-one sse --mcp-config <mcp-config-file> --port <port> --host <host> --cors <cors> --log-level <log-level> --silent

参数
- `--mcp-config <mcp-config-file>`：指定MCP配置文件的路径，未配置时则指向默认使用用户目录下.mcp-all-in-one/mcp.json。该文件未创建时需要自动创建
- `--port <port>`：指定HTTP服务的端口号，默认值为3095。
- `--host <host>`：指定HTTP服务的IP地址，默认值为127.0.0.1。
- `--cors <cors>`：指定是否开启CORS，默认值为false。
- `--log-level <log-level>`：指定日志级别，可选值为：error、warn、info、debug，默认为info
- `--silent`：启用静默模式，完全禁用日志输出，优先级高于--log-level

## 日志系统要求

### 容错性要求
- **日志系统不得影响系统正常运行**: 日志系统的任何故障都不应导致MCP服务代理功能异常
- **日志系统注释后系统仍正常工作**: 即使注释掉所有日志相关代码，系统核心功能必须能够正常运行
- **异步日志处理**: 所有日志操作必须异步执行，不阻塞主要业务流程
- **异常隔离**: 日志写入失败、格式化错误等日志系统内部异常必须被完全隔离，不向上传播

### 日志输出目标
- **双重输出**: 必须同时输出到日志文件和控制台
- **日志文件路径**: 用户目录下的~/.mcp-all-in-one/logs/目录，自动创建目录结构
- **文件命名**: 按日期命名，格式：mcp-all-in-one-YYYY-MM-DD.log
- **无轮转机制**: 不支持日志轮转，每次运行创建新文件，文件管理由用户自行负责
- **stdio模式特殊处理**: 只输出到标准错误（stderr），不输出到标准输出，避免与MCP协议通信冲突
- **http/sse模式**: 输出到标准输出（stdout），支持颜色区分不同级别
- **静默模式**: --silent参数完全禁用所有输出，包括文件和控制台

### 日志文件规则
- **文件创建**: 程序启动时自动创建日志目录和文件
- **文件权限**: 日志文件使用默认权限，用户可读写
- **文件格式**: 纯文本格式，每行一条日志记录
- **时间戳**: 每条日志包含精确的时间戳信息
- **级别标识**: 明确标识日志级别（ERROR、WARN、INFO、DEBUG）
- **内容格式**: [时间戳] [级别] [模块名] 日志内容

## @modelcontextprotocol/sdk 功能

### SDK 主要功能
@modelcontextprotocol/sdk 是MCP协议的官方TypeScript SDK，提供：

1. **传输支持**: stdio、HTTP、SSE三种传输方式
2. **客户端**: 连接MCP服务，调用工具、获取资源
3. **服务器**: 创建MCP服务，提供工具、资源和提示
4. **类型安全**: 完整的TypeScript类型支持

### 在项目中的作用
1. **连接多个MCP服务**: 作为客户端连接到各个MCP服务
2. **统一对外服务**: 作为服务器将所有功能统一暴露
3. **协议适配**: 处理不同传输协议的差异

## 其他
1. 务必使用最新版的 @modelcontextprotocol/sdk 库！
2. mcp-config-file这个json文件要符合mcp.schema.json中的schema定义。
3. 严禁把MCP配置文件直接叫成配置文件！因为以后有可能扩充别的配置文件！
4. example.mcp.json是一个样例mcp.json，可以作为测试使用！
5. 不需要热重载！
6. 尽可能使用node22内置的库。如果需要使用第三方库，尽可能使用最新的！
7. 这是一个命令行工具，不需要提供api，更不需要使用api的示例代码！
8. 你写代码必须严格遵守openspec/specs文件夹中的规范，但凡不符合规范或者规范中未提到的地方，应该告知用户，让用户来做选择。
