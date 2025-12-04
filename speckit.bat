@echo off
setlocal enabledelayedexpansion

REM Spec-Kit AI辅助工具启动脚本
REM 用于Windows环境快速启动spec-kit

echo.
echo 🚀 Spec-Kit AI辅助工具
echo =====================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Python，请先安装Python 3.7+
    pause
    exit /b 1
)

REM 检查是否存在speckit.py
if not exist "%~dp0speckit.py" (
    echo ❌ 错误: 未找到speckit.py文件
    pause
    exit /b 1
)

REM 检查是否有参数
if "%1"=="" (
    echo 📖 使用帮助:
    echo.
    echo   初始化项目:   speckit init --name ^<项目名^>
    echo   创建规范:     speckit spec --name ^<功能名^> [--description ^<描述^>]
    echo   创建计划:     speckit plan --name ^<功能名^>
    echo   创建任务:     speckit tasks --name ^<功能名^>
    echo   列出规范:     speckit list
    echo   生成工作流:   speckit workflow --name ^<功能名^>
    echo.
    echo 🔧 选项参数:
    echo   --agent, -a    AI代理类型 (默认: claude)
    echo   --name, -n     项目或功能名称
    echo   --description, -d  功能描述
    echo   --project-root, -p  项目根目录 (默认: 当前目录)
    echo.
    echo 💡 示例:
    echo   speckit init --name MyProject
    echo   speckit spec --name UserLogin --description "用户登录功能"
    echo   speckit workflow --name UserLogin
    echo.
    pause
    exit /b 0
)

REM 执行Python脚本
python "%~dp0speckit.py" %*

if errorlevel 1 (
    echo.
    echo ❌ 执行失败，请检查参数是否正确
    pause
    exit /b 1
)

echo.
echo ✅ 操作完成！
pause