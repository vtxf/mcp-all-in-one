/**
 * 基础错误类
 * 所有项目错误类的基类
 */

import { ErrorCode, ErrorSeverity, BaseErrorData, ErrorDetail } from '../types/errors';

/**
 * 基础错误类
 */
export class BaseError extends Error {
    /** 错误代码 */
    public readonly code: ErrorCode;

    /** 错误严重级别 */
    public readonly severity: ErrorSeverity;

    /** 错误发生时间 */
    public readonly timestamp: Date;

    /** 错误上下文信息 */
    public readonly context?: Record<string, any>;

    /** 原始错误对象 */
    public readonly cause?: Error;

    /** 错误详情 */
    public readonly details?: ErrorDetail[];

    /**
     * 创建基础错误实例
     * @param data 错误数据
     */
    constructor(data: BaseErrorData) {
        super(data.message);

        this.name = this.constructor.name;
        this.code = data.code;
        this.severity = data.severity;
        this.timestamp = data.timestamp;
        this.context = data.context;
        this.cause = data.cause;

        // 确保错误堆栈正确
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * 获取错误的完整描述
     * @returns 错误描述字符串
     */
    public getFullDescription(): string {
        let description = `[${this.code}] ${this.message}`;

        if (this.context && Object.keys(this.context).length > 0) {
            description += `\nContext: ${JSON.stringify(this.context, null, 2)}`;
        }

        if (this.details && this.details.length > 0) {
            description += '\nDetails:';
            this.details.forEach((detail, index) => {
                description += `\n  ${index + 1}. ${this.formatErrorDetail(detail)}`;
            });
        }

        if (this.cause) {
            description += `\nCaused by: ${this.cause.message}`;
        }

        return description;
    }

    /**
     * 格式化错误详情
     * @param detail 错误详情
     * @returns 格式化后的字符串
     */
    private formatErrorDetail(detail: ErrorDetail): string {
        let formatted = '';

        if (detail.path) {
            formatted += `Path: ${detail.path}`;
        }

        if (detail.value !== undefined) {
            formatted += (formatted ? ', ' : '') + `Value: ${JSON.stringify(detail.value)}`;
        }

        if (detail.expected !== undefined) {
            formatted += (formatted ? ', ' : '') + `Expected: ${JSON.stringify(detail.expected)}`;
        }

        if (detail.actual !== undefined) {
            formatted += (formatted ? ', ' : '') + `Actual: ${JSON.stringify(detail.actual)}`;
        }

        if (detail.suggestion) {
            formatted += (formatted ? ', ' : '') + `Suggestion: ${detail.suggestion}`;
        }

        return formatted;
    }

    /**
     * 转换为JSON对象
     * @returns JSON格式的错误信息
     */
    public toJSON(): Record<string, any> {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            severity: this.severity,
            timestamp: this.timestamp.toISOString(),
            context: this.context,
            cause: this.cause ? {
                name: this.cause.name,
                message: this.cause.message,
                stack: this.cause.stack
            } : undefined,
            details: this.details,
            stack: this.stack
        };
    }

    /**
     * 判断是否为可重试的错误
     * @returns 是否可重试
     */
    public isRetryable(): boolean {
        // 默认实现，子类可以重写
        const retryableCodes = [
            ErrorCode.CONNECTION_TIMEOUT,
            ErrorCode.CONNECTION_FAILED,
            ErrorCode.SERVICE_START_FAILED
        ];
        return retryableCodes.includes(this.code);
    }

    /**
     * 判断是否为严重错误
     * @returns 是否为严重错误
     */
    public isCritical(): boolean {
        return this.severity === ErrorSeverity.CRITICAL;
    }

    /**
     * 获取用户友好的错误消息
     * @returns 用户友好的错误消息
     */
    public getUserFriendlyMessage(): string {
        // 默认实现，子类可以重写提供更友好的消息
        return this.message;
    }
}