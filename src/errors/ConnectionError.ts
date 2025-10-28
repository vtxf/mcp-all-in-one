/**
 * 连接错误类
 * 处理MCP服务连接相关的错误
 */

import { ErrorCode, ErrorSeverity } from '../types/errors';
import { BaseError } from './BaseError';

/**
 * 连接错误类
 */
export class ConnectionError extends BaseError {
    /**
     * 创建连接错误实例
     * @param message 错误消息
     * @param code 错误代码
     * @param serviceName 服务名称
     * @param context 错误上下文
     * @param cause 原始错误
     */
    constructor(
        message: string,
        code: ErrorCode = ErrorCode.CONNECTION_FAILED,
        serviceName?: string,
        context?: Record<string, any>,
        cause?: Error
    ) {
        super({
            code,
            message,
            severity: ErrorSeverity.HIGH,
            timestamp: new Date(),
            context: { ...context, serviceName },
            cause
        });
    }

    /**
     * 创建连接失败错误
     * @param serviceName 服务名称
     * @param reason 失败原因
     * @param cause 原始错误
     * @returns ConnectionError实例
     */
    public static connectionFailed(serviceName: string, reason: string, cause?: Error): ConnectionError {
        return new ConnectionError(
            `连接服务失败: ${serviceName} - ${reason}`,
            ErrorCode.CONNECTION_FAILED,
            serviceName,
            { reason },
            cause
        );
    }

    /**
     * 创建连接超时错误
     * @param serviceName 服务名称
     * @param timeout 超时时间(毫秒)
     * @returns ConnectionError实例
     */
    public static connectionTimeout(serviceName: string, timeout: number): ConnectionError {
        return new ConnectionError(
            `连接服务超时: ${serviceName} (超时时间: ${timeout}ms)`,
            ErrorCode.CONNECTION_TIMEOUT,
            serviceName,
            { timeout }
        );
    }

    /**
     * 创建连接被拒绝错误
     * @param serviceName 服务名称
     * @param address 连接地址
     * @returns ConnectionError实例
     */
    public static connectionRefused(serviceName: string, address: string): ConnectionError {
        return new ConnectionError(
            `连接被拒绝: ${serviceName} (${address})`,
            ErrorCode.CONNECTION_REFUSED,
            serviceName,
            { address }
        );
    }

    /**
     * 创建连接丢失错误
     * @param serviceName 服务名称
     * @param reason 丢失原因
     * @returns ConnectionError实例
     */
    public static connectionLost(serviceName: string, reason: string): ConnectionError {
        return new ConnectionError(
            `连接丢失: ${serviceName} - ${reason}`,
            ErrorCode.CONNECTION_LOST,
            serviceName,
            { reason }
        );
    }

    /**
     * 判断是否为可重试的错误
     * @returns 是否可重试
     */
    public isRetryable(): boolean {
        const retryableCodes = [
            ErrorCode.CONNECTION_TIMEOUT,
            ErrorCode.CONNECTION_FAILED,
            ErrorCode.CONNECTION_REFUSED,
            ErrorCode.CONNECTION_LOST
        ];
        return retryableCodes.includes(this.code);
    }

    /**
     * 获取用户友好的错误消息
     * @returns 用户友好的错误消息
     */
    public getUserFriendlyMessage(): string {
        const serviceName = this.context?.serviceName || '未知服务';

        switch (this.code) {
            case ErrorCode.CONNECTION_FAILED:
                return `无法连接到服务 ${serviceName}，请检查服务是否正在运行。`;

            case ErrorCode.CONNECTION_TIMEOUT:
                return `连接服务 ${serviceName} 超时，请检查网络连接或增加超时时间。`;

            case ErrorCode.CONNECTION_REFUSED:
                return `服务 ${serviceName} 拒绝连接，请检查服务配置和防火墙设置。`;

            case ErrorCode.CONNECTION_LOST:
                return `与服务 ${serviceName} 的连接已断开，系统将尝试重新连接。`;

            default:
                return this.message;
        }
    }
}