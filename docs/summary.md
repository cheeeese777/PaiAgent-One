# PaiAgent-One 项目总结

## 项目概述

PaiAgent-One 是一个 AI Agent 工作流可视化编辑与执行平台。用户通过拖拽方式在画布上编排大模型节点（DeepSeek、通义千问、AI Ping、智谱）和工具节点（超拟人音频合成），构建 DAG 工作流，由后端引擎解析并逐节点执行。

## 核心功能

| 功能 | 描述 |
|---|---|
| 可视化流图编辑 | 基于 React Flow 的画布，支持拖拽添加节点、连线、缩放、MiniMap |
| 节点库 | 左侧分类展示大模型节点和工具节点，拖拽到画布即可使用 |
| 节点配置 | 右侧面板根据节点类型动态渲染配置表单（模型选择、Prompt、Temperature、输出映射等） |
| 工作流持久化 | 支持新建、保存、加载、删除工作流，流程定义以 JSON 格式存储 |
| 工作流执行引擎 | 后端解析流图 JSON → DAG 构建 → Kahn 拓扑排序 → 逐节点执行 |
| 调试面板 | 输入测试文本 → 一键运行 → 实时查看各节点执行状态和最终结果 |
| 用户认证 | JWT 登录鉴权，接口权限保护 |
| WebSocket 推送 | 执行过程中实时推送节点启动/完成/失败事件到前端 |

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                    paiagent-frontend                     │
│  React 18 + TypeScript + Vite + React Flow + Zustand    │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐            │
│  │ 节点库    │  │ Flow画布  │  │ 配置面板    │            │
│  │ (拖拽)    │  │ (编辑)    │  │ (表单)      │            │
│  └──────────┘  └──────────┘  └────────────┘            │
│  ┌──────────────────────────────────────────┐           │
│  │            调试抽屉 (输入/进度/结果)        │           │
│  └──────────────────────────────────────────┘           │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API + WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                    paiagent-backend                      │
│  Java 17 + Spring Boot 3 + Spring Security + JPA        │
│  ┌────────┐  ┌────────────┐  ┌──────────────────┐      │
│  │ Auth   │  │ Workflow   │  │ Node Definition  │      │
│  │ Module │  │ CRUD       │  │ Registry         │      │
│  └────────┘  └────────────┘  └──────────────────┘      │
│  ┌──────────────────────────────────────────────┐      │
│  │              Workflow Engine                   │      │
│  │  FlowParser → TopoSort → NodeExecutor(策略)   │      │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │      │
│  │  │ Input   │ │ LLM     │ │ Tool    │        │      │
│  │  │Executor │ │Executor │ │Executor │        │      │
│  │  └─────────┘ └─────────┘ └─────────┘        │      │
│  │  LLMProvider: Mock / DeepSeek / Qwen / ...   │      │
│  └──────────────────────────────────────────────┘      │
└──────────────────────┬──────────────────────────────────┘
                       │
              ┌────────▼────────┐
              │   MySQL 8       │
              │   4 张表         │
              │   Flyway 迁移    │
              └─────────────────┘
```

## 设计亮点

### 1. 策略模式 + 自动注册的节点执行器
每种节点类型对应一个 `NodeExecutor` 实现类，通过 Spring `@Component` 注解自动注册到 `NodeExecutorRegistry`。新增节点类型只需编写一个类，无需修改任何现有代码。

### 2. LLM Provider 抽象层
`LLMProvider` 接口 + `LLMProviderFactory` 工厂模式，当前使用 `MockLLMProvider` 模拟，后续对接真实 API 只需实现接口并添加 `@Component` 注解。

### 3. 表达式引擎
支持 `节点标签.字段名` 的引用语法（如 `超拟人音频合成.audioUrl`）和 `{{参数名}}` 模板语法，通过 label→nodeId 映射表实现灵活的节点间数据传递。

### 4. 前后端分离 + 代理配置
前端 Vite 开发服务器配置了 `/api` 和 `/ws` 的反向代理，开发时前后端可独立启动，无跨域问题。

## 代码统计

| 模块 | 文件数 | 主要内容 |
|---|---|---|
| 后端 config | 4 | WebConfig, SecurityConfig, WebSocketConfig, JacksonConfig |
| 后端 common | 5 | R.java, BizException, GlobalExceptionHandler, 枚举, 工具类 |
| 后端 auth | 6 | Controller, Service, Filter, Entity, Repository, DTO |
| 后端 workflow | 5 | Controller, Service, Repository, Entity, DTO |
| 后端 node | 4 | Controller, Service, Repository, Entity/DTO |
| 后端 engine | 10 | WorkflowEngine, FlowParser, ExecutionContext, 4个Executor, LLM层 |
| 后端 execution | 5 | Controller, Service, Repository, Entity, DTO |
| 后端 resources | 3 | application.yml, V1 建表, V2 种子数据 |
| 前端 api | 5 | client, auth, workflow, node, execution |
| 前端 store | 3 | useFlowStore, useAuthStore, useExecutionStore |
| 前端 components | 10 | Header, NodeLibrary, FlowCanvas, 4个自定义节点, ConfigPanel, DebugDrawer |
| 前端 pages | 2 | LoginPage, EditorPage |

## 当前状态

- 阶段 1-6 **已完成**: 完整的前后端框架、认证、画布编辑、节点配置、工作流持久化、引擎执行、调试面板
- 阶段 7 **待完成**: 流程校验、UX 打磨（Loading 状态、未保存提醒、快捷键）
- 大模型调用: 当前使用 **Mock 数据**，后续可无缝切换到真实 API

## 后续规划

1. **对接真实大模型 API**: 实现 DeepSeekProvider、QwenProvider 等，配置 API Key
2. **对接真实语音合成**: 对接 TTS API，返回实际可播放的音频 URL
3. **流程校验增强**: 检测孤立节点、缺少输入/输出节点、环路检测的前端提示
4. **执行历史**: 展示工作流的历史执行记录和结果对比
5. **多用户协作**: 工作流分享、权限管理
6. **节点市场**: 支持用户自定义和分享节点类型
