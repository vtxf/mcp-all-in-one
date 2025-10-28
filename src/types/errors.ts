/**
 * 错误类型定义
 */

/**
 * 错误代码枚举
 */
export enum ErrorCode {
    // 配置相关错误
    CONFIG_FILE_NOT_FOUND = 'CONFIG_FILE_NOT_FOUND',
    CONFIG_PARSE_ERROR = 'CONFIG_PARSE_ERROR',
    CONFIG_VALIDATION_ERROR = 'CONFIG_VALIDATION_ERROR',
    CONFIG_SCHEMA_ERROR = 'CONFIG_SCHEMA_ERROR',

    // 连接相关错误
    CONNECTION_FAILED = 'CONNECTION_FAILED',
    CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
    CONNECTION_REFUSED = 'CONNECTION_REFUSED',
    CONNECTION_LOST = 'CONNECTION_LOST',

    // 服务相关错误
    SERVICE_START_FAILED = 'SERVICE_START_FAILED',
    SERVICE_STOP_FAILED = 'SERVICE_STOP_FAILED',
    SERVICE_NOT_FOUND = 'SERVICE_NOT_FOUND',
    SERVICE_ALREADY_RUNNING = 'SERVICE_ALREADY_RUNNING',

    // 协议相关错误
    PROTOCOL_ERROR = 'PROTOCOL_ERROR',
    INVALID_MESSAGE = 'INVALID_MESSAGE',
    UNSUPPORTED_TRANSPORT = 'UNSUPPORTED_TRANSPORT',

    // 系统相关错误
    PERMISSION_DENIED = 'PERMISSION_DENIED',
    FILE_NOT_FOUND = 'FILE_NOT_FOUND',
    INVALID_OPERATION = 'INVALID_OPERATION',

    // 通用错误
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR'
}

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

/**
 * 基础错误接口
 */
export interface BaseErrorData {
    /** 错误代码 */
    code: ErrorCode;
    /** 错误消息 */
    message: string;
    /** 错误严重级别 */
    severity: ErrorSeverity;
    /** 错误发生时间 */
    timestamp: Date;
    /** 错误上下文信息 */
    context?: Record<string, any>;
    /** 原始错误对象 */
    cause?: Error;
}

/**
 * 错误详情
 */
export interface ErrorDetail {
    /** 错误路径 */
    path?: string;
    /** 错误值 */
    value?: any;
    /** 期望值 */
    expected?: any;
    /** 实际值 */
    actual?: any;
    /** 建议修复方案 */
    suggestion?: string;
}

/**
 * 批量错误信息
 */
export interface BulkError {
    /** 错误总数 */
    total: number;
    /** 错误列表 */
    errors: Array<{
        code: ErrorCode;
        message: string;
        path?: string;
        detail?: ErrorDetail;
    }>;
}