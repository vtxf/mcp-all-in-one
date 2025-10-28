/**
 * 配置处理工具类
 * 提供统一的配置默认值处理和类型判断功能
 */

import { McpServerConfig, McpServerType } from '../types/config';

/**
 * 配置处理工具类
 */
export class ConfigUtils {
    /**
     * 默认的服务器类型
     */
    private static readonly DEFAULT_SERVER_TYPE = McpServerType.STDIO;

    /**
     * 获取服务器配置的实际类型，如果未定义则返回默认类型（STDIO）
     * @param config 服务器配置
     * @returns 服务器类型
     */
    public static getServerType(config: McpServerConfig): McpServerType {
        return config.type || this.DEFAULT_SERVER_TYPE;
    }

    /**
     * 判断服务器配置是否为STDIO类型
     * @param config 服务器配置
     * @returns 是否为STDIO类型
     */
    public static isStdioServer(config: McpServerConfig): boolean {
        return this.getServerType(config) === McpServerType.STDIO;
    }

    /**
     * 判断服务器配置是否为HTTP类型
     * @param config 服务器配置
     * @returns 是否为HTTP类型
     */
    public static isHttpServer(config: McpServerConfig): boolean {
        return this.getServerType(config) === McpServerType.HTTP;
    }

    
    /**
     * 处理服务器配置，确保type字段有默认值
     * @param config 原始服务器配置
     * @returns 处理后的服务器配置
     */
    public static normalizeServerConfig(config: McpServerConfig): McpServerConfig {
        // 如果配置中没有type字段，则设置为默认的STDIO类型
        if (!config.type) {
            return {
                ...config,
                type: this.DEFAULT_SERVER_TYPE
            };
        }
        return config;
    }

    /**
     * 批量处理多个服务器配置，确保所有配置都有默认的type值
     * @param configs 服务器配置集合
     * @returns 处理后的服务器配置集合
     */
    public static normalizeServerConfigs(configs: Record<string, McpServerConfig>): Record<string, McpServerConfig> {
        const normalized: Record<string, McpServerConfig> = {};

        for (const [name, config] of Object.entries(configs)) {
            normalized[name] = this.normalizeServerConfig(config);
        }

        return normalized;
    }

    /**
     * 根据服务器类型过滤配置
     * @param configs 服务器配置集合
     * @param type 要过滤的服务器类型
     * @returns 指定类型的服务器配置集合
     */
    public static filterServersByType(configs: Record<string, McpServerConfig>, type: McpServerType): Record<string, McpServerConfig> {
        const filtered: Record<string, McpServerConfig> = {};

        for (const [name, config] of Object.entries(configs)) {
            if (this.getServerType(config) === type) {
                filtered[name] = config;
            }
        }

        return filtered;
    }

    /**
     * 获取所有STDIO类型的服务器配置
     * @param configs 服务器配置集合
     * @returns STDIO类型的服务器配置集合
     */
    public static getStdioServers(configs: Record<string, McpServerConfig>): Record<string, McpServerConfig> {
        return this.filterServersByType(configs, McpServerType.STDIO);
    }

    /**
     * 获取所有HTTP类型的服务器配置
     * @param configs 服务器配置集合
     * @returns HTTP类型的服务器配置集合
     */
    public static getHttpServers(configs: Record<string, McpServerConfig>): Record<string, McpServerConfig> {
        return this.filterServersByType(configs, McpServerType.HTTP);
    }

    }