/**
 * MCP协议处理器
 * 唯一的MCP业务逻辑处理者，负责处理所有MCP协议相关的业务逻辑
 */

import { McpClientsManager } from '../base/McpClientsManager';
import { SelfConfigToolsManager } from '../base/SelfConfigToolsManager';
import { BuiltinResourceProvider } from '../providers/BuiltinResourceProvider';
import { BaseMcpClient } from '../../mcp-clients/base/BaseMcpClient';
import { McpConfig } from '../../types/config';
import { Logger } from '../../core/logger/Logger';

/**
 * MCP请求接口
 */
interface McpRequest {
    method: string;
    params?: any;
    id?: string | number;
}

/**
 * MCP响应接口
 */
interface McpResponse {
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}

/**
 * MCP处理器类
 * 负责处理所有MCP协议相关的业务逻辑
 */
export class McpHandler {
    private clientsManager: McpClientsManager;
    private configPath: string;
    private aggregatedTools: any[] = [];
    private aggregatedResources: any[] = [];
    private aggregatedPrompts: any[] = [];
    private builtinResourceProvider: BuiltinResourceProvider;
    private logger: Logger;

    /**
     * 创建MCP处理器实例
     * @param config MCP配置
     * @param configPath MCP配置文件路径
     */
    constructor(config: McpConfig, configPath: string) {
        this.configPath = configPath;
        this.logger = new Logger('McpHandler');
        this.clientsManager = new McpClientsManager(config, this.logger);
        this.builtinResourceProvider = new BuiltinResourceProvider();
    }

    /**
     * 初始化MCP处理器
     */
    async initialize(): Promise<void> {
        this.logger.info('初始化MCP处理器');

        // 连接到所有MCP服务
        await this.connectToServices();

        // 聚合服务功能
        await this.aggregateTools();
        await this.aggregateResources();
        await this.aggregatePrompts();

        this.logger.info('MCP处理器初始化完成');
    }

    /**
     * 唯一对外的公共方法 - 处理MCP请求
     * @param request MCP请求
     * @returns MCP响应
     */
    async handleRequest(request: McpRequest): Promise<McpResponse> {
        try {
            this.logger.debug('处理MCP请求', { method: request.method });

            let result: any;

            switch (request.method) {
                case 'initialize':
                    result = await this.handleInitialize();
                    break;
                case 'notifications/initialized':
                    result = await this.handleNotificationsInitialized();
                    break;
                case 'ping':
                    result = await this.handlePing();
                    break;
                case 'notifications/cancelled':
                    result = await this.handleNotificationsCancelled(request.params);
                    break;
                case 'notifications/progress':
                    result = await this.handleNotificationsProgress(request.params);
                    break;
                case 'tools/list':
                    result = await this.handleListTools();
                    break;
                case 'tools/call':
                    result = await this.handleCallTool(request.params);
                    break;
                case 'notifications/tools/list_changed':
                    result = await this.handleNotificationsToolsListChanged();
                    break;
                case 'resources/list':
                    result = await this.handleListResources();
                    break;
                case 'resources/read':
                    result = await this.handleReadResource(request.params);
                    break;
                case 'resources/templates/list':
                    result = await this.handleListResourceTemplates();
                    break;
                case 'resources/subscribe':
                    result = await this.handleSubscribeResource(request.params);
                    break;
                case 'resources/unsubscribe':
                    result = await this.handleUnsubscribeResource(request.params);
                    break;
                case 'notifications/resources/list_changed':
                    result = await this.handleNotificationsResourcesListChanged();
                    break;
                case 'notifications/resources/updated':
                    result = await this.handleNotificationsResourcesUpdated(request.params);
                    break;
                case 'prompts/list':
                    result = await this.handleListPrompts();
                    break;
                case 'prompts/get':
                    result = await this.handleGetPrompt(request.params);
                    break;
                case 'notifications/prompts/list_changed':
                    result = await this.handleNotificationsPromptsListChanged();
                    break;
                case 'logging/setLevel':
                    result = await this.handleSetLogLevel(request.params);
                    break;
                case 'notifications/message':
                    result = await this.handleNotificationsMessage(request.params);
                    break;
                case 'sampling/createMessage':
                    result = await this.handleSamplingCreateMessage(request.params);
                    break;
                case 'completion/complete':
                    result = await this.handleCompletionComplete(request.params);
                    break;
                case 'roots/list':
                    result = await this.handleListRoots();
                    break;
                case 'notifications/roots/list_changed':
                    result = await this.handleNotificationsRootsListChanged();
                    break;
                case 'elicitation/create':
                    result = await this.handleElicitationCreate(request.params);
                    break;
                default:
                    throw new Error(`Method not found: ${request.method}`);
            }

            return { result };

        } catch (error) {
            this.logger.error('MCP请求处理失败', {
                method: request.method,
                error: error instanceof Error ? error.message : String(error)
            });

            return {
                error: {
                    code: -32603,
                    message: error instanceof Error ? error.message : 'Internal server error'
                }
            };
        }
    }

