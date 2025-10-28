# workflow-management

## 目标
规范 mcp-all-in-one 程序的运行时工作流程，详细描述程序从启动到处理客户端请求的完整流程，包括配置加载、服务连接、请求处理和错误恢复等关键环节。

## 程序运行流程概览

```mermaid
flowchart TD
    A[程序启动] --> B[解析命令行参数]
    B --> C[加载MCP配置文件]
    C --> D{配置文件存在?}
    D -->|否| E[创建默认配置]
    D -->|是| F[验证配置格式]
    E --> F
    F --> G{配置验证通过?}
    G -->|否| H[报错退出]
    G -->|是| I[初始化日志系统]
    I --> J[启动MCP服务管理器]
    J --> K[连接所有MCP服务]
    K --> L[启动对外服务接口]
    L --> M[监听客户端请求]
    M --> N{收到请求?}
    N -->|是| O[解析请求参数]
    N -->|否| M
    O --> P[路由到目标MCP服务]
    P --> Q[转发请求并等待响应]
    Q --> R[处理响应结果]
    R --> S[返回结果给客户端]
    S --> M
    K --> L

    style A fill:#e1f5fe
    style C fill:#f3e5f5
    style K fill:#e8f5e8
    style L fill:#fff3e0
    style P fill:#fce4ec
    style H fill:#ffebee
```

## 核心运行流程

### 1. 程序启动流程

```mermaid
flowchart TD
    Start([程序启动]) --> ParseArgs[解析命令行参数]
    ParseArgs --> CheckSubcommand{检查子命令}

    CheckSubcommand -->|stdio| StdioMode[STDIO模式]
    CheckSubcommand -->|http| HttpMode[HTTP模式]
    CheckSubcommand -->|sse| SseMode[SSE模式]

    StdioMode --> ParseLogLevel[解析日志级别参数]
    HttpMode --> ParseLogLevel
    SseMode --> ParseLogLevel

    ParseLogLevel --> LoadConfig[加载MCP配置]

    LoadConfig --> ConfigPath{配置文件路径}
    ConfigPath -->|指定路径| UseCustomPath[使用自定义路径]
    ConfigPath -->|未指定| UseDefaultPath[使用默认路径]

    UseCustomPath --> ValidateConfig[验证配置文件]
    UseDefaultPath --> ValidateConfig

    ValidateConfig --> ConfigValid{配置有效?}
    ConfigValid -->|否| ErrorExit[报错退出]
    ConfigValid -->|是| InitLogger[初始化日志系统]

    InitLogger --> StartProxy[启动代理服务]

    style Start fill:#4caf50,color:#fff
    style ErrorExit fill:#f44336,color:#fff
    style ValidateConfig fill:#ff9800,color:#fff
    style StartProxy fill:#4caf50,color:#fff
```

### 2. MCP服务连接流程

```mermaid
flowchart TD
    StartService[启动服务管理器] --> LoadServers[加载服务器配置]
    LoadServers --> IterateServers[遍历所有MCP服务]

    IterateServers --> CheckType{检查服务类型}
    CheckType -->|stdio| ConnectStdio[连接STDIO服务]
    CheckType -->|http| ConnectHttp[连接HTTP服务]
    CheckType -->|sse| ConnectSse[连接SSE服务]

    ConnectStdio --> StartProcess[启动子进程]
    StartProcess --> NextService[下一个服务]

    ConnectHttp --> HttpRequest[发送HTTP请求]
    HttpRequest --> NextService

    ConnectSse --> SseConnect[建立SSE连接]
    SseConnect --> NextService

    NextService --> HasMore{还有服务?}
    HasMore -->|是| IterateServers
    HasMore -->|否| AllConnected[所有服务连接完成]

    style StartService fill:#e1f5fe
    style ConnectStdio fill:#e8f5e8
    style ConnectHttp fill:#e3f2fd
    style ConnectSse fill:#fff3e0
    style AllConnected fill:#4caf50,color:#fff
```

### 3. 请求处理流程

