/**
 * 验证错误类
 * 处理数据验证相关的错误
 */

import { ErrorCode, ErrorSeverity } from '../types/errors';
import { BaseError } from './BaseError';

/**
 * 验证错误类
 */
export class ValidationError extends BaseError {
    /**
     * 创建验证错误实例
     * @param message 错误消息
     * @param field 验证失败的字段
     * @param value 验证失败的值
     * @param expected 期望的值
     * @param context 错误上下文
     */
    constructor(
        message: string,
        field?: string,
        value?: any,
        expected?: any,
        context?: Record<string, any>
    ) {
        super({
            code: ErrorCode.INVALID_OPERATION,
            message,
            severity: ErrorSeverity.MEDIUM,
            timestamp: new Date(),
            context: { ...context, field, value, expected }
        });
    }

    /**
     * 创建参数验证错误
     * @param parameterName 参数名
     * @param reason 验证失败原因
     * @param value 参数值
     * @returns ValidationError实例
     */
    public static parameterError(parameterName: string, reason: string, value?: any): ValidationError {
        return new ValidationError(
            `参数验证失败: ${parameterName} - ${reason}`,
            parameterName,
            value
        );
    }

    /**
     * 创建类型验证错误
     * @param fieldName 字段名
     * @param expectedType 期望类型
     * @param actualValue 实际值
     * @returns ValidationError实例
     */
    public static typeError(fieldName: string, expectedType: string, actualValue: any): ValidationError {
        return new ValidationError(
            `类型验证失败: ${fieldName} 期望 ${expectedType} 类型，实际为 ${typeof actualValue}`,
            fieldName,
            actualValue,
            expectedType
        );
    }

    /**
     * 创建范围验证错误
     * @param fieldName 字段名
     * @param value 值
     * @param min 最小值
     * @param max 最大值
     * @returns ValidationError实例
     */
    public static rangeError(fieldName: string, value: number, min: number, max: number): ValidationError {
        return new ValidationError(
            `范围验证失败: ${fieldName} 值 ${value} 超出范围 [${min}, ${max}]`,
            fieldName,
            value,
            `[${min}, ${max}]`
        );
    }

    /**
     * 创建必需字段验证错误
     * @param fieldName 字段名
     * @returns ValidationError实例
     */
    public static requiredFieldError(fieldName: string): ValidationError {
        return new ValidationError(
            `缺少必需字段: ${fieldName}`,
            fieldName
        );
    }

    /**
     * 获取用户友好的错误消息
     * @returns 用户友好的错误消息
     */
    public getUserFriendlyMessage(): string {
        const field = this.context?.field;

        if (field) {
            return `字段 "${field}" 验证失败，请检查输入值。`;
        }

        return '数据验证失败，请检查输入格式和内容。';
    }
}