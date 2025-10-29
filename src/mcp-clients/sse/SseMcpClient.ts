/**
 * SSE MCP客户端实现
 * 通过Server-Sent Events协议连接到MCP服务
 */

import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { BaseMcpClient } from '../base/BaseMcpClient';
import { SseServerConfig } from '../../types/config';
import { Logger } from '../../core/logger/Logger';

/**
 * SSE MCP客户端类
 */
export class SseMcpClient extends BaseMcpClient {
    protected config: SseServerConfig;

    /**
     * 创建SSE MCP客户端实例
     * @param serviceName 服务名称
     * @param config SSE服务配置
     */
    constructor(serviceName: string, config: SseServerConfig) {
        super(serviceName, config);
        this.config = config;
    }

    /**
     * 连接到SSE服务
     */
    public async connect(): Promise<void> {
        try {
            this.logger.info(`连接到SSE服务: ${this.serviceName}`, { url: this.config.url });

            // 验证URL
            new URL(this.config.url);

            // 创建SSE传输
            this.transport = this.createSseTransport();

            // 连接到MCP服务器
            await this.client.connect(this.transport);

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
            this.logger.info(`断开SSE服务连接: ${this.serviceName}`);

            if (this.connected) {
                await this.client.close();
                this.setConnectionStatus(false);
            }

        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)), '断开连接');
        }
    }

    /**
     * 创建SSE传输
     * @returns SSE传输实例
     */
    protected createSseTransport(): SSEClientTransport {
        const url = new URL(this.config.url);

        const transport = new SSEClientTransport(url, {
            requestInit: {
                headers: this.config.headers || {}
            }
        });

        return transport;
    }

    /**
     * 创建STDIO传输（SSE客户端不支持）
     */
    protected createStdioTransport(): any {
        throw new Error('SSE客户端不支持STDIO传输');
    }

    /**
     * 创建HTTP传输（SSE客户端不支持）
     */
    protected createHttpTransport(): any {
        throw new Error('SSE客户端不支持HTTP传输');
    }

    /**
     * 发送GET请求进行SSE健康检查
     * @returns 是否健康
     */
    public async healthCheck(): Promise<boolean> {
        try {
            const url = new URL(this.config.url);

            // 对于SSE，使用GET方法进行健康检查
            const response = await fetch(url, {
                method: 'GET',
                headers: this.config.headers || {},
                signal: AbortSignal.timeout(5000)
            });

            return response.ok;

        } catch (error) {
            this.logger.debug(`SSE健康检查失败: ${this.serviceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }
}