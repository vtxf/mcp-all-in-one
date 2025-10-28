/**
 * 命令基类
 * 定义所有命令的通用接口和行为
 */

import { Logger, LogOutputTarget } from '../../core/logger/Logger';
import { LogLevel } from '../../types/cli';

/**
 * 命令基类
 */
export abstract class BaseCommand {
    protected logger: Logger;
    protected logLevel: LogLevel;
    protected silentMode: boolean;

    /**
     * 创建命令实例
     * @param name 命令名称
     */
    constructor(protected name: string) {
        this.logger = new Logger(`Command:${name}`);
        this.logLevel = LogLevel.INFO;
        this.silentMode = false;
    }

    /**
     * 设置日志级别
     * @param level 日志级别
     */
    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
        this.logger.setLogLevel(level);
    }

    /**
     * 设置静默模式
     * @param silent 是否静默
     */
    public setSilentMode(silent: boolean): void {
        this.silentMode = silent;
        this.logger.setSilentMode(silent);
    }

    /**
     * 设置日志输出目标
     * @param target 输出目标
     */
    public setLogOutputTarget(target: LogOutputTarget): void {
        // 重新创建 logger 实例以使用新的输出目标
        this.logger = new Logger(`Command:${this.name}`, this.logLevel, this.silentMode, target);
    }

    /**
     * 执行命令
     * @param args 命令参数
     * @returns 执行结果
     */
    public abstract execute(args: any): Promise<void>;

    /**
     * 获取命令名称
     * @returns 命令名称
     */
    public getName(): string {
        return this.name;
    }

    /**
     * 获取命令描述
     * @returns 命令描述
     */
    public abstract getDescription(): string;

    /**
     * 获取命令帮助信息
     * @returns 帮助信息
     */
    public abstract getHelp(): string;

    /**
     * 验证参数
     * @param args 命令参数
     * @returns 是否有效
     */
    protected abstract validateArgs(args: any): boolean;

    /**
     * 处理错误
     * @param error 错误对象
     */
    protected handleError(error: Error): void {
        this.logger.error('命令执行失败', {
            command: this.name,
            error: error.message,
            stack: error.stack
        });

        if (!this.silentMode) {
            console.error(`错误: ${error.message}`);
        }
    }
}