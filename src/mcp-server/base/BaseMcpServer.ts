/**
 * MCP服务器基类
 * 提供所有MCP服务器的通用功能
 */

import { McpHandler } from '../core/McpHandler';
import { McpClientsManager } from './McpClientsManager';
import { McpConfig } from '../../types/config';
import { Logger } from '../../core/logger/Logger';
import { getVersion } from '../../utils';

/**
 * MCP服务器基类
 * 提供通用功能，所有具体的服务器都继承此类
 */
export abstract class BaseMcpServer {
    protected config: McpConfig;
    protected configPath: string;
    protected mcpHandler: McpHandler;
    protected clientsManager: McpClientsManager;
    protected logger: Logger;
    protected isRunning: boolean = false;

    /**
     * 创建MCP服务器实例
     * @param config MCP配置
     * @param configPath MCP配置文件路径
     * @param serverName 服务器名称
     */
    constructor(config: McpConfig, configPath: string, serverName: string) {
        this.config = config;
        this.configPath = configPath;
        this.mcpHandler = new McpHandler(config, configPath);
        this.clientsManager = this.mcpHandler['clientsManager']; // 访问私有属性，用于健康检查
        this.logger = new Logger(serverName);
    }

    /**
     * 启动服务器（抽象方法，由子类实现）
     */
    abstract start(): Promise<void>;

    /**
     * 停止服务器（抽象方法，由子类实现）
     */
    abstract stop(): Promise<void>;

    /**
     * 获取服务器信息
     */
    abstract getServerInfo(): any;

    /**
     * 通用启动流程
     */
    protected async doStart(): Promise<void> {
        if (this.isRunning) {
            this.logger.warn('服务器已在运行中');
            return;
        }

        try {
            this.logger.info('启动MCP服务器');

            // 初始化MCP处理器
            await this.mcpHandler.initialize();

            this.isRunning = true;
            this.logger.info('MCP服务器启动成功');

        } catch (error) {
            this.logger.error('MCP服务器启动失败', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 通用停止流程
     */
    protected async doStop(): Promise<void> {
        if (!this.isRunning) {
            this.logger.warn('服务器未在运行');
            return;
        }

        try {
            this.logger.info('停止MCP服务器');

            // 关闭MCP处理器
            await this.mcpHandler.close();

            this.isRunning = false;
            this.logger.info('MCP服务器已停止');

        } catch (error) {
            this.logger.error('MCP服务器停止失败', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 检查服务是否在运行
     */
    public isServerRunning(): boolean {
        return this.isRunning;
    }

    /**
     * 获取服务统计信息
     */
    public getServiceStats(): {
        total: number;
        connected: number;
        services: Array<{
            name: string;
            status: 'connected' | 'disconnected' | 'error';
            lastActivity?: Date;
        }>;
    } {
        const connections = this.clientsManager.getAllConnections();
        const stats = {
            total: connections.size,
            connected: 0,
            services: [] as Array<{
                name: string;
                status: 'connected' | 'disconnected' | 'error';
                lastActivity?: Date;
            }>
        };

        for (const [serviceName, connection] of connections) {
            const status = connection.connected ? 'connected' : 'disconnected';
            if (status === 'connected') {
                stats.connected++;
            }

            stats.services.push({
                name: serviceName,
                status,
                lastActivity: connection.lastActivity
            });
        }

        return stats;
    }

    /**
     * 处理错误的通用方法
     */
    protected handleError(error: Error): void {
        this.logger.error('服务器错误', {
            error: error.message,
            stack: error.stack
        });
    }

    /**
     * 创建连接对象（供子类使用）
     */
    protected createConnectionObject(serviceName: string, client: any): any {
        return {
            serviceName,
            client,
            connected: true,
            createdAt: new Date(),
            lastActivity: new Date(),
            close: async () => {
                this.logger.debug(`关闭服务连接: ${serviceName}`);
                if (client) {
                    await client.disconnect();
                }
            }
        };
    }

    /**
     * 获取聚合信息
     */
    protected getAggregatedInfo(): {
        tools: number;
        resources: number;
        prompts: number;
        services: string[];
    } {
        const connections = this.clientsManager.getAllConnections();
        return {
            tools: this.mcpHandler['aggregatedTools']?.length || 0,
            resources: this.mcpHandler['aggregatedResources']?.length || 0,
            prompts: this.mcpHandler['aggregatedPrompts']?.length || 0,
            services: Array.from(connections.keys())
        };
    }

    /**
     * 获取服务器状态（保持向后兼容）
     * @returns 服务器状态信息
     */
    public getStatus(): {
        name: string;
        version: string;
        serviceCount: number;
        uptime: number;
    } {
        return {
            name: 'mcp-all-in-one',
            version: getVersion(),
            serviceCount: Object.keys(this.config.mcpServers).length,
            uptime: process.uptime()
        };
    }
}