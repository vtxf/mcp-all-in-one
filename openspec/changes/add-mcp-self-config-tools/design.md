# MCP自我配置工具设计

## 架构设计

### 1. 工具注册架构

在AggregatedServer类中添加自我配置工具的注册：

```typescript
// 在setupMcpHandlers()方法中添加
private setupMcpHandlers(): void {
    // 现有工具处理器...

    // 添加自我配置工具
    this.mcpServer.setRequestHandler(ValidateMcpConfigRequestSchema, this.handleValidateMcpConfig.bind(this));
    this.mcpServer.setRequestHandler(ShowMcpConfigRequestSchema, this.handleShowMcpConfig.bind(this));
    this.mcpServer.setRequestHandler(ShowMcpConfigSchemaRequestSchema, this.handleShowMcpConfigSchema.bind(this));
    this.mcpServer.setRequestHandler(SetMcpConfigRequestSchema, this.handleSetMcpConfig.bind(this));
}
```

### 2. 工具定义

#### 2.1 validate-mcp-config 工具
- **功能**: 验证MCP配置文件的正确性
- **参数**:
  - `config-file` (可选): MCP配置文件路径，未指定时验证当前MCP配置
- **返回**: 验证结果，包括错误信息（如果有）

#### 2.2 show-mcp-config 工具
- **功能**: 显示MCP配置文件内容
- **参数**:
  - `config-file` (可选): MCP配置文件路径，未指定时显示当前MCP配置
- **返回**: MCP配置文件内容

#### 2.3 show-mcp-config-schema 工具
- **功能**: 显示MCP配置的JSON Schema
- **参数**: 无
- **返回**: MCP配置JSON Schema定义

#### 2.4 set-mcp-config 工具
- **功能**: 设置MCP配置
- **参数**:
  - `config-file` (可选): MCP配置文件路径，未指定时修改当前MCP配置
  - `config-content` (必需): 新的MCP配置内容（JSON字符串）
- **返回**: 操作结果

### 3. 实现策略

#### 3.1 MCP配置文件处理
- 利用现有的ConfigLoader读取MCP配置文件
- 利用现有的ConfigValidator验证MCP配置
- 对于未指定config-file的情况，使用当前服务的MCP配置

#### 当前MCP配置获取机制
mcp-all-in-one通过以下方式获取和使用当前MCP配置：

1. **MCP配置加载流程**:
   ```typescript
   // 在命令执行时加载MCP配置
   const config = await ConfigLoader.loadConfig({
       configPath: args.mcpConfig,  // 命令行指定的MCP配置路径，未指定时使用默认路径
       autoCreate: true,            // 自动创建缺失的MCP配置文件
       validateEnv: true            // 验证环境变量
   });
   ```

2. **当前MCP配置文件路径确定**:
   - 如果用户通过`--mcp-config`指定了路径，则使用该路径
   - 如果未指定，则使用ConfigLoader.resolveConfigPath()解析的默认路径
   - **重要**: 当前MCP配置文件路径必须与实际使用的MCP配置文件路径完全一致

3. **现有问题**:
   - 当前的MCP服务只记录了MCP配置内容(`config`对象)，但没有记录MCP配置文件路径
   - 自我配置工具无法知道当前服务实际使用的是哪个MCP配置文件
   - 需要修改服务器构造函数，同时传递MCP配置对象和MCP配置文件路径

4. **解决方案**:
   - 修改所有MCP服务器类的构造函数，增加MCP配置文件路径参数
   - 在AggregatedServer中存储当前MCP配置文件路径
   - 确保自我配置工具能够访问正确的当前MCP配置文件路径

5. **环境变量处理**:
   - ConfigLoader自动处理 `${VARIABLE_NAME}` 格式的环境变量替换
   - 支持嵌套对象中的环境变量替换
   - 验证环境变量名称格式和存在性

6. **MCP配置验证**:
   - 使用ConfigValidator.validateConfig()验证MCP配置格式
   - 提供详细的验证错误信息
   - 确保MCP配置符合JSON Schema要求

#### 3.2 安全考虑
- set-mcp-config工具只允许修改用户有权限的MCP配置文件
- 所有MCP配置修改都会创建备份文件
- MCP配置修改后会提醒用户手动重启服务

