@echo off
REM Enable delayed expansion
setlocal enabledelayedexpansion

REM Change to the directory where this script is located
cd /d %~dp0

REM Initialize a new git repository if it doesn't exist
if not exist .git (
    git init
    git remote add origin https://github.com/dx0ne/DiceForge.git
)

REM Add all changes to the staging area
git add .

REM Check if a commit message was provided as an argument
if "%1"=="" (
    REM Get the current date
    for /f "tokens=2 delims==" %%i in ('wmic os get localdatetime /value') do set datetime=%%i
    set commit_message=Commit on !datetime:~0,4!-!datetime:~4,2!-!datetime:~6,2! !datetime:~8,2!:!datetime:~10,2!:!datetime:~12,2!
) else (
    set commit_message=%1
)

REM Commit the changes with the appropriate message
git commit -m "%commit_message%"

REM Push the changes to the remote repository
git push -u origin main

endlocal
