/**
 * 配置文件加载器
 * 负责加载、解析和处理MCP配置文件
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { McpConfig, ConfigLoadOptions, DEFAULT_CONFIG } from '../../types/config';
import { ConfigError } from '../../errors/ConfigError';

/**
 * 配置文件加载器类
 */
export class ConfigLoader {
    /**
     * 默认配置文件路径
     */
    private static readonly DEFAULT_CONFIG_PATH = path.join(
        os.homedir(),
        '.mcp-all-in-one',
        'mcp.json'
    );

    /**
     * 加载MCP配置文件
     * @param options 加载选项
     * @returns 配置对象
     */
    public static async loadConfig(options: ConfigLoadOptions = {}): Promise<McpConfig> {
        const configPath = this.resolveConfigPath(options.configPath);

        try {
            // 检查配置文件是否存在
            await this.ensureConfigExists(configPath, options.autoCreate !== false);

            // 读取配置文件内容
            const configContent = await fs.readFile(configPath, 'utf-8');

            // 解析JSON配置
            const config = this.parseConfig(configContent, configPath);

            // 处理环境变量替换
            const processedConfig = this.processEnvironmentVariables(config);

            return processedConfig;

        } catch (error) {
            if (error instanceof ConfigError) {
                throw error;
            }
            throw new ConfigError(
                `加载配置文件失败: ${error instanceof Error ? error.message : String(error)}`,
                'CONFIG_FILE_NOT_FOUND' as any,
                { configPath },
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * 加载原始MCP配置文件（不处理环境变量）
     * @param options 加载选项
     * @returns 原始配置对象
     */
    public static async loadRawConfig(options: ConfigLoadOptions = {}): Promise<McpConfig> {
        const configPath = this.resolveConfigPath(options.configPath);

        try {
            // 检查配置文件是否存在
            await this.ensureConfigExists(configPath, options.autoCreate !== false);

            // 读取配置文件内容
            const configContent = await fs.readFile(configPath, 'utf-8');

            // 解析JSON配置（但不处理环境变量）
            const config = this.parseConfig(configContent, configPath);

            return config;

        } catch (error) {
            if (error instanceof ConfigError) {
                throw error;
            }
            throw new ConfigError(
                `加载原始配置文件失败: ${error instanceof Error ? error.message : String(error)}`,
                'CONFIG_FILE_NOT_FOUND' as any,
                { configPath },
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * 获取默认配置文件路径
     * @returns 默认配置文件路径
     */
    public static getDefaultConfigPath(): string {
        return this.DEFAULT_CONFIG_PATH;
    }

    /**
     * 保存配置文件
     * @param config 配置对象
     * @param configPath 配置文件路径
     */
    public static async saveConfig(config: McpConfig, configPath?: string): Promise<void> {
        const targetPath = this.resolveConfigPath(configPath);

        try {
            // 确保目录存在
            await fs.mkdir(path.dirname(targetPath), { recursive: true });

            // 格式化配置内容
            const configContent = JSON.stringify(config, null, 2);

            // 写入配置文件
            await fs.writeFile(targetPath, configContent, 'utf-8');

        } catch (error) {
            throw new ConfigError(
                `保存配置文件失败: ${error instanceof Error ? error.message : String(error)}`,
                'CONFIG_PARSE_ERROR' as any,
                { configPath: targetPath },
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * 解析配置文件路径
     * @param configPath 配置文件路径
     * @returns 解析后的绝对路径
     */
    private static resolveConfigPath(configPath?: string): string {
        if (!configPath) {
            return this.DEFAULT_CONFIG_PATH;
        }

        // 处理 ~ 路径
        if (configPath.startsWith('~')) {
            return path.join(os.homedir(), configPath.slice(1));
        }

        // 返回绝对路径
        return path.resolve(configPath);
    }

    /**
     * 确保配置文件存在
     * @param configPath 配置文件路径
     * @param autoCreate 是否自动创建
     */
    private static async ensureConfigExists(configPath: string, autoCreate: boolean): Promise<void> {
        try {
            await fs.access(configPath);
        } catch {
            if (autoCreate) {
                await this.createDefaultConfig(configPath);
            } else {
                throw ConfigError.fileNotFound(configPath);
            }
        }
    }

    /**
     * 创建默认配置文件
     * @param configPath 配置文件路径
     */
    private static async createDefaultConfig(configPath: string): Promise<void> {
        try {
            // 确保目录存在
            await fs.mkdir(path.dirname(configPath), { recursive: true });

            // 创建默认配置
            const defaultConfigContent = JSON.stringify(DEFAULT_CONFIG, null, 2);

            // 写入默认配置文件
            await fs.writeFile(configPath, defaultConfigContent, 'utf-8');

        } catch (error) {
            throw new ConfigError(
                `创建默认配置文件失败: ${error instanceof Error ? error.message : String(error)}`,
                'CONFIG_FILE_NOT_FOUND' as any,
                { configPath },
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * 解析配置文件内容
     * @param configContent 配置文件内容
     * @param configPath 配置文件路径
     * @returns 解析后的配置对象
     */
    private static parseConfig(configContent: string, configPath: string): McpConfig {
        try {
            const config = JSON.parse(configContent) as McpConfig;

            // 验证配置基本结构
            if (!config || typeof config !== 'object') {
                throw new Error('配置文件必须是一个对象');
            }

            if (!config.mcpServers || typeof config.mcpServers !== 'object') {
                throw new Error('配置文件必须包含 mcpServers 对象');
            }

            return config;

        } catch (error) {
            if (error instanceof SyntaxError) {
                throw ConfigError.parseError(configPath, error);
            }
            throw error;
        }
    }

    /**
     * 处理环境变量替换
     * @param config 配置对象
     * @returns 处理后的配置对象
     */
    private static processEnvironmentVariables(config: McpConfig): McpConfig {
        const processedConfig = JSON.parse(JSON.stringify(config));

        // 递归处理对象中的所有字符串值
        const processValue = (value: any): any => {
            if (typeof value === 'string') {
                return this.replaceEnvironmentVariables(value);
            } else if (Array.isArray(value)) {
                return value.map(processValue);
            } else if (value && typeof value === 'object') {
                const result: any = {};
                for (const [key, val] of Object.entries(value)) {
                    result[key] = processValue(val);
                }
                return result;
            }
            return value;
        };

        return processValue(processedConfig);
    }

    /**
     * 替换字符串中的环境变量
     * @param str 原始字符串
     * @returns 替换后的字符串
     */
    private static replaceEnvironmentVariables(str: string): string {
        // 匹配 ${VARIABLE_NAME} 格式的环境变量
        const envVarPattern = /\$\{([A-Z_][A-Z0-9_]*)\}/g;

        return str.replace(envVarPattern, (match, varName) => {
            const envValue = process.env[varName];
            if (envValue === undefined) {
                throw ConfigError.environmentVariableError(
                    varName,
                    '环境变量未定义'
                );
            }
            return envValue;
        });
    }

    /**
     * 验证环境变量名称格式
     * @param varName 环境变量名称
     * @returns 是否符合格式要求
     */
    public static isValidEnvironmentVariableName(varName: string): boolean {
        // 环境变量名称必须符合 /^[A-Z_][A-Z0-9_]*$/ 模式
        return /^[A-Z_][A-Z0-9_]*$/.test(varName);
    }
}