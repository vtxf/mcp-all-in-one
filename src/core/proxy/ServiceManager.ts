/**
 * 服务管理器
 * 管理MCP服务的生命周期和状态
 */

import { McpService, ServiceStatus, ServiceEvent, ServiceEventType } from '../../types/service';
import { Logger } from '../logger/Logger';
import { EventEmitter } from 'events';

/**
 * 服务管理器类
 */
export class ServiceManager extends EventEmitter {
    private services: Map<string, McpService>;
    private logger: Logger;
    private healthCheckInterval: NodeJS.Timeout | null;

    /**
     * 创建服务管理器实例
     */
    constructor() {
        super();
        this.services = new Map();
        this.logger = new Logger('ServiceManager');
        this.healthCheckInterval = null;
    }

    /**
     * 添加服务
     * @param service MCP服务
     */
    public addService(service: McpService): void {
        this.services.set(service.name, service);
        this.logger.info('服务已添加', { serviceName: service.name, type: service.config.type });

        this.emitServiceEvent(ServiceEventType.SERVICE_ADDED, service.name);
    }

    /**
     * 移除服务
     * @param serviceName 服务名称
     */
    public removeService(serviceName: string): boolean {
        const service = this.services.get(serviceName);
        if (!service) {
            return false;
        }

        // 如果服务正在运行，先停止它
        if (service.status === ServiceStatus.RUNNING) {
            this.logger.warn('移除正在运行的服务', { serviceName });
        }

        this.services.delete(serviceName);
        this.logger.info('服务已移除', { serviceName });

        this.emitServiceEvent(ServiceEventType.SERVICE_REMOVED, serviceName);
        return true;
    }

    /**
     * 获取服务
     * @param serviceName 服务名称
     * @returns 服务实例或undefined
     */
    public getService(serviceName: string): McpService | undefined {
        return this.services.get(serviceName);
    }

    /**
     * 获取所有服务
     * @returns 所有服务
     */
    public getAllServices(): McpService[] {
        return Array.from(this.services.values());
    }

    /**
     * 根据状态获取服务
     * @param status 服务状态
     * @returns 服务列表
     */
    public getServicesByStatus(status: ServiceStatus): McpService[] {
        return this.getAllServices().filter(service => service.status === status);
    }

    /**
     * 更新服务状态
     * @param serviceName 服务名称
     * @param status 新状态
     * @param error 错误信息（可选）
     */
    public updateServiceStatus(
        serviceName: string,
        status: ServiceStatus,
        error?: Error
    ): void {
        const service = this.services.get(serviceName);
        if (!service) {
            this.logger.warn('尝试更新不存在的服务状态', { serviceName, status });
            return;
        }

        const oldStatus = service.status;
        service.status = status;

        if (error) {
            service.lastError = error;
        }

        // 根据状态更新时间戳
        if (status === ServiceStatus.RUNNING) {
            service.startedAt = new Date();
        } else if (status === ServiceStatus.STOPPED) {
            service.startedAt = undefined;
        }

        this.logger.debug('服务状态已更新', {
            serviceName,
            oldStatus,
            newStatus: status,
            error: error?.message
        });

        // 触发状态变更事件
        this.emitServiceEvent(this.getStatusEventType(status), serviceName, { error });
    }

    /**
     * 启动健康检查
     * @param interval 检查间隔（毫秒）
     */
    public startHealthCheck(interval: number = 30000): void {
        if (this.healthCheckInterval) {
            this.logger.warn('健康检查已在运行');
            return;
        }

        this.logger.info('启动服务健康检查', { interval });
        this.healthCheckInterval = setInterval(() => {
            this.performHealthCheck();
        }, interval);
    }

