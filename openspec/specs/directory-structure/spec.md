# 源码目录结构规范

## 目标
规范 mcp-all-in-one 项目的源码目录结构和内部文件组织，确保代码结构清晰、可维护且符合项目架构要求。

## 核心设计原则

### 1. 遵循 constitution 规范
- 严格按照 constitution/spec.md 中的要求组织代码
- 支持 stdio、http、sse 三种通信模式
- 使用最新版 @modelcontextprotocol/sdk
- HTTP/SSE模式使用Express框架，stdio模式不涉及Web服务器
- 4个空格缩进，类名首字母大写，使用 export class 导出

### 2. 模块化设计
- 每个功能模块独立目录
- 清晰的依赖关系
- 便于单元测试和集成测试
- 支持功能的独立开发和部署

### 3. 配置驱动
- 基于 MCP 配置文件的服务管理
- 统一的配置加载和验证机制
- 环境变量支持和替换

## 完整源码目录结构

```
mcp-all-in-one/
├── src/                           # 源代码主目录
│   ├── core/                      # 核心功能模块
│   │   ├── config/                # 配置管理
│   │   │   ├── ConfigLoader.ts    # 配置加载器
│   │   │   ├── ConfigValidator.ts # 配置验证器
│   │   │   └── index.ts           # 配置模块导出
│   │   ├── logger/                # 日志系统
│   │   │   ├── Logger.ts          # 日志管理器
│   │   │   └── index.ts           # 日志模块导出
│   │   ├── proxy/                 # MCP服务代理
│   │   │   ├── McpProxy.ts        # 主代理类
│   │   │   ├── ServiceManager.ts  # 服务管理器
│   │   │   └── index.ts           # 代理模块导出
│   │   └── utils/                 # 工具函数
│   │       ├── env.ts             # 环境变量处理
│   │       ├── path.ts            # 路径处理工具
│   │       ├── validation.ts      # 验证工具
│   │       └── index.ts           # 工具模块导出
│   ├── mcp-server/                # 对外MCP服务器（聚合服务）
│   │   ├── base/                  # 基础服务器类
│   │   │   ├── BaseMcpServer.ts   # MCP服务器基类
│   │   │   ├── AggregatedServer.ts # 聚合服务器基类
│   │   │   └── index.ts           # 基础服务器模块导出
│   │   ├── stdio/                 # STDIO服务器实现
│   │   │   ├── StdioMcpServer.ts  # STDIO MCP服务器类
│   │   │   └── index.ts           # STDIO服务器模块导出
│   │   ├── http/                  # HTTP服务器实现
│   │   │   ├── HttpMcpServer.ts   # HTTP MCP服务器类
│   │   │   ├── middleware/        # HTTP中间件
│   │   │   │   ├── cors.ts        # CORS中间件
│   │   │   │   ├── error.ts       # 错误处理中间件
│   │   │   │   └── index.ts       # 中间件导出
│   │   │   └── index.ts           # HTTP服务器模块导出
│   │   └── sse/                   # SSE服务器实现
│   │       ├── SseMcpServer.ts    # SSE MCP服务器类
│   │       ├── SseConnection.ts   # SSE连接管理
│   │       └── index.ts           # SSE服务器模块导出
│   ├── mcp-clients/               # 对内MCP客户端（连接各个MCP服务）
│   │   ├── base/                  # 基础客户端类
│   │   │   ├── BaseMcpClient.ts   # MCP客户端基类
│   │   │   ├── ClientManager.ts   # 客户端管理器
│   │   │   ├── ServiceStatus.ts   # 服务状态管理
│   │   │   └── index.ts           # 基础客户端模块导出
│   │   ├── stdio/                 # STDIO客户端实现
│   │   │   ├── StdioMcpClient.ts  # STDIO MCP客户端类
│   │   │   ├── ProcessManager.ts  # 进程管理器
│   │   │   └── index.ts           # STDIO客户端模块导出
│   │   ├── http/                  # HTTP客户端实现
│   │   │   ├── HttpMcpClient.ts   # HTTP MCP客户端类
│   │   │   ├── HttpConnectionManager.ts # HTTP连接管理器
│   │   │   └── index.ts           # HTTP客户端模块导出
│   │   └── sse/                   # SSE客户端实现
│   │       ├── SseMcpClient.ts    # SSE MCP客户端类
│   │       ├── SseConnectionManager.ts # SSE连接管理器
│   │       └── index.ts           # SSE客户端模块导出
│   ├── cli/                       # 命令行接口
│   │   ├── commands/              # 命令实现
│   │   │   ├── BaseCommand.ts     # 命令基类
│   │   │   ├── StdioCommand.ts    # STDIO命令
│   │   │   ├── HttpCommand.ts     # HTTP命令
│   │   │   ├── SseCommand.ts      # SSE命令
│   │   │   ├── ConfigCommand.ts   # 配置管理命令
│   │   │   └── index.ts           # 命令模块导出
│   │   ├── utils/                 # CLI工具函数
│   │   │   ├── parser.ts          # 参数解析器
│   │   │   ├── validator.ts       # 参数验证器
│   │   │   ├── formatter.ts       # 输出格式化器
│   │   │   └── index.ts           # CLI工具模块导出
│   │   └── index.ts               # CLI模块导出
│   ├── types/                     # 类型定义
│   │   ├── config.ts              # 配置相关类型
│   │   ├── transport.ts           # 传输相关类型
│   │   ├── service.ts             # 服务相关类型
│   │   ├── cli.ts                 # CLI相关类型
│   │   ├── errors.ts              # 错误类型定义
│   │   └── index.ts               # 类型模块导出
│   ├── errors/                    # 错误处理
│   │   ├── BaseError.ts           # 基础错误类
│   │   ├── ConfigError.ts         # 配置错误
│   │   ├── ConnectionError.ts     # 连接错误
│   │   ├── ServiceError.ts        # 服务错误
│   │   ├── ValidationError.ts     # 验证错误
│   │   └── index.ts               # 错误模块导出
│   └── index.ts                   # 主入口文件
├── tests/                         # 测试目录
│   ├── unit/                      # 单元测试
│   │   ├── core/                  # 核心模块测试
│   │   │   ├── config/            # 配置模块测试
│   │   │   ├── logger/            # 日志模块测试
│   │   │   └── utils/             # 工具模块测试
│   │   ├── mcp-server/            # MCP服务器模块测试
│   │   │   ├── stdio/             # STDIO MCP服务器测试
│   │   │   ├── http/              # HTTP MCP服务器测试
│   │   │   └── sse/               # SSE MCP服务器测试
│   │   ├── mcp-clients/           # MCP客户端模块测试
│   │   └── cli/                   # CLI模块测试
│   ├── integration/               # 集成测试
│   │   ├── stdio-workflow.test.ts # STDIO工作流测试
│   │   ├── http-workflow.test.ts  # HTTP工作流测试
│   │   ├── sse-workflow.test.ts   # SSE工作流测试
│   │   └── multi-service.test.ts  # 多服务集成测试
│   ├── fixtures/                  # 测试数据
│   │   ├── configs/               # 测试配置文件
│   │   │   ├── valid.mcp.json     # 有效配置示例
│   │   │   ├── invalid.mcp.json   # 无效配置示例
│   │   │   └── minimal.mcp.json   # 最小配置示例
│   │   └── mocks/                 # Mock数据
│   │       ├── services.ts        # 服务Mock
│   │       └── responses.ts       # 响应Mock
│   ├── utils/                     # 测试工具
│   │   ├── test-helpers.ts        # 测试辅助函数
│   │   ├── mock-server.ts         # Mock服务器
│   │   └── index.ts               # 测试工具导出
│   └── setup.ts                   # 测试环境设置
├── schemas/                       # Schema定义
│   ├── mcp.schema.json            # MCP配置文件Schema
│   └── cli.schema.json            # CLI参数Schema
├── scripts/                       # 构建和部署脚本
│   ├── build.js                   # 构建脚本
│   ├── dev.js                     # 开发脚本
│   ├── test.js                    # 测试脚本
│   └── prepublish.js              # 发布前准备脚本
├── docs/                          # 文档目录
│   ├── API.md                     # API文档
│   ├── CONFIGURATION.md           # 配置文档
│   ├── DEVELOPMENT.md             # 开发指南
│   └── DEPLOYMENT.md              # 部署指南
├── examples/                      # 示例文件
│   ├── configs/                   # 配置示例
│   │   ├── basic.mcp.json         # 基础配置示例
│   │   ├── advanced.mcp.json      # 高级配置示例
│   │   └── production.mcp.json    # 生产环境配置示例
│   └── usage/                     # 使用示例
│       ├── stdio-example.md       # STDIO使用示例
│       ├── http-example.md        # HTTP使用示例
│       └── sse-example.md         # SSE使用示例
├── package.json                   # 项目配置文件
├── package-lock.json              # 依赖锁定文件
├── tsconfig.json                  # TypeScript配置
├── jest.config.js                 # Jest测试配置
├── .eslintrc.js                   # ESLint配置
├── .prettierrc                    # Prettier配置
├── .gitignore                     # Git忽略文件
├── CHANGELOG.md                   # 变更记录
├── README.md                      # 项目说明文档
├── README_zh-CN.md                # 中文说明文档
├── LICENSE                        # 许可证文件
├── .nvmrc                         # Node.js版本配置
├── .node-version                  # Node.js版本配置(fnm)
└── bin/                           # 可执行文件目录
    └── mcp-all-in-one             # 命令行入口文件
```

