# Spec-Kit AI驱动开发项目

![Spec-Kit](https://img.shields.io/badge/Spec-Kit-AI%20Driven-blue)
![Python](https://img.shields.io/badge/Python-3.7+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

> 🚀 基于规范驱动开发(Spec-Driven Development)的AI辅助开发工具包

## 📖 项目简介

本项目实现了GitHub的[spec-kit](https://github.com/github/spec-kit)规范驱动开发方法论，通过AI助手实现高质量、高效率的软件开发流程。

### 🎯 核心理念

- **规范驱动**: 将可执行的规范作为开发的核心资产
- **AI增强**: 利用AI助手实现从规范到代码的自动转换
- **质量保障**: 内置质量门禁和最佳实践
- **协作效率**: 标准化的开发流程和文档

## 🚀 快速开始

### 环境要求

- Python 3.7+
- 支持的AI助手: Claude Code, Gemini CLI, GitHub Copilot, Cursor等

### 安装和初始化

1. **克隆项目**
```bash
git clone <repository-url>
cd demo
```

2. **初始化Spec-Kit项目**
```bash
# Windows环境
speckit init --name MyProject --agent claude

# 或直接使用Python
python speckit.py init --name MyProject --agent claude
```

3. **验证安装**
```bash
speckit list
```

## 📋 使用指南

### AI工作流

Spec-Kit提供了一套完整的AI辅助工作流，通过以下命令实现：

```bash
# 1. 制定项目原则
/speckit.constitution

# 2. 描述功能需求
/speckit.specify <功能名称>

# 3. 制定实施计划
/speckit.plan <功能名称>

# 4. 分解任务列表
/speckit.tasks <功能名称>

# 5. 执行代码实现
/speckit.implement <功能名称>
```

### 快速命令生成

使用工具快速生成AI工作流命令：

```bash
# 生成完整工作流
speckit workflow --name UserLogin

# 创建功能规范文件
speckit spec --name UserLogin --description "用户登录功能"

# 创建实施计划
speckit plan --name UserLogin

# 创建任务列表
speckit tasks --name UserLogin
```

### 辅助命令

```bash
# 澄清模糊需求
/speckit.clarify <功能名称>

# 分析跨制品一致性
/speckit.analyze <功能名称>

# 生成质量检查清单
/speckit.checklist <功能名称>

# 列出所有规范
speckit list
```

## 🏗️ 项目结构

```
demo/
├── .speckit/                    # Spec-Kit配置目录
│   ├── constitution.md         # 项目宪法
│   ├── config.json             # 项目配置
│   ├── templates/              # 模板文件
│   │   ├── spec.template.md    # 规范模板
│   │   ├── plan.template.md    # 计划模板
│   │   └── tasks.template.md   # 任务模板
│   └── memory/                 # 项目记忆（生成的规范、计划等）
│       ├── *.spec.md          # 功能规范
│       ├── *.plan.md          # 实施计划
│       └── *.tasks.md         # 任务列表
├── src/                        # 源代码
├── tests/                      # 测试代码
├── docs/                       # 项目文档
├── scripts/                    # 构建和部署脚本
├── config/                     # 配置文件
├── speckit.py                 # Python工具脚本
├── speckit.bat               # Windows批处理脚本
└── README.md                  # 项目说明
```

## 📝 模板说明

### 规范模板 (spec.template.md)

包含完整的功能规范结构：
- 需求概述（背景、目标用户、成功标准）
- 功能需求（核心功能、用户界面、数据模型）
- 非功能需求（性能、安全、可用性）
- 技术约束和测试要求
- 风险评估和验收标准

### 计划模板 (plan.template.md)

包含详细的实施计划结构：
- 架构设计（整体架构、系统组件、技术决策）
- 开发阶段（基础架构、核心功能、功能完善、测试部署）
- 资源分配（人力、技术、时间）
- 质量保证和风险管理

### 任务模板 (tasks.template.md)

包含细化的任务分解结构：
- 任务优先级矩阵
- 按阶段的详细任务列表
- 任务统计和状态跟踪
- 风险和阻塞问题管理

## 🤖 AI代理支持

### 支持的AI助手

| AI代理 | 支持状态 | 备注 |
|--------|----------|------|
| Claude Code | ✅ 完全支持 | 推荐使用 |
| Gemini CLI | ✅ 完全支持 | |
| GitHub Copilot | ✅ 完全支持 | |
| Cursor | ✅ 完全支持 | |
| Amazon Q Developer | ⚠️ 部分支持 | 不支持自定义参数 |

### AI命令详解

#### `/speckit.constitution`
制定项目的基本原则和约束条件，包括：
- 代码质量标准
- 用户体验要求
- 安全性和性能指标
- 技术栈选择标准

#### `/speckit.specify <功能名>`
描述要构建的功能，重点关注：
- "做什么"和"为什么"
- 用户价值和业务需求
- 功能边界和约束条件

#### `/speckit.plan <功能名>`
基于选定技术栈制定实施方案：
- 架构设计和技术选型
- 开发阶段和里程碑
- 资源分配和风险评估

#### `/speckit.tasks <功能名>`
将计划分解为可执行的任务：
- 按优先级排列的任务列表
- 每个任务的详细描述和验收标准
- 时间估算和依赖关系

#### `/speckit.implement <功能名>`
按任务顺序执行实现：
- 代码生成和实现
- 测试编写和验证
- 文档更新和审查

## 🔧 高级用法

### 自定义模板

可以修改`.speckit/templates/`目录下的模板文件，使其符合项目特定需求：

```markdown
# 自定义规范模板示例
# 项目特定要求
## 业务规则
## 合规要求
## 审计需求
```

### 批量操作

```bash
# 批量创建多个功能的规范
for feature in UserAuth ProductOrder PaymentGateway; do
    speckit spec --name $feature
done
```

### 集成CI/CD

可以将Spec-Kit集成到CI/CD流水线中：

```yaml
# .github/workflows/spec-check.yml
name: Spec Check
on: [push, pull_request]
jobs:
  spec-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check specs
        run: python speckit.py list
```

## 📊 质量保障

### 代码质量门禁

- 所有代码必须通过静态分析检查
- 单元测试覆盖率不低于80%
- 代码审查必须通过才能合并
- 性能测试必须满足预定义指标

### 文档质量标准

- 规范文档必须完整和准确
- 技术文档必须及时更新
- API文档必须与实现保持一致
- 用户文档必须易于理解

## 🤝 贡献指南

### 开发流程

1. Fork项目并创建功能分支
2. 使用Spec-Kit工作流开发功能
3. 确保所有质量门禁通过
4. 提交Pull Request

### 代码规范

- 遵循PEP 8 Python编码规范
- 使用类型提示（Type Hints）
- 编写完整的单元测试
- 提供清晰的文档字符串

## 📚 学习资源

- [Spec-Driven Development详细说明](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- [AI辅助开发最佳实践](https://github.com/github/spec-kit/blob/main/docs/ai-development.md)
- [规范写作指南](https://github.com/github/spec-kit/blob/main/docs/spec-writing.md)

## 🆘 常见问题

### Q: 如何开始第一个功能开发？

A: 按以下顺序执行：
```bash
speckit workflow --name YourFeature
# 然后按照输出的命令依次执行
```

### Q: 如何处理需求变更？

A: 使用澄清命令：
```bash
/speckit.clarify <功能名>
```

### Q: 如何确保代码质量？

A: 使用分析命令：
```bash
/speckit.analyze <功能名>
/speckit.checklist <功能名>
```

## 📄 许可证

本项目采用MIT许可证 - 查看[LICENSE](LICENSE)文件了解详情。

## 🙏 致谢

- 感谢GitHub的[spec-kit](https://github.com/github/spec-kit)项目提供的规范驱动开发框架
- 感谢所有贡献者和用户的支持和反馈

---

**💬 有问题或建议？欢迎提交Issue或Pull Request！**