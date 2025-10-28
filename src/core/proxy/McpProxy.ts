/**
 * MCP代理主类
 * 负责管理多个MCP服务的聚合和请求路由
 */

import { McpConfig, McpServerConfig, McpServerType } from '../../types/config';
import { ServiceStatus, McpService } from '../../types/service';
import { Logger, LogOutputTarget } from '../logger/Logger';
import { ConfigError } from '../../errors/ConfigError';
import { WindowsSupport } from '../utils/windows';
import { ConfigUtils } from '../../utils/ConfigUtils';

/**
 * MCP代理主类
 */
export class McpProxy {
    private config: McpConfig;
    private services: Map<string, McpService>;
    private logger: Logger;

    /**
     * 创建MCP代理实例
     * @param config MCP配置
     * @param silentMode 是否启用静默模式
     * @param outputTarget 日志输出目标
     */
    constructor(config: McpConfig, silentMode: boolean = false, outputTarget: LogOutputTarget = LogOutputTarget.STDOUT) {
        this.config = config;
        this.services = new Map();
        this.logger = new Logger('McpProxy', undefined, silentMode, outputTarget);
        this.initializeServices();
    }

    /**
     * 初始化所有MCP服务
     */
    private initializeServices(): void {
        this.logger.info('初始化MCP服务', { serviceCount: Object.keys(this.config.mcpServers).length });

        for (const [serviceName, serverConfig] of Object.entries(this.config.mcpServers)) {
            try {
                const service = this.createService(serviceName, serverConfig);
                this.services.set(serviceName, service);
                this.logger.debug('服务初始化成功', { serviceName, type: serverConfig.type });
            } catch (error) {
                this.logger.error('服务初始化失败', { serviceName, error: error instanceof Error ? error.message : String(error) });
            }
        }

        this.logger.info('MCP服务初始化完成', { successCount: this.services.size });
    }

    /**
     * 创建MCP服务实例
     * @param serviceName 服务名称
     * @param serverConfig 服务器配置
     * @returns MCP服务实例
     */
    private createService(serviceName: string, serverConfig: McpServerConfig): McpService {
        // 验证服务器配置
        this.validateServerConfig(serviceName, serverConfig);

        // 使用ConfigUtils获取服务器类型，确保有默认值
        const serverType = ConfigUtils.getServerType(serverConfig);

        // 处理Windows平台的命令包装
        if (serverType === McpServerType.STDIO) {
            serverConfig = this.processStdioConfigForWindows(serverConfig);
        }

        const service: McpService = {
            name: serviceName,
            config: serverConfig,
            status: ServiceStatus.STOPPED,
            restartCount: 0,
            enabled: true
        };

        return service;
    }

    /**
     * 验证服务器配置
     * @param serviceName 服务名称
     * @param config 服务器配置
     */
    private validateServerConfig(serviceName: string, config: McpServerConfig): void {
        // 验证服务器名称
        if (!serviceName || typeof serviceName !== 'string') {
            throw new ConfigError(`无效的服务名称: ${serviceName}`);
        }

        // 验证服务器配置
        if (!config || typeof config !== 'object') {
            throw new ConfigError(`服务 ${serviceName} 的配置无效`);
        }

        // 使用ConfigUtils获取服务器类型，确保有默认值
        const serverType = ConfigUtils.getServerType(config);

        // 根据类型验证配置
        switch (serverType) {
            case McpServerType.STDIO:
                if (!('command' in config) || !config.command || typeof config.command !== 'string') {
                    throw new ConfigError(`STDIO服务 ${serviceName} 必须指定command字段`);
                }
                break;

            case McpServerType.HTTP:
                if (!('url' in config) || !config.url || typeof config.url !== 'string') {
                    throw new ConfigError(`${serverType.toUpperCase()}服务 ${serviceName} 必须指定url字段`);
                }
                break;

            default:
                throw new ConfigError(`服务 ${serviceName} 的类型无效: ${serverType}`);
        }
    }

    /**
     * 为Windows平台处理STDIO配置
     * @param config STDIO配置
     * @returns 处理后的配置
     */
    private processStdioConfigForWindows(config: any): any {
        if (!ConfigUtils.isStdioServer(config)) {
            return config;
        }

        const { command, args } = WindowsSupport.wrapCommandForWindows(config.command, config.args || []);

        return {
            ...config,
            command,
            args
        };
    }

    /**
     * 启动所有服务
     */
    public async startAllServices(): Promise<void> {
        this.logger.info('启动所有MCP服务');

        const startPromises = Array.from(this.services.entries()).map(async ([serviceName, service]) => {
            try {
                await this.startService(serviceName);
            } catch (error) {
                this.logger.error('服务启动失败', { serviceName, error: error instanceof Error ? error.message : String(error) });
            }
        });

        await Promise.allSettled(startPromises);

        const runningCount = this.getServicesByStatus(ServiceStatus.RUNNING).length;
        this.logger.info('服务启动完成', { totalServices: this.services.size, runningServices: runningCount });
    }

