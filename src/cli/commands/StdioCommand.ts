/**
 * STDIO命令实现
 * 启动stdio模式的MCP服务
 */

import { BaseCommand } from './BaseCommand';
import { ConfigLoader } from '../../core/config/ConfigLoader';
import { ConfigValidator } from '../../core/config/ConfigValidator';
import { StdioMcpServer } from '../../mcp-server/stdio';
import { LogLevel } from '../../types/cli';
import { LogOutputTarget } from '../../core/logger/Logger';
import * as path from 'path';
import * as os from 'os';

/**
 * STDIO命令类
 */
export class StdioCommand extends BaseCommand {
    /**
     * 创建STDIO命令实例
     */
    constructor() {
        super('stdio');
    }

    /**
     * 执行STDIO命令
     * @param args 命令参数
     */
    public async execute(args: {
        mcpConfig?: string;
        logLevel?: string;
        silent?: boolean;
    }): Promise<void> {
        try {
            // STDIO模式：设置日志输出到stderr，避免与MCP协议通信冲突
            this.setLogOutputTarget(LogOutputTarget.STDERR);

            // 设置日志级别
            if (args.logLevel) {
                this.setLogLevel(args.logLevel as LogLevel);
            }

            // 设置静默模式
            if (args.silent) {
                this.setSilentMode(true);
            }

            this.logger.info('启动STDIO模式MCP服务', { args });

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

            // 启动MCP STDIO服务器（它内部会处理所有服务连接）
            const stdioServer = new StdioMcpServer(config, actualConfigPath);
            await stdioServer.start();
            this.logger.info('STDIO MCP服务器已启动，等待连接...');

            // 显示服务统计信息
            const stats = stdioServer.getServiceStats();
            this.logger.info('MCP服务启动完成');

            this.logger.info(`
------ MCP Configuration (Connect all with one MCP!) / MCP配置信息（一个MCP连接所有！） ------
{
  "mcpServers": {
    "mcp-all-in-one": {
      "command": "npx",
      "args": [
        "mcp-all-in-one",
        "stdio"
      ]
    }
  }
}
`)

            this.logger.info(JSON.stringify(stats, null, 4));

            // 监听退出信号
            this.setupExitHandlers(stdioServer);

        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)));
            process.exit(1);
        }
    }

    /**
     * 设置退出处理器
     * @param stdioServer STDIO服务器实例
     */
    private setupExitHandlers(stdioServer: StdioMcpServer): void {
        const cleanup = async (signal: string) => {
            this.logger.info(`收到${signal}信号，正在关闭服务...`);
            try {
                await stdioServer.stop();
                this.logger.info('所有服务已停止');
                process.exit(0);
            } catch (error) {
                this.logger.error('关闭服务时发生错误', {
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
        // STDIO命令没有必需的参数
        return true;
    }

    /**
     * 获取命令描述
     * @returns 命令描述
     */
    public getDescription(): string {
        return 'Start stdio mode MCP service aggregator, merging multiple MCP services into one unified service / 启动stdio模式的MCP服务聚合器，将多个MCP服务合并为一个统一服务';
    }

    /**
     * 获取命令帮助信息
     * @returns 帮助信息
     */
    public getHelp(): string {
        return `
Usage / 用法: mcp-all-in-one stdio [options / 选项]

Start stdio mode MCP service aggregator, merging multiple MCP services into one unified MCP service.
This is the recommended mode for use in Claude Code, Cursor and other IDEs.
启动stdio模式的MCP服务聚合器，将多个MCP服务合并为一个统一的MCP服务。
这是在Claude Code、Cursor等IDE中使用的推荐模式。

Options / 选项:
  -c, --mcp-config <path>     Specify MCP configuration file path (default: ~/.mcp-all-in-one/mcp.json) / 指定MCP配置文件路径 (默认: ~/.mcp-all-in-one/mcp.json)
  -l, --log-level <level>     Set log level (error|warn|info|debug, default: info) / 设置日志级别 (error|warn|info|debug，默认: info)
  -s, --silent                Enable silent mode, disable log output / 启用静默模式，禁用日志输出

Examples / 示例:
  # Start with default configuration / 使用默认配置启动
  mcp-all-in-one stdio

  # Start with custom configuration file / 使用自定义配置文件启动
  mcp-all-in-one stdio --mcp-config ./my-config.json

  # Enable debug logging / 启用调试日志
  mcp-all-in-one stdio --log-level debug

  # Start in silent mode / 静默模式启动
  mcp-all-in-one stdio --silent

IDE Configuration Example / IDE配置示例:
  In Claude Code or Cursor, you only need to configure one MCP service:
  在Claude Code或Cursor中，只需配置一个MCP服务：
  {
    "mcpServers": {
      "mcp-all-in-one": {
        "command": "mcp-all-in-one",
        "args": ["stdio", "--mcp-config", "/path/to/your/mcp.json"]
      }
    }
  }

Self-configuration Tools / 自我配置工具:
  After startup, you can use the following built-in MCP tools to manage configuration:
  启动后，可使用以下内置MCP工具管理配置：
  - mcp-all-in-one-show-mcp-config: Display current configuration / 显示当前配置
  - mcp-all-in-one-validate-mcp-config: Validate configuration file / 验证配置文件
  - mcp-all-in-one-set-mcp-config: Set configuration / 设置配置
  - mcp-all-in-one-show-mcp-config-schema: Display configuration format / 显示配置格式
        `.trim();
    }
}