#### 3.3 错误处理
- MCP配置文件不存在时的明确错误提示
- JSON格式错误的详细错误信息
- 验证失败的具体错误位置

## 数据流

### validate-mcp-config 流程
1. 解析参数获取MCP配置文件路径
2. 使用ConfigLoader读取MCP配置文件
3. 使用ConfigValidator验证MCP配置
4. 返回验证结果

### show-mcp-config 流程
1. 解析参数获取MCP配置文件路径
2. 使用ConfigLoader读取MCP配置文件
3. 返回MCP配置内容（处理环境变量后的实际MCP配置）

### show-mcp-config-schema 流程
1. 读取内置的mcp.schema.json文件
2. 返回MCP配置Schema内容

### set-mcp-config 流程
1. 解析参数获取MCP配置文件路径和新MCP配置内容
2. 验证新MCP配置的格式和内容
3. 创建原MCP配置文件的备份
4. 写入新MCP配置文件
5. 如果修改的是当前使用的MCP配置，提醒用户手动重启服务

## 技术实现细节

### 修改MCP服务器类以支持MCP配置文件路径传递

为了支持自我配置工具，需要修改以下MCP服务器类：

#### 1. 修改AggregatedServer基类
```typescript
export abstract class AggregatedServer extends BaseMcpServer {
    // 当前MCP配置文件路径 - 必须在构造函数中设置
    protected currentConfigPath: string;

    /**
     * 创建聚合服务器实例
     * @param config MCP配置
     * @param configPath 当前MCP配置文件路径
     * @param name 服务器名称
     */
    constructor(config: McpConfig, configPath: string, name: string) {
        super(config, name);

        // 存储当前MCP配置文件路径 - 必须设置
        this.currentConfigPath = configPath;

        // 其他初始化代码...
    }

    /**
     * 获取当前MCP配置文件路径
     * @returns 当前MCP配置文件路径
     */
    public getCurrentConfigPath(): string {
        return this.currentConfigPath;
    }
}
```

#### 2. 修改所有MCP服务器实现类
需要修改以下服务器类的构造函数：
- StdioMcpServer
- HttpMcpServer
- SseMcpServer

```typescript
// StdioMcpServer示例
export class StdioMcpServer extends AggregatedServer {
    constructor(config: McpConfig, configPath: string) {
        super(config, configPath, 'stdio');
    }
}

// HttpMcpServer示例
export class HttpMcpServer extends AggregatedServer {
    constructor(config: McpConfig, configPath: string, port: number, host: string, cors: boolean) {
        super(config, configPath, 'http');
        // 其他初始化...
    }
}
```

#### 3. 修改命令类以传递MCP配置文件路径
在所有命令类中，需要确定实际的MCP配置文件路径并传递给服务器：

```typescript
// 在StdioCommand.execute()中
public async execute(args: { mcpConfig?: string; }): Promise<void> {
    // 加载MCP配置文件
    const config = await ConfigLoader.loadConfig({
        configPath: args.mcpConfig,
        autoCreate: true,
        validateEnv: true
    });

    // 确定实际使用的MCP配置文件路径
    const actualConfigPath = args.mcpConfig ?
        ConfigLoader.resolveConfigPath(args.mcpConfig) :
        ConfigLoader.getDefaultConfigPath();

    // 启动MCP服务器，传递MCP配置和MCP配置文件路径
    const stdioServer = new StdioMcpServer(config, actualConfigPath);
    await stdioServer.start();
}
```

### 自我配置工具实现
在AggregatedServer中添加自我配置工具的具体实现：

/**
 * 处理validate-mcp-config工具调用
 */
private async handleValidateMcpConfig(request: any): Promise<any> {
    // 如果未指定config-file参数，则使用当前服务的MCP配置文件路径
    const configPath = request.params?.['config-file'] || this.currentConfigPath;

    try {
        const config = await ConfigLoader.loadConfig({ configPath });
        const validation = await ConfigValidator.validateConfig(config);

        return {
            valid: validation.valid,
            errors: validation.errors || [],
            configPath
        };
    } catch (error) {
        return {
            valid: false,
            errors: [error instanceof Error ? error.message : String(error)],
            configPath
        };
    }
}

/**
 * 处理show-mcp-config工具调用
 */
