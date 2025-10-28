/**
 * 服务错误类
 * 处理MCP服务相关的错误
 */

import { ErrorCode, ErrorSeverity } from '../types/errors';
import { BaseError } from './BaseError';

/**
 * 服务错误类
 */
export class ServiceError extends BaseError {
    /**
     * 创建服务错误实例
     * @param message 错误消息
     * @param code 错误代码
     * @param serviceName 服务名称
     * @param context 错误上下文
     * @param cause 原始错误
     */
    constructor(
        message: string,
        code: ErrorCode = ErrorCode.SERVICE_START_FAILED,
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
     * 创建服务启动失败错误
     * @param serviceName 服务名称
     * @param reason 失败原因
     * @param cause 原始错误
     * @returns ServiceError实例
     */
    public static startFailed(serviceName: string, reason: string, cause?: Error): ServiceError {
        return new ServiceError(
            `服务启动失败: ${serviceName} - ${reason}`,
            ErrorCode.SERVICE_START_FAILED,
            serviceName,
            { reason },
            cause
        );
    }

    /**
     * 创建服务停止失败错误
     * @param serviceName 服务名称
     * @param reason 失败原因
     * @param cause 原始错误
     * @returns ServiceError实例
     */
    public static stopFailed(serviceName: string, reason: string, cause?: Error): ServiceError {
        return new ServiceError(
            `服务停止失败: ${serviceName} - ${reason}`,
            ErrorCode.SERVICE_STOP_FAILED,
            serviceName,
            { reason },
            cause
        );
    }

    /**
     * 创建服务未找到错误
     * @param serviceName 服务名称
     * @returns ServiceError实例
     */
    public static notFound(serviceName: string): ServiceError {
        return new ServiceError(
            `服务未找到: ${serviceName}`,
            ErrorCode.SERVICE_NOT_FOUND,
            serviceName
        );
    }

    /**
     * 创建服务已在运行错误
     * @param serviceName 服务名称
     * @returns ServiceError实例
     */
    public static alreadyRunning(serviceName: string): ServiceError {
        return new ServiceError(
            `服务已在运行: ${serviceName}`,
            ErrorCode.SERVICE_ALREADY_RUNNING,
            serviceName
        );
    }

    /**
     * 获取用户友好的错误消息
     * @returns 用户友好的错误消息
     */
    public getUserFriendlyMessage(): string {
        const serviceName = this.context?.serviceName || '未知服务';

        switch (this.code) {
            case ErrorCode.SERVICE_START_FAILED:
                return `服务 ${serviceName} 启动失败，请检查配置和依赖项。`;

            case ErrorCode.SERVICE_STOP_FAILED:
                return `服务 ${serviceName} 停止失败，请尝试强制终止进程。`;

            case ErrorCode.SERVICE_NOT_FOUND:
                return `找不到服务 ${serviceName}，请检查配置文件。`;

            case ErrorCode.SERVICE_ALREADY_RUNNING:
                return `服务 ${serviceName} 已在运行中。`;

            default:
                return this.message;
        }
    }
}