```mermaid
flowchart TD
    ReceiveRequest[接收客户端请求] --> ValidateRequest[验证请求格式]
    ValidateRequest --> RequestValid{请求有效?}
    RequestValid -->|否| SendError[返回错误]
    RequestValid -->|是| ParseRequest[解析请求内容]

    ParseRequest --> IdentifyService[识别目标服务]
    IdentifyService --> ServiceExists{服务存在?}
    ServiceExists -->|否| ServiceNotFound[服务未找到]
    ServiceExists -->|是| ServiceAvailable{服务可用?}

    ServiceAvailable -->|否| ServiceUnavailable[服务不可用]
    ServiceAvailable -->|是| ForwardRequest[转发请求]

    ForwardRequest --> ServiceType{服务类型}
    ServiceType -->|stdio| StdioCall[STDIO调用]
    ServiceType -->|http| HttpCall[HTTP调用]
    ServiceType -->|sse| SseCall[SSE调用]

    StdioCall --> WaitStdio[等待STDIO响应]
    HttpCall --> WaitHttp[等待HTTP响应]
    SseCall --> WaitSse[等待SSE响应]

    WaitStdio --> ProcessResponse[处理响应]
    WaitHttp --> ProcessResponse
    WaitSse --> ProcessResponse

    ProcessResponse --> Success{成功?}
    Success -->|否| HandleError[处理错误]
    Success -->|是| FormatResponse[格式化响应]

    HandleError --> LogError[记录错误日志（容错处理）]
    LogError --> SendErrorResponse[发送错误响应]

    FormatResponse --> SendResponse[发送响应]
    SendError --> End([结束])
    ServiceNotFound --> End
    ServiceUnavailable --> End
    SendErrorResponse --> End
    SendResponse --> End

    style ReceiveRequest fill:#e1f5fe
    style ForwardRequest fill:#e8f5e8
    style ProcessResponse fill:#fff3e0
    style SendResponse fill:#4caf50,color:#fff
    style SendError fill:#f44336,color:#fff
```

### 4. 不同通信模式的处理流程

#### STDIO模式处理流程

```mermaid
flowchart TD
    StdioStart[STDIO模式启动] --> StdioConfig[配置STDIO参数]
    StdioConfig --> StdioServers[连接STDIO服务器]
    StdioServers --> StdioListen[监听标准输入]
    StdioListen --> StdioRequest{收到STDIO请求?}
    StdioRequest -->|是| StdioProcess[处理STDIO请求]
    StdioRequest -->|否| StdioListen
    StdioProcess --> StdioRespond[输出响应到标准输出]
    StdioRespond --> StdioListen

    style StdioStart fill:#e8f5e8
    style StdioConfig fill:#e8f5e8
    style StdioServers fill:#e8f5e8
    style StdioProcess fill:#e8f5e8
    style StdioRespond fill:#e8f5e8
```

#### HTTP模式处理流程

```mermaid
flowchart TD
    HttpStart[HTTP模式启动] --> HttpServer[创建HTTP服务器]
    HttpServer --> HttpConfig[配置HTTP参数]
    HttpConfig --> HttpListen[监听HTTP端口]
    HttpListen --> HttpRequest{收到HTTP请求?}
    HttpRequest -->|是| HttpProcess[处理HTTP请求]
    HttpRequest -->|否| HttpListen
    HttpProcess --> HttpRespond[发送HTTP响应]
    HttpRespond --> HttpListen

    style HttpStart fill:#e3f2fd
    style HttpServer fill:#e3f2fd
    style HttpConfig fill:#e3f2fd
    style HttpProcess fill:#e3f2fd
    style HttpRespond fill:#e3f2fd
```

#### SSE模式处理流程

```mermaid
flowchart TD
    SseStart[SSE模式启动] --> SseServer[创建SSE服务器]
    SseServer --> SseConfig[配置SSE参数]
    SseConfig --> SseConnect[等待SSE连接]
    SseConnect --> SseRequest{收到SSE请求?}
    SseRequest -->|是| SseProcess[处理SSE请求]
    SseRequest -->|否| SseConnect
    SseProcess --> SseRespond[发送SSE响应]
    SseRespond --> SseConnect

    style SseStart fill:#fff3e0
    style SseServer fill:#fff3e0
    style SseConfig fill:#fff3e0
    style SseProcess fill:#fff3e0
    style SseRespond fill:#fff3e0
```