## 参考文件

### refs/schemas/ - Schema参考文件
为了支持实际开发，本规范提供了Schema参考文件，位于 `refs/schemas/` 目录下：

#### MCP配置Schema
- **权威位置**: `openspec/specs/constitution/mcp.schema.json`
- **用途**: MCP配置文件的官方JSON Schema定义
- **包含**:
  - 完整的配置文件结构验证
  - stdio/http/sse三种服务类型的详细定义
  - 参数约束和验证规则
  - 多种配置示例（完整配置、最小配置、HTTP专用配置等）
- **使用**:
  - IDE智能提示和自动补全
  - 配置文件格式验证
  - 生成配置模板
  - 确保配置一致性
- **注意**: 所有MCP配置相关的开发都应参考constitution中的权威版本，该文件是唯一的权威schema文件

#### cli.schema.json
- **用途**: CLI命令行参数的完整JSON Schema定义
- **包含**:
  - 所有命令行参数的结构定义
  - 全局参数、子命令参数和全局标志
  - 详细的类型验证和约束规则
  - 命令使用示例
- **使用**:
  - 生成自动补全脚本
  - 命令行帮助信息生成
  - 参数格式验证
  - 确保参数一致性

#### cli.example.json
- **用途**: CLI命令行参数的详细使用示例
- **包含**:
  - 各种命令的使用示例（stdio/http/sse/globalFlags等）
  - 解析结果展示
  - 错误情况和约束说明
  - 高级使用场景
  - 参数详细说明和约束条件
