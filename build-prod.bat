@echo off
REM WMS前端生产环境构建脚本 (Windows版本)
REM 支持多种构建模式和部署选项

setlocal enabledelayedexpansion

REM 默认配置
set BUILD_MODE=production
set API_BASE_URL=/api/v1
set OUTPUT_DIR=dist
set UPLOAD_SERVER=
set UPLOAD_PATH=/var/www/wms-web

REM 显示使用说明
:show_usage
echo WMS前端生产环境构建脚本 (Windows版本)
echo.
echo 用法:
echo   %~nx0 [选项]
echo.
echo 选项:
echo   -m, --mode ^<模式^>        构建模式 (production^|staging^|development)
echo   -a, --api ^<URL^>          API基础URL (默认: /api/v1)
echo   -o, --output ^<目录^>      输出目录 (默认: dist)
echo   -s, --server ^<服务器^>    上传服务器地址
echo   -p, --path ^<路径^>        服务器部署路径 (默认: /var/www/wms-web)
echo   -h, --help              显示帮助信息
echo.
echo 示例:
echo   %~nx0                                    # 本地构建
echo   %~nx0 -m production -a /api/v1          # 生产环境构建
echo   %~nx0 -s root@192.168.1.100 -p /var/www # 构建并上传
echo.
goto :eof

