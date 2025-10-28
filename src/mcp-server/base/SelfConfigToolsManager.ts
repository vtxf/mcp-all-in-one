/**
 * MCP自我配置工具管理器
 * 负责管理mcp-all-in-one的自我配置工具定义和处理逻辑
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigLoader } from '../../core/config/ConfigLoader';
import { ConfigValidator } from '../../core/config/ConfigValidator';

/**
 * 自我配置工具管理器类
 */
export class SelfConfigToolsManager {
    /**
     * 获取自我配置工具列表
     * @returns 自我配置工具列表
     */
    public static getSelfConfigTools(): any[] {
        return [
            {
                name: 'mcp-all-in-one-validate-mcp-config',
                description: '验证mcp-all-in-one的MCP配置文件的正确性',
                inputSchema: {
                    type: 'object',
                    properties: {
                        'config-file': {
                            type: 'string',
                            description: 'mcp-all-in-one的MCP配置文件路径，未指定时验证当前配置'
                        }
                    }
                }
            },
            {
                name: 'mcp-all-in-one-show-mcp-config',
                description: '显示mcp-all-in-one的MCP配置文件内容',
                inputSchema: {
                    type: 'object',
                    properties: {
                        'config-file': {
                            type: 'string',
                            description: 'mcp-all-in-one的MCP配置文件路径，未指定时显示当前配置'
                        }
                    }
                }
            },
            {
                name: 'mcp-all-in-one-show-mcp-config-schema',
                description: '显示mcp-all-in-one的MCP配置的JSON Schema',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            },
            {
                name: 'mcp-all-in-one-set-mcp-config',
                description: '设置mcp-all-in-one的MCP配置，设置之前可以通过mcp-all-in-one-show-mcp-config-schema了解规则！',
                inputSchema: {
                    type: 'object',
                    properties: {
                        'config-file': {
                            type: 'string',
                            description: 'mcp-all-in-one的MCP配置文件路径，未指定时修改当前配置'
                        },
                        'config-content': {
                            type: 'string',
                            description: 'mcp-all-in-one的新MCP配置内容（JSON字符串）'
                        }
                    },
                    required: ['config-content']
                }
            }
        ];
    }

    /**
     * 处理validate-mcp-config工具调用
     * @param request 工具调用请求
     * @param currentConfigPath 当前MCP配置文件路径
     * @returns 验证结果
     */
    public static async handleValidateMcpConfig(request: any, currentConfigPath: string): Promise<any> {
        // 如果未指定config-file参数，则使用当前服务的MCP配置文件路径
        const configPath = request.params?.arguments?.['config-file'] || currentConfigPath;

        try {
            const config = await ConfigLoader.loadConfig({ configPath });
            const validation = await ConfigValidator.validateConfig(config);

            return {
                valid: validation.valid,
                errors: validation.errors || [],
                configPath
            };
        } catch (error) {
            return {
                valid: false,
                errors: [error instanceof Error ? error.message : String(error)],
                configPath
            };
        }
    }

    /**
     * 处理show-mcp-config工具调用
     * @param request 工具调用请求
     * @param currentConfigPath 当前MCP配置文件路径
     * @returns MCP配置内容
     */
    public static async handleShowMcpConfig(request: any, currentConfigPath: string): Promise<any> {
        // 如果未指定config-file参数，则使用当前服务的MCP配置文件路径
        const configPath = request.params?.arguments?.['config-file'] || currentConfigPath;

        try {
            // 使用loadRawConfig获取原始配置文件内容，不处理环境变量
            const config = await ConfigLoader.loadRawConfig({ configPath });
            return {
                config,
                configPath,
            };
        } catch (error) {
            throw new Error(`读取MCP配置文件失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 处理show-mcp-config-schema工具调用
     * @returns MCP配置Schema
     */
    public static async handleShowMcpConfigSchema(): Promise<any> {
        try {
            // 读取内置的mcp.schema.json文件
            const schemaPath = path.join(__dirname, '../../../schemas/mcp.schema.json');
            const schemaContent = await fs.readFile(schemaPath, 'utf-8');
            const schema = JSON.parse(schemaContent);

            return {
                schema,
                schemaVersion: schema['$schema'] || 'unknown'
            };
        } catch (error) {
            throw new Error(`读取MCP配置Schema失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 处理set-mcp-config工具调用
     * @param request 工具调用请求
     * @param currentConfigPath 当前MCP配置文件路径
     * @param logger 日志记录器（用于备份失败警告）
     * @returns 设置结果
     */
    public static async handleSetMcpConfig(request: any, currentConfigPath: string, logger?: any): Promise<any> {
        // 如果未指定config-file参数，则使用当前服务的MCP配置文件路径
        const configPath = request.params?.arguments?.['config-file'] || currentConfigPath;
        const configContent = request.params?.arguments?.['config-content'];

        if (!configContent) {
            throw new Error('config-content参数是必需的');
        }

        try {
            // 验证新MCP配置格式
            let newConfig;
            try {
                newConfig = JSON.parse(configContent);
            } catch (parseError) {
                throw new Error(`MCP配置内容不是有效的JSON格式: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
            }

            // 验证MCP配置内容
            const validation = await ConfigValidator.validateConfig(newConfig);
            if (!validation.valid) {
                return {
                    success: false,
                    configPath,
                    errors: validation.errors?.map(e => `${e.path}: ${e.message}`) || []
                };
            }

            // 创建备份
            const backupPath = await this.createConfigBackup(configPath, logger);

            // 保存新MCP配置
            await ConfigLoader.saveConfig(newConfig, configPath);

            // 检查是否修改了当前使用的MCP配置
            const isCurrentConfig = configPath === currentConfigPath;
            const restartRequired = isCurrentConfig;

            return {
                success: true,
                configPath,
                backupPath,
                restartRequired,
                restartMessage: restartRequired ?
                    `MCP配置已更新。请重启mcp-all-in-one服务以应用新配置。使用以下命令重启:\n` +
                    `mcp-all-in-one ${process.argv.slice(2).join(' ')}` :
                    'MCP配置文件已更新',
                errors: []
            };

        } catch (error) {
            return {
                success: false,
                configPath,
                errors: [error instanceof Error ? error.message : String(error)],
                restartRequired: false,
                restartMessage: ''
            };
        }
    }

    /**
     * 创建MCP配置文件备份
     * @param configPath MCP配置文件路径
     * @param logger 日志记录器（用于备份失败警告）
     * @returns 备份文件路径
     */
    private static async createConfigBackup(configPath: string, logger?: any): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `${configPath}.backup.${timestamp}`;

        try {
            await fs.copyFile(configPath, backupPath);
            return backupPath;
        } catch (error) {
            // 如果备份失败，记录警告但不中止操作
            if (logger) {
                logger.warn('创建MCP配置备份失败', {
                    configPath,
                    backupPath,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return '';
        }
    }

    /**
     * 判断是否是自我配置工具
     * @param toolName 工具名称
     * @returns 是否是自我配置工具
     */
    public static isSelfConfigTool(toolName: string): boolean {
        const selfConfigToolNames = this.getSelfConfigTools().map(tool => tool.name);
        return selfConfigToolNames.includes(toolName);
    }
}