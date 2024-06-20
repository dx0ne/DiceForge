@echo off
REM Check if Git is installed
git --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Git is not installed. Please install Git and try again.
    exit /b 1
)

REM Clone the repository into the current directory
git clone https://github.com/dx0ne/DiceForge.git .

REM Check if the clone was successful
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to clone the repository.
    exit /b 1
)

echo Repository cloned successfully.
