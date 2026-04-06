# PaiAgent-One: AI Agent 工作流平台 - 架构设计文档

## Context

构建一个完整的 AI Agent 工作流可视化编辑与执行平台。用户可通过拖拽方式在画布上编排大模型节点和工具节点，形成 DAG 工作流（如：用户输入 → 大模型处理 → 语音合成 → 输出），后端引擎负责解析并逐节点执行该工作流。当前阶段以搭建完整的前后端框架为主，大模型调用使用 Mock 数据。

## 技术选型

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + React Flow + Zustand + Tailwind CSS + Axios |
| 后端 | Java 17 + Spring Boot 3 + Spring Data JPA + Spring Security + JWT + WebSocket |
| 数据库 | MySQL 8 |
| 数据库迁移 | Flyway |

## 项目目录结构

```
PaiAgent-One/
├── paiagent-backend/                    # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/paiagent/
│       │   ├── PaiAgentApplication.java
│       │   ├── config/                  # WebConfig, SecurityConfig, WebSocketConfig
│       │   ├── common/                  # R.java(统一响应), GlobalExceptionHandler, 枚举, 工具类
│       │   ├── auth/                    # AuthController, AuthService, JwtAuthFilter, DTO
│       │   ├── workflow/                # WorkflowController/Service/Repository/Entity/DTO
│       │   ├── node/                    # NodeDefinitionController/Service/Repository/Entity
│       │   ├── engine/                  # 工作流引擎核心
│       │   │   ├── WorkflowEngine.java        # 编排调度器
│       │   │   ├── ExecutionContext.java       # 节点间共享数据总线
│       │   │   ├── FlowParser.java            # JSON → DAG → 拓扑排序
│       │   │   ├── NodeExecutor.java           # 策略接口
│       │   │   ├── NodeExecutorRegistry.java   # 执行器自动注册
│       │   │   ├── executor/                   # InputNode/LLMNode/ToolNode/OutputNode Executor
│       │   │   └── llm/                        # LLMProvider 接口 + MockLLMProvider
│       │   └── execution/               # ExecutionController/Service/Repository + WebSocket
│       └── resources/
│           ├── application.yml
│           └── db/migration/            # Flyway SQL (建表 + 种子数据)
│
├── paiagent-frontend/                   # React 前端
│   ├── package.json / vite.config.ts / tsconfig.json
│   └── src/
│       ├── api/                         # client.ts, auth.ts, workflow.ts, node.ts, execution.ts
│       ├── store/                       # useFlowStore, useAuthStore, useExecutionStore (Zustand)
│       ├── types/                       # flow.ts, node.ts, execution.ts, api.ts
│       ├── components/
│       │   ├── layout/                  # Header.tsx
│       │   ├── sidebar/                 # NodeLibrary, NodeCategory, DraggableNode
│       │   ├── canvas/                  # FlowCanvas + 自定义节点 (InputNode/LLMNode/ToolNode/OutputNode)
│       │   ├── config/                  # NodeConfigPanel
│       │   └── debug/                   # DebugDrawer
│       └── pages/                       # LoginPage, EditorPage
│
└── docs/
    └── architecture.md                  # 本文件
```

## 数据库设计 (4 张表)

### users
| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | 用户 ID |
| username | VARCHAR(64) UNIQUE | 登录名 |
| password_hash | VARCHAR(256) | BCrypt 密码 |
| display_name | VARCHAR(128) | 显示名称 |
| created_at / updated_at | DATETIME | 时间戳 |

### node_definitions (节点注册表 - 驱动左侧菜单)
| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| node_key | VARCHAR(64) UNIQUE | "deepseek", "qwen", "voice_synthesis" 等 |
| node_type | VARCHAR(32) | INPUT / LLM / TOOL / OUTPUT |
| label | VARCHAR(128) | 显示名称："DeepSeek", "通义千问" |
| category | VARCHAR(64) | "大模型节点" / "工具节点" |
| icon_url | VARCHAR(256) | 图标路径 |
| config_schema | JSON | 可配置字段的 JSON Schema |
| default_config | JSON | 默认配置值 |
| sort_order | INT | 排列顺序 |
| enabled | TINYINT(1) | 是否启用 |

### workflows
| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| name | VARCHAR(128) | 流程名称 (如 "qoder5") |
| user_id | BIGINT FK | 所属用户 |
| flow_json | LONGTEXT | 完整 React Flow JSON (nodes + edges + 配置) |
| version | INT | 乐观锁版本号 |
| created_at / updated_at | DATETIME | |

### workflow_executions
| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| workflow_id | BIGINT FK | 所属工作流 |
| user_id | BIGINT FK | 执行人 |
| status | VARCHAR(32) | PENDING / RUNNING / SUCCESS / FAILED |
| input_data | JSON | 调试输入 |
| output_data | JSON | 最终输出 |
| node_results | JSON | 每个节点执行结果 Map<nodeId, {status, output, durationMs}> |
| error_message | TEXT | 错误信息 |
| started_at / finished_at | DATETIME | |