    /**
     * 关闭MCP处理器
     */
    async close(): Promise<void> {
        this.logger.info('关闭MCP处理器');

        // 断开所有服务连接
        await this.disconnectFromServices();

        this.logger.info('MCP处理器已关闭');
    }

    // ==================== 私有方法 ====================

    /**
     * 处理初始化请求
     */
    private async handleInitialize(): Promise<any> {
        return {
            protocolVersion: "2024-11-05",
            capabilities: {
                tools: {
                    listChanged: true
                },
                resources: {
                    subscribe: true,
                    listChanged: true
                },
                prompts: {
                    listChanged: true
                },
                logging: {},
                sampling: {},
                completion: {}
            },
            serverInfo: {
                name: "mcp-all-in-one",
                version: "1.0.2"
            }
        };
    }

    /**
     * 处理初始化完成通知
     */
    private async handleNotificationsInitialized(): Promise<any> {
        this.logger.debug('收到客户端初始化完成通知');
        return {
            success: true,
            message: "Initialized notification received"
        };
    }

    /**
     * 处理ping请求
     * 根据MCP协议规范，ping应该返回空响应
     */
    private async handlePing(): Promise<any> {
        // MCP协议规定ping返回空结果，这里返回空对象符合协议规范
        return {};
    }

    /**
     * 处理工具列表请求
     */
    private async handleListTools(): Promise<any> {
        return { tools: this.aggregatedTools };
    }

    /**
     * 处理工具调用请求
     */
    private async handleCallTool(params: any): Promise<any> {
        const { name, arguments: args } = params;

        // 检查是否是mcp-all-in-one自我配置工具
        if (SelfConfigToolsManager.isSelfConfigTool(name)) {
            return await this.handleSelfConfigTool(name, args || {});
        }

        // 查找工具映射
        const toolMapping = this.findToolMapping(name);
        if (!toolMapping) {
            throw new Error(`工具 ${name} 未找到`);
        }

        const { serviceName, originalName } = toolMapping;
        const client = this.clientsManager.getClient(serviceName);
        if (!client || !client.isConnected()) {
            throw new Error(`服务 ${serviceName} 不可用`);
        }

        return await client.callTool(originalName, args || {});
    }

    /**
     * 处理自我配置工具调用
     */
    private async handleSelfConfigTool(name: string, args: any): Promise<any> {
        const request = {
            params: {
                arguments: args
            }
        };

        switch (name) {
            case 'mcp-all-in-one-validate-mcp-config':
                return await SelfConfigToolsManager.handleValidateMcpConfig(request, this.configPath);
            case 'mcp-all-in-one-show-mcp-config':
                return await SelfConfigToolsManager.handleShowMcpConfig(request, this.configPath);
            case 'mcp-all-in-one-show-mcp-config-schema':
                return await SelfConfigToolsManager.handleShowMcpConfigSchema();
            case 'mcp-all-in-one-set-mcp-config':
                return await SelfConfigToolsManager.handleSetMcpConfig(request, this.configPath, this.logger);
            default:
                throw new Error(`未知的自我配置工具: ${name}`);
        }
    }

    /**
     * 处理资源列表请求
     */
    private async handleListResources(): Promise<any> {
        return { resources: this.aggregatedResources };
    }

