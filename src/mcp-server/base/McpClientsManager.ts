/**
 * MCP客户端管理器
 * 负责管理所有MCP客户端的连接、状态和操作
 */

import { BaseMcpClient } from '../../mcp-clients/base/BaseMcpClient';
import { McpClientFactory } from '../../mcp-clients/McpClientFactory';
import { Logger } from '../../core/logger/Logger';
import { McpConfig } from '../../types/config';
import { ConfigUtils } from '../../utils/ConfigUtils';

/**
 * MCP客户端管理器类
 */
export class McpClientsManager {
    private mcpClients: Map<string, BaseMcpClient>;
    private clientConnections: Map<string, any>;
    private serviceStatus: Map<string, { connected: boolean; lastError?: Error }>;
    private logger: Logger;
    private config: McpConfig;

    /**
     * 创建MCP客户端管理器实例
     * @param config MCP配置
     * @param logger 日志记录器
     */
    constructor(config: McpConfig, logger: Logger) {
        this.config = config;
        this.logger = logger;
        this.mcpClients = new Map();
        this.clientConnections = new Map();
        this.serviceStatus = new Map();

        // 初始化服务状态
        for (const serviceName of Object.keys(config.mcpServers)) {
            this.serviceStatus.set(serviceName, { connected: false });
        }
    }

