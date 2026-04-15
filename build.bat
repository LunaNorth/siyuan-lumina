@echo off
REM build.bat - 打包插件，排除开发、系统临时文件及指定内容

setlocal enabledelayedexpansion

set OUTPUT=package.zip
set PLUGIN_DIR=.

if not exist "%PLUGIN_DIR%" (
    echo ❌ 错误: 未找到插件目录 '%PLUGIN_DIR%' >&2
    exit /b 1
)

REM ✅ 保存原始工作目录
set ORIGINAL_DIR=%cd%

REM 创建临时目录
set TEMP_DIR=%TEMP%\plugin_build_%RANDOM%
mkdir "%TEMP_DIR%" 2>nul
if not exist "%TEMP_DIR%" (
    echo ❌ 错误: 无法创建临时目录 '%TEMP_DIR%' >&2
    exit /b 1
)

echo 📁 复制插件文件到临时目录...
xcopy "%PLUGIN_DIR%\*" "%TEMP_DIR%\" /E /I /Q /H /Y >nul 2>&1

echo 🧹 清理不需要的文件和目录...

REM 删除版本控制及IDE相关目录
if exist "%TEMP_DIR%\.git" rd /s /q "%TEMP_DIR%\.git" >nul 2>&1
if exist "%TEMP_DIR%\.gitignore" del /q "%TEMP_DIR%\.gitignore" >nul 2>&1
if exist "%TEMP_DIR%\.history" rd /s /q "%TEMP_DIR%\.history" >nul 2>&1
if exist "%TEMP_DIR%\.idea" rd /s /q "%TEMP_DIR%\.idea" >nul 2>&1
if exist "%TEMP_DIR%\.DS_Store" del /q "%TEMP_DIR%\.DS_Store" >nul 2>&1
if exist "%TEMP_DIR%\node_modules" rd /s /q "%TEMP_DIR%\node_modules" >nul 2>&1

REM 删除构建脚本自身
if exist "%TEMP_DIR%\build.sh" del /q "%TEMP_DIR%\build.sh" >nul 2>&1
if exist "%TEMP_DIR%\build.bat" del /q "%TEMP_DIR%\build.bat" >nul 2>&1
if exist "%TEMP_DIR%\.hotreload" del /q "%TEMP_DIR%\.hotreload" >nul 2>&1
if exist "%TEMP_DIR%\update.sh" del /q "%TEMP_DIR%\update.sh" >nul 2>&1

REM ✅ 按用户要求排除：i18n 文件夹 和 README_zh_CN.md
if exist "%TEMP_DIR%\i18n" rd /s /q "%TEMP_DIR%\i18n" >nul 2>&1
if exist "%TEMP_DIR%\README_zh_CN.md" del /q "%TEMP_DIR%\README_zh_CN.md" >nul 2>&1

REM 删除 LICENSE（保留历史排除逻辑）
if exist "%TEMP_DIR%\LICENSE" del /q "%TEMP_DIR%\LICENSE" >nul 2>&1

REM 删除旧的输出文件
if exist "%ORIGINAL_DIR%\%OUTPUT%" del /q "%ORIGINAL_DIR%\%OUTPUT%" >nul 2>&1

REM 使用 PowerShell 打包 (Windows 内置)
echo 📦 正在打包...
powershell -nologo -noprofile -command "Compress-Archive -Path '%TEMP_DIR%\*' -DestinationPath '%ORIGINAL_DIR%\%OUTPUT%' -Force" >nul 2>&1

if %errorlevel% neq 0 (
    echo ❌ 打包失败
    rd /s /q "%TEMP_DIR%" >nul 2>&1
    exit /b 1
)

REM 验证输出文件
if not exist "%ORIGINAL_DIR%\%OUTPUT%" (
    echo ❌ 错误: 打包文件未生成 '%OUTPUT%' >&2
    rd /s /q "%TEMP_DIR%" >nul 2>&1
    exit /b 1
)

REM 清理临时目录
rd /s /q "%TEMP_DIR%" >nul 2>&1

echo ✅ 打包成功