/**
 * 传输协议相关类型定义
 */

import { McpServerConfig, McpServerType } from './config';

/**
 * 传输协议类型枚举
 */
export enum TransportType {
    STDIO = 'stdio',
    HTTP = 'http'
}

/**
 * 连接状态枚举
 */
export enum ConnectionStatus {
    DISCONNECTED = 'disconnected',
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    ERROR = 'error',
    RECONNECTING = 'reconnecting'
}

/**
 * 传输连接基础接口
 */
export interface TransportConnection {
    /** 连接ID */
    id: string;
    /** 连接状态 */
    status: ConnectionStatus;
    /** 最后错误信息 */
    lastError?: Error;
    /** 连接建立时间 */
    connectedAt?: Date;
    /** 最后活动时间 */
    lastActivity?: Date;
}

/**
 * STDIO传输连接
 */
export interface StdioTransportConnection extends TransportConnection {
    type: TransportType.STDIO;
    /** 进程ID */
    pid?: number;
    /** 命令行 */
    command: string;
    /** 命令参数 */
    args: string[];
    /** 工作目录 */
    cwd?: string;
    /** 环境变量 */
    env?: Record<string, string>;
}

/**
 * HTTP传输连接
 */
export interface HttpTransportConnection extends TransportConnection {
    type: TransportType.HTTP;
    /** 服务URL */
    url: string;
    /** 请求头 */
    headers?: Record<string, string>;
    /** 超时时间 */
    timeout: number;
    /** 重试次数 */
    retries: number;
}

/**
 * 传输连接联合类型
 */
export type AnyTransportConnection =
    | StdioTransportConnection
    | HttpTransportConnection;

/**
 * 传输事件类型
 */
export enum TransportEventType {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    ERROR = 'error',
    MESSAGE = 'message',
    RECONNECTING = 'reconnecting'
}

/**
 * 传输事件数据
 */
export interface TransportEvent {
    type: TransportEventType;
    connectionId: string;
    timestamp: Date;
    data?: any;
    error?: Error;
}

/**
 * 传输配置
 */
export interface TransportConfig {
    /** 连接超时时间(毫秒) */
    timeout: number;
    /** 是否启用自动重连 */
    autoReconnect: boolean;
    /** 重连间隔(毫秒) */
    reconnectInterval: number;
    /** 最大重试次数 */
    maxRetries: number;
    /** 心跳间隔(毫秒) */
    heartbeatInterval?: number;
}