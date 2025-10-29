/**
 * 配置相关类型定义
 */

/**
 * MCP服务器类型枚举
 */
export enum McpServerType {
    STDIO = 'stdio',
    HTTP = 'http'
}

/**
 * STDIO类型MCP服务器配置
 */
export interface StdioServerConfig {
    type?: McpServerType.STDIO; // 改为可选，默认为STDIO
    command: string;
    args?: string[];
    env?: Record<string, string>;
    cwd?: string;
    timeout?: number;
    restart?: boolean;
    restartDelay?: number;
}

/**
 * HTTP类型MCP服务器配置
 */
export interface HttpServerConfig {
    type: McpServerType.HTTP;
    url: string;
    headers?: Record<string, string>;
}

/**
 * MCP服务器配置联合类型
 */
export type McpServerConfig = StdioServerConfig | HttpServerConfig;

/**
 * MCP服务器配置集合
 */
export interface McpServersConfig {
    [serverName: string]: McpServerConfig;
}

/**
 * 完整的MCP配置文件结构
 */
export interface McpConfig {
    mcpServers: McpServersConfig;
}

/**
 * 默认配置值
 */
export const DEFAULT_CONFIG: McpConfig = {
    mcpServers: {}
};

/**
 * 配置验证错误信息
 */
export interface ConfigValidationError {
    path: string;
    message: string;
    value?: any;
}

/**
 * 配置加载选项
 */
export interface ConfigLoadOptions {
    /** 配置文件路径 */
    configPath?: string;
    /** 是否自动创建默认配置 */
    autoCreate?: boolean;
    /** 是否验证环境变量 */
    validateEnv?: boolean;
}