    /**
     * 处理资源读取请求
     */
    private async handleReadResource(params: any): Promise<any> {
        const { uri } = params;

        // 检查是否是内置资源
        if (uri.startsWith('builtin://')) {
            if (await this.builtinResourceProvider.resourceExists(uri)) {
                return await this.builtinResourceProvider.readResource(uri);
            } else {
                throw new Error(`内置资源 ${uri} 不存在`);
            }
        }

        // 处理外部服务资源
        const resourceMapping = this.findResourceMapping(uri);
        if (!resourceMapping) {
            throw new Error(`资源 ${uri} 未找到`);
        }

        const { serviceName, originalUri } = resourceMapping;
        const client = this.clientsManager.getClient(serviceName);
        if (!client || !client.isConnected()) {
            throw new Error(`服务 ${serviceName} 不可用`);
        }

        return await client.readResource(originalUri);
    }

    /**
     * 处理提示列表请求
     */
    private async handleListPrompts(): Promise<any> {
        return { prompts: this.aggregatedPrompts };
    }

    /**
     * 处理提示获取请求
     */
    private async handleGetPrompt(params: any): Promise<any> {
        const { name, arguments: args } = params;

        const promptMapping = this.findPromptMapping(name);
        if (!promptMapping) {
            throw new Error(`提示 ${name} 未找到`);
        }

        const { serviceName, originalName } = promptMapping;
        const client = this.clientsManager.getClient(serviceName);
        if (!client || !client.isConnected()) {
            throw new Error(`服务 ${serviceName} 不可用`);
        }

        return await client.getPrompt(originalName, args || {});
    }

    /**
     * 处理取消通知
     */
    private async handleNotificationsCancelled(params: any): Promise<any> {
        const { requestId, reason } = params;

        this.logger.info('收到取消通知', { requestId, reason });

        // TODO: 实现取消逻辑，需要跟踪正在进行的请求并取消它们
        // 这里可以添加取消特定请求的逻辑

        return {
            success: true,
            message: "Cancellation notification received"
        };
    }

    /**
     * 处理进度通知
     */
    private async handleNotificationsProgress(params: any): Promise<any> {
        const { progressToken, progress, total, message } = params;

        this.logger.debug('收到进度通知', {
            progressToken,
            progress,
            total,
            message
        });

        // TODO: 实现进度跟踪逻辑，可以将进度信息存储或转发给客户端

        return {
            success: true,
            message: "Progress notification received"
        };
    }

    /**
     * 处理工具列表变更通知
     */
    private async handleNotificationsToolsListChanged(): Promise<any> {
        this.logger.info('收到工具列表变更通知');

        // 重新聚合工具列表
        await this.aggregateTools();

        return {
            success: true,
            message: "Tools list changed notification received"
        };
    }

    /**
     * 处理资源模板列表请求
     */
    private async handleListResourceTemplates(): Promise<any> {
        // 聚合所有服务的资源模板
        const templates = [];

        try {
            const connections = this.clientsManager.getAllConnections();

            for (const [serviceName, client] of connections) {
                if (client.isConnected() && client.listResourceTemplates) {
                    try {
                        const serviceTemplates = await client.listResourceTemplates();
                        templates.push(...serviceTemplates.map((template: any) => ({
                            ...template,
                            name: `${serviceName}__${template.name}`
                        })));
                    } catch (error) {
                        this.logger.warn(`获取服务 ${serviceName} 的资源模板失败`, {
                            error: error instanceof Error ? error.message : String(error)
                        });
                    }
                }
            }
        } catch (error) {
            this.logger.error('获取资源模板列表失败', {
                error: error instanceof Error ? error.message : String(error)
            });
        }

        return { resourceTemplates: templates };
    }

    /**
     * 处理资源订阅请求
     */
    private async handleSubscribeResource(params: any): Promise<any> {
        const { uri } = params;

        const resourceMapping = this.findResourceMapping(uri);
        if (!resourceMapping) {
            throw new Error(`资源 ${uri} 未找到`);
        }

        const { serviceName, originalUri } = resourceMapping;
        const client = this.clientsManager.getClient(serviceName);
        if (!client || !client.isConnected()) {
            throw new Error(`服务 ${serviceName} 不可用`);
        }

        // 检查客户端是否支持订阅
        if (!client.subscribeResource) {
            throw new Error(`服务 ${serviceName} 不支持资源订阅`);
        }

        return await client.subscribeResource(originalUri);
    }

