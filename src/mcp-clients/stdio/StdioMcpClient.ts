/**
 * STDIO MCP客户端实现
 * 通过标准输入输出连接到MCP服务
 */

import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { BaseMcpClient } from '../base/BaseMcpClient';
import { StdioServerConfig } from '../../types/config';
import { WindowsSupport } from '../../core/utils/windows';
import { LogOutputTarget } from '../../core/logger/Logger';

/**
 * STDIO MCP客户端类
 */
export class StdioMcpClient extends BaseMcpClient {
    protected config: StdioServerConfig;

    /**
     * 创建STDIO MCP客户端实例
     * @param serviceName 服务名称
     * @param config STDIO服务配置
     */
    constructor(serviceName: string, config: StdioServerConfig) {
        super(serviceName, config);
        this.config = config;
        // STDIO模式强制日志输出到stderr，避免干扰MCP协议通信
        this.logger.setOutputTarget(LogOutputTarget.STDERR);
    }

    /**
     * 连接到STDIO服务
     */
    public async connect(): Promise<void> {
        try {
            this.logger.info(`连接到STDIO服务: ${this.serviceName}`);

            // 为Windows平台包装命令
            const { command, args } = WindowsSupport.wrapCommandForWindows(
                this.config.command,
                this.config.args || []
            );

            this.logger.debug(`启动STDIO进程: ${command} ${args.join(' ')}`, {
                cwd: this.config.cwd,
                env: { ...process.env, ...this.config.env }
            });

            // 创建STDIO传输 - 让StdioClientTransport内部管理进程
            const transport = new StdioClientTransport({
                command,
                args,
                cwd: this.config.cwd,
                env: { ...process.env, ...this.config.env } as Record<string, string>
            });

            this.transport = transport;

            // 连接到MCP服务器
            await this.client.connect(transport);

            this.setConnectionStatus(true);

        } catch (error) {
            this.setConnectionStatus(false, error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }

    /**
     * 断开连接
     */
    public async disconnect(): Promise<void> {
        try {
            this.logger.info(`断开STDIO服务连接: ${this.serviceName}`);

            // 断开MCP客户端连接 - StdioClientTransport会自动管理进程清理
            if (this.connected) {
                await this.client.close();
                this.setConnectionStatus(false);
            }

        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)), '断开连接');
        }
    }

    /**
     * 创建STDIO传输
     * @returns STDIO传输实例
     */
    protected createStdioTransport(): StdioClientTransport {
        const { command, args } = WindowsSupport.wrapCommandForWindows(
            this.config.command,
            this.config.args || []
        );

        return new StdioClientTransport({
            command,
            args,
            cwd: this.config.cwd,
            env: { ...process.env, ...this.config.env } as Record<string, string>
        });
    }

    /**
     * 创建HTTP传输（STDIO客户端不支持）
     */
    protected createHttpTransport(): any {
        throw new Error('STDIO客户端不支持HTTP传输');
    }

    /**
     * 创建SSE传输（STDIO客户端不支持）
     */
    protected createSseTransport(): any {
        throw new Error('STDIO客户端不支持SSE传输');
    }

    
    /**
     * 重启连接
     */
    public async restart(): Promise<void> {
        this.logger.info(`重启STDIO连接: ${this.serviceName}`);

        try {
            // 先断开当前连接
            await this.disconnect();

            // 等待一小段时间再重新连接
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 重新连接
            await this.connect();

        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)), '重启连接');
            throw error;
        }
    }

    /**
     * 获取连接信息
     * @returns 连接状态信息
     */
    public getConnectionInfo(): {
        status: 'running' | 'stopped' | 'error';
        command: string;
        args: string[];
        uptime: number;
        connected: boolean;
    } {
        return {
            status: this.connected ? 'running' : 'stopped',
            command: this.config.command,
            args: this.config.args || [],
            uptime: process.uptime(),
            connected: this.connected
        };
    }

    /**
     * 获取客户端详细信息
     * @returns 客户端详细信息
     */
    public getClientDetails(): {
        serviceName: string;
        serverType: 'stdio';
        connected: boolean;
        lastError?: string;
        uptime: number;
        connection: any;
        config: StdioServerConfig;
    } {
        return {
            serviceName: this.serviceName,
            serverType: 'stdio',
            connected: this.connected,
            lastError: this.lastError?.message,
            uptime: process.uptime(),
            connection: this.getConnectionInfo(),
            config: this.config
        };
    }
}