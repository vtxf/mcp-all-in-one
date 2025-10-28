/**
 * 服务相关类型定义
 */

import { McpServerConfig, McpServerType } from './config';
import { ConnectionStatus, AnyTransportConnection } from './transport';

/**
 * 服务状态枚举
 */
export enum ServiceStatus {
    STOPPED = 'stopped',
    STARTING = 'starting',
    RUNNING = 'running',
    STOPPING = 'stopping',
    ERROR = 'error',
    RESTARTING = 'restarting'
}

/**
 * MCP服务信息
 */
export interface McpService {
    /** 服务名称 */
    name: string;
    /** 服务配置 */
    config: McpServerConfig;
    /** 服务状态 */
    status: ServiceStatus;
    /** 传输连接 */
    connection?: AnyTransportConnection;
    /** 服务启动时间 */
    startedAt?: Date;
    /** 最后错误信息 */
    lastError?: Error;
    /** 重启次数 */
    restartCount: number;
    /** 是否启用 */
    enabled: boolean;
}

/**
 * 服务管理器配置
 */
export interface ServiceManagerConfig {
    /** 服务健康检查间隔(毫秒) */
    healthCheckInterval: number;
    /** 服务启动超时时间(毫秒) */
    startTimeout: number;
    /** 服务停止超时时间(毫秒) */
    stopTimeout: number;
    /** 最大重启次数 */
    maxRestartAttempts: number;
    /** 重启延迟(毫秒) */
    restartDelay: number;
}

/**
 * 服务事件类型
 */
export enum ServiceEventType {
    SERVICE_ADDED = 'service_added',
    SERVICE_REMOVED = 'service_removed',
    SERVICE_STARTED = 'service_started',
    SERVICE_STOPPED = 'service_stopped',
    SERVICE_ERROR = 'service_error',
    SERVICE_RESTARTED = 'service_restarted',
    HEALTH_CHECK_FAILED = 'health_check_failed',
    HEALTH_CHECK_PASSED = 'health_check_passed'
}

/**
 * 服务事件数据
 */
export interface ServiceEvent {
    type: ServiceEventType;
    serviceName: string;
    timestamp: Date;
    data?: any;
    error?: Error;
}

/**
 * 服务统计信息
 */
export interface ServiceStats {
    /** 服务总数 */
    totalServices: number;
    /** 运行中的服务数 */
    runningServices: number;
    /** 错误状态的服务数 */
    errorServices: number;
    /** 停止的服务数 */
    stoppedServices: number;
    /** 总重启次数 */
    totalRestarts: number;
    /** 平均正常运行时间(毫秒) */
    averageUptime: number;
}

/**
 * 服务过滤器
 */
export interface ServiceFilter {
    /** 服务名称模式 */
    namePattern?: string;
    /** 服务类型 */
    serverType?: McpServerType;
    /** 服务状态 */
    status?: ServiceStatus;
    /** 是否启用 */
    enabled?: boolean;
}

/**
 * 服务操作结果
 */
export interface ServiceOperationResult {
    /** 操作是否成功 */
    success: boolean;
    /** 影响的服务名称 */
    serviceName: string;
    /** 错误信息 */
    error?: Error;
    /** 操作时间 */
    timestamp: Date;
}