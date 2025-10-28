# dependencies-management

## 目标
规范 mcp-all-in-one 项目的第三方依赖库管理，明确项目所需的依赖库、版本要求和选择原则，确保项目的稳定性、安全性和可维护性。

## 核心原则

### 1. 最小化依赖原则
- 优先使用Node.js 22内置模块
- 只引入必要的第三方库
- 避免功能重复的依赖库
- 选择轻量级、维护良好的库

### 2. 版本管理原则
- 使用最新稳定版本
- 版本号使用 `^` 前缀允许小版本更新
- 核心依赖库必须使用最新版本
- 及时更新到安全版本

### 3. 稳定性原则
- 选择活跃维护的库
- 避免使用有已知问题的库
- 及时更新有修复问题的版本

## 生产依赖库（dependencies）

### 1. @modelcontextprotocol/sdk ^1.20.2
- **用途**: MCP协议官方TypeScript SDK
- **功能**:
  - 提供stdio、HTTP、SSE三种传输方式
  - 实现MCP客户端连接各个MCP服务
  - 实现MCP服务器对外提供聚合服务
  - 完整的TypeScript类型支持
- **选择原因**:
  - MCP协议官方SDK，兼容性最好
  - 项目核心功能必需
  - 务必使用最新版本获得完整功能支持
- **版本要求**: 必须使用最新版本1.20.2

### 2. express ^5.0.1
- **用途**: HTTP和SSE模式的Web框架
- **功能**:
  - HTTP服务器的路由管理
  - 中间件系统支持（CORS、错误处理、日志记录等）
  - SSE（Server-Sent Events）连接管理
  - 请求/响应处理和JSON解析
  - 静态文件服务（如需要）
- **选择原因**:
  - 成熟稳定的Web框架，社区支持良好
  - 强大的中间件生态系统，便于功能扩展
  - 完美支持HTTP和SSE协议需求
  - 与MCP SDK的HTTP传输层兼容性良好
  - 相比原生http模块，大幅简化复杂路由和中间件管理
- **使用场景**: 仅用于HTTP和SSE模式的对外服务，stdio模式不涉及
- **版本要求**: 最新版本5.0.1

### 3. commander ^14.0.1
- **用途**: 命令行接口框架
- **功能**:
  - 解析stdio/http/sse子命令
  - 处理命令行参数（--mcp-config, --log-level, --port等）
  - 生成帮助信息和错误提示
  - 支持命令验证和格式化
- **选择原因**:
  - 现代化的CLI框架，功能完整
  - TypeScript原生支持
  - 社区活跃，维护良好
  - 符合项目的命令行需求
- **版本要求**: 最新版本14.0.1

### 4. winston ^3.18.3
- **用途**: 日志管理系统
- **功能**:
  - 支持error、warn、info、debug四个日志级别
  - 支持控制台彩色输出
  - 支持文件输出（无轮转机制）
  - 支持静默模式（--silent参数）
  - 异步日志处理，不阻塞主流程
- **选择原因**:
  - 规范中明确要求使用Winston
  - 功能强大，配置灵活
  - 支持多种输出目标和格式
  - 异步处理保证系统性能
- **版本要求**: 最新版本3.18.3

### 5. ajv ^8.17.1
- **用途**: JSON Schema验证器
- **功能**:
  - 验证MCP配置文件格式
  - 支持复杂的JSON Schema规则
  - 提供详细的错误信息
  - 高性能验证
- **选择原因**:
  - 最快的JSON Schema验证器
  - 支持最新的JSON Schema规范
  - 与配置文件验证需求完美匹配
  - 社区标准，可靠性高
- **版本要求**: 最新版本8.17.1

## 开发依赖库（devDependencies）

### 1. typescript ^5.9.3
- **用途**: TypeScript编译器和语言服务
- **功能**:
  - 将TypeScript代码编译为JavaScript
  - 提供类型检查和语言服务
  - 支持最新TypeScript特性
  - 配合Node.js 22使用
- **选择原因**:
  - 项目要求使用TypeScript + Node 22
  - 类型安全保障代码质量
  - 现代JavaScript开发标准
  - 必须与@types/node版本匹配
- **版本要求**: 最新版本5.9.3

### 2. @types/node ^24.9.1
- **用途**: Node.js的TypeScript类型定义
- **功能**:
  - 提供Node.js内置模块的类型定义
  - 确保与Node.js 22版本匹配
  - 支持ES模块和CommonJS
  - 完整的API类型覆盖
