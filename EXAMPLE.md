# Spec-Kit 使用示例

本文档演示如何使用Spec-Kit进行AI驱动的规范驱动开发。

## 🎯 示例场景

我们要开发一个**用户登录功能**，包含用户认证、密码重置和会话管理。

## 🚀 完整工作流程

### 步骤1: 初始化项目

首先初始化一个新的Spec-Kit项目：

```bash
speckit init --name MyWebApp --agent claude
```

### 步骤2: 制定项目原则

在AI助手中执行：

```
/speckit.constitution
```

AI助手会基于`.speckit/constitution.md`中的内容，制定项目的开发原则。

### 步骤3: 描述功能需求

```bash
# 创建用户登录功能的规范
speckit spec --name UserLogin --description "实现用户登录功能，包括邮箱密码登录、密码重置和会话管理"
```

然后在AI助手中执行：

```
/speckit.specify UserLogin
```

### 步骤4: 制定实施计划

```bash
# 创建实施计划
speckit plan --name UserLogin
```

然后在AI助手中执行：

```
/speckit.plan UserLogin
```

### 步骤5: 分解任务列表

```bash
# 创建任务列表
speckit tasks --name UserLogin
```

然后在AI助手中执行：

```
/speckit.tasks UserLogin
```

### 步骤6: 执行代码实现

在AI助手中执行：

```
/speckit.implement UserLogin
```

## 📝 生成的文件

执行上述步骤后，会在`.speckit/memory/`目录下生成以下文件：

```
.speckit/memory/
├── UserLogin.spec.md    # 功能规范
├── UserLogin.plan.md    # 实施计划
└── UserLogin.tasks.md   # 任务列表
```

## 🔍 生成的工作流命令

使用以下命令快速生成完整的AI工作流：

```bash
speckit workflow --name UserLogin
```

输出示例：

```
🎯 Spec-Kit AI 工作流
==================================================

功能名称: UserLogin

1️⃣  制定项目原则:
   /speckit.constitution

2️⃣  描述功能需求:
   /speckit.specify UserLogin

3️⃣  制定实施计划:
   /speckit.plan UserLogin

4️⃣  分解任务列表:
   /speckit.tasks UserLogin

5️⃣  执行代码实现:
   /speckit.implement UserLogin

🔧 辅助命令:
   • 澄清需求: /speckit.clarify UserLogin
   • 分析一致性: /speckit.analyze UserLogin
   • 质量检查: /speckit.checklist UserLogin
```

## 📋 实际操作示例

### 创建项目并生成规范

```bash
# 初始化项目
C:\Work\Demo> speckit init --name MyWebApp
🚀 初始化 Spec-Kit 项目: MyWebApp
  📁 创建目录: docs - 项目文档
  📁 创建目录: src - 源代码
  📁 创建目录: tests - 测试代码
  📁 创建目录: scripts - 构建和部署脚本
  📁 创建目录: config - 配置文件
  ⚙️  创建配置文件: c:\Work\Demo\.speckit\config.json

# 创建用户登录规范
C:\Work\Demo> speckit spec --name UserLogin --description "用户登录和认证功能"
📝 创建功能规范: c:\Work\Demo\.speckit\memory\UserLogin.spec.md

# 查看生成的文件
C:\Work\Demo> speckit list
📋 功能规范列表:
  1. UserLogin
```

### 在AI助手中使用

现在可以在Claude Code、Copilot等AI助手中使用生成的命令：

```
/speckit.constitution
/speckit.specify UserLogin
/speckit.plan UserLogin
/speckit.tasks UserLogin
/speckit.implement UserLogin
```

## 🎨 生成的规范内容示例

### UserLogin.spec.md 部分内容

