/**
 * STDIO MCP服务器实现
 * 通过标准输入输出提供MCP服务
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { LogOutputTarget } from '../../core/logger/Logger';
import { McpConfig } from '../../types/config';
import { BaseMcpServer } from '../base/BaseMcpServer';

/**
 * STDIO MCP服务器类
 */
export class StdioMcpServer extends BaseMcpServer {
    private transport: StdioServerTransport | null = null;

    /**
     * 创建STDIO MCP服务器实例
     * @param config MCP配置
     * @param configPath 当前MCP配置文件路径
     */
    constructor(config: McpConfig, configPath: string) {
        super(config, configPath, 'StdioServer');
        // STDIO模式强制日志输出到stderr，避免干扰MCP协议通信
        this.logger.setOutputTarget(LogOutputTarget.STDERR);
    }

    
    /**
     * 启动STDIO服务器
     */
    public async start(): Promise<void> {
        try {
            this.logger.info('启动STDIO MCP服务器');

            // 调用基类的通用启动流程
            await this.doStart();

            // 创建STDIO传输
            this.transport = new StdioServerTransport();

            // 直接设置消息处理器，绕过McpServer的限制
            this.transport.onmessage = async (message: any) => {
                try {
                    // 将JSONRPCMessage转换为McpRequest格式
                    const mcpRequest = {
                        method: message.method,
                        params: message.params,
                        id: message.id
                    };

                    // 直接调用McpHandler处理所有消息
                    const mcpResponse = await this.mcpHandler.handleRequest(mcpRequest);

                    // 构建完整的JSON-RPC响应
                    const jsonResponse: any = {
                        jsonrpc: "2.0",
                        id: message.id
                    };

                    // 添加成功或错误结果
                    if (mcpResponse.result) {
                        jsonResponse.result = mcpResponse.result;
                    } else if (mcpResponse.error) {
                        jsonResponse.error = mcpResponse.error;
                    }

                    // 发送响应
                    if (this.transport) {
                        await this.transport.send(jsonResponse);
                    }

                } catch (error) {
                    this.logger.error('处理MCP消息失败', {
                        method: message.method,
                        error: error instanceof Error ? error.message : String(error)
                    });

                    // 发送错误响应
                    const errorResponse: any = {
                        jsonrpc: "2.0",
                        id: message.id,
                        error: {
                            code: -32603,
                            message: error instanceof Error ? error.message : 'Internal server error'
                        }
                    };

                    if (this.transport) {
                        await this.transport.send(errorResponse);
                    }
                }
            };

            // 设置错误处理器
            this.transport.onerror = (error) => {
                this.logger.error('STDIO传输错误', error);
            };

            // 设置关闭处理器
            this.transport.onclose = () => {
                this.logger.info('STDIO传输连接关闭');
            };

            // 启动传输
            await this.transport.start();

            // 启动健康检查
            this.startHealthCheck(30000);

            this.logger.info('STDIO MCP服务器启动成功');

        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }

    /**
     * 停止STDIO服务器
     */
    public async stop(): Promise<void> {
        try {
            this.logger.info('停止STDIO MCP服务器');

            // 关闭传输
            if (this.transport) {
                // 注意：MCP SDK的StdioServerTransport可能没有显式的close方法
                // 通常通过关闭进程来停止STDIO服务器
                this.transport = null;
            }

            // 调用基类的通用停止流程
            await this.doStop();

            this.logger.info('STDIO MCP服务器已停止');

        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * 获取服务器信息
     * @returns 服务器详细信息
     */
    public getServerInfo(): {
        type: 'stdio';
        status: 'running' | 'stopped' | 'error';
        services: any;
        uptime: number;
        stats: any;
    } {
        return {
            type: 'stdio',
            status: this.isRunning ? 'running' : 'stopped',
            services: this.getAggregatedInfo(),
            uptime: process.uptime(),
            stats: this.getServiceStats()
        };
    }

    /**
     * 启动健康检查
     * @param interval 检查间隔（毫秒）
     */
    private startHealthCheck(interval: number): void {
        setInterval(async () => {
            try {
                const connections = this.clientsManager.getAllConnections();
                for (const [serviceName, connection] of connections) {
                    if (!await this.isServiceHealthy(serviceName, connection)) {
                        this.logger.warn(`服务不健康: ${serviceName}`);
                        // 可以在这里添加重连逻辑
                    }
                }
            } catch (error) {
                this.logger.debug('健康检查失败', {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }, interval);
    }

    /**
     * 检查单个服务是否健康
     * @param serviceName 服务名称
     * @param connection 服务连接
     * @returns 是否健康
     */
    private async isServiceHealthy(serviceName: string, connection: any): Promise<boolean> {
        if (!connection || !connection.connected) {
            return false;
        }

        try {
            // 从管理器获取MCP客户端
            const client = this.clientsManager.getClient(serviceName);
            if (!client) {
                return false;
            }

            // 检查客户端连接状态
            return client.isConnected();

        } catch (error) {
            this.logger.debug(`健康检查失败: ${serviceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }
}