    /**
     * 处理资源取消订阅请求
     */
    private async handleUnsubscribeResource(params: any): Promise<any> {
        const { uri } = params;

        const resourceMapping = this.findResourceMapping(uri);
        if (!resourceMapping) {
            throw new Error(`资源 ${uri} 未找到`);
        }

        const { serviceName, originalUri } = resourceMapping;
        const client = this.clientsManager.getClient(serviceName);
        if (!client || !client.isConnected()) {
            throw new Error(`服务 ${serviceName} 不可用`);
        }

        // 检查客户端是否支持取消订阅
        if (!client.unsubscribeResource) {
            throw new Error(`服务 ${serviceName} 不支持资源取消订阅`);
        }

        return await client.unsubscribeResource(originalUri);
    }

    /**
     * 处理资源列表变更通知
     */
    private async handleNotificationsResourcesListChanged(): Promise<any> {
        this.logger.info('收到资源列表变更通知');

        // 重新聚合资源列表
        await this.aggregateResources();

        return {
            success: true,
            message: "Resources list changed notification received"
        };
    }

    /**
     * 处理资源更新通知
     */
    private async handleNotificationsResourcesUpdated(params: any): Promise<any> {
        const { uri } = params;

        this.logger.info('收到资源更新通知', { uri });

        // TODO: 实现资源更新处理逻辑，可以通知订阅的客户端

        return {
            success: true,
            message: "Resource updated notification received"
        };
    }

    /**
     * 处理提示列表变更通知
     */
    private async handleNotificationsPromptsListChanged(): Promise<any> {
        this.logger.info('收到提示列表变更通知');

        // 重新聚合提示列表
        await this.aggregatePrompts();

        return {
            success: true,
            message: "Prompts list changed notification received"
        };
    }

    /**
     * 处理日志消息通知
     */
    private async handleNotificationsMessage(params: any): Promise<any> {
        const { level, message, data } = params;

        // 根据日志级别记录消息
        switch (level) {
            case 'debug':
                this.logger.debug(message, data);
                break;
            case 'info':
                this.logger.info(message, data);
                break;
            case 'warn':
                this.logger.warn(message, data);
                break;
            case 'error':
                this.logger.error(message, data);
                break;
            default:
                this.logger.info(`[${level.toUpperCase()}] ${message}`, data);
        }

        return {
            success: true,
            message: "Message notification received"
        };
    }

    /**
     * 处理消息采样创建请求
     */
    private async handleSamplingCreateMessage(params: any): Promise<any> {
        const { messages, maxTokens, systemPrompt, temperature, includeContext } = params;

        this.logger.info('收到消息采样创建请求', {
            messageCount: messages?.length,
            maxTokens,
            temperature
        });

        // TODO: 实现消息采样逻辑，需要集成LLM模型
        // 这里可以添加调用语言模型的逻辑

        throw new Error("Message sampling functionality not yet implemented");
    }

    /**
     * 处理自动补全请求
     */
    private async handleCompletionComplete(params: any): Promise<any> {
        const { ref, argument, context } = params;

        this.logger.debug('收到自动补全请求', { ref, argument });

        // TODO: 实现自动补全逻辑，可以根据上下文提供补全建议
        // 这里可以添加智能补全的逻辑

        throw new Error("Auto completion functionality not yet implemented");
    }

    /**
     * 处理根目录列表请求
     */
    private async handleListRoots(): Promise<any> {
        // MCP SDK没有提供listRoots方法，这里返回空列表
        // 在实际使用中，根目录管理通常由服务端主动通知而不是客户端查询
        this.logger.info('根目录列表查询：MCP SDK未提供listRoots方法，返回空列表');

        return { roots: [] };
    }

    /**
     * 处理根目录列表变更通知
     */
    private async handleNotificationsRootsListChanged(): Promise<any> {
        this.logger.info('收到根目录列表变更通知');

        // TODO: 实现根目录列表变更处理逻辑

        return {
            success: true,
            message: "Roots list changed notification received"
        };
    }

    /**
     * 处理信息采集创建请求
     */
    private async handleElicitationCreate(params: any): Promise<any> {
        const { type, data } = params;

        this.logger.info('收到信息采集创建请求', { type });

        // TODO: 实现信息采集逻辑，可以根据类型采集不同信息
        // 这里可以添加数据采集的逻辑

        throw new Error("Elicitation functionality not yet implemented");
    }

