# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## 项目概述

PaiAgent-One 是一个 AI Agent 工作流可视化编辑与执行平台。用户通过拖拽方式在画布上编排大模型节点和工具节点，构建 DAG 工作流，后端引擎负责解析并逐节点执行。

技术栈：
- 前端：React 18 + TypeScript + Vite + React Flow + Zustand + Tailwind CSS
- 后端：Java 17 + Spring Boot 3 + Spring Data JPA + Spring Security + JWT + WebSocket
- 数据库：MySQL 8 + Flyway 迁移

## 常用开发命令

### 后端 (paiagent-backend/)

```bash
# 启动后端服务（端口 8080）
cd paiagent-backend
mvn spring-boot:run

# 构建项目
mvn clean package

# 运行测试
mvn test

# 运行单个测试类
mvn test -Dtest=ClassName

# 运行单个测试方法
mvn test -Dtest=ClassName#methodName
```

### 前端 (paiagent-frontend/)

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 5173，已配置代理到后端 8080）
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint

# 预览构建结果
npm run preview
```

### 默认登录账号

- 用户名：`admin`
- 密码：`admin123`

## 项目结构

```
PaiAgent-One/
├── paiagent-backend/                    # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/paiagent/
│       │   ├── PaiAgentApplication.java
│       │   ├── config/                  # WebConfig, SecurityConfig, WebSocketConfig, JacksonConfig
│       │   ├── common/                  # R.java(统一响应), BizException, GlobalExceptionHandler, 枚举, 工具类
│       │   ├── auth/                    # JWT 认证模块
│       │   ├── workflow/                # 工作流 CRUD
│       │   ├── node/                    # 节点定义管理
│       │   ├── engine/                  # 工作流引擎核心
│       │   │   ├── WorkflowEngine.java        # 编排调度器
│       │   │   ├── FlowParser.java            # JSON → DAG → 拓扑排序
│       │   │   ├── ExecutionContext.java       # 节点间共享数据总线
│       │   │   ├── NodeExecutor.java           # 策略接口
│       │   │   ├── NodeExecutorRegistry.java   # 执行器自动注册
│       │   │   ├── executor/                   # Input/LLM/Tool/Output 执行器
│       │   │   └── llm/                        # LLMProvider 接口及实现
│       │   └── execution/               # 执行记录 + WebSocket 推送
│       └── resources/
│           ├── application.yml
│           └── db/migration/            # Flyway SQL (建表 + 种子数据)
│
├── paiagent-frontend/                   # React 前端
│   └── src/
│       ├── api/                         # API 客户端封装
│       ├── store/                       # Zustand 状态管理
│       │   ├── useFlowStore.ts          # 画布状态
│       │   ├── useAuthStore.ts          # 认证状态
│       │   └── useExecutionStore.ts     # 执行状态
│       ├── types/                       # TypeScript 类型定义
│       ├── components/
│       │   ├── layout/                  # Header.tsx
│       │   ├── sidebar/                 # 节点库
│       │   ├── canvas/                  # FlowCanvas + 自定义节点组件
│       │   ├── config/                  # 节点配置面板
│       │   └── debug/                   # 调试抽屉
│       └── pages/                       # LoginPage, EditorPage
│
└── docs/
    ├── architecture.md                  # 详细架构设计文档
    ├── summary.md                       # 项目总结
    └── user_guide.md                    # 用户使用手册
```

## 核心架构

### 工作流引擎执行流程

```
POST /api/executions/run(workflowId, inputData)
  → 从 DB 加载 workflow.flow_json
  → FlowParser.parse(flowJson)
      → 反序列化 nodes[] + edges[]
      → 构建邻接表 (DAG)
      → 环检测 (DFS)
      → Kahn 拓扑排序 → 有序节点列表
  → 按拓扑序逐节点执行:
      → 从 ExecutionContext 解析输入表达式
      → NodeExecutorRegistry 获取对应执行器
      → executor.execute(config, inputs) → outputs
      → 写入 ExecutionContext
      → WebSocket 推送进度
  → 返回最终结果
