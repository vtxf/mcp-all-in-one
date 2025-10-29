---
name: Release Version
description: 自动更新版本号、基于git日志生成修订日志、安装依赖、构建、打标签并发布到npm
category: Release
tags: [release, version, npm, publish, changelog, git]
---

**功能说明**
用于自动完成项目的版本发布流程，核心功能是基于 git 提交记录自动生成 CHANGELOG.md：

1. 更新package.json中的版本号
2. **自动分析git提交记录并生成CHANGELOG.md条目**
3. 安装依赖（npm install）
4. 构建项目（npm run build）
5. 创建git tag并push到远程仓库
6. 发布到npm

**核心特性**
- 🚀 **智能CHANGELOG生成**：自动分析git提交记录，按类型分类整理变更
- 📝 **规范化格式**：遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 标准
- 🔄 **自动化流程**：减少手动操作，提高发布效率和准确性

**使用方法**
```
/release [版本号]
```

**参数说明**
- `[版本号]`: 新的版本号，格式遵循语义化版本规范（如 1.2.4、2.0.0等）
- 如果不提供版本号，系统会显示当前版本号并建议一个新版本号供确认

**执行步骤**
1. 如果未提供版本号：
   - 读取package.json获取当前版本号
   - 根据当前版本号建议下一个版本号（自动递增补丁版本号）
   - 询问用户是否使用建议的版本号或输入自定义版本号
2. 验证版本号格式
3. 检查git工作区是否干净
4. 更新package.json中的版本号
5. 自动生成CHANGELOG.md内容：
   - 分析自上次发布以来的git提交记录
   - 按照提交类型（feat、fix、refactor、docs、chore等）分类整理
   - 生成标准的变更记录格式
   - 自动插入到CHANGELOG.md文件顶部
6. 运行npm install
7. 运行npm run build
8. 创建git tag（格式：v<版本号>）
9. 推送git commits和tags到远程仓库
10. 发布到npm

**注意事项**
- 执行前请确保已配置好npm发布权限
- 执行前请确保git工作区没有未提交的更改
- CHANGELOG.md内容会根据git提交记录自动生成，遵循以下分类规则：
  - `feat`: 新功能
  - `fix`: 修复
  - `refactor`: 重构
  - `docs`: 文档更新
  - `chore`: 构建工具、依赖更新等
  - `perf`: 性能优化
  - `test`: 测试相关
  - `style`: 代码格式调整
- 发布成功后请在GitHub上创建Release

**错误处理规则**
- 如果发布过程中遇到任何问题，立即停止操作
- 常见错误情况包括：
  - CHANGELOG.md 生成失败（git问题或文件权限问题）
  - npm install 失败（依赖安装问题）
  - npm run build 失败（构建错误）
  - 版本号重复或格式错误
  - git commit 失败（合并冲突或其他git错误）
  - git push 失败（网络问题或权限问题）
  - npm publish 失败（认证问题或包名冲突）
- 遇到错误时，系统会：
  1. 立即停止后续操作
  2. 显示具体的错误信息和错误位置
  3. 提供可能的解决方案建议
  4. 等待用户决定下一步操作
- 用户可以选择：
  - 修复问题后重新执行命令
  - 手动完成剩余步骤
  - 回滚已完成的操作（包括版本号和CHANGELOG.md的更改）

**示例**
```
/release 1.2.4
/release
```

**CHANGELOG自动生成规则**
系统会分析自上次版本标签以来的所有提交，按照以下格式生成变更记录：

1. **提交分类**：根据提交消息前缀自动分类
   - `feat`: 新增功能
   - `fix`: 问题修复
   - `refactor`: 代码重构
   - `docs`: 文档更新
   - `chore`: 版本更新、依赖管理等
   - `perf`: 性能优化
   - `test`: 测试相关
   - `style`: 代码格式调整（不影响功能）

2. **生成格式**：
```markdown
## [1.2.7] - 2025-10-29

### 新增
- feat(component): 添加新功能A
- feat(api): 实现新接口B

### 修复
- fix(handler): 修复XX问题

### 重构
- refactor(config): 重构配置处理逻辑

### 文档
- docs(readme): 更新使用说明

### 发布
- chore: bump version to 1.2.7
```

3. **日期自动添加**：使用当前日期作为版本发布日期

4. **技术实现细节**：
   - 使用 `git tag --list "v*"` 查找所有版本标签
   - 找到最新版本标签，使用 `git log <latest_tag>..HEAD --pretty=format:"%h %s"` 获取未发布的提交
   - 解析每条提交消息，提取类型和内容
   - 按类型分组并生成对应的 markdown 内容
   - 读取现有 CHANGELOG.md，在文件顶部插入新版本条目

5. **特殊情况处理**：
   - 如果没有找到之前的版本标签，将分析所有提交记录
   - 自动跳过版本发布相关的提交（如 `chore(release):`）
   - 对于没有明确类型前缀的提交，归类到"其他"分类
   - 保留原有的 CHANGELOG.md 格式和结构

**交互示例**
```
/release
> 当前版本号: 1.2.6
> 建议版本号: 1.2.7
> 是否使用建议版本号? (y/n): y
> 分析git提交记录...
> 找到5个提交需要记录：
>   - feat(sse): 添加SSE客户端支持
>   - fix(config): 修复配置验证问题
>   - docs(readme): 更新文档
>   - chore: bump version to 1.2.6
>   - chore(release): 发布版本 1.2.6
> 正在生成CHANGELOG条目...
> 更新版本号... 完成
> 更新CHANGELOG.md... 完成
> 安装依赖... 完成
> 构建项目... 完成
> 创建git tag... 完成
> 推送到远程仓库... 完成
> 发布到npm... 完成
```

**错误处理示例**
```
/release 1.2.7
> 更新版本号... 完成
> 分析git提交记录... 完成
> 生成CHANGELOG条目... 完成
> 安装依赖... 失败
> ❌ 错误: npm install 执行失败
> 错误信息: ERR! peer dep missing: @types/node@^22.0.0
> 建议解决方案: 检查package.json中的依赖版本配置
> 已停止操作，请决定下一步：
> 1. 修复问题后重新执行 /release
> 2. 手动完成剩余步骤
> 3. 回滚版本号和CHANGELOG更改
```