private async handleShowMcpConfig(request: any): Promise<any> {
    // 如果未指定config-file参数，则使用当前服务的MCP配置文件路径
    const configPath = request.params?.['config-file'] || this.currentConfigPath;

    try {
        const config = await ConfigLoader.loadConfig({ configPath });
        return {
            config,
            configPath,
            envExpanded: true
        };
    } catch (error) {
        throw new Error(`读取MCP配置文件失败: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * 处理show-mcp-config-schema工具调用
 */
private async handleShowMcpConfigSchema(): Promise<any> {
    try {
        // 读取内置的mcp.schema.json文件
        const schemaPath = path.join(__dirname, '../../../schemas/mcp.schema.json');
        const schemaContent = await fs.readFile(schemaPath, 'utf-8');
        const schema = JSON.parse(schemaContent);

        return {
            schema,
            schemaVersion: schema['$schema'] || 'unknown'
        };
    } catch (error) {
        throw new Error(`读取MCP配置Schema失败: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * 处理set-mcp-config工具调用
 */
private async handleSetMcpConfig(request: any): Promise<any> {
    // 如果未指定config-file参数，则使用当前服务的MCP配置文件路径
    const configPath = request.params?.['config-file'] || this.currentConfigPath;
    const configContent = request.params?.['config-content'];

    if (!configContent) {
        throw new Error('config-content参数是必需的');
    }

    try {
        // 验证新MCP配置格式
        let newConfig;
        try {
            newConfig = JSON.parse(configContent);
        } catch (parseError) {
            throw new Error(`MCP配置内容不是有效的JSON格式: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }

        // 验证MCP配置内容
        const validation = await ConfigValidator.validateConfig(newConfig);
        if (!validation.valid) {
            return {
                success: false,
                configPath,
                errors: validation.errors?.map(e => `${e.path}: ${e.message}`) || []
            };
        }

        // 创建备份
        const backupPath = await this.createConfigBackup(configPath);

        // 保存新MCP配置
        await ConfigLoader.saveConfig(newConfig, configPath);

        // 检查是否修改了当前使用的MCP配置
        const isCurrentConfig = configPath === this.currentConfigPath;
        const restartRequired = isCurrentConfig;

        return {
            success: true,
            configPath,
            backupPath,
            restartRequired,
            restartMessage: restartRequired ?
                `MCP配置已更新。请重启mcp-all-in-one服务以应用新配置。使用以下命令重启:\n` +
                `mcp-all-in-one ${process.argv.slice(2).join(' ')}` :
                'MCP配置文件已更新',
            errors: []
        };

    } catch (error) {
        return {
            success: false,
            configPath,
            errors: [error instanceof Error ? error.message : String(error)],
            restartRequired: false,
            restartMessage: ''
        };
    }
}

/**
 * 创建MCP配置文件备份
 * @param configPath MCP配置文件路径
 * @returns 备份文件路径
 */
private async createConfigBackup(configPath: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${configPath}.backup.${timestamp}`;

    try {
        await fs.copyFile(configPath, backupPath);
        return backupPath;
    } catch (error) {
        // 如果备份失败，记录警告但不中止操作
        this.logger.warn('创建MCP配置备份失败', {
            configPath,
            backupPath,
            error: error instanceof Error ? error.message : String(error)
        });
        return '';
    }
}
```

### 工具注册
在setupMcpHandlers方法中注册新的工具：

```typescript
private setupMcpHandlers(): void {
    // 现有工具处理器...

    // 注册自我配置工具
    this.mcpServer.setRequestHandler(
        { method: 'tools/call', name: 'validate-mcp-config' },
        this.handleValidateMcpConfig.bind(this)
    );

    this.mcpServer.setRequestHandler(
        { method: 'tools/call', name: 'show-mcp-config' },
        this.handleShowMcpConfig.bind(this)
    );

    this.mcpServer.setRequestHandler(
        { method: 'tools/call', name: 'show-mcp-config-schema' },
        this.handleShowMcpConfigSchema.bind(this)
    );

    this.mcpServer.setRequestHandler(
        { method: 'tools/call', name: 'set-mcp-config' },
        this.handleSetMcpConfig.bind(this)
    );

    // 更新工具列表
    this.updateSelfConfigTools();
}

/**
 * 更新自我配置工具列表
 */
private updateSelfConfigTools(): void {
    const selfConfigTools = [
        {
            name: 'validate-mcp-config',
            description: '验证MCP配置文件的正确性',
            inputSchema: {
                type: 'object',
                properties: {
                    'config-file': {
                        type: 'string',
                        description: '配置文件路径，未指定时验证当前配置'
                    }
                }
            }
        },
        {
            name: 'show-mcp-config',
            description: '显示MCP配置文件内容',
            inputSchema: {
                type: 'object',
                properties: {
                    'config-file': {
                        type: 'string',
                        description: '配置文件路径，未指定时显示当前配置'
                    }
                }
            }
        },
        {
            name: 'show-mcp-config-schema',
            description: '显示MCP配置的JSON Schema',
            inputSchema: {
                type: 'object',
                properties: {}
            }
        },
        {
            name: 'set-mcp-config',
            description: '设置MCP配置',
            inputSchema: {
                type: 'object',
                properties: {
                    'config-file': {
                        type: 'string',
                        description: '配置文件路径，未指定时修改当前配置'
                    },
                    'config-content': {
                        type: 'string',
                        description: '新的配置内容（JSON字符串）'
                    }
                },
                required: ['config-content']
            }
        }
    ];

    // 将自我配置工具添加到聚合工具列表
    this.aggregatedTools = [
        ...selfConfigTools,
        ...this.aggregatedTools
    ];
}
```

### Schema定义
需要为四个工具定义JSON Schema，用于参数验证和工具发现。

### 配置变更提醒机制
当配置文件被修改后，工具应该提醒用户需要手动重启服务以应用新配置：
- 在设置配置成功后显示重启提醒信息
- 提供重启服务的命令建议
- 不尝试自动重载配置，保持服务稳定性

### MCP配置备份策略
- 每次修改MCP配置前创建备份
- 备份文件命名：`config.json.backup.YYYYMMDDHHMMSS`
- 保留最近5个备份文件

## 文件结构

实现MCP自我配置工具需要修改和新增以下文件：

### 1. 需要修改的现有文件

#### 1.1 核心服务器类修改
```
src/mcp-server/base/
├── AggregatedServer.ts          # 主要修改：添加自我配置工具实现
├── BaseMcpServer.ts            # 修改：增加配置文件路径支持
└── index.ts                    # 可能需要更新导出
```

**主要修改内容：**
- `AggregatedServer.ts`: 添加四个自我配置工具的处理器方法
- `BaseMcpServer.ts`: 增加配置文件路径属性和相关方法
- 所有MCP服务器类需要更新构造函数以接收配置文件路径参数

#### 1.2 传输层服务器修改
```
src/mcp-server/
├── stdio/StdioMcpServer.ts     # 修改：构造函数增加configPath参数
├── http/HttpMcpServer.ts       # 修改：构造函数增加configPath参数
├── sse/SseMcpServer.ts         # 修改：构造函数增加configPath参数
└── index.ts                    # 可能需要更新导出
```

#### 1.3 CLI命令修改
```
src/cli/commands/
├── StdioCommand.ts             # 修改：传递配置文件路径给服务器
├── HttpCommand.ts              # 修改：传递配置文件路径给服务器
├── SseCommand.ts               # 修改：传递配置文件路径给服务器
└── BaseCommand.ts              # 可能需要添加通用方法
```

**修改重点：**
- 确定实际使用的配置文件路径
- 将配置文件路径传递给MCP服务器实例

### 2. 需要新增的文件

#### 2.1 自我配置工具相关类型定义
```
src/types/self-config/
├── index.ts                    # 导出所有自我配置相关类型
├── requests.ts                 # 自我配置工具请求类型定义
├── responses.ts                # 自我配置工具响应类型定义
└── schemas.ts                  # 自我配置工具JSON Schema定义
```

**详细内容：**
- `requests.ts`: 定义四个工具的请求参数类型
- `responses.ts`: 定义工具响应的数据结构
- `schemas.ts`: 定义工具的输入验证Schema

#### 2.2 自我配置工具实现
```
src/mcp-server/self-config/
├── index.ts                    # 导出自我配置工具
├── SelfConfigTools.ts          # 自我配置工具实现类
├── ConfigBackup.ts             # 配置备份管理工具
└── validators.ts               # 配置验证工具
```

**文件说明：**
- `SelfConfigTools.ts`: 实现四个自我配置工具的核心逻辑
- `ConfigBackup.ts`: 管理配置文件备份的创建和清理
- `validators.ts`: 提供配置验证相关的辅助函数

#### 2.3 Schema文件
```
schemas/self-config/
├── validate-mcp-config.json   # validate-mcp-config工具的Schema
├── show-mcp-config.json        # show-mcp-config工具的Schema
├── show-mcp-config-schema.json # show-mcp-config-schema工具的Schema
└── set-mcp-config.json         # set-mcp-config工具的Schema
```

### 3. MCP配置文件相关说明

#### 3.1 已存在的MCP配置Schema文件
```
schemas/
└── mcp.schema.json             # 已存在，无需修改
```

**说明：**
- 现有的 mcp.schema.json 已经完整定义了MCP配置文件的结构
- 自我配置工具不需要修改此Schema，因为：
  1. 自我配置工具是运行时功能，不是MCP配置项
  2. 工具通过MCP协议暴露，不需要在MCP配置文件中定义
  3. 现有的MCP配置验证规则已经足够，支持所有需要的MCP配置格式

#### 3.2 MCP配置文件处理
- 自我配置工具专门用于操作MCP配置文件
- 所有工具都围绕MCP配置文件的读取、验证、修改展开
- 不涉及其他类型的配置文件（如应用配置、环境配置等）

### 4. 测试文件结构

#### 4.1 单元测试
```
tests/unit/mcp-server/self-config/
├── SelfConfigTools.test.ts     # 自我配置工具单元测试
├── ConfigBackup.test.ts        # 配置备份功能测试
└── validators.test.ts          # 验证器测试
```

#### 4.2 集成测试
```
tests/integration/self-config/
├── self-config-tools.test.ts   # 自我配置工具集成测试
└── config-flow.test.ts         # 完整配置流程测试
```

### 5. 文档文件

#### 5.1 API文档
```
docs/api/self-config-tools.md   # 自我配置工具API文档
```

#### 5.2 用户指南
```
docs/guides/
├── self-config-usage.md        # 自我配置工具使用指南
└── config-management.md        # 配置管理最佳实践
```

## 实现优先级

### 第一阶段：核心功能
1. 修改 `AggregatedServer.ts` - 添加基础工具框架
2. 修改所有MCP服务器类的构造函数 - 支持配置文件路径
3. 修改CLI命令类 - 传递配置文件路径
4. 实现基础的 `validate-mcp-config` 工具

### 第二阶段：完整工具集
1. 实现 `show-mcp-config` 工具
2. 实现 `show-mcp-config-schema` 工具
3. 实现 `set-mcp-config` 工具
4. 添加配置备份功能

### 第三阶段：完善和测试
1. 添加完整的错误处理
2. 编写单元测试和集成测试
3. 完善文档和使用指南
4. 性能优化和安全加固

## 依赖关系

```
自我配置工具实现依赖关系图：

AggregatedServer.ts (主修改)
├── BaseMcpServer.ts (基类修改)
├── types/self-config/ (新增类型定义)
│   ├── requests.ts
│   ├── responses.ts
│   └── schemas.ts
├── mcp-server/self-config/ (新增实现)
│   ├── SelfConfigTools.ts
│   ├── ConfigBackup.ts
│   └── validators.ts
└── schemas/self-config/ (新增Schema文件)
    ├── validate-mcp-config.json
    ├── show-mcp-config.json
    ├── show-mcp-config-schema.json
    └── set-mcp-config.json

CLI命令类修改
├── StdioCommand.ts
├── HttpCommand.ts
├── SseCommand.ts
└── BaseCommand.ts

传输层服务器修改
├── stdio/StdioMcpServer.ts
├── http/HttpMcpServer.ts
└── sse/SseMcpServer.ts
```

## 兼容性考虑

### 向后兼容性
- 所有现有API保持不变
- 新增的配置文件路径参数为可选参数
- 自我配置工具为可选功能，不影响现有工作流

### 向前兼容性
- 设计支持未来扩展更多自我配置工具
- Schema设计支持版本化
- 工具命名支持命名空间以避免冲突