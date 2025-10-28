/**
 * 版本工具函数
 * 用于从package.json中自动获取版本号
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * 获取项目版本号
 * @returns 版本号字符串
 */
export function getVersion(): string {
    try {
        // 使用项目根目录下的package.json
        const pkgPath = path.join(__dirname, '../../package.json');
        
        // 读取package.json文件
        const packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        
        // 返回版本号
        return packageJson.version || '1.0.0';
    } catch (error) {
        // 如果读取失败，返回默认版本号
        return '1.0.0';
    }
}