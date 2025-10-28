/**
 * 配置验证器
 * 使用JSON Schema验证MCP配置文件
 */

import Ajv from 'ajv';
import { McpConfig, McpServerConfig, McpServerType } from '../../types/config';
import { ConfigError } from '../../errors/ConfigError';
import mcpSchema from '../../../schemas/mcp.schema.json';

/**
 * 配置验证器类
 */
export class ConfigValidator {
    /**
     * AJV验证器实例
     */
    private static ajv: Ajv | null = null;

    /**
     * MCP配置JSON Schema
     */
    private static mcpSchema: any = null;

    /**
     * 初始化验证器
     */
    private static async initializeValidator(): Promise<void> {
        if (this.ajv && this.mcpSchema) {
            return;
        }

        try {
            // 创建AJV实例
            this.ajv = new Ajv({
                allErrors: true,
                verbose: true,
                strict: true,
                allowUnionTypes: true
            });

            // 添加URI格式验证器
            this.ajv.addFormat('uri', {
                type: 'string',
                validate: (data: string) => {
                    try {
                        new URL(data);
                        return true;
                    } catch {
                        return false;
                    }
                }
            });

            // 加载MCP Schema
            await this.loadMcpSchema();

            // 添加Schema到验证器
            this.ajv.addSchema(this.mcpSchema);

        } catch (error) {
            throw new ConfigError(
                `初始化配置验证器失败: ${error instanceof Error ? error.message : String(error)}`,
                'CONFIG_SCHEMA_ERROR' as any,
                undefined,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * 加载MCP Schema
     */
    private static async loadMcpSchema(): Promise<void> {
        // 使用独立的JSON schema文件中的定义
        this.mcpSchema = mcpSchema;
    }

    /**
     * 验证MCP配置
     * @param config 配置对象
     * @returns 验证结果
     */
    public static async validateConfig(config: McpConfig): Promise<{
        valid: boolean;
        errors?: Array<{
            path: string;
            message: string;
            value?: any;
        }>;
    }> {
        await this.initializeValidator();

        if (!this.ajv || !this.mcpSchema) {
            throw new ConfigError(
                '配置验证器未正确初始化',
                'CONFIG_SCHEMA_ERROR' as any
            );
        }

        try {
            const validate = this.ajv.compile(this.mcpSchema);
            const valid = validate(config);

            if (!valid && validate.errors) {
                const errors = validate.errors.map(error => ({
                    path: error.instancePath || error.schemaPath || 'root',
                    message: error.message || '未知验证错误',
                    value: error.data
                }));

                return { valid: false, errors };
            }

            return { valid: true };

        } catch (error) {
            throw new ConfigError(
                `配置验证过程中发生错误: ${error instanceof Error ? error.message : String(error)}`,
                'CONFIG_VALIDATION_ERROR' as any,
                undefined,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * 验证单个MCP服务器配置
     * @param serverName 服务器名称
     * @param serverConfig 服务器配置
     * @returns 验证结果
     */
    public static validateServerConfig(
        serverName: string,
        serverConfig: McpServerConfig
    ): {
        valid: boolean;
        errors?: Array<{
            path: string;
            message: string;
            value?: any;
        }>;
    } {
        const errors: Array<{ path: string; message: string; value?: any }> = [];

        // 验证服务器名称
        if (!/^[^\s\$\{\}]+$/.test(serverName)) {
            errors.push({
                path: `mcpServers.${serverName}`,
                message: '服务器名称不能包含空格、$或{}字符',
                value: serverName
            });
        }

        // 根据类型验证配置
        switch (serverConfig.type) {
            case McpServerType.STDIO:
                this.validateStdioConfig(`mcpServers.${serverName}`, serverConfig, errors);
                break;

            case McpServerType.HTTP:
                this.validateHttpConfig(`mcpServers.${serverName}`, serverConfig, errors);
                break;

            
            default:
                errors.push({
                    path: `mcpServers.${serverName}.type`,
                    message: `不支持的服务器类型: ${(serverConfig as any).type}`,
                    value: (serverConfig as any).type
                });
        }

        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    /**
     * 验证STDIO类型配置
     * @param path 配置路径
     * @param config STDIO配置
     * @param errors 错误列表
     */
    private static validateStdioConfig(
        path: string,
        config: any,
        errors: Array<{ path: string; message: string; value?: any }>
    ): void {
        if (!config.command || typeof config.command !== 'string') {
            errors.push({
                path: `${path}.command`,
                message: 'STDIO类型必须指定command字段',
                value: config.command
            });
        }

        if (config.args && !Array.isArray(config.args)) {
            errors.push({
                path: `${path}.args`,
                message: 'args字段必须是数组',
                value: config.args
            });
        }

        if (config.timeout !== undefined) {
            if (typeof config.timeout !== 'number' ||
                config.timeout < 1000 ||
                config.timeout > 300000) {
                errors.push({
                    path: `${path}.timeout`,
                    message: 'timeout必须是1000-300000之间的数字',
                    value: config.timeout
                });
            }
        }
    }

    /**
     * 验证HTTP类型配置
     * @param path 配置路径
     * @param config HTTP配置
     * @param errors 错误列表
     */
    private static validateHttpConfig(
        path: string,
        config: any,
        errors: Array<{ path: string; message: string; value?: any }>
    ): void {
        if (!config.url || typeof config.url !== 'string') {
            errors.push({
                path: `${path}.url`,
                message: 'HTTP类型必须指定url字段',
                value: config.url
            });
        } else {
            // 简单的URL格式验证
            try {
                new URL(config.url);
            } catch {
                errors.push({
                    path: `${path}.url`,
                    message: 'url字段格式无效',
                    value: config.url
                });
            }
        }

        if (config.retries !== undefined) {
            if (typeof config.retries !== 'number' ||
                config.retries < 0 ||
                config.retries > 10) {
                errors.push({
                    path: `${path}.retries`,
                    message: 'retries必须是0-10之间的数字',
                    value: config.retries
                });
            }
        }
    }

    
    /**
     * 验证环境变量引用
     * @param config 配置对象
     * @returns 验证结果
     */
    public static validateEnvironmentVariables(config: McpConfig): {
        valid: boolean;
        errors?: Array<{
            path: string;
            message: string;
            variable: string;
        }>;
    } {
        const errors: Array<{ path: string; message: string; variable: string }> = [];

        const checkEnvironmentVariables = (obj: any, basePath: string = ''): void => {
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = basePath ? `${basePath}.${key}` : key;

                if (typeof value === 'string') {
                    const matches = value.matchAll(/\$\{([A-Z_][A-Z0-9_]*)\}/g);
                    for (const match of matches) {
                        const varName = match[1];
                        if (!process.env[varName]) {
                            errors.push({
                                path: currentPath,
                                message: '引用的环境变量未定义',
                                variable: varName
                            });
                        }
                    }
                } else if (value && typeof value === 'object') {
                    checkEnvironmentVariables(value, currentPath);
                }
            }
        };

        checkEnvironmentVariables(config);

        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }
}