```markdown
# 功能规范

## 1. 需求概述

### 1.1 背景和动机
用户登录功能是Web应用的基础功能，需要提供安全、便捷的用户认证服务。当前系统缺乏统一的用户认证机制，影响用户体验和系统安全性。

### 1.2 目标用户
- 注册用户：需要通过邮箱和密码登录系统
- 管理员：需要管理用户认证和权限
- 系统管理员：需要监控登录状态和安全事件

### 1.3 成功标准
- 用户可以通过邮箱密码成功登录
- 登录失败有明确的错误提示
- 支持密码重置功能
- 登录状态在会话期间保持
- 符合安全最佳实践

## 2. 功能需求

### 2.1 核心功能
- **邮箱密码登录**: 
  - 输入：邮箱地址、密码
  - 处理：验证邮箱格式和密码强度，数据库验证
  - 输出：登录成功令牌或失败信息

- **密码重置**: 
  - 前置条件：用户已注册且邮箱有效
  - 执行步骤：发送重置邮件 -> 验证重置码 -> 设置新密码
  - 后置条件：密码更新成功，旧密码失效

### 2.2 用户界面
- **页面布局**: 
  - 登录表单居中显示
  - 包含邮箱输入框、密码输入框、登录按钮
  - 提供"忘记密码"链接

- **交互流程**: 
  - 用户输入凭据 -> 点击登录 -> 验证 -> 跳转或显示错误

### 2.3 数据模型
- **用户表(Users)**: id, email, password_hash, created_at, updated_at
- **登录会话(Sessions)**: id, user_id, token, expires_at, created_at
- **密码重置(PasswordResets)**: id, user_id, token, expires_at, used

## 3. 非功能需求

### 3.1 性能要求
- **响应时间**: 登录验证 < 500ms，页面加载 < 2s
- **并发处理**: 支持1000+并发用户登录
- **资源消耗**: 内存使用 < 100MB，CPU使用率 < 50%

### 3.2 安全要求
- **身份验证**: 使用JWT令牌，支持刷新机制
- **权限控制**: 基于角色的访问控制(RBAC)
- **数据保护**: 密码使用bcrypt加密，敏感数据传输使用HTTPS

## 4. 验收标准

### 4.1 功能验收
- [ ] 用户可以通过正确凭据登录
- [ ] 错误凭据显示适当错误信息
- [ ] 密码重置流程完整可用
- [ ] 登录状态正确维护

### 4.2 质量验收
- [ ] 所有安全测试通过
- [ ] 性能测试达到要求
- [ ] 代码覆盖率 > 80%
```

## 📈 项目跟踪

### 任务进度监控

生成的任务列表包含详细的进度跟踪：

```markdown
## 📊 任务统计

| 阶段 | 任务数 | 总工时 | 完成度 |
|------|--------|--------|--------|
| 前期准备 | 2 | 8h | 25% |
| 后端开发 | 3 | 24h | 0% |
| 前端开发 | 3 | 20h | 0% |
| 测试质量 | 3 | 16h | 0% |

## 📈 进度报告

### 本周进展
- **完成任务**: P-01, P-02
- **实际工时**: 10h
- **遇到问题**: 数据库迁移脚本需要调整

### 下周计划
- **计划任务**: B-01, B-02
- **预估工时**: 16h
- **重点关注**: 用户认证API实现
```

## 🔧 辅助工具使用

### 澄清需求

当需求不明确时，使用澄清命令：

```
/speckit.clarify UserLogin
```

AI助手会提出问题来澄清：
- 是否支持第三方登录（Google, GitHub等）？
- 是否需要多因素认证？
- 登录失败后的锁定策略是什么？

### 一致性分析

检查规范、计划和任务之间的一致性：

```
/speckit.analyze UserLogin
```

AI助手会分析：
- 规范中的需求是否在计划中得到体现
- 任务分解是否覆盖所有计划要点
- 是否存在遗漏或冲突

### 质量检查

生成质量检查清单：

```
/speckit.checklist UserLogin
```

生成的检查清单包括：
- [ ] 密码强度验证
- [ ] 防暴力破解机制
- [ ] 会话超时处理
- [ ] 错误日志记录
- [ ] 安全测试覆盖

## 🎯 最佳实践

### 规范写作技巧

1. **关注用户价值**：强调功能为用户带来的价值
2. **明确验收标准**：每个功能都要有清晰的成功标准
3. **考虑边界条件**：包括正常、异常和边界情况
4. **非功能需求**：不要忘记性能、安全、可用性要求

### 任务分解原则

1. **任务粒度适中**：每个任务1-2天可完成
2. **依赖关系清晰**：明确任务间的前后依赖
3. **验收标准具体**：每个任务都有明确的完成标准
4. **时间估算合理**：基于历史数据和复杂度评估

### AI协作技巧

1. **提供充分上下文**：给AI足够的信息来理解需求
2. **迭代澄清**：通过澄清命令逐步完善需求
3. **验证结果**：使用分析命令检查AI输出的质量
4. **持续改进**：根据使用反馈不断优化流程

---

通过这个完整的示例，你可以看到Spec-Kit如何将复杂的开发过程标准化，并通过AI助手大幅提升开发效率和质量。