- **选择原因**:
  - TypeScript项目必需
  - 必须与使用的Node.js版本一致
  - 提供完整的类型安全保障
  - 确保IDE智能提示准确
- **版本要求**: 最新版本24.9.1（匹配Node 22）

### 3. tsx ^4.20.6
- **用途**: TypeScript执行器和开发工具
- **功能**:
  - 直接执行TypeScript文件
  - 支持热重载和开发模式
  - 性能优于ts-node
  - 支持ESM和CommonJS
- **选择原因**:
  - 规范中明确要求优先使用tsx而非ts-node
  - 开发效率高，启动速度快
  - 现代TypeScript开发工具
  - 支持最新的Node.js特性
- **版本要求**: 最新版本4.20.6

### 4. jest ^30.2.0
- **用途**: JavaScript测试框架
- **功能**:
  - 单元测试和集成测试
  - 代码覆盖率报告
  - Mock和Spy功能
  - 异步测试支持
- **选择原因**:
  - 现代化的测试框架
  - 支持TypeScript
  - 满足项目测试覆盖率要求（≥80%）
  - 丰富的断言和Mock功能
- **版本要求**: 最新版本30.2.0

### 5. eslint ^9.38.0
- **用途**: JavaScript/TypeScript代码检查工具
- **功能**:
  - 代码质量检查
  - 代码风格统一
  - 潜在问题发现
  - 自动修复功能
- **选择原因**:
  - TypeScript项目代码质量保障
  - 确保代码规范一致性
  - 集成到开发流程中
  - 支持最新的JavaScript/TypeScript特性
- **版本要求**: 最新版本9.38.0

### 6. prettier ^3.6.2
- **用途**: 代码格式化工具
- **功能**:
  - 统一代码格式
  - 支持多种文件类型
  - 与ESLint集成
  - 可配置的格式化规则
- **选择原因**:
  - 确保代码风格一致性
  - 减少代码格式争议
  - 与ESLint配合使用
  - 现代代码格式化标准
- **版本要求**: 最新版本3.6.2

### 7. nodemon ^3.1.10
- **用途**: 开发时自动重启工具
- **功能**:
  - 监听文件变化自动重启
  - 支持TypeScript编译
  - 可配置的忽略规则
  - 开发效率提升
- **选择原因**:
  - 提高开发效率
  - 支持TypeScript项目
  - 传统的开发工具，稳定可靠
  - 减少手动重启操作
- **版本要求**: 最新版本3.1.10

## Node.js内置模块使用原则

### 架构选择说明

#### 1. Web服务器架构选择
- **HTTP/SSE服务模式**: 使用Express框架
  - **选择原因**: 需要处理复杂路由、中间件、CORS等功能，Express提供强大支持
  - **使用场景**: 仅用于HTTP和SSE模式的对外服务
  - **优势**: 简化开发，强大的中间件生态系统，与MCP SDK兼容性好
- **stdio模式**: 不涉及Web服务器，无需Express框架

#### 2. 其他场景仍优先使用内置模块

#### 2. 文件系统操作
- **使用**: `fs`, `fs/promises` 模块
- **替代**: fs-extra等第三方库
- **原因**: 内置fs模块功能足够，支持Promise API

#### 3. 路径处理
- **使用**: `path` 模块
- **替代**: path-browserify等第三方库
- **原因**: 内置path模块跨平台支持好

#### 4. 进程管理
- **使用**: `child_process` 模块
- **替代**: shelljs, execa等第三方库
- **原因**: 内置模块功能完整，支持所有需求

#### 5. 网络请求
- **使用**: `fetch` (Node.js 18+内置)
- **替代**: axios, node-fetch等第三方库
- **原因**: Node.js 18+内置fetch，符合现代Web标准

#### 6. 环境变量处理
- **使用**: `process.env`
- **替代**: dotenv等第三方库（仅在不使用.env文件时）
- **原因**: 内置环境变量访问，无需额外依赖

### 可考虑第三方库的特殊场景

#### 1. 环境变量文件支持
- **库**: dotenv ^16.4.5
- **用途**: 支持.env文件加载环境变量
- **原因**: 方便开发环境配置管理
- **注意**: 仅在需要.env文件时引入

#### 2. 更强大的文件系统操作
- **库**: fs-extra ^11.2.0
- **用途**: 提供更多文件系统操作方法
- **原因**: 如果内置fs模块功能不足时考虑
- **注意**: 优先使用内置fs模块

## 版本配置文件规范

### package.json配置示例