### 5. 错误处理和恢复流程

```mermaid
flowchart TD
    ErrorDetected[检测到错误] --> ErrorType{错误类型}

    ErrorType -->|配置错误| ConfigError[配置错误处理]
    ErrorType -->|连接错误| ConnectionError[连接错误处理]
    ErrorType -->|请求错误| RequestError[请求错误处理]
    ErrorType -->|服务错误| ServiceError[服务错误处理]

    ConfigError --> LogConfigError[记录配置错误]
    LogConfigError --> ExitProgram[退出程序]

    ConnectionError --> CheckRetryPolicy{检查重试策略}
    CheckRetryPolicy -->|可重试| ReconnectService[重新连接服务]
    CheckRetryPolicy -->|不可重试| MarkServiceDown[标记服务下线]

    ReconnectService --> ReconnectSuccess{重连成功?}
    ReconnectSuccess -->|是| ServiceOnline[服务上线]
    ReconnectSuccess -->|否| UpdateRetryCount[更新重试次数]

    UpdateRetryCount --> RetryLimit{达到重试上限?}
    RetryLimit -->|否| CheckRetryPolicy
    RetryLimit -->|是| MarkServiceDown

    RequestError --> ValidateRequestParams[验证请求参数]
    ValidateRequestParams --> ReturnClientError[返回客户端错误]

    ServiceError --> CheckServiceHealth[检查服务健康状态]
    CheckServiceHealth --> ServiceHealthy{服务健康?}
    ServiceHealthy -->|否| RestartService[重启服务]
    ServiceHealthy -->|是| LogServiceError[记录服务错误（容错处理）]

    RestartService --> RestartSuccess{重启成功?}
    RestartSuccess -->|是| ServiceOnline
    RestartSuccess -->|否| MarkServiceDown

    MarkServiceDown --> NotifyClients[通知客户端]
    ServiceOnline --> NotifyClients
    LogServiceError --> ReturnServerError[返回服务错误]
    ReturnClientError --> End([结束])
    ReturnServerError --> End
    NotifyClients --> End
    ExitProgram --> End

    style ErrorDetected fill:#ffebee
    style ConfigError fill:#ffcdd2
    style ConnectionError fill:#f8bbd9
    style RequestError fill:#e1bee7
    style ServiceError fill:#c5cae9
    style ServiceOnline fill:#c8e6c9
    style MarkServiceDown fill:#ffcdd2
```


## ADDED Requirements

### Requirement: 程序启动和初始化
程序必须提供完整的启动流程，确保所有组件按正确顺序初始化。

#### Scenario: 程序正常启动
- **WHEN** 用户执行 mcp-all-in-one 命令时
- **THEN** 程序必须解析命令行参数、加载配置文件、初始化日志系统、连接所有MCP服务并启动对外接口

#### Scenario: 配置文件缺失
- **WHEN** 指定的配置文件不存在时
- **THEN** 程序必须在默认位置创建配置文件模板并使用默认配置启动

### Requirement: MCP服务连接管理
程序必须支持多种类型MCP服务的连接和管理，提供基本的服务发现和连接机制。

#### Scenario: 多类型服务连接
- **WHEN** 程序启动时
- **THEN** 必须能够同时连接stdio、http、sse三种类型的MCP服务

#### Scenario: 服务连接失败处理
- **WHEN** MCP服务连接失败时
- **THEN** 程序必须记录错误日志并继续运行其他服务

### Requirement: 请求路由和处理
程序必须提供高效的请求路由机制，能够正确识别目标服务并转发请求。

#### Scenario: 请求路由
- **WHEN** 收到客户端请求时
- **THEN** 程序必须解析请求内容，识别目标MCP服务，并根据服务类型选择合适的通信方式转发请求

#### Scenario: 响应处理
- **WHEN** 收到MCP服务响应时
- **THEN** 程序必须处理响应格式，统一错误处理，并返回标准化的响应给客户端