    /**
     * 启动单个服务
     * @param serviceName 服务名称
     */
    public async startService(serviceName: string): Promise<void> {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new ConfigError(`服务未找到: ${serviceName}`);
        }

        if (service.status === ServiceStatus.RUNNING) {
            this.logger.warn('服务已在运行', { serviceName });
            return;
        }

        this.logger.info('启动服务', { serviceName, type: service.config.type });

        try {
            service.status = ServiceStatus.STARTING;

            // 这里应该实现实际的服务启动逻辑
            // 为了演示，我们只是模拟启动过程
            await this.simulateServiceStart(service);

            service.status = ServiceStatus.RUNNING;
            service.startedAt = new Date();

            this.logger.info('服务启动成功', { serviceName });

        } catch (error) {
            service.status = ServiceStatus.ERROR;
            service.lastError = error instanceof Error ? error : new Error(String(error));
            throw error;
        }
    }

    /**
     * 模拟服务启动过程
     * @param service 服务实例
     */
    private async simulateServiceStart(service: McpService): Promise<void> {
        // 模拟启动延迟
        await new Promise(resolve => setTimeout(resolve, 100));

        // 模拟可能的启动失败（10%概率）
        if (Math.random() < 0.1) {
            throw new Error(`模拟启动失败: ${service.name}`);
        }
    }

    /**
     * 停止所有服务
     */
    public async stopAllServices(): Promise<void> {
        this.logger.info('停止所有MCP服务');

        const stopPromises = Array.from(this.services.keys()).map(async serviceName => {
            try {
                await this.stopService(serviceName);
            } catch (error) {
                this.logger.error('服务停止失败', { serviceName, error: error instanceof Error ? error.message : String(error) });
            }
        });

        await Promise.allSettled(stopPromises);

        this.logger.info('所有服务已停止');
    }

    /**
     * 停止单个服务
     * @param serviceName 服务名称
     */
    public async stopService(serviceName: string): Promise<void> {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new ConfigError(`服务未找到: ${serviceName}`);
        }

        if (service.status !== ServiceStatus.RUNNING) {
            this.logger.warn('服务未在运行', { serviceName, status: service.status });
            return;
        }

        this.logger.info('停止服务', { serviceName });

        try {
            service.status = ServiceStatus.STOPPING;

            // 这里应该实现实际的服务停止逻辑
            // 为了演示，我们只是模拟停止过程
            await this.simulateServiceStop(service);

            service.status = ServiceStatus.STOPPED;
            service.startedAt = undefined;

            this.logger.info('服务停止成功', { serviceName });

        } catch (error) {
            service.status = ServiceStatus.ERROR;
            service.lastError = error instanceof Error ? error : new Error(String(error));
            throw error;
        }
    }

    /**
     * 模拟服务停止过程
     * @param service 服务实例
     */
    private async simulateServiceStop(service: McpService): Promise<void> {
        // 模拟停止延迟
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    /**
     * 根据状态获取服务列表
     * @param status 服务状态
     * @returns 服务列表
     */
    public getServicesByStatus(status: ServiceStatus): McpService[] {
        return Array.from(this.services.values()).filter(service => service.status === status);
    }

    /**
     * 获取所有服务
     * @returns 所有服务
     */
    public getAllServices(): McpService[] {
        return Array.from(this.services.values());
    }

    /**
     * 获取服务统计信息
     * @returns 统计信息
     */
    public getServiceStats(): {
        total: number;
        running: number;
        stopped: number;
        error: number;
        starting: number;
        stopping: number;
    } {
        const services = this.getAllServices();

        return {
            total: services.length,
            running: services.filter(s => s.status === ServiceStatus.RUNNING).length,
            stopped: services.filter(s => s.status === ServiceStatus.STOPPED).length,
            error: services.filter(s => s.status === ServiceStatus.ERROR).length,
            starting: services.filter(s => s.status === ServiceStatus.STARTING).length,
            stopping: services.filter(s => s.status === ServiceStatus.STOPPING).length
        };
    }

    /**
     * 获取配置
     * @returns MCP配置
     */
    public getConfig(): McpConfig {
        return this.config;
    }

    /**
     * 重新加载配置
     * @param newConfig 新配置
     */
    public async reloadConfig(newConfig: McpConfig): Promise<void> {
        this.logger.info('重新加载配置');

        // 停止所有服务
        await this.stopAllServices();

        // 清空服务列表
        this.services.clear();

        // 更新配置
        this.config = newConfig;

        // 重新初始化服务
        this.initializeServices();

        // 启动所有服务
        await this.startAllServices();

        this.logger.info('配置重新加载完成');
    }
}