    /**
     * 停止健康检查
     */
    public stopHealthCheck(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
            this.logger.info('服务健康检查已停止');
        }
    }

    /**
     * 执行健康检查
     */
    private async performHealthCheck(): Promise<void> {
        const runningServices = this.getServicesByStatus(ServiceStatus.RUNNING);

        for (const service of runningServices) {
            try {
                const isHealthy = await this.checkServiceHealth(service);
                if (!isHealthy) {
                    this.logger.warn('服务健康检查失败', { serviceName: service.name });
                    this.emitServiceEvent(ServiceEventType.HEALTH_CHECK_FAILED, service.name);
                } else {
                    this.emitServiceEvent(ServiceEventType.HEALTH_CHECK_PASSED, service.name);
                }
            } catch (error) {
                this.logger.error('健康检查过程中发生错误', {
                    serviceName: service.name,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
    }

    /**
     * 检查单个服务的健康状态
     * @param service 服务实例
     * @returns 是否健康
     */
    private async checkServiceHealth(service: McpService): Promise<boolean> {
        // 这里应该实现实际的健康检查逻辑
        // 为了演示，我们只是模拟健康检查
        if (service.startedAt) {
            const uptime = Date.now() - service.startedAt.getTime();
            // 模拟随机失败（5%概率）
            if (Math.random() < 0.05) {
                return false;
            }
            return uptime > 0; // 只要启动时间大于0就认为健康
        }
        return false;
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
        totalRestarts: number;
        averageUptime: number;
    } {
        const services = this.getAllServices();
        const now = Date.now();

        const runningServices = services.filter(s => s.status === ServiceStatus.RUNNING);
        const totalUptime = runningServices.reduce((sum, service) => {
            if (service.startedAt) {
                return sum + (now - service.startedAt.getTime());
            }
            return sum;
        }, 0);

        return {
            total: services.length,
            running: runningServices.length,
            stopped: services.filter(s => s.status === ServiceStatus.STOPPED).length,
            error: services.filter(s => s.status === ServiceStatus.ERROR).length,
            starting: services.filter(s => s.status === ServiceStatus.STARTING).length,
            stopping: services.filter(s => s.status === ServiceStatus.STOPPING).length,
            totalRestarts: services.reduce((sum, s) => sum + s.restartCount, 0),
            averageUptime: runningServices.length > 0 ? totalUptime / runningServices.length : 0
        };
    }

    /**
     * 重启服务
     * @param serviceName 服务名称
     */
    public async restartService(serviceName: string): Promise<void> {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`服务未找到: ${serviceName}`);
        }

        this.logger.info('重启服务', { serviceName });

        service.restartCount++;
        this.emitServiceEvent(ServiceEventType.SERVICE_RESTARTED, serviceName, {
            restartCount: service.restartCount
        });
    }

    /**
     * 启用服务
     * @param serviceName 服务名称
     */
    public enableService(serviceName: string): void {
        const service = this.services.get(serviceName);
        if (service && !service.enabled) {
            service.enabled = true;
            this.logger.info('服务已启用', { serviceName });
        }
    }

    /**
     * 禁用服务
     * @param serviceName 服务名称
     */
    public disableService(serviceName: string): void {
        const service = this.services.get(serviceName);
        if (service && service.enabled) {
            service.enabled = false;
            this.logger.info('服务已禁用', { serviceName });
        }
    }

    /**
     * 获取状态对应的事件类型
     * @param status 服务状态
     * @returns 事件类型
     */
    private getStatusEventType(status: ServiceStatus): ServiceEventType {
        switch (status) {
            case ServiceStatus.STARTING:
            case ServiceStatus.RUNNING:
                return ServiceEventType.SERVICE_STARTED;
            case ServiceStatus.STOPPING:
            case ServiceStatus.STOPPED:
                return ServiceEventType.SERVICE_STOPPED;
            case ServiceStatus.ERROR:
                return ServiceEventType.SERVICE_ERROR;
            default:
                return ServiceEventType.SERVICE_STARTED;
        }
    }

    /**
     * 发射服务事件
     * @param eventType 事件类型
     * @param serviceName 服务名称
     * @param data 事件数据
     */
    private emitServiceEvent(
        eventType: ServiceEventType,
        serviceName: string,
        data?: any
    ): void {
        const event: ServiceEvent = {
            type: eventType,
            serviceName,
            timestamp: new Date(),
            data
        };

        this.emit('serviceEvent', event);
        this.emit(eventType, event);

        this.logger.debug('服务事件已发射', {
            eventType,
            serviceName,
            data: data ? JSON.stringify(data) : undefined
        });
    }

    /**
     * 清理资源
     */
    public dispose(): void {
        this.stopHealthCheck();
        this.removeAllListeners();
        this.services.clear();
        this.logger.info('服务管理器已清理');
    }
}