/**
 * 配置错误类
 * 处理配置文件相关的错误
 */

import { ErrorCode, ErrorSeverity } from '../types/errors';
import { BaseError } from './BaseError';
import { ErrorDetail } from '../types/errors';

/**
 * 配置错误类
 */
export class ConfigError extends BaseError {
    /**
     * 创建配置错误实例
     * @param message 错误消息
     * @param code 错误代码
     * @param context 错误上下文
     * @param cause 原始错误
     */
    constructor(
        message: string,
        code: ErrorCode = ErrorCode.CONFIG_VALIDATION_ERROR,
        context?: Record<string, any>,
        cause?: Error
    ) {
        super({
            code,
            message,
            severity: ErrorSeverity.MEDIUM,
            timestamp: new Date(),
            context,
            cause
        });
    }

    /**
     * 创建配置文件未找到错误
     * @param filePath 文件路径
     * @returns ConfigError实例
     */
    public static fileNotFound(filePath: string): ConfigError {
        return new ConfigError(
            `配置文件未找到: ${filePath}`,
            ErrorCode.CONFIG_FILE_NOT_FOUND,
            { filePath },
            undefined
        );
    }

    /**
     * 创建配置解析错误
     * @param filePath 文件路径
     * @param parseError 解析错误
     * @returns ConfigError实例
     */
    public static parseError(filePath: string, parseError: Error): ConfigError {
        return new ConfigError(
            `配置文件解析失败: ${filePath} - ${parseError.message}`,
            ErrorCode.CONFIG_PARSE_ERROR,
            { filePath },
            parseError
        );
    }

    /**
     * 创建配置验证错误
     * @param validationErrors 验证错误列表
     * @returns ConfigError实例
     */
    public static validationError(validationErrors: Array<{
        path: string;
        message: string;
        value?: any;
    }>): ConfigError {
        const details: ErrorDetail[] = validationErrors.map(error => ({
            path: error.path,
            value: error.value,
            suggestion: `请检查配置文件中 ${error.path} 的值`
        }));

        const errorMessage = `配置验证失败，发现 ${validationErrors.length} 个错误:\n` +
            validationErrors.map(error => `- ${error.path}: ${error.message}`).join('\n');

        return new ConfigError(
            errorMessage,
            ErrorCode.CONFIG_VALIDATION_ERROR,
            { errorCount: validationErrors.length },
            undefined
        );
    }

    /**
     * 创建环境变量错误
     * @param varName 环境变量名
     * @param reason 错误原因
     * @returns ConfigError实例
     */
    public static environmentVariableError(varName: string, reason: string): ConfigError {
        return new ConfigError(
            `环境变量错误: ${varName} - ${reason}`,
            ErrorCode.CONFIG_VALIDATION_ERROR,
            { varName, reason },
            undefined
        );
    }

    /**
     * 获取用户友好的错误消息
     * @returns 用户友好的错误消息
     */
    public getUserFriendlyMessage(): string {
        switch (this.code) {
            case ErrorCode.CONFIG_FILE_NOT_FOUND:
                return `找不到配置文件，请检查文件路径是否正确，或使用 --mcp-config 参数指定配置文件路径。`;

            case ErrorCode.CONFIG_PARSE_ERROR:
                return `配置文件格式错误，请检查JSON格式是否正确。`;

            case ErrorCode.CONFIG_VALIDATION_ERROR:
                return `配置文件内容不符合要求，请按照错误提示修正配置。`;

            default:
                return this.message;
        }
    }
}