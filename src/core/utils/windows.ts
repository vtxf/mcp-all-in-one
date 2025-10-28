/**
 * Windows平台支持工具
 * 处理Windows平台的特殊需求
 */

import * as path from 'path';

/**
 * Windows平台工具类
 */
export class WindowsSupport {
    /**
     * 检测当前是否为Windows平台
     * @returns 是否为Windows平台
     */
    public static isWindows(): boolean {
        return process.platform === 'win32';
    }

    /**
     * 判断命令是否需要Shell前缀
     * @param command 命令字符串
     * @returns 是否需要添加Shell前缀
     */
    public static needsShellPrefix(command: string): boolean {
        // 非Windows平台不需要
        if (!this.isWindows()) {
            return false;
        }

        // 绝对路径不需要
        if (path.isAbsolute(command)) {
            return false;
        }

        // 相对路径不需要
        if (command.startsWith('./') || command.startsWith('../')) {
            return false;
        }

        // 包含路径分隔符的不需要
        if (command.includes('/') || command.includes('\\')) {
            return false;
        }

        // Windows内置命令不需要
        const windowsInternalCommands = [
            'ping', 'ipconfig', 'dir', 'copy', 'del', 'move', 'md', 'rd',
            'type', 'ver', 'vol', 'date', 'time', 'cls', 'exit', 'echo',
            'cd', 'chdir', 'set', 'setlocal', 'endlocal', 'call', 'goto',
            'for', 'if', 'pause', 'rem', 'start', 'assoc', 'break',
            'cacls', 'fc', 'find', 'findstr', 'mode', 'more', 'sort',
            'title', 'tree', 'xcopy'
        ];

        if (windowsInternalCommands.includes(command.toLowerCase())) {
            return false;
        }

        // 其他情况需要添加Shell前缀
        return true;
    }

    /**
     * 为Windows平台包装命令
     * @param command 原始命令
     * @param args 命令参数
     * @returns 包装后的命令和参数
     */
    public static wrapCommandForWindows(
        command: string,
        args: string[]
    ): { command: string; args: string[] } {
        // 非Windows平台不处理
        if (!this.isWindows() || !this.needsShellPrefix(command)) {
            return { command, args };
        }

        // Windows平台自动添加cmd /c前缀
        return {
            command: 'cmd',
            args: ['/c', command, ...args]
        };
    }

    /**
     * 清理Windows路径中的引号
     * @param filePath 文件路径
     * @returns 清理后的路径
     */
    public static cleanPath(filePath: string): string {
        if (!this.isWindows()) {
            return filePath;
        }

        // 移除多余的引号
        return filePath.replace(/^"+|"+$/g, '');
    }

    /**
     * 转义Windows命令行参数中的特殊字符
     * @param arg 命令行参数
     * @returns 转义后的参数
     */
    public static escapeArg(arg: string): string {
        if (!this.isWindows()) {
            return arg;
        }

        // 转义Windows cmd特殊字符
        return arg.replace(/["%&|<>^]/g, '^$&');
    }

    /**
     * 批量转义命令行参数
     * @param args 命令行参数数组
     * @returns 转义后的参数数组
     */
    public static escapeArgs(args: string[]): string[] {
        return args.map(arg => this.escapeArg(arg));
    }

    /**
     * 安全地包装Windows命令（包含参数转义）
     * @param command 原始命令
     * @param args 命令参数
     * @returns 包装后的命令和参数
     */
    public static wrapCommandForWindowsSecure(
        command: string,
        args: string[]
    ): { command: string; args: string[] } {
        if (!this.isWindows() || !this.needsShellPrefix(command)) {
            return { command, args: this.escapeArgs(args) };
        }

        return {
            command: 'cmd',
            args: ['/c', command, ...this.escapeArgs(args)]
        };
    }

    /**
     * 验证Windows环境变量名称
     * @param varName 环境变量名称
     * @returns 是否符合Windows环境变量命名规范
     */
    public static isValidWindowsEnvironmentVariable(varName: string): boolean {
        // Windows环境变量名称规则：不能包含 !, $, ', (, ), ,, 空格
        const invalidChars = /[!'(),\s]/;
        return !invalidChars.test(varName) && varName.length > 0;
    }

    /**
     * 获取Windows平台的默认Shell路径
     * @returns Shell路径
     */
    public static getDefaultShellPath(): string {
        if (!this.isWindows()) {
            return '/bin/sh';
        }

        // 优先使用cmd.exe
        const cmdPath = process.env.COMSPEC || 'C:\\Windows\\System32\\cmd.exe';
        return cmdPath;
    }

    /**
     * 检测是否在WSL（Windows Subsystem for Linux）环境中
     * @returns 是否在WSL环境中
     */
    public static isWSL(): boolean {
        if (!this.isWindows()) {
            return false;
        }

        // 检查WSL环境变量
        return (
            process.env.WSL_DISTRO_NAME !== undefined ||
            process.env.WSLENV !== undefined ||
            (process.platform === 'linux' && (process.env.PATH?.includes('/mnt/c/') || false))
        );
    }

    /**
     * 处理Windows平台的路径分隔符
     * @param filePath 文件路径
     * @returns 标准化后的路径
     */
    public static normalizePath(filePath: string): string {
        if (!this.isWindows()) {
            return filePath;
        }

        // 统一使用反斜杠作为路径分隔符
        return filePath.replace(/\//g, '\\');
    }

    /**
     * 将Windows路径转换为POSIX风格路径（用于跨平台兼容）
     * @param windowsPath Windows路径
     * @returns POSIX风格路径
     */
    public static windowsToPosixPath(windowsPath: string): string {
        if (!this.isWindows()) {
            return windowsPath;
        }

        // 转换驱动器路径
        let posixPath = windowsPath.replace(/^([A-Z]):\\/i, '/$1/');

        // 转换路径分隔符
        posixPath = posixPath.replace(/\\/g, '/');

        return posixPath;
    }
}