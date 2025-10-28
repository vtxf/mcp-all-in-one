# 自我配置工具测试执行指南

## 快速开始

### 1. 环境准备

```bash
# 确保在项目根目录
cd s:\vtxf\2025\projects\vtxf\mcps_2025\mcp-all-in-one

# 构建项目
npm run build

# 进入测试目录
cd openspec/specs/self-config-tools-testing
```

### 2. 手动测试执行

#### 启动STDIO服务
```bash
# 在项目根目录执行
node dist/index.js stdio -c example.mcp.json
```

#### 执行测试用例

复制以下测试请求到STDIO服务终端：

**测试1: 验证当前配置**
```json
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"mcp-all-in-one-validate-mcp-config","arguments":{}}}
```

**测试2: 显示当前配置**
```json
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"mcp-all-in-one-show-mcp-config","arguments":{}}}
```

**测试3: 显示Schema**
```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"mcp-all-in-one-show-mcp-config-schema","arguments":{}}}
```

**测试4: 创建新配置**
```json
{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"mcp-all-in-one-set-mcp-config","arguments":{"config-file":"./test-output.json","config-content":"{\"mcpServers\":{\"test\":{\"command\":\"echo\",\"args\":[\"hello\"]}}}"}}}
```

### 3. PowerShell自动化测试脚本

```powershell
# test-self-config-tools.ps1
#Requires -Version 7

# 设置变量
$ProjectRoot = "S:\vtxf\2025\projects\vtxf\mcps_2025\mcp-all-in-one"
$TestDir = "$ProjectRoot\openspec\specs\self-config-tools-testing"
$McpService = "$ProjectRoot\dist\index.js"
$ConfigFile = "$ProjectRoot\example.mcp.json"

Write-Host "=== mcp-all-in-one 自我配置工具测试 ===" -ForegroundColor Green
Write-Host "项目根目录: $ProjectRoot"
Write-Host "测试目录: $TestDir"
Write-Host ""

# 检查文件是否存在
if (-not (Test-Path $McpService)) {
    Write-Error "MCP服务文件不存在: $McpService"
    Write-Host "请先运行: npm run build" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $ConfigFile)) {
    Write-Error "配置文件不存在: $ConfigFile"
    exit 1
}

# 测试用例定义
$TestCases = @(
    @{
        Name = "验证当前配置"
        Id = 1
        Request = '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"mcp-all-in-one-validate-mcp-config","arguments":{}}}'
        ExpectedContains = @("valid", "true")
    },
    @{
        Name = "显示当前配置"
        Id = 2
        Request = '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"mcp-all-in-one-show-mcp-config","arguments":{}}}'
        ExpectedContains = @("config", "mcpServers")
    },
    @{
        Name = "显示Schema"
        Id = 3
        Request = '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"mcp-all-in-one-show-mcp-config-schema","arguments":{}}}'
        ExpectedContains = @("schema", "definitions")
    },
    @{
        Name = "创建测试配置"
        Id = 4
        Request = '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"mcp-all-in-one-set-mcp-config","arguments":{"config-file":"./openspec/specs/self-config-tools-testing/test-output.json","config-content":"{\"mcpServers\":{\"test-service\":{\"command\":\"echo\",\"args\":[\"test\"]}}}"}}'
        ExpectedContains = @("success", "true")
        CleanupFile = "$TestDir\test-output.json"
    }
)

# 执行测试
$PassedTests = 0
$TotalTests = $TestCases.Count

foreach ($test in $TestCases) {
    Write-Host "测试 $($test.Id): $($test.Name)" -ForegroundColor Cyan

    try {
        # 启动MCP服务进程
        $process = Start-Process -FilePath "node" -ArgumentList @($McpService, "stdio", "-c", $ConfigFile) -PassThru -NoNewWindow -RedirectStandardInput ".\temp-input.txt" -RedirectStandardOutput ".\temp-output.txt" -RedirectStandardError ".\temp-error.txt"

        # 等待服务启动
        Start-Sleep -Seconds 2

        # 发送请求
        $test.Request | Out-File -FilePath ".\temp-input.txt" -Encoding UTF8

        # 等待响应
        Start-Sleep -Seconds 3

        # 读取输出
        if (Test-Path ".\temp-output.txt") {
            $output = Get-Content ".\temp-output.txt" -Raw
            Write-Host "响应: $output" -ForegroundColor Gray

            # 验证响应
            $success = $true
            foreach ($expected in $test.ExpectedContains) {
                if ($output -notlike "*$expected*") {
                    Write-Host "❌ 未找到预期内容: $expected" -ForegroundColor Red
                    $success = $false
                }
            }

            if ($success) {
                Write-Host "✅ 通过" -ForegroundColor Green
                $PassedTests++
            } else {
                Write-Host "❌ 失败" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ 无响应输出" -ForegroundColor Red
        }

        # 清理进程
        if (-not $process.HasExited) {
            $process.Kill()
        }

        # 清理临时文件
        Remove-Item ".\temp-input.txt" -ErrorAction SilentlyContinue
        Remove-Item ".\temp-output.txt" -ErrorAction SilentlyContinue
        Remove-Item ".\temp-error.txt" -ErrorAction SilentlyContinue

        # 清理测试生成的文件
        if ($test.CleanupFile -and (Test-Path $test.CleanupFile)) {
            Remove-Item $test.CleanupFile -ErrorAction SilentlyContinue
        }

    } catch {
        Write-Host "❌ 测试异常: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
}

# 测试结果汇总
Write-Host "=== 测试结果汇总 ===" -ForegroundColor Yellow
Write-Host "总测试数: $TotalTests"
Write-Host "通过数: $PassedTests" -ForegroundColor $(if ($PassedTests -eq $TotalTests) { "Green" } else { "Red" })
Write-Host "失败数: $($TotalTests - $PassedTests)" -ForegroundColor $(if ($PassedTests -eq $TotalTests) { "Green" } else { "Red" })
Write-Host "成功率: $([math]::Round($PassedTests / $TotalTests * 100, 1))%" -ForegroundColor $(if ($PassedTests -eq $TotalTests) { "Green" } else { "Red" })

if ($PassedTests -eq $TotalTests) {
    Write-Host "🎉 所有测试通过！" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  部分测试失败，请检查日志" -ForegroundColor Yellow
    exit 1
}
```