### Requirement: 错误处理和恢复
程序必须提供基本的错误处理机制，确保系统的稳定性。

#### Scenario: 服务异常处理
- **WHEN** MCP服务出现异常时
- **THEN** 程序必须记录错误日志并继续运行

#### Scenario: 配置错误处理
- **WHEN** 配置文件格式错误时
- **THEN** 程序必须提供详细的错误信息并安全退出，避免使用无效配置运行


### Requirement: 多协议支持
程序必须支持stdio、http、sse三种对外服务协议，满足不同客户端的需求。

#### Scenario: STDIO模式运行
- **WHEN** 使用stdio子命令启动时
- **THEN** 程序必须通过标准输入输出通信，适合命令行工具集成

#### Scenario: HTTP模式运行
- **WHEN** 使用http子命令启动时
- **THEN** 程序必须启动HTTP服务器，支持REST API调用

#### Scenario: SSE模式运行
- **WHEN** 使用sse子命令启动时
- **THEN** 程序必须支持Server-Sent Events，适合实时通信场景

## 运行流程详细说明

### 启动阶段详细流程

1. **命令行参数解析**
   - 解析子命令（stdio/http/sse）
   - 处理配置文件路径参数
   - 解析日志级别参数（--log-level），支持：error、warn、info、debug，默认为info
   - 解析协议特定参数（端口、主机等）
   - 验证参数有效性和兼容性

2. **配置文件加载**
   - 检查配置文件是否存在
   - 不存在时创建默认配置模板
   - 使用JSON Schema验证配置格式
   - 处理环境变量替换

3. **服务初始化**
   - 使用指定的日志级别初始化Winston日志系统（具备容错性）
   - 配置日志输出格式和目标（日志系统故障不影响核心功能）
   - 处理--silent参数优先级：--silent完全禁用所有日志输出，优先级高于--log-level
   - 启动MCP服务管理器
   - 加载所有MCP服务配置
   - 建立服务连接池

4. **服务连接建立**
   - 根据服务类型选择连接方式
   - 建立连接并验证服务可用性
   - 处理连接失败和重试逻辑
   - 维护服务健康状态

### 运行时详细流程

1. **请求接收和验证**
   - 接收客户端请求
   - 验证请求格式和参数
   - 处理环境变量替换
   - 记录请求日志（容错处理，日志失败不影响请求处理）

2. **请求路由处理**
   - 解析请求目标服务
   - 检查目标服务状态
   - 选择合适的通信协议
   - 转发请求到目标服务

3. **响应处理和返回**
   - 等待并接收服务响应
   - 处理响应格式转换
   - 统一错误处理机制
   - 返回标准化响应

4. **服务状态监控**
   - 监控所有MCP服务状态
   - 检测服务异常和故障
   - 执行自动恢复策略
   - 更新服务可用性状态

### 错误处理详细流程

1. **配置错误处理**
   - 配置文件格式错误
   - 配置参数不合法
   - 环境变量缺失
   - 配置权限问题

2. **连接错误处理**
   - 网络连接失败
   - 服务启动失败
   - 连接超时处理
   - 重连策略执行

3. **运行时错误处理**
   - 请求处理异常
   - 服务响应错误
   - 资源不足处理
   - 并发冲突解决

### 配置管理详细流程

1. **配置文件加载**
   - 配置文件存在性检查
   - JSON Schema格式验证
   - 环境变量替换处理
   - 默认配置创建机制

2. **配置参数处理**
   - 命令行参数解析
   - 配置文件参数合并
   - 参数有效性验证
   - 错误配置处理

## 性能和可靠性要求

### 性能指标
- **启动时间**: 程序启动时间应在5秒内完成
- **请求延迟**: 单个请求处理延迟应在100ms内
- **并发能力**: 支持至少100个并发请求
- **内存使用**: 基础内存占用不超过100MB

### 可靠性要求
- **服务可用性**: 99.9%的服务可用性
- **故障恢复**: 服务故障后30秒内自动恢复
- **错误隔离**: 单个服务故障不影响整体服务

通过遵循这些运行流程规范，mcp-all-in-one程序将能够提供稳定、高效、可靠的MCP服务代理功能。