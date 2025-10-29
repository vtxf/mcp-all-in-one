/**
 * 配置管理命令实现
 * 提供配置文件验证、查看等功能
 */

import { BaseCommand } from './BaseCommand';
import { ConfigLoader } from '../../core/config/ConfigLoader';
import { ConfigValidator } from '../../core/config/ConfigValidator';
import * as fs from 'fs/promises';
import * as path from 'path';
import mcpSchema from '../../../schemas/mcp.schema.json';

/**
 * 配置管理命令类
 */
export class ConfigCommand extends BaseCommand {
    /**
     * 创建配置命令实例
     */
    constructor() {
        super('config');
    }

    /**
     * 执行配置命令
     * @param args 命令参数
     */
    public async execute(args: {
        action: 'validate' | 'show' | 'schema' | 'set';
        configPath?: string;
    }): Promise<void> {
        try {
            switch (args.action) {
                case 'validate':
                    await this.validateConfig(args.configPath);
                    break;
                case 'show':
                    await this.showConfig(args.configPath);
                    break;
                case 'schema':
                    await this.showSchema();
                    break;
                case 'set':
                    await this.setConfig(args.configPath);
                    break;
                default:
                    throw new Error(`未知的配置操作: ${args.action}`);
            }
        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * 验证配置文件
     * @param configPath 配置文件路径
     */
    private async validateConfig(configPath?: string): Promise<void> {
        this.logger.info('验证配置文件', { configPath });

        try {
            // 加载配置文件
            const config = await ConfigLoader.loadConfig({
                configPath,
                autoCreate: false,
                validateEnv: false
            });

            // 验证配置
            const validation = await ConfigValidator.validateConfig(config);

            if (validation.valid) {
                console.log('✅ 配置文件验证通过');
                console.log(`📊 服务数量: ${Object.keys(config.mcpServers).length}`);

                // 统计不同类型的服务
                const stats = this.getServiceTypeStats(config);
                for (const [type, count] of Object.entries(stats)) {
                    console.log(`   ${type}: ${count}`);
                }
            } else {
                console.log('❌ 配置文件验证失败');
                console.log('');
                console.log('错误详情:');
                validation.errors?.forEach((error, index) => {
                    console.log(`${index + 1}. ${error.path}: ${error.message}`);
                });

                process.exit(1);
            }

        } catch (error) {
            if (error instanceof Error && error.message.includes('配置文件未找到')) {
                console.log('❌ 配置文件未找到');
                console.log('请检查文件路径或使用 --mcp-config 参数指定正确的配置文件路径');
            } else {
                throw error;
            }
        }
    }

    /**
     * 显示配置文件内容
     * @param configPath 配置文件路径
     */
    private async showConfig(configPath?: string): Promise<void> {
        const actualPath = configPath || ConfigLoader.getDefaultConfigPath();
        this.logger.info('显示配置文件内容', { configPath: actualPath });

        try {
            // 检查文件是否存在
            await fs.access(actualPath);

            // 读取并显示配置文件
            const configContent = await fs.readFile(actualPath, 'utf-8');
            const config = JSON.parse(configContent);

            console.log('📄 mcp-all-in-one的MCP配置文件内容:');
            console.log(`路径: ${actualPath}`);
            console.log('');

            // 美化输出JSON
            console.log(JSON.stringify(config, null, 2));

        } catch (error) {
            if (error instanceof Error && error.message.includes('ENOENT')) {
                console.log('❌ 配置文件不存在');
                console.log(`路径: ${actualPath}`);
                console.log('请检查文件路径或创建配置文件');
            } else if (error instanceof SyntaxError) {
                console.log('❌ 配置文件格式错误');
                console.log(`错误: ${error.message}`);
            } else {
                throw error;
            }
        }
    }

    /**
     * 显示配置Schema
     */
    private async showSchema(): Promise<void> {
        this.logger.info('显示配置文件Schema');

        try {
            console.log('📋 mcp-all-in-one的MCP配置文件Schema:');
            console.log('');

            // 直接使用导入的JSON schema
            console.log(JSON.stringify(mcpSchema, null, 2));

        } catch (error) {
            console.log('❌ 无法获取Schema定义');
            console.log('Schema加载失败，请检查代码实现');
        }
    }

    /**
     * 设置配置文件内容
     * @param configPath 配置文件路径
     */
    private async setConfig(configPath?: string): Promise<void> {
        const actualPath = configPath || ConfigLoader.getDefaultConfigPath();
        this.logger.info('设置配置文件内容', { configPath: actualPath });

        try {
            // 确保目录存在
            const dir = path.dirname(actualPath);
            await fs.mkdir(dir, { recursive: true });

            // 从标准输入读取配置内容
            let configContent = '';

            // 设置编码为UTF-8
            process.stdin.setEncoding('utf-8');

            // 读取所有输入数据
            for await (const chunk of process.stdin) {
                configContent += chunk;
            }

            // 验证JSON格式
            let config;
            try {
                config = JSON.parse(configContent);
            } catch (error) {
                console.log('❌ JSON格式错误');
                console.log(`错误: ${error instanceof Error ? error.message : String(error)}`);
                process.exit(1);
                return;
            }

            // 验证配置格式
            const validation = await ConfigValidator.validateConfig(config);

            if (!validation.valid) {
                console.log('❌ 配置文件验证失败');
                console.log('');
                console.log('错误详情:');
                validation.errors?.forEach((error, index) => {
                    console.log(`${index + 1}. ${error.path}: ${error.message}`);
                });
                process.exit(1);
                return;
            }

            // 写入配置文件
            await fs.writeFile(actualPath, JSON.stringify(config, null, 2), 'utf-8');

            console.log('✅ 配置文件设置成功');
            console.log(`路径: ${actualPath}`);
            console.log(`📊 服务数量: ${Object.keys(config.mcpServers).length}`);

            // 统计不同类型的服务
            const stats = this.getServiceTypeStats(config);
            for (const [type, count] of Object.entries(stats)) {
                console.log(`   ${type}: ${count}`);
            }

        } catch (error) {
            console.log('❌ 设置配置文件失败');
            console.log(`错误: ${error instanceof Error ? error.message : String(error)}`);
            process.exit(1);
        }
    }

    /**
     * 统计服务类型
     * @param config MCP配置
     * @returns 服务类型统计
     */
    private getServiceTypeStats(config: any): Record<string, number> {
        const stats: Record<string, number> = {};

        for (const service of Object.values(config.mcpServers)) {
            const type = (service as any).type || 'stdio';
            stats[type] = (stats[type] || 0) + 1;
        }

        return stats;
    }

    /**
     * 验证命令参数
     * @param args 命令参数
     * @returns 是否有效
     */
    protected validateArgs(args: any): boolean {
        if (!args.action || !['validate', 'show', 'schema', 'set'].includes(args.action)) {
            return false;
        }
        return true;
    }

    /**
     * 获取命令描述
     * @returns 命令描述
     */
    public getDescription(): string {
        return 'Manage mcp-all-in-one MCP configuration files, supporting validation, viewing, Schema display and settings / 管理mcp-all-in-one的MCP配置文件，支持验证、查看、Schema显示和设置';
    }

    /**
     * 获取命令帮助信息
     * @returns 帮助信息
     */
    public getHelp(): string {
        return `
Usage / 用法: mcp-all-in-one --validate-mcp-config [path]
       mcp-all-in-one --show-mcp-config [path]
       mcp-all-in-one --show-mcp-config-schema

Manage mcp-all-in-one MCP configuration files, supporting validation, viewing, Schema display and settings.
管理mcp-all-in-one的MCP配置文件，支持验证、查看、Schema显示和设置。

Options / 选项:
  --validate-mcp-config [path]  Validate mcp-all-in-one MCP configuration file (default: ~/.mcp-all-in-one/mcp.json) / 验证mcp-all-in-one的MCP配置文件 (默认: ~/.mcp-all-in-one/mcp.json)
  --show-mcp-config [path]      Display mcp-all-in-one MCP configuration file content / 显示mcp-all-in-one的MCP配置文件内容
  --show-mcp-config-schema      Display mcp-all-in-one MCP configuration file Schema / 显示mcp-all-in-one的MCP配置文件Schema

Examples / 示例:
  # Validate default configuration file / 验证默认配置文件
  mcp-all-in-one --validate-mcp-config

  # Validate configuration file at specified path / 验证指定路径的配置文件
  mcp-all-in-one --validate-mcp-config ./my-config.json

  # Display default configuration file content / 显示默认配置文件内容
  mcp-all-in-one --show-mcp-config

  # Display configuration file content at specified path / 显示指定路径的配置文件内容
  mcp-all-in-one --show-mcp-config ./my-config.json

  # Display configuration file Schema / 显示配置文件Schema
  mcp-all-in-one --show-mcp-config-schema

Configuration File Format / 配置文件格式:
  mcp-all-in-one supports three types of MCP service configurations:
  mcp-all-in-one支持三种类型的MCP服务配置:
  
  1. stdio type (default) / stdio类型 (默认):
     {
       "mcpServers": {
         "service-name": {
           "command": "npx",
           "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
         }
       }
     }

  2. http type / http类型:
     {
       "mcpServers": {
         "service-name": {
           "type": "http",
           "url": "http://localhost:8080/mcp",
           "headers": {
             "Authorization": "Bearer token"
           }
         }
       }
     }

  3. sse type / sse类型:
     {
       "mcpServers": {
         "service-name": {
           "type": "sse",
           "url": "http://localhost:8080/sse",
           "headers": {
             "Authorization": "Bearer token"
           }
         }
       }
     }

Configuration Validation / 配置验证:
  The validation command checks for:
  验证命令检查:
  - Valid JSON format / 有效的JSON格式
  - Required fields / 必需字段
  - Valid service types / 有效的服务类型
  - Proper parameter values / 正确的参数值

Configuration Schema / 配置Schema:
  Use --show-mcp-config-schema to display the complete JSON Schema for configuration files.
  This can be used with IDE plugins for auto-completion and validation.
  使用 --show-mcp-config-schema 显示配置文件的完整JSON Schema。
  可与IDE插件配合使用，实现自动补全和验证。
        `.trim();
    }
}