- **使用**:
  - 开发指导和快速上手
  - 测试用例编写
  - 文档补充
  - 参数使用参考

#### README.md
- **用途**: Schema文件的使用说明文档
- **包含**:
  - 各个schema文件的详细说明
  - IDE集成指南
  - 使用方法和最佳实践
  - 版本信息和更新记录

### 如何使用这些参考文件

#### 1. 开发时参考
在实际生成代码时，应该：
- 参考 `mcp.schema.json` 了解配置文件的具体结构
- 参考 `cli.schema.json` 了解命令行参数的详细定义
- 参考 `cli.example.json` 查看具体的使用示例

#### 2. 验证和测试
```bash
# 使用ajv验证配置文件
npx ajv validate -s refs/schemas/mcp.schema.json -d config.json

# 查看CLI使用示例
cat refs/schemas/cli.example.json | jq '.examples.http'
```

#### 3. IDE集成
在VSCode中设置schema关联：
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

## 核心模块详细说明

### 1. src/core/ - 核心功能模块

#### config/ - 配置管理
- **ConfigLoader.ts**: 负责加载和解析MCP配置文件，处理环境变量替换
- **ConfigValidator.ts**: 使用JSON Schema验证配置文件格式
- **职责**: 统一的配置加载、验证和管理机制

#### logger/ - 日志系统
- **Logger.ts**: 基于Winston的日志管理器，支持多级别日志输出
- **职责**: 提供统一的日志记录接口，支持不同输出格式和目标
- **日志级别**: 支持error、warn、info、debug四个级别，通过命令行参数--log-level设置，默认为info
- **配置方式**: 通过命令行参数--log-level控制，可选值为：error（仅错误）、warn（警告及以上）、info（信息及以上）、debug（调试及以上）

#### proxy/ - MCP服务代理
- **McpProxy.ts**: 主代理类，负责请求路由和响应处理
- **ServiceManager.ts**: 管理所有MCP服务的生命周期和状态
- **职责**: 统一的服务代理和管理，实现透明的请求转发

