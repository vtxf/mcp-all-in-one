/**
 * 简化的日志管理器
 * 提供基础的日志功能，后续可扩展为Winston实现
 */

import { LogLevel } from '../../types/cli';

/**
 * 日志输出目标枚举
 */
export enum LogOutputTarget {
    STDOUT = 'stdout',
    STDERR = 'stderr'
}

/**
 * 简化的日志管理器类
 */
export class Logger {
    private logLevel: LogLevel;
    private silentMode: boolean;
    private name: string;
    private outputTarget: LogOutputTarget;

    /**
     * 创建日志管理器实例
     * @param name 模块名称
     * @param logLevel 日志级别
     * @param silentMode 静默模式
     * @param outputTarget 输出目标，默认为stdout
     */
    constructor(name: string, logLevel: LogLevel = LogLevel.INFO, silentMode: boolean = false, outputTarget: LogOutputTarget = LogOutputTarget.STDOUT) {
        this.name = name;
        this.logLevel = logLevel;
        this.silentMode = silentMode;
        this.outputTarget = outputTarget;
    }

    /**
     * 设置日志级别
     * @param level 日志级别
     */
    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    /**
     * 设置静默模式
     * @param silent 是否静默
     */
    public setSilentMode(silent: boolean): void {
        this.silentMode = silent;
    }

    /**
     * 设置输出目标
     * @param target 输出目标
     */
    public setOutputTarget(target: LogOutputTarget): void {
        this.outputTarget = target;
    }

    /**
     * 检查是否应该记录指定级别的日志
     * @param level 日志级别
     * @returns 是否应该记录
     */
    private shouldLog(level: LogLevel): boolean {
        if (this.silentMode) {
            return false;
        }

        const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const targetLevelIndex = levels.indexOf(level);

        return targetLevelIndex <= currentLevelIndex;
    }

    /**
     * 格式化日志消息
     * @param level 日志级别
     * @param message 消息内容
     * @param extra 额外信息
     * @returns 格式化后的消息
     */
    private formatMessage(level: LogLevel, message: string, extra?: any): string {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] [${this.name}] ${message}`;

        if (extra && Object.keys(extra).length > 0) {
            return `${formattedMessage} ${JSON.stringify(extra)}`;
        }

        return formattedMessage;
    }

    /**
     * 输出日志到指定目标
     * @param message 日志消息
     */
    private writeToOutput(message: string): void {
        if (this.outputTarget === LogOutputTarget.STDERR) {
            console.error(message);
        } else {
            console.log(message);
        }
    }

    /**
     * 记录错误日志
     * @param message 错误消息
     * @param extra 额外信息
     */
    public error(message: string, extra?: any): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            const formattedMessage = this.formatMessage(LogLevel.ERROR, message, extra);
            // 错误日志总是输出到 stderr
            console.error(formattedMessage);
        }
    }

    /**
     * 记录警告日志
     * @param message 警告消息
     * @param extra 额外信息
     */
    public warn(message: string, extra?: any): void {
        if (this.shouldLog(LogLevel.WARN)) {
            const formattedMessage = this.formatMessage(LogLevel.WARN, message, extra);
            // 警告日志总是输出到 stderr
            console.warn(formattedMessage);
        }
    }

    /**
     * 记录信息日志
     * @param message 信息消息
     * @param extra 额外信息
     */
    public info(message: string, extra?: any): void {
        if (this.shouldLog(LogLevel.INFO)) {
            const formattedMessage = this.formatMessage(LogLevel.INFO, message, extra);
            this.writeToOutput(formattedMessage);
        }
    }

    /**
     * 记录调试日志
     * @param message 调试消息
     * @param extra 额外信息
     */
    public debug(message: string, extra?: any): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, extra);
            this.writeToOutput(formattedMessage);
        }
    }

    /**
     * 记录原始日志（不格式化）
     * @param message 日志消息
     */
    public raw(message: string): void {
        if (!this.silentMode) {
            this.writeToOutput(message);
        }
    }

    /**
     * 创建子日志器
     * @param childName 子模块名称
     * @returns 子日志器实例
     */
    public child(childName: string): Logger {
        const fullName = `${this.name}:${childName}`;
        return new Logger(fullName, this.logLevel, this.silentMode, this.outputTarget);
    }
}

/**
 * 默认日志器实例
 */
export const defaultLogger = new Logger('mcp-all-in-one');