## API 设计

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/login` | 登录，返回 JWT |
| GET | `/api/auth/profile` | 获取当前用户信息 |
| GET | `/api/nodes/definitions` | 获取所有可用节点定义 (驱动左侧菜单) |
| POST | `/api/workflows` | 新建工作流 |
| GET | `/api/workflows` | 获取用户工作流列表 |
| GET | `/api/workflows/{id}` | 加载单个工作流 (含 flow_json) |
| PUT | `/api/workflows/{id}` | 保存工作流 |
| DELETE | `/api/workflows/{id}` | 删除工作流 |
| POST | `/api/executions/run` | 执行工作流 (body: workflowId + inputData) |
| GET | `/api/executions/{id}` | 获取执行结果 |
| WS | `/ws/execution/{id}` | WebSocket 实时推送执行进度 |

## 工作流引擎核心设计

### 执行流程
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

### 节点执行器 (策略模式, 自动注册)
- **InputNodeExecutor**: 读取用户输入 → context["input-1"] = {text: "..."}
- **LLMNodeExecutor**: 解析 prompt 模板 → 调用 LLMProvider(Mock) → context["llm-1"] = {text: "..."}
- **ToolNodeExecutor**: 调用工具 API(Mock 语音合成) → context["tool-1"] = {audioUrl: "..."}
- **OutputNodeExecutor**: 解析输出映射和响应模板 → 返回最终结果

### 表达式解析
- 节点输出通过 `节点标签.字段名` 引用，如 `超拟人音频合成.audioUrl`
- 响应模板使用 `{{参数名}}` 语法，如 `{{output}}`
- 引擎维护 label → nodeId 映射表进行解析

### 扩展性
- **新增节点类型**: 数据库插入 node_definitions 行 + 后端实现 NodeExecutor(@Component 自动注册) + 前端可复用通用节点组件
- **新增 LLM 提供商**: 实现 LLMProvider 接口 + @Component → 自动注册，零配置

## 实施状态

### 阶段 1: 项目骨架
- [x] **1.1** 后端 Spring Boot 3 项目脚手架 (pom.xml, 主类, 配置, 统一响应, 全局异常处理)
- [x] **1.2** 前端 Vite + React + TS 项目脚手架 (依赖安装, Tailwind 配置, Axios 封装)
- [x] **1.3** Flyway 数据库迁移 (4 张表建表 + 种子数据: 默认节点定义 + admin 用户)

### 阶段 2: 认证 + 基础布局
- [x] **2.1** 后端 JWT 认证 (JwtUtil, JwtAuthFilter, SecurityConfig, AuthController)
- [x] **2.2** 前端登录页 + useAuthStore + 路由守卫
- [x] **2.3** 前端主布局: 三栏 Flex 布局 (侧边栏 | 画布 | 配置面板) + 渐变色 Header

### 阶段 3: 节点库 + 画布 (核心)
- [x] **3.1** 后端节点定义 API (GET /api/nodes/definitions)
- [x] **3.2** 前端左侧节点库: 可折叠分类 + 可拖拽节点项
- [x] **3.3** 前端 React Flow 画布: 自定义节点组件 (Input/LLM/Tool/Output) + 拖放添加 + 连线
- [x] **3.4** Zustand useFlowStore: nodes/edges 状态管理, 增删改查

### 阶段 4: 节点配置面板
- [x] **4.1** 右侧配置面板框架 (根据选中节点类型显示不同表单)
- [x] **4.2** 输出节点配置: 输出映射表 + 引用表达式选择器 + 响应模板编辑器
- [x] **4.3** LLM 节点配置: 模型选择, System Prompt, Temperature
- [x] **4.4** 工具节点配置: 工具特定参数

### 阶段 5: 保存/加载工作流
- [x] **5.1** 后端 Workflow CRUD API (5 个端点)
- [x] **5.2** 前端: 保存/新建/加载按钮功能 + Flow JSON 序列化/反序列化

### 阶段 6: 工作流引擎 + 调试 (核心)
- [x] **6.1** 后端引擎核心: FlowParser(DAG 构建 + 拓扑排序) + ExecutionContext + WorkflowEngine
- [x] **6.2** 节点执行器: Input/LLM/Tool/Output NodeExecutor 实现
- [x] **6.3** Mock 提供商: MockLLMProvider + Mock 语音合成
- [x] **6.4** 执行追踪: ExecutionService + 数据库记录
- [x] **6.5** WebSocket 实时进度推送
- [x] **6.6** 前端调试抽屉: 输入框 + 运行按钮 + 执行时间线 + 结果展示 + 画布节点状态高亮

### 阶段 7: 收尾打磨 (待完成)
- [ ] **7.1** 错误处理: 流程校验 (无孤立节点、必须有输入输出节点)、节点执行失败处理
- [ ] **7.2** UX 优化: Loading 状态, 未保存提醒, 快捷键

## 启动方式

1. **后端**: 确保 MySQL 运行 → 修改 `paiagent-backend/src/main/resources/application.yml` 数据库配置 → `cd paiagent-backend && mvn spring-boot:run` (端口 8080)
2. **前端**: `cd paiagent-frontend && npm install && npm run dev` (端口 5173，已配置代理到 8080)
3. **登录**: admin / admin123

## 关键文件清单

| 文件 | 重要性 | 说明 |
|---|---|---|
| `engine/WorkflowEngine.java` | 核心 | 工作流编排调度器，串联所有后端组件 |
| `engine/FlowParser.java` | 核心 | JSON → DAG → 拓扑排序，连接前端编辑器和后端引擎 |
| `engine/ExecutionContext.java` | 核心 | 节点间数据传递总线 |
| `engine/executor/LLMNodeExecutor.java` | 核心 | 最复杂的节点执行器，是其他执行器的范本 |
| `components/canvas/FlowCanvas.tsx` | 核心 | 前端画布核心，React Flow 封装 |
| `store/useFlowStore.ts` | 核心 | 前端状态单一数据源 |
| `components/debug/DebugDrawer.tsx` | 重要 | 调试交互入口 |
| `components/config/NodeConfigPanel.tsx` | 重要 | 右侧配置面板 |
