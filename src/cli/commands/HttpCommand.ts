/**
 * HTTP命令实现
 * 启动HTTP模式的MCP服务
 */

import { BaseCommand } from './BaseCommand';
import { ConfigLoader } from '../../core/config/ConfigLoader';
import { ConfigValidator } from '../../core/config/ConfigValidator';
import { HttpMcpServer } from '../../mcp-server/http/HttpMcpServer';
import { LogLevel } from '../../types/cli';
import * as path from 'path';
import * as os from 'os';

/**
 * HTTP命令类
 */
export class HttpCommand extends BaseCommand {
    /**
     * 创建HTTP命令实例
     */
    constructor() {
        super('http');
    }

    /**
     * 执行HTTP命令
     * @param args 命令参数
     */
    public async execute(args: {
        mcpConfig?: string;
        port?: number;
        host?: string;
        cors?: boolean;
        corsOrigin?: string;
        logLevel?: string;
        silent?: boolean;
    }): Promise<void> {
        try {
            // 设置日志级别
            if (args.logLevel) {
                this.setLogLevel(args.logLevel as LogLevel);
            }

            // 设置静默模式
            if (args.silent) {
                this.setSilentMode(true);
            }

            const port = args.port || 3095;
            const host = args.host || '127.0.0.1';
            const corsEnabled = args.cors !== undefined ? args.cors : true;

            this.logger.info('启动HTTP模式MCP服务', {
                port,
                host,
                cors: corsEnabled,
                args
            });

            // 确定实际使用的MCP配置文件路径
            const actualConfigPath = this.resolveConfigPath(args.mcpConfig);

            // 加载配置文件
            const config = await ConfigLoader.loadConfig({
                configPath: args.mcpConfig,
                autoCreate: true,
                validateEnv: true
            });

            this.logger.info('配置文件加载成功', {
                serviceCount: Object.keys(config.mcpServers).length,
                configPath: actualConfigPath
            });

            // 验证配置
            const validation = await ConfigValidator.validateConfig(config);
            if (!validation.valid) {
                throw new Error(`配置验证失败:\n${validation.errors?.map(e => `- ${e.path}: ${e.message}`).join('\n')}`);
            }

            this.logger.info('配置验证通过');

            // 创建HTTP服务器
            const server = new HttpMcpServer(config, actualConfigPath, port, host, corsEnabled);

            // 启动服务器
            await server.start();

            // 显示服务器信息
            const serverInfo = server.getServerInfo();
            this.logger.info('HTTP MCP服务器启动成功', serverInfo);

            // 显示访问信息
            if (!this.silentMode) {
                console.log('🚀 HTTP MCP Server Started / HTTP MCP服务器已启动');
                console.log(`
------ MCP Configuration (Connect all with one MCP!) / MCP配置信息（一个MCP连接所有！） ------
{
  "mcpServers": {
    "mcp-all-in-one": {
      "type": "http",
      "url": "${serverInfo.url}/mcp"
    }
  }
}
`)


                console.log(`📡 Server Address / 服务地址: ${serverInfo.url}`);
                console.log(`🔗 MCP Endpoint / MCP地址: ${serverInfo.url}/mcp`);
                console.log(`🔗 Health Check / 健康检查: ${serverInfo.url}/health`);
                console.log(`📊 Status Info / 状态信息: ${serverInfo.url}/status`);
                console.log(`📋 Service Count / 服务数量: ${serverInfo.stats.total}`);
                console.log(`✅ Connected Services / 连接的服务: ${serverInfo.stats.connected}`);

                if (serverInfo.stats.connected > 0) {
                    console.log('\n📋 Connected Services / 已连接的服务:');
                    serverInfo.stats.services
                        .filter((s: any) => s.status === 'connected')
                        .forEach((s: any) => {
                            console.log(`   ✅ ${s.name}`);
                        });
                }

                if (serverInfo.stats.connected < serverInfo.stats.total) {
                    console.log('\n❌ Failed Services / 连接失败的服务:');
                    serverInfo.stats.services
                        .filter((s: any) => s.status !== 'connected')
                        .forEach((s: any) => {
                            console.log(`   ❌ ${s.name}`);
                        });
                }
            }

            // 监听退出信号
            this.setupExitHandlers(server);

            // 启动健康检查
            this.startHealthCheck(server);

        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)));
            process.exit(1);
        }
    }

    /**
     * 设置退出处理器
     * @param server HTTP服务器实例
     */
    private setupExitHandlers(server: HttpMcpServer): void {
        const cleanup = async (signal: string) => {
            this.logger.info(`收到${signal}信号，正在关闭HTTP服务...`);
            try {
                await server.stop();
                this.logger.info('HTTP服务已停止');
                process.exit(0);
            } catch (error) {
                this.logger.error('关闭HTTP服务时发生错误', {
                    error: error instanceof Error ? error.message : String(error)
                });
                process.exit(1);
            }
        };

        process.on('SIGINT', () => cleanup('SIGINT'));
        process.on('SIGTERM', () => cleanup('SIGTERM'));

        // 处理未捕获的异常
        process.on('uncaughtException', (error) => {
            this.logger.error('未捕获的异常', {
                error: error.message,
                stack: error.stack
            });
            cleanup('uncaughtException');
        });

        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error('未处理的Promise拒绝', {
                reason: String(reason),
                promise: String(promise)
            });
        });
    }

    /**
     * 启动健康检查
     * @param server HTTP服务器实例
     */
    private startHealthCheck(server: HttpMcpServer): void {
        setInterval(async () => {
            try {
                const stats = server.getServiceStats();
                const disconnectedCount = stats.total - stats.connected;
                if (disconnectedCount > 0) {
                    this.logger.warn('检测到服务连接中断', {
                        失败的服务: disconnectedCount,
                        总服务数: stats.total
                    });
                }
            } catch (error) {
                this.logger.error('健康检查失败', {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }, 60000); // 每60秒检查一次，减少频率
    }

    /**
     * 解析MCP配置文件路径
     * @param configPath 配置文件路径
     * @returns 解析后的绝对路径
     */
    private resolveConfigPath(configPath?: string): string {
        if (!configPath) {
            return ConfigLoader.getDefaultConfigPath();
        }

        // 处理 ~ 路径
        if (configPath.startsWith('~')) {
            return path.join(os.homedir(), configPath.slice(1));
        }

        // 返回绝对路径
        return path.resolve(configPath);
    }

    /**
     * 验证命令参数
     * @param args 命令参数
     * @returns 是否有效
     */
    protected validateArgs(args: any): boolean {
        // 验证端口号
        if (args.port !== undefined) {
            const port = parseInt(args.port);
            if (isNaN(port) || port < 1 || port > 65535) {
                return false;
            }
        }

        // 验证主机地址
        if (args.host !== undefined) {
            const host = args.host;
            if (typeof host !== 'string' || host.trim() === '') {
                return false;
            }
        }

        return true;
    }

    /**
     * 获取命令描述
     * @returns 命令描述
     */
    public getDescription(): string {
        return 'Start HTTP mode MCP service aggregator, merging multiple MCP services into one unified HTTP interface service / 启动HTTP模式的MCP服务聚合器，将多个MCP服务合并为一个统一的HTTP接口服务';
    }

    /**
     * 获取命令帮助信息
     * @returns 帮助信息
     */
    public getHelp(): string {
        return `
Usage / 用法: mcp-all-in-one http [options / 选项]

Start HTTP mode MCP service aggregator, merging multiple MCP services into one unified HTTP interface service.
This mode allows accessing MCP services through HTTP protocol, suitable for web applications, remote clients or cross-platform access scenarios.
启动HTTP模式的MCP服务聚合器，将多个MCP服务合并为一个统一的HTTP接口服务。
此模式允许通过HTTP协议访问MCP服务，适合Web应用、远程客户端或需要跨平台访问的场景。

Options / 选项:
  -c, --mcp-config <path>    Specify MCP configuration file path (default: ~/.mcp-all-in-one/mcp.json) / 指定MCP配置文件路径 (默认: ~/.mcp-all-in-one/mcp.json)
  -p, --port <port>           Set HTTP service port (default: 3095) / 设置HTTP服务端口 (默认: 3095)
  -h, --host <host>           Set binding host address (default: 127.0.0.1) / 设置绑定主机地址 (默认: 127.0.0.1)
      --cors                  Enable CORS cross-origin support (default: true) / 启用CORS跨域支持 (默认: true)
      --cors-origin <origin>   Set CORS allowed origin (default: *) / 设置CORS允许的源地址 (默认: *)
  -l, --log-level <level>     Set log level (error|warn|info|debug, default: info) / 设置日志级别 (error|warn|info|debug，默认: info)
  -s, --silent                Enable silent mode / 启用静默模式

Examples / 示例:
  # Start HTTP service with default configuration / 使用默认配置启动HTTP服务
  mcp-all-in-one http

  # Specify port and host address / 指定端口和主机地址
  mcp-all-in-one http --port 8080 --host 0.0.0.0

  # Enable CORS support, allow specific origin access / 启用CORS支持，允许特定源访问
  mcp-all-in-one http --cors --cors-origin "http://localhost:3000"

  # Use custom configuration file / 使用自定义配置文件
  mcp-all-in-one http -c ./my-mcp.json

  # Enable debug logging / 启用调试日志
  mcp-all-in-one http --log-level debug

  # Start in silent mode / 静默模式启动
  mcp-all-in-one http --silent

HTTP API Endpoints / HTTP API端点:
  - Main endpoint: http://host:port/mcp / 主端点: http://host:port/mcp
  - Health check: http://host:port/health / 健康检查: http://host:port/health
  - Status info: http://host:port/status / 状态信息: http://host:port/status

IDE Configuration Examples / IDE配置示例:
  Configure HTTP mode in Claude Code / 在Claude Code中配置HTTP模式:
  {
    "mcpServers": {
      "mcp-all-in-one": {
        "command": "mcp-all-in-one",
        "args": ["http", "--port", "3095", "--mcp-config", "/path/to/mcp.json"]
      }
    }
  }

  Configure HTTP mode in Cursor / 在Cursor中配置HTTP模式:
  {
    "mcpServers": {
      "mcp-all-in-one": {
        "command": "mcp-all-in-one",
        "args": ["http", "--port", "3095", "--mcp-config", "/path/to/mcp.json"]
      }
    }
  }

Built-in Self-configuration Tools / 内置自我配置工具:
  When HTTP mode is started, the following tools are automatically available / 当启动HTTP模式时，以下工具会自动可用:
  - mcp-all-in-one-show-mcp-config: Display current MCP configuration / 显示当前MCP配置
  - mcp-all-in-one-validate-mcp-config: Validate MCP configuration / 验证MCP配置
  - mcp-all-in-one-show-mcp-config-schema: Display configuration schema / 显示配置Schema
  - mcp-all-in-one-set-mcp-config: Set MCP configuration / 设置MCP配置

Advanced Usage / 高级用法:
  # Configure using environment variables / 使用环境变量配置
  MCP_CONFIG=./custom.json mcp-all-in-one http

  # Run in background (Linux/macOS) / 后台运行 (Linux/macOS)
  nohup mcp-all-in-one http --port 8080 > mcp.log 2>&1 &

  # Run using systemd service / 使用systemd服务运行
  sudo systemctl enable mcp-all-in-one
  sudo systemctl start mcp-all-in-one
        `.trim();
    }
}