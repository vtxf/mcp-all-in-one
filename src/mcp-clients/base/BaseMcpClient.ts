/**
 * MCP客户端基类
 * 提供所有MCP客户端的通用功能
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { McpServerConfig, McpServerType } from '../../types/config';
import { Logger } from '../../core/logger/Logger';
import { getVersion } from '../../utils';

/**
 * MCP客户端基类
 */
export abstract class BaseMcpClient {
    protected client: Client;
    protected config: McpServerConfig;
    protected transport: any;
    protected serviceName: string;
    protected logger: Logger;
    protected connected: boolean;
    protected lastError?: Error;

    /**
     * 创建MCP客户端实例
     * @param serviceName 服务名称
     * @param config 服务配置
     */
    constructor(serviceName: string, config: McpServerConfig) {
        this.serviceName = serviceName;
        this.config = config;
        this.logger = new Logger(`McpClient:${serviceName}`);
        this.connected = false;

        this.client = new Client(
            {
                name: 'mcp-all-in-one-client',
                version: getVersion(),
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                    prompts: {},
                },
            }
        );
    }

    /**
     * 连接到MCP服务
     */
    public abstract connect(): Promise<void>;

    /**
     * 断开连接
     */
    public abstract disconnect(): Promise<void>;

    /**
     * 重新连接
     */
    public async reconnect(): Promise<void> {
        this.logger.info(`重新连接到服务: ${this.serviceName}`);

        try {
            await this.disconnect();
            await this.connect();
        } catch (error) {
            this.logger.error(`重新连接失败: ${this.serviceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 检查连接状态
     * @returns 是否已连接
     */
    public isConnected(): boolean {
        return this.connected;
    }

    /**
     * 获取最后的错误
     * @returns 最后的错误信息
     */
    public getLastError(): Error | undefined {
        return this.lastError;
    }

    /**
     * 列出可用工具
     * @returns 工具列表
     */
    public async listTools(): Promise<any[]> {
        if (!this.connected) {
            throw new Error(`客户端未连接: ${this.serviceName}`);
        }

        try {
            const result = await this.client.listTools();
            return result.tools || [];
        } catch (error) {
            this.logger.error(`获取工具列表失败: ${this.serviceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 调用工具
     * @param toolName 工具名称
     * @param args 工具参数
     * @returns 工具执行结果
     */
    public async callTool(toolName: string, args: any = {}): Promise<any> {
        if (!this.connected) {
            throw new Error(`客户端未连接: ${this.serviceName}`);
        }

        this.logger.debug(`调用工具: ${toolName}`, { args });

        try {
            const result = await this.client.callTool({ name: toolName, arguments: args });
            return result;
        } catch (error) {
            this.logger.error(`工具调用失败: ${toolName}`, {
                error: error instanceof Error ? error.message : String(error),
                args
            });
            throw error;
        }
    }

    /**
     * 列出可用资源
     * @returns 资源列表
     */
    public async listResources(): Promise<any[]> {
        if (!this.connected) {
            throw new Error(`客户端未连接: ${this.serviceName}`);
        }

        try {
            const result = await this.client.listResources();
            return result.resources || [];
        } catch (error) {
            this.logger.error(`获取资源列表失败: ${this.serviceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 读取资源
     * @param uri 资源URI
     * @returns 资源内容
     */
    public async readResource(uri: string): Promise<any> {
        if (!this.connected) {
            throw new Error(`客户端未连接: ${this.serviceName}`);
        }

        this.logger.debug(`读取资源: ${uri}`);

        try {
            const result = await this.client.readResource({ uri });
            return result;
        } catch (error) {
            this.logger.error(`资源读取失败: ${uri}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 列出可用资源模板
     * @returns 资源模板列表
     */
    public async listResourceTemplates(): Promise<any[]> {
        if (!this.connected) {
            throw new Error(`客户端未连接: ${this.serviceName}`);
        }

        try {
            const result = await this.client.listResourceTemplates();
            return result.resourceTemplates || [];
        } catch (error) {
            this.logger.error(`获取资源模板列表失败: ${this.serviceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 列出可用提示
     * @returns 提示列表
     */
    public async listPrompts(): Promise<any[]> {
        if (!this.connected) {
            throw new Error(`客户端未连接: ${this.serviceName}`);
        }

        try {
            const result = await this.client.listPrompts();
            return result.prompts || [];
        } catch (error) {
            this.logger.error(`获取提示列表失败: ${this.serviceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 获取提示
     * @param promptName 提示名称
     * @param args 提示参数
     * @returns 提示内容
     */
    public async getPrompt(promptName: string, args: any = {}): Promise<any> {
        if (!this.connected) {
            throw new Error(`客户端未连接: ${this.serviceName}`);
        }

        this.logger.debug(`获取提示: ${promptName}`, { args });

        try {
            const result = await this.client.getPrompt({ name: promptName, arguments: args });
            return result;
        } catch (error) {
            this.logger.error(`提示获取失败: ${promptName}`, {
                error: error instanceof Error ? error.message : String(error),
                args
            });
            throw error;
        }
    }

    /**
     * 订阅资源更新
     * @param uri 资源URI
     * @returns 订阅结果
     */
    public async subscribeResource(uri: string): Promise<any> {
        if (!this.connected) {
            throw new Error(`客户端未连接: ${this.serviceName}`);
        }

        this.logger.debug(`订阅资源: ${uri}`);

        try {
            const result = await this.client.subscribeResource({ uri });
            return result;
        } catch (error) {
            this.logger.error(`资源订阅失败: ${uri}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 取消订阅资源更新
     * @param uri 资源URI
     * @returns 取消订阅结果
     */
    public async unsubscribeResource(uri: string): Promise<any> {
        if (!this.connected) {
            throw new Error(`客户端未连接: ${this.serviceName}`);
        }

        this.logger.debug(`取消订阅资源: ${uri}`);

        try {
            const result = await this.client.unsubscribeResource({ uri });
            return result;
        } catch (error) {
            this.logger.error(`资源取消订阅失败: ${uri}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 发送根目录列表变更通知
     * @returns 发送结果
     */
    public async sendRootsListChanged(): Promise<void> {
        if (!this.connected) {
            throw new Error(`客户端未连接: ${this.serviceName}`);
        }

        try {
            await this.client.sendRootsListChanged();
            this.logger.debug(`已发送根目录列表变更通知: ${this.serviceName}`);
        } catch (error) {
            this.logger.error(`发送根目录列表变更通知失败: ${this.serviceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 设置连接状态
     * @param connected 是否已连接
     * @param error 错误信息（可选）
     */
    protected setConnectionStatus(connected: boolean, error?: Error): void {
        this.connected = connected;
        if (error) {
            this.lastError = error;
        } else {
            this.lastError = undefined;
        }

        if (connected) {
            this.logger.info(`已连接到服务: ${this.serviceName}`);
        } else {
            this.logger.info(`已断开服务连接: ${this.serviceName}`);
        }
    }

    /**
     * 处理错误
     * @param error 错误对象
     * @param operation 操作名称
     */
    protected handleError(error: Error, operation: string): void {
        this.lastError = error;
        this.logger.error(`${operation}失败: ${this.serviceName}`, {
            error: error.message,
            stack: error.stack
        });
    }

    /**
     * 获取客户端信息
     * @returns 客户端状态信息
     */
    public getClientInfo(): {
        serviceName: string;
        serverType: string;
        connected: boolean;
        lastError?: string;
        uptime: number;
    } {
        return {
            serviceName: this.serviceName,
            serverType: this.config.type || 'stdio',
            connected: this.connected,
            lastError: this.lastError?.message,
            uptime: process.uptime()
        };
    }

    /**
     * 创建传输层
     * @param transportType 传输类型
     * @returns 传输实例
     */
    protected createTransport(transportType: McpServerType): any {
        switch (transportType) {
            case McpServerType.STDIO:
                return this.createStdioTransport();
            case McpServerType.HTTP:
                return this.createHttpTransport();
            case McpServerType.SSE:
                return this.createSseTransport();

            default:
                throw new Error(`不支持的传输类型: ${transportType}`);
        }
    }

    /**
     * 创建STDIO传输
     * @returns STDIO传输实例
     */
    protected abstract createStdioTransport(): StdioClientTransport;

    /**
     * 创建HTTP传输
     * @returns HTTP传输实例
     */
    protected abstract createHttpTransport(): StreamableHTTPClientTransport;

    /**
     * 创建SSE传输
     * @returns SSE传输实例
     */
    protected abstract createSseTransport(): SSEClientTransport;

    }