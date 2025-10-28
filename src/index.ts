/**
 * mcp-all-in-one 主入口文件
 * 合并多个MCP服务为一个统一的MCP服务
 */

import { Command } from 'commander';
import { StdioCommand } from './cli/commands/StdioCommand';
import { ConfigCommand } from './cli/commands/ConfigCommand';
import { HttpCommand } from './cli/commands/HttpCommand';
import { Logger } from './core/logger/Logger';
import { getVersion } from './utils';

/**
 * 主程序入口
 */
async function main(): Promise<void> {
    const logger = new Logger('Main');

    try {
        // 创建CLI程序
        const program = new Command();

        // 设置程序基本信息
        program
            .name('mcp-all-in-one')
            .description('Merge multiple MCP services into a unified MCP service / 合并多个MCP服务为一个统一的MCP服务')
            .version(getVersion())
            .addHelpText('beforeAll', `
🔗 mcp-all-in-one - MCP Service Aggregator / MCP服务聚合器

Core Features / 核心功能：
1. Multi-service Aggregation - Merge multiple MCP services into one unified MCP service to simplify IDE configuration / 多服务聚合 - 将多个MCP服务合并为一个统一的MCP服务，简化IDE配置
2. Self-configuration - Dynamically manage configuration through built-in MCP tools without manual file editing / 自我配置 - 通过内置MCP工具动态管理配置，无需手动编辑文件

Use Cases / 使用场景：
• Configure only one MCP service in IDEs like Claude Code, Cursor to use multiple MCP tools / 在Claude Code、Cursor等IDE中只需配置一个MCP服务，即可使用多个MCP工具
• Dynamically add, remove, or modify MCP service configurations without restarting IDE / 动态添加、删除或修改MCP服务配置，无需重启IDE
• Combine different types of MCP services (stdio, HTTP) to implement complex workflows / 组合不同类型的MCP服务（stdio、HTTP）实现复杂工作流

Quick Start / 快速开始：
  mcp-all-in-one stdio                    # Start with default configuration / 使用默认配置启动
  mcp-all-in-one stdio -c ./mcp.json      # Start with custom configuration file / 使用自定义配置文件启动

Configuration Management / 配置管理：
  mcp-all-in-one --validate-mcp-config    # Validate configuration file / 验证配置文件
  mcp-all-in-one --show-mcp-config        # Display current configuration / 显示当前配置
  mcp-all-in-one --show-mcp-config-schema # Display configuration format / 显示配置格式

For more information visit / 更多信息请访问: https://github.com/vtxf/mcp-all-in-one
========================================
`);

        // STDIO子命令
        const stdioCommand = new StdioCommand();
        program
            .command('stdio')
            .description(stdioCommand.getDescription())
            .option('-c, --mcp-config <path>', 'Specify MCP configuration file path / 指定MCP配置文件路径')
            .option('-l, --log-level <level>', 'Set log level (error|warn|info|debug) / 设置日志级别 (error|warn|info|debug)', 'info')
            .option('-s, --silent', 'Enable silent mode / 启用静默模式')
            .action(async (options) => {
                await stdioCommand.execute(options);
            });

        // HTTP子命令
        const httpCommand = new HttpCommand();
        program
            .command('http')
            .description(httpCommand.getDescription())
            .option('-c, --mcp-config <path>', 'Specify MCP configuration file path / 指定MCP配置文件路径')
            .option('-p, --port <port>', 'Set HTTP service port / 设置HTTP服务端口', '3095')
            .option('-h, --host <host>', 'Set binding host address / 设置绑定主机地址', '127.0.0.1')
            .option('--cors', 'Enable CORS cross-origin support / 启用CORS跨域支持')
            .option('--cors-origin <origin>', 'Set CORS allowed origin / 设置CORS允许的源地址')
            .option('-l, --log-level <level>', 'Set log level (error|warn|info|debug) / 设置日志级别 (error|warn|info|debug)', 'info')
            .option('-s, --silent', 'Enable silent mode / 启用静默模式')
            .action(async (options) => {
                await httpCommand.execute(options);
            });

  
        // mcp-all-in-one配置管理命令（作为全局标志）
        program
            .option('--validate-mcp-config [path]', 'Validate mcp-all-in-one MCP configuration file / 验证mcp-all-in-one的MCP配置文件')
            .option('--show-mcp-config [path]', 'Display mcp-all-in-one MCP configuration file content / 显示mcp-all-in-one的MCP配置文件内容')
            .option('--show-mcp-config-schema', 'Display mcp-all-in-one MCP configuration file Schema / 显示mcp-all-in-one的MCP配置文件Schema')
            .option('--set-mcp-config [path]', 'Set mcp-all-in-one MCP configuration file (read from standard input) / 设置mcp-all-in-one的MCP配置文件（从标准输入读取）')
            .action(async (options) => {
                const configCommand = new ConfigCommand();

                if (options.validateMcpConfig !== undefined) {
                    await configCommand.execute({
                        action: 'validate',
                        configPath: options.validateMcpConfig === true ? undefined : options.validateMcpConfig
                    });
                } else if (options.showMcpConfig !== undefined) {
                    await configCommand.execute({
                        action: 'show',
                        configPath: options.showMcpConfig === true ? undefined : options.showMcpConfig
                    });
                } else if (options.showMcpConfigSchema) {
                    await configCommand.execute({
                        action: 'schema'
                    });
                } else if (options.setMcpConfig !== undefined) {
                    await configCommand.execute({
                        action: 'set',
                        configPath: options.setMcpConfig === true ? undefined : options.setMcpConfig
                    });
                }
            });

        // 解析命令行参数
        await program.parseAsync(process.argv);

    } catch (error) {
        logger.error('程序执行失败', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        process.exit(1);
    }
}

// 如果直接运行此文件，或者在CLI环境中，则执行主程序
if (require.main === module || process.env.MCP_ALL_IN_ONE_CLI === 'true') {
    main().catch((error) => {
        console.error('程序启动失败:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    });
}

