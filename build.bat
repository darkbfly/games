@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: Phaser Games Docker 构建脚本 (Windows)
:: 使用方法: build.bat [选项]

set PROJECT_NAME=phaser-games
set IMAGE_NAME=phaser-games
set CONTAINER_NAME=phaser-games
set PORT=8080

:: 显示帮助信息
:show_help
echo.
echo Phaser Games Docker 构建脚本 (Windows)
echo.
echo 使用方法: %~nx0 [选项]
echo.
echo 选项:
echo   build     构建Docker镜像
echo   run       运行容器
echo   stop      停止容器
echo   restart   重启容器
echo   logs      查看容器日志
echo   clean     清理容器和镜像
echo   deploy    完整部署（构建+运行）
echo   help      显示此帮助信息
echo.
echo 示例:
echo   %~nx0 deploy    # 完整部署
echo   %~nx0 build     # 只构建镜像
echo   %~nx0 logs      # 查看日志
echo.
goto :eof

:: 检查Docker是否安装
:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo 错误: Docker未安装或未在PATH中
    echo 请先安装Docker Desktop: https://docs.docker.com/desktop/windows/
    exit /b 1
)
goto :eof

:: 构建镜像
:build_image
echo 正在构建Docker镜像...
docker build -t %IMAGE_NAME% .
if errorlevel 1 (
    echo 镜像构建失败！
    exit /b 1
)
echo 镜像构建完成！
goto :eof

:: 运行容器
:run_container
echo 正在启动容器...

:: 检查容器是否已存在
docker ps -a --format "table {{.Names}}" | findstr /r "^%CONTAINER_NAME%$" >nul 2>&1
if not errorlevel 1 (
    echo 容器已存在，正在删除旧容器...
    docker stop %CONTAINER_NAME% >nul 2>&1
    docker rm %CONTAINER_NAME% >nul 2>&1
)

:: 启动新容器
docker run -d --name %CONTAINER_NAME% -p %PORT%:80 --restart unless-stopped %IMAGE_NAME%
if errorlevel 1 (
    echo 容器启动失败！
    exit /b 1
)

echo 容器启动成功！
echo 访问地址: http://localhost:%PORT%
goto :eof

:: 停止容器
:stop_container
echo 正在停止容器...
docker stop %CONTAINER_NAME% >nul 2>&1
if errorlevel 1 (
    echo 容器未运行
) else (
    echo 容器已停止
)
goto :eof

:: 重启容器
:restart_container
call :stop_container
echo 正在重启容器...
docker start %CONTAINER_NAME% >nul 2>&1
if errorlevel 1 (
    call :run_container
) else (
    echo 容器重启完成！
)
goto :eof

:: 查看日志
:show_logs
echo 显示容器日志...
docker logs -f %CONTAINER_NAME%
goto :eof

:: 清理资源
:clean_resources
echo 正在清理Docker资源...

:: 停止并删除容器
docker stop %CONTAINER_NAME% >nul 2>&1
docker rm %CONTAINER_NAME% >nul 2>&1

:: 删除镜像
docker rmi %IMAGE_NAME% >nul 2>&1

:: 清理未使用的资源
docker system prune -f >nul 2>&1

echo 清理完成！
goto :eof

:: 完整部署
:deploy
echo 开始完整部署...
call :build_image
if errorlevel 1 exit /b 1
call :run_container
if errorlevel 1 exit /b 1
echo 部署完成！
echo 访问地址: http://localhost:%PORT%
goto :eof

:: 主函数
:main
call :check_docker
if errorlevel 1 exit /b 1

set action=%1
if "%action%"=="" set action=help

if "%action%"=="build" (
    call :build_image
) else if "%action%"=="run" (
    call :run_container
) else if "%action%"=="stop" (
    call :stop_container
) else if "%action%"=="restart" (
    call :restart_container
) else if "%action%"=="logs" (
    call :show_logs
) else if "%action%"=="clean" (
    call :clean_resources
) else if "%action%"=="deploy" (
    call :deploy
) else if "%action%"=="help" (
    call :show_help
) else (
    echo 未知选项: %action%
    call :show_help
    exit /b 1
)

goto :eof

:: 运行主函数
call :main %*
