@echo off
setlocal

:: Default to dev environment if no argument provided
set ENV=%1
if "%ENV%"=="" set ENV=dev

:: Set compose files
set COMPOSE_FILES=-f docker-compose.yml -f docker-compose.%ENV%.yml

:: Check for environment file
if not exist .env.local (
    echo Error: .env.local file not found
    echo Please create .env.local file from .env.example
    exit /b 1
)

:: Create necessary directories
if not exist fastapi-service\logs mkdir fastapi-service\logs

:: Stop and remove existing containers
echo Stopping existing containers...
docker-compose %COMPOSE_FILES% down

:: Remove old images (optional)
if "%2"=="--clean" (
    echo Removing old images...
    docker image prune -f
)

:: Build and start containers
echo Building and starting containers for %ENV% environment...
docker-compose %COMPOSE_FILES% up -d --build

:: Show container status
echo Container status:
docker-compose %COMPOSE_FILES% ps

:: Show logs
echo Recent logs:
docker-compose %COMPOSE_FILES% logs --tail=100

endlocal 
