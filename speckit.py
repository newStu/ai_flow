#!/usr/bin/env python3
"""
Spec-Kit AI辅助工具
支持规范驱动开发的AI操作脚本
"""

import os
import sys
import json
import argparse
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class SpecKit:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root).resolve()
        self.speckit_dir = self.project_root / ".speckit"
        self.templates_dir = self.speckit_dir / "templates"
        self.memory_dir = self.speckit_dir / "memory"
        
        # 确保目录存在
        self._ensure_directories()
    
    def _ensure_directories(self):
        """确保必要的目录存在"""
        dirs = [
            self.speckit_dir,
            self.templates_dir,
            self.memory_dir
        ]
        for dir_path in dirs:
            dir_path.mkdir(parents=True, exist_ok=True)
    
    def init_project(self, project_name: str, ai_agent: str = "claude"):
        """初始化spec-kit项目"""
        print(f"🚀 初始化 Spec-Kit 项目: {project_name}")
        
        # 创建项目结构
        project_structure = {
            "docs": "项目文档",
            "src": "源代码",
            "tests": "测试代码",
            "scripts": "构建和部署脚本",
            "config": "配置文件"
        }
        
        for dir_name, description in project_structure.items():
            dir_path = self.project_root / dir_name
            dir_path.mkdir(exist_ok=True)
            print(f"  📁 创建目录: {dir_name} - {description}")
        
        # 创建配置文件
        config = {
            "project": {
                "name": project_name,
                "created_at": datetime.now().isoformat(),
                "ai_agent": ai_agent,
                "version": "1.0.0"
            },
            "templates": {
                "spec": str(self.templates_dir / "spec.template.md"),
                "plan": str(self.templates_dir / "plan.template.md"),
                "tasks": str(self.templates_dir / "tasks.template.md")
            },
            "paths": {
                "memory": str(self.memory_dir),
                "docs": str(self.project_root / "docs"),
                "src": str(self.project_root / "src")
            }
        }
        
        config_file = self.speckit_dir / "config.json"
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print(f"  ⚙️  创建配置文件: {config_file}")
        
        # 读取配置
        with open(config_file, 'r', encoding='utf-8') as f:
            config_data = json.load(f)
        
        return config_data
    
    def create_specification(self, feature_name: str, description: str = ""):
        """创建功能规范"""
        spec_file = self.memory_dir / f"{feature_name}.spec.md"
        
        if spec_file.exists():
            print(f"⚠️  规范文件已存在: {spec_file}")
            return str(spec_file)
        
        # 读取模板
        template_file = self.templates_dir / "spec.template.md"
        if template_file.exists():
            with open(template_file, 'r', encoding='utf-8') as f:
                content = f.read()
        else:
            content = self._get_default_spec_template()
        
        # 替换模板变量
        content = content.replace("[项目名称]", feature_name)
        content = content.replace("[创建日期]", datetime.now().strftime("%Y-%m-%d"))
        
        if description:
            content = content.replace("*描述为什么需要这个功能*", description)
        
        # 写入文件
        with open(spec_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"📝 创建功能规范: {spec_file}")
        return str(spec_file)
    
    def create_plan(self, feature_name: str):
        """创建实施计划"""
        plan_file = self.memory_dir / f"{feature_name}.plan.md"
        
        if plan_file.exists():
            print(f"⚠️  计划文件已存在: {plan_file}")
            return str(plan_file)
        
        # 读取模板
        template_file = self.templates_dir / "plan.template.md"
        if template_file.exists():
            with open(template_file, 'r', encoding='utf-8') as f:
                content = f.read()
        else:
            content = self._get_default_plan_template()
        
        # 替换模板变量
        content = content.replace("[项目名称]", feature_name)
        content = content.replace("[制定人]", "AI Assistant")
        content = content.replace("[日期]", datetime.now().strftime("%Y-%m-%d"))
        
        # 写入文件
        with open(plan_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"📋 创建实施计划: {plan_file}")
        return str(plan_file)
    
    def create_tasks(self, feature_name: str):
        """创建任务列表"""
        tasks_file = self.memory_dir / f"{feature_name}.tasks.md"
        
        if tasks_file.exists():
            print(f"⚠️  任务文件已存在: {tasks_file}")
            return str(tasks_file)
        
        # 读取模板
        template_file = self.templates_dir / "tasks.template.md"
        if template_file.exists():
            with open(template_file, 'r', encoding='utf-8') as f:
                content = f.read()
        else:
            content = self._get_default_tasks_template()
        
        # 替换模板变量
        content = content.replace("[项目名称]", feature_name)
        content = content.replace("[创建人]", "AI Assistant")
        content = content.replace("[创建日期]", datetime.now().strftime("%Y-%m-%d"))
        content = content.replace("[更新日期]", datetime.now().strftime("%Y-%m-%d"))
        
        # 写入文件
        with open(tasks_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 创建任务列表: {tasks_file}")
        return str(tasks_file)
    
    def list_specifications(self):
        """列出所有规范"""
        spec_files = list(self.memory_dir.glob("*.spec.md"))
        if not spec_files:
            print("📭 没有找到功能规范")
            return []
        
        print("📋 功能规范列表:")
        for i, spec_file in enumerate(spec_files, 1):
            print(f"  {i}. {spec_file.stem}")
        
        return [str(f) for f in spec_files]
    
    def get_ai_command(self, command: str, feature_name: str = "") -> str:
        """生成AI助手命令"""
        commands = {
            "constitution": f"/speckit.constitution",
            "specify": f"/speckit.specify {feature_name}" if feature_name else "/speckit.specify [功能名称]",
            "plan": f"/speckit.plan {feature_name}" if feature_name else "/speckit.plan [功能名称]",
            "tasks": f"/speckit.tasks {feature_name}" if feature_name else "/speckit.tasks [功能名称]",
            "implement": f"/speckit.implement {feature_name}" if feature_name else "/speckit.implement [功能名称]",
            "clarify": f"/speckit.clarify {feature_name}" if feature_name else "/speckit.clarify [功能名称]",
            "analyze": f"/speckit.analyze {feature_name}" if feature_name else "/speckit.analyze [功能名称]",
            "checklist": f"/speckit.checklist {feature_name}" if feature_name else "/speckit.checklist [功能名称]"
        }
        
        return commands.get(command, f"未知命令: {command}")
    
    def generate_ai_workflow(self, feature_name: str):
        """生成完整的工作流命令"""
        workflow = [
            "🎯 Spec-Kit AI 工作流",
            "=" * 50,
            "",
            f"功能名称: {feature_name}",
            "",
            "1️⃣  制定项目原则:",
            f"   {self.get_ai_command('constitution')}",
            "",
            "2️⃣  描述功能需求:",
            f"   {self.get_ai_command('specify', feature_name)}",
            "",
            "3️⃣  制定实施计划:",
            f"   {self.get_ai_command('plan', feature_name)}",
            "",
            "4️⃣  分解任务列表:",
            f"   {self.get_ai_command('tasks', feature_name)}",
            "",
            "5️⃣  执行代码实现:",
            f"   {self.get_ai_command('implement', feature_name)}",
            "",
            "🔧 辅助命令:",
            f"   • 澄清需求: {self.get_ai_command('clarify', feature_name)}",
            f"   • 分析一致性: {self.get_ai_command('analyze', feature_name)}",
            f"   • 质量检查: {self.get_ai_command('checklist', feature_name)}",
            "",
            "💡 使用建议:",
            "   1. 首先运行 constitution 建立项目原则",
            "   2. 按顺序执行 specify → plan → tasks → implement",
            "   3. 遇到不确定时使用 clarify 澄清需求",
            "   4. 完成后使用 analyze 和 checklist 进行质量检查"
        ]
        
        return "\n".join(workflow)
    
    def _get_default_spec_template(self) -> str:
        """获取默认规范模板"""
        return """# 功能规范

## 1. 需求概述

### 1.1 背景和动机
*描述为什么需要这个功能，解决了什么问题*

### 1.2 目标用户
*明确功能的主要用户群体*

### 1.3 成功标准
*定义功能成功完成的具体标准*

## 2. 功能需求

### 2.1 核心功能
- **功能1**: [详细描述]
- **功能2**: [详细描述]

### 2.2 用户界面
*界面设计和交互要求*

### 2.3 数据模型
*数据结构要求*

## 3. 非功能需求

### 3.1 性能要求
*响应时间、并发处理等要求*

### 3.2 安全要求
*身份验证、权限控制等要求*

### 3.3 可用性要求
*易用性、可访问性等要求*

## 4. 验收标准

### 4.1 功能验收
- [ ] 所有核心功能正常工作
- [ ] 用户界面符合设计要求

### 4.2 质量验收
- [ ] 代码质量符合标准
- [ ] 测试覆盖率达标

---

*创建日期: [创建日期]*
"""
    
    def _get_default_plan_template(self) -> str:
        """获取默认计划模板"""
        return """# 实施计划

## 1. 架构设计

### 1.1 整体架构
*架构模式和技术栈选择*

### 1.2 系统组件
*主要模块和组件划分*

### 1.3 技术决策
*技术选择的原因和考虑*

## 2. 开发阶段

### 阶段1: 基础架构搭建
**时间估算**: [X天/周]
- [ ] 项目初始化
- [ ] 开发环境搭建

### 阶段2: 核心功能开发
**时间估算**: [X天/周]
- [ ] 数据模型设计
- [ ] 业务逻辑实现

### 阶段3: 功能完善
**时间估算**: [X天/周]
- [ ] 高级功能实现
- [ ] 性能优化

### 阶段4: 测试和部署
**时间估算**: [X天/周]
- [ ] 功能测试
- [ ] 生产部署

## 3. 资源分配

### 3.1 人力资源
*团队成员和角色分配*

### 3.2 技术资源
*开发、测试、生产环境*

### 3.3 时间安排
*关键里程碑和时间节点*

## 4. 风险管理

### 4.1 技术风险
| 风险项 | 影响程度 | 缓解措施 |
|--------|----------|----------|

### 4.2 项目风险
| 风险项 | 影响程度 | 缓解措施 |
|--------|----------|----------|

---

*制定人: [制定人]*
*更新日期: [日期]*
"""
    
    def _get_default_tasks_template(self) -> str:
        """获取默认任务模板"""
        return """# 任务分解

## 📋 任务概览

**功能模块**: [功能模块名称]  
**创建时间**: [创建日期]  
**预估总工时**: [总工时估算]

---

## 🎯 详细任务列表

### 🔧 阶段1: 前期准备

#### P-01: 需求分析和技术调研
- **描述**: 详细分析需求，调研相关技术
- **负责人**: [开发人员姓名]
- **预估工时**: [X]小时
- **验收标准**: 
  - [ ] 需求理解清晰
  - [ ] 技术选型合理

#### P-02: 环境搭建和工具配置
- **描述**: 搭建开发环境，配置工具
- **负责人**: [开发人员姓名]
- **预估工时**: [X]小时
- **验收标准**:
  - [ ] 开发环境可用
  - [ ] 工具配置正确

---

### 💻 阶段2: 后端开发

#### B-01: 数据模型设计和实现
- **描述**: 设计数据库模型，创建数据访问层
- **负责人**: [后端开发人员]
- **预估工时**: [X]小时
- **验收标准**:
  - [ ] 数据模型符合需求
  - [ ] 接口测试通过

---

### 🎨 阶段3: 前端开发

#### F-01: 组件设计和开发
- **描述**: 设计UI组件，实现组件库
- **负责人**: [前端开发人员]
- **预估工时**: [X]小时
- **验收标准**:
  - [ ] 组件可复用
  - [ ] 响应式适配

---

### 🧪 阶段4: 测试和质量保证

#### T-01: 单元测试完善
- **描述**: 编写单元测试，确保覆盖率
- **负责人**: [开发人员]
- **预估工时**: [X]小时
- **验收标准**:
  - [ ] 测试覆盖率达标
  - [ ] 测试稳定通过

---

## 📊 任务统计

| 阶段 | 任务数 | 总工时 | 完成度 |
|------|--------|--------|--------|
| 前期准备 | 2 | [X]h | 0% |
| 后端开发 | 1 | [X]h | 0% |
| 前端开发 | 1 | [X]h | 0% |
| 测试质量 | 1 | [X]h | 0% |

---

## 📈 进度报告

### 本周进展
- **完成任务**: [完成任务列表]
- **实际工时**: [实际使用工时]

### 下周计划
- **计划任务**: [下周计划任务]
- **预估工时**: [预估工时]

---

*创建人: [创建人]*
*更新日期: [更新日期]*
"""

def main():
    parser = argparse.ArgumentParser(description="Spec-Kit AI辅助工具")
    parser.add_argument("command", choices=["init", "spec", "plan", "tasks", "list", "workflow"], 
                       help="要执行的命令")
    parser.add_argument("--name", "-n", help="项目或功能名称")
    parser.add_argument("--agent", "-a", default="claude", help="AI代理类型")
    parser.add_argument("--description", "-d", help="功能描述")
    parser.add_argument("--project-root", "-p", default=".", help="项目根目录")
    
    args = parser.parse_args()
    
    kit = SpecKit(args.project_root)
    
    if args.command == "init":
        if not args.name:
            print("❌ 初始化项目需要提供项目名称 (--name)")
            sys.exit(1)
        kit.init_project(args.name, args.agent)
        
    elif args.command == "spec":
        if not args.name:
            print("❌ 创建规范需要提供功能名称 (--name)")
            sys.exit(1)
        kit.create_specification(args.name, args.description or "")
        
    elif args.command == "plan":
        if not args.name:
            print("❌ 创建计划需要提供功能名称 (--name)")
            sys.exit(1)
        kit.create_plan(args.name)
        
    elif args.command == "tasks":
        if not args.name:
            print("❌ 创建任务需要提供功能名称 (--name)")
            sys.exit(1)
        kit.create_tasks(args.name)
        
    elif args.command == "list":
        kit.list_specifications()
        
    elif args.command == "workflow":
        if not args.name:
            print("❌ 生成工作流需要提供功能名称 (--name)")
            sys.exit(1)
        workflow = kit.generate_ai_workflow(args.name)
        print(workflow)

if __name__ == "__main__":
    main()