```json
{
  "name": "mcp-all-in-one",
  "version": "1.0.0",
  "description": "合并多个MCP服务为一个统一的MCP服务",
  "main": "dist/index.js",
  "bin": {
    "mcp-all-in-one": "bin/mcp-all-in-one"
  },
  "engines": {
    "node": ">=22.0.0"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "dev:watch": "nodemon --exec tsx src/index.ts",
    "prepublishOnly": "npm run build && npm test"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.20.2",
    "express": "^5.0.1",
    "commander": "^14.0.1",
    "winston": "^3.18.3",
    "ajv": "^8.17.1"
  },
  "devDependencies": {
    "@types/node": "^24.9.1",
    "@types/express": "^5.0.0",
    "typescript": "^5.9.3",
    "tsx": "^4.20.6",
    "jest": "^30.2.0",
    "eslint": "^9.38.0",
    "prettier": "^3.6.2",
    "nodemon": "^3.1.10"
  }
}
```

### .nvmrc 和 .node-version 配置
```
22
```

## 依赖管理最佳实践

### 1. 定期更新策略
- **每月检查**: 检查依赖库是否有新版本
- **问题更新**: 及时更新有已知问题的版本
- **功能更新**: 评估新版本功能是否需要
- **兼容性测试**: 更新前进行兼容性测试

### 2. 依赖检查
- **npm audit**: 定期运行依赖审计
- **依赖分析**: 分析依赖库的依赖关系
- **问题监控**: 监控已知问题信息

### 3. 版本锁定策略
- **开发环境**: 使用^前缀允许小版本更新
- **生产环境**: 考虑锁定具体版本号
- **CI/CD**: 在流水线中测试新版本兼容性
- **回滚准备**: 准备版本回滚方案

### 4. 依赖优化
- **tree shaking**: 移除未使用的代码
- **bundle分析**: 分析打包体积
- **重复依赖**: 检查并解决重复依赖
- **轻量替代**: 寻找更轻量的替代库

## 依赖库使用规范

### 1. Express框架使用
- **允许使用**: express ^5.0.1 - 用于HTTP和SSE模式的对外服务
- **使用原则**: 
  - 仅在HTTP和SSE模式中使用
  - stdio模式不涉及Web服务器功能
  - 优先使用Express核心功能，避免过度复杂的中间件
  - 确保与@modelcontextprotocol/sdk的HTTP传输层兼容

### 2. 仍需避免的HTTP框架
- **fastify**: 避免引入，统一使用Express
- **koa**: 避免引入，统一使用Express
- **hapi**: 避免引入，统一使用Express
- **其他HTTP框架**: 保持最小依赖原则，避免功能重复

### 2. HTTP客户端类
- **axios**: 使用Node.js内置fetch
- **node-fetch**: Node.js 18+内置fetch
- **got**: 使用Node.js内置fetch
- **request**: 已废弃，不安全

### 3. 工具库类
- **lodash**: 大部分功能可使用现代JavaScript替代
- **moment**: 使用现代Date API或date-fns
- **underscore**: 功能可使用现代JavaScript替代

### 4. 已废弃或不维护的库
- **request**: HTTP客户端，已废弃
- **moment.js**: 日期库，已建议迁移
- **babel**: 如果使用Node.js 22，大部分情况下不需要

## 特殊说明

### 1. @modelcontextprotocol/sdk 版本要求
- **必须使用最新版本**: 这是项目核心依赖
- **定期检查**: 每月检查是否有新版本
- **立即更新**: 发现新版本应立即评估更新
- **测试验证**: 更新后必须完整测试

### 2. Express框架使用原则
- **版本选择**: 使用Express 5.x最新稳定版本
- **功能限制**: 仅使用HTTP和SSE服务相关的核心功能
- **中间件选择**: 只选择项目必需的中间件，避免过度复杂化
- **性能监控**: 确保Express的使用不影响MCP代理性能

### 3. TypeScript版本匹配
- **@types/node版本**: 必须与Node.js版本匹配
- **@types/express版本**: 必须与Express版本匹配
- **TypeScript版本**: 使用最新稳定版本
- **类型兼容**: 确保所有类型定义兼容

### 4. 开发工具版本
- **工具链统一**: 确保所有开发工具版本兼容
- **IDE支持**: 考虑IDE和编辑器的兼容性
- **团队协作**: 确保团队开发环境一致

这个依赖管理规范确保项目使用最新、最稳定、最合适的依赖库，同时根据实际需求合理选择Express框架，为HTTP和SSE模式提供强大的Web服务支持。