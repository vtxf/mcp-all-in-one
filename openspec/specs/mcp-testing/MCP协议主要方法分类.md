# MCP协议主要方法分类
1. 初始化和基础协议
initialize - 初始化请求
notifications/initialized - 初始化完成通知
ping - 连接测试
2. 取消和进度
notifications/cancelled - 取消通知
notifications/progress - 进度通知
3. 资源管理 (Resources)
resources/list - 列出资源
resources/templates/list - 列出资源模板
resources/read - 读取资源
resources/subscribe - 订阅资源更新
resources/unsubscribe - 取消订阅
notifications/resources/list_changed - 资源列表变更通知
notifications/resources/updated - 资源更新通知
4. 提示模板 (Prompts)
prompts/list - 列出提示模板
prompts/get - 获取提示模板
notifications/prompts/list_changed - 提示列表变更通知
5. 工具 (Tools)
tools/list - 列出工具
tools/call - 调用工具
notifications/tools/list_changed - 工具列表变更通知
6. 日志 (Logging)
logging/setLevel - 设置日志级别
notifications/message - 日志消息通知
7. 采样 (Sampling)
sampling/createMessage - 创建消息采样请求
8. 自动补全 (Completion)
completion/complete - 完成请求
9. 根目录管理 (Roots)
roots/list - 列出根目录
notifications/roots/list_changed - 根目录列表变更通知
10. 信息采集 (Elicitation)
elicitation/create - 创建信息采集请求