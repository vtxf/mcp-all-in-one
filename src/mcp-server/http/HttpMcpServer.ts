/**
 * HTTP MCP服务器实现
 * 通过HTTP协议提供MCP服务
 */

import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { McpConfig } from '../../types/config';
import { BaseMcpServer } from '../base/BaseMcpServer';
import { getVersion } from '../../utils';

/**
 * HTTP MCP服务器类
 */
export class HttpMcpServer extends BaseMcpServer {
    protected app: express.Application;
    protected server: any;
    private port: number;
    private host: string;
    private corsEnabled: boolean;

    /**
     * 创建HTTP MCP服务器实例
     * @param config MCP配置
     * @param configPath 当前MCP配置文件路径
     * @param port HTTP端口
     * @param host 绑定主机
     * @param corsEnabled 是否启用CORS
     */
    constructor(config: McpConfig, configPath: string, port: number = 3095, host: string = '127.0.0.1', corsEnabled: boolean = false) {
        super(config, configPath, 'HttpServer');
        this.port = port;
        this.host = host;
        this.corsEnabled = corsEnabled;
        this.app = express();
        this.server = null;
    }

    /**
     * 启动HTTP服务器
     */
    public async start(): Promise<void> {
        try {
            this.logger.info('启动HTTP MCP服务器', { port: this.port, host: this.host, cors: this.corsEnabled });

            // 调用基类的通用启动流程
            await this.doStart();

            // 配置Express应用
            this.setupExpress();

            // 创建HTTP服务器
            this.server = createServer(this.app);

            // 启动服务器
            await new Promise<void>((resolve, reject) => {
                this.server.listen(this.port, this.host, () => {
                    this.logger.info(`HTTP服务器已启动: http://${this.host}:${this.port}`);
                    resolve();
                });

                this.server.on('error', (error: Error) => {
                    this.logger.error('HTTP服务器启动失败', { error: error.message });
                    reject(error);
                });
            });

            // 启动健康检查
            this.startHealthCheck(60000);

            this.logger.info('HTTP MCP服务器启动成功');

        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }

    /**
     * 停止HTTP服务器
     */
    public async stop(): Promise<void> {
        try {
            this.logger.info('停止HTTP MCP服务器');

            // 关闭HTTP服务器
            if (this.server) {
                await new Promise<void>((resolve) => {
                    this.server.close(() => {
                        this.logger.info('HTTP服务器已关闭');
                        resolve();
                    });
                });
                this.server = null;
            }

            // 调用基类的通用停止流程
            await this.doStop();

        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * 获取服务器信息
     * @returns 服务器详细信息
     */
    public getServerInfo(): {
        type: 'http';
        status: 'running' | 'stopped' | 'error';
        url: string;
        port: number;
        host: string;
        cors: boolean;
        services: any;
        uptime: number;
        stats: any;
    } {
        return {
            type: 'http',
            status: this.isRunning ? 'running' : 'stopped',
            url: `http://${this.host}:${this.port}`,
            port: this.port,
            host: this.host,
            cors: this.corsEnabled,
            services: this.getAggregatedInfo(),
            uptime: process.uptime(),
            stats: this.getServiceStats()
        };
    }

    /**
     * 配置Express应用
     */
    private setupExpress(): void {
        // 启用JSON解析
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // 配置CORS
        if (this.corsEnabled) {
            this.app.use(cors({
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization'],
                credentials: true
            }));
        }

        // 添加请求日志中间件
        this.app.use((req, res, next) => {
            this.logger.debug('HTTP请求', {
                method: req.method,
                url: req.url,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        });

        // 设置MCP协议端点
        this.setupMcpHttpEndpoints();

        // 根路径和状态端点
        this.app.get('/', (req, res) => {
            res.json({
                name: 'mcp-all-in-one HTTP Server',
                version: getVersion(),
                status: 'running',
                endpoints: {
                    mcp: '/mcp',
                    health: '/health',
                    status: '/status'
                },
                timestamp: new Date().toISOString()
            });
        });

        this.app.get('/health', (req, res) => {
            const stats = this.getServiceStats();
            res.json({
                status: 'healthy',
                services: stats,
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        });

        this.app.get('/status', (req, res) => {
            res.json(this.getServerInfo());
        });

        // 错误处理中间件
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            this.logger.error('HTTP请求错误', {
                error: err.message,
                method: req.method,
                url: req.url,
                stack: err.stack
            });

            // 根据错误类型确定适当的错误码和HTTP状态码
            let errorCode = -32603; // 默认内部错误
            let statusCode = 500;
            let errorMessage = 'Internal server error';

            const errorMsg = err.message || String(err);

            // 根据错误消息确定具体错误类型
            if (errorMsg.includes('JSON') || errorMsg.includes('parse') || errorMsg.includes('Unexpected token')) {
                errorCode = -32700; // Parse error
                statusCode = 400;
                errorMessage = 'Parse error: Invalid JSON';
            } else if (errorMsg.includes('unexpected') || errorMsg.includes('EOF')) {
                errorCode = -32700; // Parse error
                statusCode = 400;
                errorMessage = 'Parse error: Unexpected end of input';
            }

            res.status(statusCode).json({
                jsonrpc: '2.0',
                error: {
                    code: errorCode,
                    message: errorMessage
                },
                id: null
            });
        });

        // 404处理 - 必须放在最后
        this.app.use((req, res) => {
            res.status(404).json({
                jsonrpc: '2.0',
                error: {
                    code: -32601,
                    message: 'Method not found'
                },
                id: null
            });
        });
    }

    /**
     * 设置MCP协议HTTP端点 - 使用McpHandler处理所有业务逻辑
     */
    private setupMcpHttpEndpoints(): void {
        // 创建一个统一的MCP请求处理器
        this.app.post('/mcp', async (req, res) => {
            try {
                const request = req.body;

                // 更新所有活跃连接的lastActivity时间
                this.updateAllConnectionsActivity();

                // 直接调用McpHandler处理请求
                const response = await this.mcpHandler.handleRequest(request);

                res.json({
                    jsonrpc: '2.0',
                    result: response.result,
                    error: response.error,
                    id: request.id
                });

            } catch (error) {
                this.logger.error('MCP请求处理失败', {
                    error: error instanceof Error ? error.message : String(error),
                    request: req.body
                });

                // 根据错误类型确定适当的错误码和HTTP状态码
                let errorCode = -32603; // 默认内部错误
                let statusCode = 500;
                let errorMessage = error instanceof Error ? error.message : 'Internal server error';

                const errorMsg = error instanceof Error ? error.message : String(error);

                // 根据错误消息确定具体错误类型
                if (errorMsg.includes('未找到') || errorMsg.includes('not found')) {
                    errorCode = -32601; // Method not found
                    statusCode = 400;
                } else if (errorMsg.includes('Invalid request') || errorMsg.includes('Invalid params') ||
                          errorMsg.includes('required') || errorMsg.includes('validation')) {
                    errorCode = -32602; // Invalid params
                    statusCode = 400;
                } else if (errorMsg.includes('JSON') || errorMsg.includes('parse')) {
                    errorCode = -32700; // Parse error
                    statusCode = 400;
                }

                res.status(statusCode).json({
                    jsonrpc: '2.0',
                    error: {
                        code: errorCode,
                        message: errorMessage
                    },
                    id: req.body?.id || null
                });
            }
        });
    }

    /**
     * 更新所有连接的lastActivity时间
     */
    private updateAllConnectionsActivity(): void {
        const connections = this.clientsManager.getAllConnections();
        for (const [serviceName, connection] of connections) {
            if (connection && connection.connected) {
                connection.lastActivity = new Date();
                this.logger.debug(`更新服务活动时间: ${serviceName}`);
            }
        }
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