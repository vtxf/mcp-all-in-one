/**
 * HTTP MCP客户端实现
 * 通过HTTP协议连接到MCP服务
 */

import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { BaseMcpClient } from '../base/BaseMcpClient';
import { HttpServerConfig } from '../../types/config';
import { Logger } from '../../core/logger/Logger';

/**
 * HTTP MCP客户端类
 */
export class HttpMcpClient extends BaseMcpClient {
    protected config: HttpServerConfig;

    /**
     * 创建HTTP MCP客户端实例
     * @param serviceName 服务名称
     * @param config HTTP服务配置
     */
    constructor(serviceName: string, config: HttpServerConfig) {
        super(serviceName, config);
        this.config = config;
    }

    /**
     * 连接到HTTP服务
     */
    public async connect(): Promise<void> {
        try {
            this.logger.info(`连接到HTTP服务: ${this.serviceName}`, { url: this.config.url });

            // 验证URL
            new URL(this.config.url);

            // 创建HTTP传输
            this.transport = this.createHttpTransport();

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
            this.logger.info(`断开HTTP服务连接: ${this.serviceName}`);

            if (this.connected) {
                await this.client.close();
                this.setConnectionStatus(false);
            }

        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)), '断开连接');
        }
    }

    /**
     * 创建HTTP传输
     * @returns HTTP传输实例
     */
    protected createHttpTransport(): StreamableHTTPClientTransport {
        const url = new URL(this.config.url);

        const transport = new StreamableHTTPClientTransport(url, {
            requestInit: {
                headers: this.config.headers || {}
            }
        });

        return transport;
    }

    /**
     * 创建STDIO传输（HTTP客户端不支持）
     */
    protected createStdioTransport(): any {
        throw new Error('HTTP客户端不支持STDIO传输');
    }

    /**
     * 创建SSE传输（HTTP客户端不支持）
     */
    protected createSseTransport(): any {
        throw new Error('HTTP客户端不支持SSE传输');
    }

    /**
     * 发送HTTP请求进行健康检查
     * @returns 是否健康
     */
    public async healthCheck(): Promise<boolean> {
        try {
            const url = new URL(this.config.url);
            const response = await fetch(url, {
                method: 'HEAD',
                headers: this.config.headers || {},
                signal: AbortSignal.timeout(5000)
            });

            return response.ok;

        } catch (error) {
            this.logger.debug(`HTTP健康检查失败: ${this.serviceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }
}