    /**
     * 处理日志级别设置请求
     */
    private async handleSetLogLevel(params: any): Promise<any> {
        const { level } = params;

        // 验证日志级别是否有效
        const validLevels = ['debug', 'info', 'warn', 'error'];
        if (!validLevels.includes(level)) {
            throw new Error(`Invalid log level: ${level}. Valid levels are: ${validLevels.join(', ')}`);
        }

        // 设置日志级别
        this.logger.setLogLevel(level);

        this.logger.info(`日志级别已设置为: ${level}`);

        return {};
    }

    /**
     * 连接到所有MCP服务
     */
    private async connectToServices(): Promise<void> {
        this.logger.info('连接到MCP服务');
        await this.clientsManager.connectToServices();
    }

    /**
     * 断开所有服务连接
     */
    private async disconnectFromServices(): Promise<void> {
        this.logger.info('断开所有MCP服务连接');

        const connections = this.clientsManager.getAllConnections();
        const disconnectPromises: Promise<void>[] = [];

        for (const [serviceName, connection] of connections) {
            disconnectPromises.push(
                (async () => {
                    try {
                        if (connection.close) {
                            await connection.close();
                        }
                        this.logger.debug(`已断开服务: ${serviceName}`);
                    } catch (error) {
                        this.logger.error(`断开服务失败: ${serviceName}`, {
                            error: error instanceof Error ? error.message : String(error)
                        });
                    }
                })()
            );
        }

        await Promise.allSettled(disconnectPromises);
    }

    /**
     * 聚合所有工具
     */
    private async aggregateTools(): Promise<void> {
        this.logger.info('聚合工具列表');
        this.aggregatedTools = [];

        // 添加自我配置工具
        const selfConfigTools = SelfConfigToolsManager.getSelfConfigTools();
        this.aggregatedTools.push(...selfConfigTools);

        // 添加各服务的工具
        try {
            const { tools: serviceTools } = await this.clientsManager.aggregateTools();
            this.aggregatedTools.push(...serviceTools);
        } catch (error) {
            this.logger.error(`聚合服务工具失败`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }

        this.logger.info(`工具聚合完成，共 ${this.aggregatedTools.length} 个工具`);
    }

    /**
     * 聚合所有资源
     */
    private async aggregateResources(): Promise<void> {
        this.logger.info('聚合资源列表');
        this.aggregatedResources = [];

        // 添加内置资源
        try {
            const builtinResources = await this.builtinResourceProvider.listResources();
            this.aggregatedResources.push(...builtinResources);
            this.logger.info(`添加了 ${builtinResources.length} 个内置资源`);
        } catch (error) {
            this.logger.error(`获取内置资源失败`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }

        // 添加各服务的资源
        try {
            const { resources: serviceResources } = await this.clientsManager.aggregateResources();
            this.aggregatedResources.push(...serviceResources);
        } catch (error) {
            this.logger.error(`聚合服务资源失败`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }

        this.logger.info(`资源聚合完成，共 ${this.aggregatedResources.length} 个资源`);
    }

    /**
     * 聚合所有提示
     */
    private async aggregatePrompts(): Promise<void> {
        this.logger.info('聚合提示列表');
        this.aggregatedPrompts = [];

        // 添加各服务的提示
        try {
            const { prompts: servicePrompts } = await this.clientsManager.aggregatePrompts();
            this.aggregatedPrompts.push(...servicePrompts);
        } catch (error) {
            this.logger.error(`聚合服务提示失败`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }

        this.logger.info(`提示聚合完成，共 ${this.aggregatedPrompts.length} 个提示`);
    }

    /**
     * 查找工具映射
     */
    private findToolMapping(name: string): { serviceName: string; originalName: string } | null {
        const parts = name.split('__');
        if (parts.length === 2) {
            return { serviceName: parts[0], originalName: parts[1] };
        }
        return null;
    }

    /**
     * 查找资源映射
     */
    private findResourceMapping(uri: string): { serviceName: string; originalUri: string } | null {
        const parts = uri.split('__');
        if (parts.length === 2) {
            return { serviceName: parts[0], originalUri: parts[1] };
        }
        return null;
    }

    /**
     * 查找提示映射
     */
    private findPromptMapping(name: string): { serviceName: string; originalName: string } | null {
        const parts = name.split('__');
        if (parts.length === 2) {
            return { serviceName: parts[0], originalName: parts[1] };
        }
        return null;
    }
}