#### utils/ - 工具函数
- **env.ts**: 环境变量处理和替换功能
- **path.ts**: 路径处理和文件操作工具
- **validation.ts**: 通用验证工具函数
- **职责**: 提供项目通用的工具函数支持

### 2. src/mcp-server/ - 对外MCP服务器（聚合服务）

**重要说明**: 本模块使用 `@modelcontextprotocol/sdk` 作为MCP服务器，将聚合后的服务对外提供给MCP客户端（如Claude Code）。

#### base/ - 基础服务器类
- **BaseMcpServer.ts**: 使用MCP SDK的基础MCP服务器类，定义通用接口
- **AggregatedServer.ts**: 聚合服务器基类，管理多个MCP客户端的聚合逻辑
- **职责**: 为各种服务模式提供统一的MCP服务器基础实现

#### stdio/ - STDIO服务器实现
- **StdioMcpServer.ts**: 基于MCP SDK的STDIO MCP服务器实现
- **职责**: 使用MCP SDK的StdioServerTransport，对外提供STDIO模式的聚合MCP服务

#### http/ - HTTP服务器实现
- **HttpMcpServer.ts**: 基于Express和MCP SDK的HTTP MCP服务器实现
- **middleware/**: Express中间件，包括CORS、错误处理、请求验证等
  - **cors.ts**: CORS跨域处理中间件
  - **error.ts**: 错误处理中间件
  - **validation.ts**: 请求参数验证中间件
  - **logging.ts**: 请求日志记录中间件
- **职责**: 使用Express框架和MCP SDK的HttpServerTransport，对外提供HTTP模式的聚合MCP服务

#### sse/ - SSE服务器实现
- **SseMcpServer.ts**: 基于Express和MCP SDK的SSE MCP服务器实现
- **SseConnection.ts**: SSE连接管理和维护，支持长连接和心跳机制
- **SseMiddleware.ts**: SSE专用中间件，处理连接管理和消息格式化
- **职责**: 使用Express框架和MCP SDK的SseServerTransport，对外提供SSE模式的聚合MCP服务

### 3. src/mcp-clients/ - 对内MCP客户端（连接各个MCP服务）

**重要说明**: 本模块使用 `@modelcontextprotocol/sdk` 作为MCP客户端，连接MCP配置文件中定义的各个独立MCP服务。

#### base/ - 基础客户端类
- **BaseMcpClient.ts**: 使用MCP SDK的基础客户端类，定义通用接口
- **ClientManager.ts**: 客户端管理器，负责所有MCP客户端的生命周期
- **ServiceStatus.ts**: 服务状态管理和监控
- **职责**: 为各种MCP客户端提供统一的基础实现

#### stdio/ - STDIO客户端实现
- **StdioClient.ts**: 基于MCP SDK的STDIO客户端实现
- **ProcessManager.ts**: 子进程的启动、监控和重启管理
- **职责**: 使用MCP SDK的StdioClientTransport，连接STDIO类型的MCP服务

#### http/ - HTTP客户端实现
- **HttpClient.ts**: 基于MCP SDK的HTTP客户端实现
- **HttpConnectionManager.ts**: HTTP连接管理器
- **职责**: 使用MCP SDK的HttpClientTransport，连接HTTP类型的MCP服务

#### sse/ - SSE客户端实现
- **SseClient.ts**: 基于MCP SDK的SSE客户端实现
- **SseConnectionManager.ts**: SSE连接管理器，维护长连接
- **职责**: 使用MCP SDK的SseClientTransport，连接SSE类型的MCP服务

### 4. src/cli/ - 命令行接口

#### commands/ - 命令实现
- **BaseCommand.ts**: 命令的基类，定义通用接口
- **StdioCommand.ts**: stdio子命令的实现
- **HttpCommand.ts**: http子命令的实现
- **SseCommand.ts**: sse子命令的实现
- **ConfigCommand.ts**: 配置管理相关命令的实现
- **职责**: 实现所有命令行子命令的功能

#### utils/ - CLI工具函数
- **parser.ts**: 命令行参数解析
- **validator.ts**: 参数验证
- **formatter.ts**: 输出格式化
- **职责**: 提供命令行处理的通用工具

### 5. src/types/ - 类型定义
- **config.ts**: 配置相关的TypeScript类型定义
- **transport.ts**: 传输协议相关的类型定义
- **service.ts**: 服务相关的类型定义
- **cli.ts**: CLI相关的类型定义
- **errors.ts**: 错误类型定义
- **职责**: 为整个项目提供完整的TypeScript类型支持

### 6. src/errors/ - 错误处理
- **BaseError.ts**: 基础错误类，定义错误处理的通用接口
- **ConfigError.ts**: 配置相关错误
- **ConnectionError.ts**: 连接相关错误
- **ServiceError.ts**: 服务相关错误
- **ValidationError.ts**: 验证相关错误
- **职责**: 提供统一的错误处理机制

## 关键设计决策说明

### 1. 模块化架构
- 每个功能模块独立目录，职责单一
- 通过index.ts文件提供清晰的模块导出接口
- 便于单元测试和功能替换

### 2. 分层设计
- **核心层(core)**: 提供基础功能支持（配置、日志、代理、工具）
- **MCP服务器层(mcp-server)**: 对外提供聚合的MCP服务，使用MCP SDK作为服务器
- **MCP客户端层(mcp-clients)**: 对内连接各个MCP服务，使用MCP SDK作为客户端
- **接口层(cli)**: 提供命令行接口

### 3. 协议支持与架构选择
- **传输协议**: 使用官方 `@modelcontextprotocol/sdk` 处理 stdio/http/sse 传输协议
- **Web框架选择**: 
  - HTTP/SSE模式使用Express框架处理路由、中间件和CORS等复杂功能
  - stdio模式不涉及Web服务器，使用MCP SDK直接处理
- **服务模式**: 为每种服务模式(stdio/http/sse)提供独立的对外服务器实现
- **统一接口**: 通过MCP SDK统一管理不同协议的MCP服务连接
- **无缝切换**: 支持不同对外服务模式间的无缝切换

### 4. 配置驱动
- 所有服务配置来自MCP配置文件
- 统一的配置加载和验证机制
- 支持环境变量替换

### 5. 错误处理
- 分层的错误处理机制
- 详细的错误类型定义
- 统一的错误日志记录

## 代码规范要求

### 1. TypeScript规范
- 使用严格模式编译
- 所有函数和类必须有完整的类型注解
- 接口优先于类型别名
- Express相关类型使用@types/express包

### 2. 代码风格
- 4个空格缩进
- 类名使用PascalCase
- 函数和变量使用camelCase
- 常量使用UPPER_SNAKE_CASE

### 3. 注释规范
- 所有类和公共方法必须有JSDoc注释
- 复杂逻辑必须有行内注释
- 注释使用中文编写
- Express中间件必须说明其用途和参数

### 4. 导出规范
- 使用export class导出类
- 每个模块有统一的index.ts导出文件
- 避免使用export default
- Express应用实例通过工厂函数创建和导出

### 5. 测试规范
- 每个模块必须有对应的单元测试
- 测试覆盖率不低于80%
- 集成测试覆盖主要工作流程
- Express中间件需要独立的单元测试

## 依赖管理原则

### 1. Node.js内置优先
- 优先使用Node.js内置模块
- 减少第三方依赖
- 确保兼容性和安全性

### 2. 最小化依赖
- 只引入必要的第三方库
- 选择轻量级、维护良好的库
- 避免依赖冲突

### 3. 版本固定
- 使用固定版本号而非范围
- 及时更新到安全版本
- 记录版本更新原因

## 参考文件使用指南

### Schema文件的实际应用
本规范提到的schema参考文件 (`refs/schemas/`) 是为了支持开发而提供的辅助文件，实际开发时应注意：

1. **配置开发**: 使用权威的 `openspec/specs/constitution/mcp.schema.json` 作为配置验证的基础
2. **CLI开发**: 参考 `cli.schema.json` 和 `cli.example.json` 实现命令行接口
3. **测试编写**: 基于schema文件中的示例编写测试用例
4. **文档生成**: 使用schema文件生成API文档和使用指南

### 持续维护
当项目功能更新时，必须同步更新相应的schema文件：
- 新增配置选项 → 更新权威的 `openspec/specs/constitution/mcp.schema.json`
- 新增命令行参数 → 更新 `cli.schema.json` 和 `cli.example.json`
- 修改现有功能 → 更新相关schema和示例
- **重要**: `openspec/specs/constitution/mcp.schema.json` 是唯一的权威schema文件，所有配置验证都应以此为准

这个目录结构规范确保了项目的可维护性、可扩展性和代码质量，完全符合现有的openspec规范要求。