/**
 * 内置资源提供器
 * 提供mcp-all-in-one内置的资源，如常用MCP服务列表等
 */

import { Logger } from '../../core/logger/Logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 内置资源提供器类
 */
export class BuiltinResourceProvider {
    private logger: Logger;
    private resourcesDir: string;

    /**
     * 创建内置资源提供器实例
     */
    constructor() {
        this.logger = new Logger('BuiltinResourceProvider');
        // 获取resources目录的绝对路径
        this.resourcesDir = path.resolve(process.cwd(), 'resources');
    }

    /**
     * 获取所有内置资源列表
     */
    async listResources(): Promise<Array<{
        uri: string;
        name: string;
        description?: string;
        mimeType?: string;
    }>> {
        const resources: Array<{
            uri: string;
            name: string;
            description?: string;
            mimeType?: string;
        }> = [];

        try {
            // 检查resources目录是否存在
            if (!fs.existsSync(this.resourcesDir)) {
                this.logger.warn('resources目录不存在', { dir: this.resourcesDir });
                return resources;
            }

            // 读取common_mcp_list.md文件
            const commonMcpListPath = path.join(this.resourcesDir, 'common_mcp_list.md');
            if (fs.existsSync(commonMcpListPath)) {
                resources.push({
                    uri: 'builtin://common_mcp_list',
                    name: '常用MCP服务列表',
                    description: 'mcp-all-in-one内置的常用MCP服务列表，包含各类MCP服务的功能、适用场景和配置示例',
                    mimeType: 'text/markdown'
                });
            }

            this.logger.info('获取内置资源列表', { count: resources.length });
            return resources;
        } catch (error) {
            this.logger.error('获取内置资源列表失败', {
                error: error instanceof Error ? error.message : String(error)
            });
            return resources;
        }
    }

    /**
     * 读取指定资源内容
     */
    async readResource(uri: string): Promise<{
        contents: Array<{
            uri: string;
            mimeType?: string;
            text?: string;
            blob?: string;
        }>;
    }> {
        try {
            // 处理内置资源URI
            if (uri.startsWith('builtin://')) {
                const resourceName = uri.replace('builtin://', '');
                
                if (resourceName === 'common_mcp_list') {
                    const commonMcpListPath = path.join(this.resourcesDir, 'common_mcp_list.md');
                    
                    if (fs.existsSync(commonMcpListPath)) {
                        const content = fs.readFileSync(commonMcpListPath, 'utf-8');
                        
                        return {
                            contents: [
                                {
                                    uri,
                                    mimeType: 'text/markdown',
                                    text: content
                                }
                            ]
                        };
                    } else {
                        throw new Error(`资源文件不存在: ${commonMcpListPath}`);
                    }
                } else {
                    throw new Error(`未知的内置资源: ${resourceName}`);
                }
            } else {
                throw new Error(`不支持的资源URI格式: ${uri}`);
            }
        } catch (error) {
            this.logger.error('读取内置资源失败', {
                uri,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * 检查资源是否存在
     */
    async resourceExists(uri: string): Promise<boolean> {
        try {
            if (uri.startsWith('builtin://')) {
                const resourceName = uri.replace('builtin://', '');
                
                if (resourceName === 'common_mcp_list') {
                    const commonMcpListPath = path.join(this.resourcesDir, 'common_mcp_list.md');
                    return fs.existsSync(commonMcpListPath);
                }
            }
            
            return false;
        } catch (error) {
            this.logger.error('检查资源存在性失败', {
                uri,
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }
}