    /**
     * 连接到所有MCP服务
     */
    async connectToServices(): Promise<void> {
        this.logger.info('连接到所有MCP服务', { serviceCount: Object.keys(this.config.mcpServers).length });

        const connectionPromises = Object.entries(this.config.mcpServers).map(
            async ([serviceName, serviceConfig]) => {
                try {
                    await this.connectToService(serviceName, serviceConfig);
                    this.serviceStatus.set(serviceName, { connected: true });
                    this.logger.info(`已连接到服务: ${serviceName}`);
                } catch (error) {
                    this.serviceStatus.set(serviceName, {
                        connected: false,
                        lastError: error instanceof Error ? error : new Error(String(error))
                    });
                    this.logger.error(`连接服务失败: ${serviceName}`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }
        );

        await Promise.allSettled(connectionPromises);

        const connectedCount = Array.from(this.serviceStatus.values()).filter(s => s.connected).length;
        this.logger.info('服务连接完成', {
            total: this.serviceStatus.size,
            connected: connectedCount,
            failed: this.serviceStatus.size - connectedCount
        });
    }

    /**
     * 连接到单个MCP服务
     * @param serviceName 服务名称
     * @param serviceConfig 服务配置
     */
    async connectToService(serviceName: string, serviceConfig: any): Promise<void> {
        const serverType = ConfigUtils.getServerType(serviceConfig);
        this.logger.info(`连接到${serverType.toUpperCase()}服务: ${serviceName}`);

        try {
            // 验证服务配置
            const validation = McpClientFactory.validateServerConfig(serviceConfig);
            if (!validation.valid) {
                throw new Error(`服务配置验证失败: ${validation.errors.join(', ')}`);
            }

            // 使用工厂创建对应的MCP客户端
            const client = McpClientFactory.createClient(serviceName, serviceConfig);

            // 连接到服务
            await client.connect();

            // 保存客户端实例
            this.mcpClients.set(serviceName, client);

            // 创建连接对象，允许自定义属性
            const connection = this.createConnectionObject(serviceName, client);

            this.clientConnections.set(serviceName, connection);
            this.logger.info(`成功连接到${serverType.toUpperCase()}服务: ${serviceName}`);

        } catch (error) {
            const errorInfo: any = {
                error: error instanceof Error ? error.message : String(error),
                serverType
            };

            // 添加特定类型的配置信息
            switch (serverType) {
                case 'stdio':
                    errorInfo.command = serviceConfig.command;
                    errorInfo.args = serviceConfig.args;
                    break;
                case 'http':
                    errorInfo.url = serviceConfig.url;
                    break;
            }

            this.logger.error(`连接${serverType.toUpperCase()}服务失败: ${serviceName}`, errorInfo);
            throw error;
        }
    }

    /**
     * 创建连接对象，可以添加特定属性
     * @param serviceName 服务名称
     * @param client MCP客户端实例
     * @returns 连接对象
     */
    private createConnectionObject(serviceName: string, client: BaseMcpClient): any {
        return {
            serviceName,
            client,
            connected: true,
            createdAt: new Date(),
            close: async () => {
                this.logger.debug(`关闭服务连接: ${serviceName}`);
                if (client) {
                    await client.disconnect();
                }
            }
        };
    }

    /**
     * 断开所有服务连接
     */
    async disconnectFromServices(): Promise<void> {
        this.logger.info('断开所有服务连接');

        const disconnectPromises = Array.from(this.clientConnections.entries()).map(
            async ([serviceName, connection]) => {
                try {
                    if (connection && typeof connection.close === 'function') {
                        await connection.close();
                    }
                    this.logger.debug(`已断开服务: ${serviceName}`);
                } catch (error) {
                    this.logger.error(`断开服务失败: ${serviceName}`, {
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }
        );

        await Promise.allSettled(disconnectPromises);
        this.clientConnections.clear();
        this.serviceStatus.clear();
        this.mcpClients.clear();
    }

    /**
     * 检查服务健康状态
     */
    async checkServicesHealth(healthCheckFn: (serviceName: string, connection: any) => Promise<boolean>): Promise<void> {
        for (const [serviceName, connection] of this.clientConnections) {
            try {
                // 检查连接是否仍然有效
                const isHealthy = await healthCheckFn(serviceName, connection);

                const currentStatus = this.serviceStatus.get(serviceName);
                if (currentStatus && currentStatus.connected !== isHealthy) {
                    this.serviceStatus.set(serviceName, {
                        connected: isHealthy,
                        lastError: isHealthy ? undefined : new Error('健康检查失败')
                    });

                    if (!isHealthy) {
                        this.logger.warn(`服务健康检查失败: ${serviceName}`);
                        // 尝试重新连接
                        await this.reconnectService(serviceName);
                    }
                }
            } catch (error) {
                this.logger.error(`健康检查错误: ${serviceName}`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
    }

    /**
     * 重新连接服务
     * @param serviceName 服务名称
     */
    async reconnectService(serviceName: string): Promise<void> {
        this.logger.info(`尝试重新连接服务: ${serviceName}`);

        const serviceConfig = this.config.mcpServers[serviceName];
        if (!serviceConfig) {
            return;
        }

        try {
            // 关闭现有连接
            const existingConnection = this.clientConnections.get(serviceName);
            if (existingConnection && typeof existingConnection.close === 'function') {
                await existingConnection.close();
            }

            // 重新连接
            await this.connectToService(serviceName, serviceConfig);
            this.serviceStatus.set(serviceName, { connected: true });
            this.logger.info(`重新连接成功: ${serviceName}`);
        } catch (error) {
            this.serviceStatus.set(serviceName, {
                connected: false,
                lastError: error instanceof Error ? error : new Error(String(error))
            });
            this.logger.error(`重新连接失败: ${serviceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * 获取客户端实例
     * @param serviceName 服务名称
     * @returns MCP客户端实例
     */
    getClient(serviceName: string): BaseMcpClient | undefined {
        return this.mcpClients.get(serviceName);
    }

    /**
     * 获取所有客户端实例
     * @returns 所有MCP客户端实例
     */
    getAllClients(): Map<string, BaseMcpClient> {
        return new Map(this.mcpClients);
    }

    /**
     * 获取服务状态
     * @param serviceName 服务名称
     * @returns 服务状态
     */
    getServiceStatus(serviceName: string): { connected: boolean; lastError?: Error } | undefined {
        return this.serviceStatus.get(serviceName);
    }

    /**
     * 获取所有服务状态
     * @returns 所有服务状态
     */
    getAllServiceStatus(): Map<string, { connected: boolean; lastError?: Error }> {
        return new Map(this.serviceStatus);
    }

    /**
     * 获取服务状态统计
     * @returns 服务状态统计
     */
    getServiceStats(): {
        total: number;
        connected: number;
        disconnected: number;
        services: Array<{
            name: string;
            connected: boolean;
            lastError?: string;
        }>;
    } {
        const services = Array.from(this.serviceStatus.entries()).map(([name, status]) => ({
            name,
            connected: status.connected,
            lastError: status.lastError?.message
        }));

        return {
            total: services.length,
            connected: services.filter(s => s.connected).length,
            disconnected: services.filter(s => !s.connected).length,
            services
        };
    }

    /**
     * 获取连接信息
     * @param serviceName 服务名称
     * @returns 连接信息
     */
    getConnection(serviceName: string): any {
        return this.clientConnections.get(serviceName);
    }

    /**
     * 获取所有连接信息
     * @returns 所有连接信息
     */
    getAllConnections(): Map<string, any> {
        return new Map(this.clientConnections);
    }

    /**
     * 聚合工具
     */
    async aggregateTools(): Promise<{ tools: any[]; toolServiceMap: Map<string, { serviceName: string; originalName: string }> }> {
        this.logger.info('开始聚合MCP工具');

        const aggregatedTools: any[] = [];
        const toolServiceMap = new Map<string, { serviceName: string; originalName: string }>();

        // 收集所有工具
        for (const [serviceName, client] of this.mcpClients) {
            try {
                if (client && client.isConnected()) {
                    const tools = await client.listTools();

                    // 为每个工具创建代理工具，避免名称冲突
                    tools.forEach((tool: any) => {
                        // 创建代理工具，使用 {serviceName}__{toolName} 命名规则
                        const proxyTool = {
                            ...tool,
                            name: `${serviceName}__${tool.name}`,
                            description: `[${serviceName}] ${tool.description}`
                        };

                        aggregatedTools.push(proxyTool);

                        // 记录映射关系：代理工具名 -> {服务名, 原始工具名}
                        toolServiceMap.set(proxyTool.name, {
                            serviceName,
                            originalName: tool.name
                        });
                    });

                    this.logger.debug(`已收集服务 ${serviceName} 的工具`, { toolCount: tools.length });
                } else {
                    this.logger.warn(`服务 ${serviceName} 未连接，跳过工具聚合`);
                }
            } catch (error) {
                this.logger.error(`聚合服务 ${serviceName} 工具失败`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        this.logger.info('工具聚合完成', { totalTools: aggregatedTools.length });
        return { tools: aggregatedTools, toolServiceMap };
    }

    /**
     * 聚合资源
     */
    async aggregateResources(): Promise<{ resources: any[]; resourceServiceMap: Map<string, { serviceName: string; originalUri: string }> }> {
        this.logger.info('开始聚合MCP资源');

        const aggregatedResources: any[] = [];
        const resourceServiceMap = new Map<string, { serviceName: string; originalUri: string }>();

        // 收集所有资源
        for (const [serviceName, client] of this.mcpClients) {
            try {
                if (client && client.isConnected()) {
                    const resources = await client.listResources();

                    // 为每个资源创建代理资源，避免URI冲突
                    resources.forEach((resource: any) => {
                        // 创建代理资源，使用 {serviceName}__{uri} 命名规则
                        const proxyResource = {
                            ...resource,
                            uri: `${serviceName}__${resource.uri}`,
                            description: resource.description ? `[${serviceName}] ${resource.description}` : undefined
                        };

                        aggregatedResources.push(proxyResource);

                        // 记录映射关系：代理资源URI -> {服务名, 原始URI}
                        resourceServiceMap.set(proxyResource.uri, {
                            serviceName,
                            originalUri: resource.uri
                        });
                    });

                    this.logger.debug(`已收集服务 ${serviceName} 的资源`, { resourceCount: resources.length });
                } else {
                    this.logger.warn(`服务 ${serviceName} 未连接，跳过资源聚合`);
                }
            } catch (error) {
                this.logger.error(`聚合服务 ${serviceName} 资源失败`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        this.logger.info('资源聚合完成', { totalResources: aggregatedResources.length });
        return { resources: aggregatedResources, resourceServiceMap };
    }

    /**
     * 聚合提示
     */
    async aggregatePrompts(): Promise<{ prompts: any[]; promptServiceMap: Map<string, { serviceName: string; originalName: string }> }> {
        this.logger.info('开始聚合MCP提示');

        const aggregatedPrompts: any[] = [];
        const promptServiceMap = new Map<string, { serviceName: string; originalName: string }>();

        // 收集所有提示
        for (const [serviceName, client] of this.mcpClients) {
            try {
                if (client && client.isConnected()) {
                    const prompts = await client.listPrompts();

                    // 为每个提示创建代理提示，避免名称冲突
                    prompts.forEach((prompt: any) => {
                        // 创建代理提示，使用 {serviceName}__{promptName} 命名规则
                        const proxyPrompt = {
                            ...prompt,
                            name: `${serviceName}__${prompt.name}`,
                            description: `[${serviceName}] ${prompt.description}`
                        };

                        aggregatedPrompts.push(proxyPrompt);

                        // 记录映射关系：代理提示名 -> {服务名, 原始提示名}
                        promptServiceMap.set(proxyPrompt.name, {
                            serviceName,
                            originalName: prompt.name
                        });
                    });

                    this.logger.debug(`已收集服务 ${serviceName} 的提示`, { promptCount: prompts.length });
                } else {
                    this.logger.warn(`服务 ${serviceName} 未连接，跳过提示聚合`);
                }
            } catch (error) {
                this.logger.error(`聚合服务 ${serviceName} 提示失败`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        this.logger.info('提示聚合完成', { totalPrompts: aggregatedPrompts.length });
        return { prompts: aggregatedPrompts, promptServiceMap };
    }

    /**
     * 获取资源模板
     */
    async getResourceTemplates(): Promise<any[]> {
        const allTemplates: any[] = [];

        for (const [serviceName, client] of this.mcpClients) {
            try {
                if (client && client.isConnected()) {
                    const templates = await client.listResourceTemplates();
                    allTemplates.push(...templates);
                }
            } catch (error) {
                this.logger.error(`获取服务 ${serviceName} 资源模板失败`);
            }
        }

        return allTemplates;
    }
}