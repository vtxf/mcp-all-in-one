/**
 * MCP客户端工厂
 * 根据服务配置创建对应的MCP客户端实例
 */

import { McpServerConfig, McpServerType, StdioServerConfig, HttpServerConfig } from '../types/config';
import { BaseMcpClient } from './base/BaseMcpClient';
import { StdioMcpClient } from './stdio/StdioMcpClient';
import { HttpMcpClient } from './http/HttpMcpClient';
import { Logger } from '../core/logger/Logger';

/**
 * MCP客户端工厂类
 */
export class McpClientFactory {
    private static logger = new Logger('McpClientFactory');

    /**
     * 根据服务配置创建对应的MCP客户端
     * @param serviceName 服务名称
     * @param serviceConfig 服务配置
     * @returns MCP客户端实例
     */
    public static createClient(serviceName: string, serviceConfig: McpServerConfig): BaseMcpClient {
        const serverType = this.getServerType(serviceConfig);

        this.logger.debug(`创建MCP客户端: ${serviceName}, 类型: ${serverType}`);

        switch (serverType) {
            case McpServerType.STDIO:
                return new StdioMcpClient(serviceName, serviceConfig as StdioServerConfig);

            case McpServerType.HTTP:
                return new HttpMcpClient(serviceName, serviceConfig as HttpServerConfig);

            default:
                throw new Error(`不支持的服务器类型: ${serverType}`);
        }
    }

    /**
     * 获取服务器类型
     * @param config 服务器配置
     * @returns 服务器类型
     */
    private static getServerType(config: McpServerConfig): McpServerType {
        return config.type || McpServerType.STDIO;
    }

    /**
     * 检查是否为支持的服务器类型
     * @param config 服务器配置
     * @returns 是否支持
     */
    public static isSupportedServerType(config: McpServerConfig): boolean {
        const serverType = this.getServerType(config);
        return Object.values(McpServerType).includes(serverType);
    }

    /**
     * 获取所有支持的服务器类型
     * @returns 支持的服务器类型列表
     */
    public static getSupportedServerTypes(): McpServerType[] {
        return Object.values(McpServerType);
    }

    /**
     * 验证服务器配置
     * @param config 服务器配置
     * @returns 验证结果
     */
    public static validateServerConfig(config: McpServerConfig): {
        valid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];
        const serverType = this.getServerType(config);

        // 检查服务器类型是否支持
        if (!this.isSupportedServerType(config)) {
            errors.push(`不支持的服务器类型: ${serverType}`);
        }

        // 根据类型检查特定配置
        switch (serverType) {
            case McpServerType.STDIO:
                const stdioConfig = config as StdioServerConfig;
                if (!stdioConfig.command) {
                    errors.push('STDIO类型服务器必须提供command字段');
                }
                break;

            case McpServerType.HTTP:
                const httpConfig = config as HttpServerConfig;
                if (!httpConfig.url) {
                    errors.push('HTTP类型服务器必须提供url字段');
                } else if (!this.isValidUrl(httpConfig.url)) {
                    errors.push('HTTP类型服务器的url格式无效');
                }
                break;
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 验证URL格式
     * @param url URL字符串
     * @returns 是否为有效URL
     */
    private static isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}