### 4. 使用方法

1. **保存脚本**：将上述PowerShell脚本保存为`test-self-config-tools.ps1`

2. **执行脚本**：
```powershell
cd openspec/specs/self-config-tools-testing
pwsh -ExecutionPolicy Bypass -File test-self-config-tools.ps1
```

3. **查看结果**：脚本会自动执行所有测试并显示结果汇总

## 高级测试

### 压力测试

```bash
# 并发测试脚本
for i in {1..10}; do
    echo '{"jsonrpc":"2.0","id":'$i',"method":"tools/call","params":{"name":"mcp-all-in-one-validate-mcp-config","arguments":{}}}' | node ../../dist/index.js stdio -c ../../example.mcp.json &
done
wait
```

### 错误场景测试

```json
// 测试无效配置文件
{"jsonrpc":"2.0","id":101,"method":"tools/call","params":{"name":"mcp-all-in-one-validate-mcp-config","arguments":{"config-file":"./nonexistent.json"}}}

// 测试无效JSON
{"jsonrpc":"2.0","id":102,"method":"tools/call","params":{"name":"mcp-all-in-one-set-mcp-config","arguments":{"config-content":"{invalid json}"}}}

// 测试缺少参数
{"jsonrpc":"2.0","id":103,"method":"tools/call","params":{"name":"mcp-all-in-one-set-mcp-config","arguments":{}}}
```

## 故障排除

### 常见问题

1. **端口占用**
```bash
# 检查端口占用
netstat -ano | findstr :3000

# 杀死占用进程
taskkill /PID <PID> /F
```

2. **权限问题**
```bash
# 确保有文件读写权限
icacls . /grant Everyone:F
```

3. **环境变量问题**
```bash
# 检查必要的环境变量
echo $MCP_TEST_MODE
echo $NODE_ENV
```

### 调试模式

```bash
# 启用详细日志
MCP_LOG_LEVEL=debug node ../../dist/index.js stdio -c ../../example.mcp.json

# 使用Node.js调试器
node --inspect-brk ../../dist/index.js stdio -c ../../example.mcp.json
```

## 性能基准

### 预期性能指标

- **单次请求响应时间** < 2秒
- **并发处理能力** > 10 req/s
- **内存使用** < 200MB
- **CPU使用率** < 50%

### 性能测试命令

```bash
# 简单性能测试
time echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"mcp-all-in-one-show-mcp-config","arguments":{}}}' | node ../../dist/index.js stdio -c ../../example.mcp.json

# 批量性能测试
for i in {1..100}; do
    echo '{"jsonrpc":"2.0","id":'$i',"method":"tools/call","params":{"name":"mcp-all-in-one-validate-mcp-config","arguments":{}}}' | node ../../dist/index.js stdio -c ../../example.mcp.json
done
```

这个测试执行指南提供了完整的手动和自动化测试方案，确保能够有效验证自我配置工具的功能。