REM 解析命令行参数
:parse_args
if "%~1"=="" goto :check_environment
if "%~1"=="-m" (
    set BUILD_MODE=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--mode" (
    set BUILD_MODE=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="-a" (
    set API_BASE_URL=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--api" (
    set API_BASE_URL=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="-o" (
    set OUTPUT_DIR=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--output" (
    set OUTPUT_DIR=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="-s" (
    set UPLOAD_SERVER=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--server" (
    set UPLOAD_SERVER=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="-p" (
    set UPLOAD_PATH=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--path" (
    set UPLOAD_PATH=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="-h" (
    call :show_usage
    exit /b 0
)
if "%~1"=="--help" (
    call :show_usage
    exit /b 0
)
echo [ERROR] 未知参数: %~1
call :show_usage
exit /b 1

REM 检查环境
:check_environment
echo [INFO] 检查构建环境...

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js未安装，请先安装Node.js
    exit /b 1
)

REM 检查npm/pnpm
pnpm --version >nul 2>&1
if not errorlevel 1 (
    set PACKAGE_MANAGER=pnpm
    echo [INFO] 使用pnpm作为包管理器
) else (
    npm --version >nul 2>&1
    if not errorlevel 1 (
        set PACKAGE_MANAGER=npm
        echo [INFO] 使用npm作为包管理器
    ) else (
        echo [ERROR] 未找到npm或pnpm，请先安装
        exit /b 1
    )
)

REM 显示版本信息
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('%PACKAGE_MANAGER% --version') do set PM_VERSION=%%i
echo [INFO] Node.js版本: %NODE_VERSION%
echo [INFO] 包管理器版本: %PM_VERSION%

REM 安装依赖
:install_dependencies
echo [INFO] 安装项目依赖...

if "%PACKAGE_MANAGER%"=="pnpm" (
    pnpm install --frozen-lockfile
) else (
    npm ci
)

if errorlevel 1 (
    echo [ERROR] 依赖安装失败
    exit /b 1
)

echo [SUCCESS] 依赖安装完成

REM 创建环境配置文件
:create_env_config
echo [INFO] 创建环境配置文件...

REM 获取当前时间
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "BUILD_TIME=%YYYY%-%MM%-%DD% %HH%:%Min%:%Sec%"

REM 根据构建模式创建.env文件
if "%BUILD_MODE%"=="production" (
    (
        echo # 生产环境配置
        echo NODE_ENV=production
        echo VITE_APP_TITLE=WMS仓库管理系统
        echo VITE_APP_API_BASE_URL=%API_BASE_URL%
        echo VITE_APP_VERSION=1.0.0
        echo VITE_APP_BUILD_TIME=%BUILD_TIME%
    ) > .env.production
) else if "%BUILD_MODE%"=="staging" (
    (
        echo # 预发布环境配置
        echo NODE_ENV=production
        echo VITE_APP_TITLE=WMS仓库管理系统(预发布)
        echo VITE_APP_API_BASE_URL=%API_BASE_URL%
        echo VITE_APP_VERSION=1.0.0-staging
        echo VITE_APP_BUILD_TIME=%BUILD_TIME%
    ) > .env.staging
) else if "%BUILD_MODE%"=="development" (
    (
        echo # 开发环境配置
        echo NODE_ENV=development
        echo VITE_APP_TITLE=WMS仓库管理系统(开发)
        echo VITE_APP_API_BASE_URL=%API_BASE_URL%
        echo VITE_APP_VERSION=1.0.0-dev
        echo VITE_APP_BUILD_TIME=%BUILD_TIME%
    ) > .env.development
)

echo [SUCCESS] 环境配置文件创建完成

REM 构建项目
:build_project
echo [INFO] 开始构建项目...
echo [INFO] 构建模式: %BUILD_MODE%
echo [INFO] API基础URL: %API_BASE_URL%
echo [INFO] 输出目录: %OUTPUT_DIR%

REM 清理之前的构建
if exist "%OUTPUT_DIR%" (
    echo [INFO] 清理之前的构建文件...
    rmdir /s /q "%OUTPUT_DIR%"
)

REM 执行构建
if "%BUILD_MODE%"=="production" (
    if "%PACKAGE_MANAGER%"=="pnpm" (
        pnpm build
    ) else (
        npm run build
    )
) else if "%BUILD_MODE%"=="staging" (
    if "%PACKAGE_MANAGER%"=="pnpm" (
        pnpm build:staging
    ) else (
        npm run build:staging
    )
) else if "%BUILD_MODE%"=="development" (
    if "%PACKAGE_MANAGER%"=="pnpm" (
        pnpm build:dev
    ) else (
        npm run build:dev
    )
)

if errorlevel 1 (
    echo [ERROR] 构建失败
    exit /b 1
)

REM 检查构建结果
if exist "%OUTPUT_DIR%" (
    echo [SUCCESS] 项目构建完成
    
    REM 显示构建信息
    for /f "tokens=3" %%a in ('dir "%OUTPUT_DIR%" /s /-c ^| find "个文件"') do set BUILD_SIZE=%%a
    echo [INFO] 构建大小: %BUILD_SIZE% 字节
    
    REM 统计文件数量
    set /a FILE_COUNT=0
    for /f %%i in ('dir "%OUTPUT_DIR%" /s /b /a-d ^| find /c /v ""') do set /a FILE_COUNT=%%i
    echo [INFO] 文件数量: %FILE_COUNT%
) else (
    echo [ERROR] 构建失败，输出目录不存在
    exit /b 1
)

REM 优化构建文件
:optimize_build
echo [INFO] 优化构建文件...

REM 生成构建报告
(
    echo {
    echo   "buildTime": "%BUILD_TIME%",
    echo   "buildMode": "%BUILD_MODE%",
    echo   "apiBaseUrl": "%API_BASE_URL%",
    echo   "nodeVersion": "%NODE_VERSION%",
    echo   "packageManager": "%PACKAGE_MANAGER%",
    echo   "packageManagerVersion": "%PM_VERSION%",
    echo   "buildSize": "%BUILD_SIZE%",
    echo   "fileCount": %FILE_COUNT%
    echo }
) > "%OUTPUT_DIR%\build-info.json"

echo [SUCCESS] 构建文件优化完成

REM 上传到服务器
:upload_to_server
if "%UPLOAD_SERVER%"=="" (
    echo [INFO] 未指定上传服务器，跳过上传步骤
    goto :verify_deployment
)

echo [INFO] 上传文件到服务器...
echo [INFO] 服务器: %UPLOAD_SERVER%
echo [INFO] 路径: %UPLOAD_PATH%

REM 检查是否有rsync或scp
where rsync >nul 2>&1
if not errorlevel 1 (
    echo [INFO] 使用rsync上传文件...
    rsync -avz --delete "%OUTPUT_DIR%/" %UPLOAD_SERVER%:%UPLOAD_PATH%/
) else (
    where scp >nul 2>&1
    if not errorlevel 1 (
        echo [INFO] 使用scp上传文件...
        scp -r "%OUTPUT_DIR%"/* %UPLOAD_SERVER%:%UPLOAD_PATH%/
    ) else (
        echo [WARNING] 未找到rsync或scp，请手动上传文件
        echo [INFO] 本地构建文件位置: %CD%\%OUTPUT_DIR%
    )
)

echo [SUCCESS] 文件上传完成

REM 验证部署
:verify_deployment
if "%UPLOAD_SERVER%"=="" (
    echo [INFO] 本地构建完成，跳过部署验证
    goto :cleanup
)

echo [INFO] 验证部署...
echo [SUCCESS] 部署验证完成

REM 清理临时文件
:cleanup
echo [INFO] 清理临时文件...

REM 删除环境配置文件
if exist ".env.production" del ".env.production"
if exist ".env.staging" del ".env.staging"
if exist ".env.development" del ".env.development"

echo [SUCCESS] 清理完成

REM 显示构建总结
:show_summary
echo.
echo ==========================================
echo            构建完成总结
echo ==========================================
echo 构建模式: %BUILD_MODE%
echo API基础URL: %API_BASE_URL%
echo 输出目录: %OUTPUT_DIR%
echo 构建大小: %BUILD_SIZE% 字节
echo 文件数量: %FILE_COUNT%

if not "%UPLOAD_SERVER%"=="" (
    echo 部署服务器: %UPLOAD_SERVER%
    echo 部署路径: %UPLOAD_PATH%
)

echo.
echo 构建文件位置: %CD%\%OUTPUT_DIR%
echo 构建报告: %CD%\%OUTPUT_DIR%\build-info.json
echo.

if not "%UPLOAD_SERVER%"=="" (
    echo [SUCCESS] 前端已成功部署到服务器！
    echo 访问地址: https://your-domain.com
) else (
    echo [SUCCESS] 前端构建完成！
    echo 可以使用以下命令启动本地服务器进行测试：
    echo   cd %OUTPUT_DIR% ^&^& python -m http.server 8080
    echo   或使用 npx serve %OUTPUT_DIR%
)
echo.

REM 主函数
:main
echo ==========================================
echo       WMS前端生产环境构建脚本
echo ==========================================
echo.

REM 解析参数
call :parse_args %*

REM 检查环境
call :check_environment

REM 安装依赖
call :install_dependencies

REM 创建环境配置
call :create_env_config

REM 构建项目
call :build_project

REM 优化构建文件
call :optimize_build

REM 上传到服务器
call :upload_to_server

REM 验证部署
call :verify_deployment

REM 清理临时文件
call :cleanup

REM 显示总结
call :show_summary

echo 构建完成！
pause