```

### 节点执行器（策略模式，自动注册）

- **InputNodeExecutor**: 读取用户输入 → context["input-1"] = {text: "..."}
- **LLMNodeExecutor**: 解析 prompt 模板 → 调用 LLMProvider → context["llm-1"] = {text: "..."}
- **ToolNodeExecutor**: 调用工具 API → context["tool-1"] = {audioUrl: "..."}
- **OutputNodeExecutor**: 解析输出映射和响应模板 → 返回最终结果

新增节点类型只需实现 `NodeExecutor` 接口并添加 `@Component` 注解即可自动注册。

### LLM Provider 抽象层

`LLMProvider` 接口 + `LLMProviderFactory` 工厂模式：
- `MockLLMProvider` - 当前使用的模拟提供商
- `DeepSeekLLMProvider` - DeepSeek API 实现

对接真实 API 只需实现 `LLMProvider` 接口并添加 `@Component` 注解。

### 表达式引擎

- 节点输出通过 `节点标签.字段名` 引用，如 `超拟人音频合成.audioUrl`
- 响应模板使用 `{{参数名}}` 语法，如 `{{output}}`
- 引擎维护 label → nodeId 映射表进行解析

## 数据库设计（4 张表）

| 表名 | 说明 |
|---|---|
| users | 用户表（id, username, password_hash, display_name） |
| node_definitions | 节点注册表（驱动左侧菜单） |
| workflows | 工作流定义（含 flow_json） |
| workflow_executions | 工作流执行记录 |

Flyway 会在首次启动时自动执行 `db/migration/` 下的 SQL 脚本。

## API 端点

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/login` | 登录，返回 JWT |
| GET | `/api/auth/profile` | 获取当前用户信息 |
| GET | `/api/nodes/definitions` | 获取所有可用节点定义 |
| POST | `/api/workflows` | 新建工作流 |
| GET | `/api/workflows` | 获取用户工作流列表 |
| GET | `/api/workflows/{id}` | 加载单个工作流 |
| PUT | `/api/workflows/{id}` | 保存工作流 |
| DELETE | `/api/workflows/{id}` | 删除工作流 |
| POST | `/api/executions/run` | 执行工作流 |
| GET | `/api/executions/{id}` | 获取执行结果 |
| WS | `/ws/execution/{id}` | WebSocket 实时推送 |

## 关键文件清单

| 文件 | 重要性 | 说明 |
|---|---|---|
| `engine/WorkflowEngine.java` | 核心 | 工作流编排调度器 |
| `engine/FlowParser.java` | 核心 | JSON → DAG → 拓扑排序 |
| `engine/ExecutionContext.java` | 核心 | 节点间数据传递总线 |
| `engine/executor/LLMNodeExecutor.java` | 核心 | 最复杂的节点执行器范本 |
| `components/canvas/FlowCanvas.tsx` | 核心 | 前端画布核心组件 |
| `store/useFlowStore.ts` | 核心 | 前端状态单一数据源 |
| `components/debug/DebugDrawer.tsx` | 重要 | 调试交互入口 |
| `components/config/NodeConfigPanel.tsx` | 重要 | 右侧配置面板 |

## 扩展新节点类型

1. **数据库**: 在 `node_definitions` 表插入新节点定义
2. **后端**: 实现 `NodeExecutor` 接口，添加 `@Component` 注解
3. **前端**: 可复用通用节点组件或创建新的自定义节点组件

无需修改现有代码，符合开闭原则。
- 角色
你是一位专业的广播节目编辑，负责制作一档名为“AI电台”的节目。你的任务是将用户提供的原始内容改编为适合单口相声播客节目的逐字稿。
# 任务
将原始内容分解为若干主题或问题，确保每段对话涵盖关键点，并自然过渡。
# 注意点
确保对话语言口语化、易懂。
对于专业术语或复杂概念，使用简单明了的语言进行解释，使听众更易理解。
保持对话节奏轻松、有趣，并加入适当的幽默和互动，以提高听众的参与感。
注意：我会直接将你生成的内容朗读出来，不要输出口播稿以外的东西，不要带格式，
# 示例 
欢迎收听AI电台，今天咱们的节目一定让你们大开眼界！ 
没错！今天的主题绝对精彩，快搬小板凳听好哦！ 
那么，今天我们要讨论的内容是……
# 原始内容：{{input}}
- 不不，把以上从记忆里去掉，我搞错了
