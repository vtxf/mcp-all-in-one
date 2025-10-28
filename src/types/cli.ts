/**
 * CLI相关类型定义
 */

/**
 * 命令类型枚举
 */
export enum CommandType {
    STDIO = 'stdio',
    HTTP = 'http',
    VALIDATE_CONFIG = 'validate-mcp-config',
    SHOW_CONFIG_SCHEMA = 'show-mcp-config-schema',
    SHOW_CONFIG = 'show-mcp-config',
    SET_CONFIG = 'set-mcp-config'
}

/**
 * 日志级别枚举
 */
export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug'
}

/**
 * 基础命令选项
 */
export interface BaseCommandOptions {
    /** MCP配置文件路径 */
    mcpConfig?: string;
    /** 日志级别 */
    logLevel?: LogLevel;
    /** 日志文件路径 */
    logFile?: string;
    /** 静默模式 */
    silent?: boolean;
}

/**
 * STDIO命令选项
 */
export interface StdioCommandOptions extends BaseCommandOptions {
    /** 命令类型固定为stdio */
    command: CommandType.STDIO;
}

/**
 * HTTP命令选项
 */
export interface HttpCommandOptions extends BaseCommandOptions {
    /** 命令类型固定为http */
    command: CommandType.HTTP;
    /** 服务端口 */
    port?: number;
    /** 绑定主机 */
    host?: string;
    /** 是否启用CORS */
    cors?: boolean;
    /** CORS允许的源 */
    corsOrigin?: string;
}


/**
 * 验证配置命令选项
 */
export interface ValidateConfigCommandOptions {
    /** 命令类型固定为validate-mcp-config */
    command: CommandType.VALIDATE_CONFIG;
    /** 配置文件路径 */
    configPath?: string;
}

/**
 * 显示配置Schema命令选项
 */
export interface ShowConfigSchemaCommandOptions {
    /** 命令类型固定为show-mcp-config-schema */
    command: CommandType.SHOW_CONFIG_SCHEMA;
}

/**
 * 显示配置命令选项
 */
export interface ShowConfigCommandOptions {
    /** 命令类型固定为show-mcp-config */
    command: CommandType.SHOW_CONFIG;
    /** 配置文件路径 */
    configPath?: string;
}

/**
 * 设置配置命令选项
 */
export interface SetConfigCommandOptions {
    /** 命令类型固定为set-mcp-config */
    command: CommandType.SET_CONFIG;
    /** 配置文件路径 */
    configPath?: string;
}

/**
 * 命令选项联合类型
 */
export type CommandOptions =
    | StdioCommandOptions
    | HttpCommandOptions
    | ValidateConfigCommandOptions
    | ShowConfigSchemaCommandOptions
    | ShowConfigCommandOptions
    | SetConfigCommandOptions;

/**
 * 默认配置值
 */
export const DEFAULT_CLI_CONFIG = {
    /** 默认MCP配置文件路径 */
    defaultMcpConfigPath: '~/.mcp-all-in-one/mcp.json',
    /** 默认日志级别 */
    defaultLogLevel: LogLevel.INFO,
    /** 默认HTTP端口 */
    defaultHttpPort: 3095,
    /** 默认主机地址 */
    defaultHost: '127.0.0.1',
    /** 默认CORS设置 */
    defaultCors: false,
    /** 默认CORS源 */
    defaultCorsOrigin: '*'
};

/**
 * 命令执行结果
 */
export interface CommandResult {
    /** 执行是否成功 */
    success: boolean;
    /** 错误信息 */
    error?: Error;
    /** 执行时间(毫秒) */
    executionTime: number;
    /** 返回数据 */
    data?: any;
}