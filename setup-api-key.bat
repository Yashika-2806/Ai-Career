@echo off
echo ============================================
echo    Gemini API Key Setup for AI Career
echo ============================================
echo.

REM Check if .env file exists
if not exist "backend\.env" (
    echo ERROR: backend\.env file not found!
    echo.
    echo Creating .env file from template...
    copy "backend\.env.example" "backend\.env" 2>nul
    if errorlevel 1 (
        echo Could not create .env file. Please create it manually.
        pause
        exit /b 1
    )
)

echo Current API key status:
findstr "GEMINI_API_KEY" backend\.env
echo.

echo ============================================
echo.
echo Steps to get your Gemini API key:
echo 1. Open: https://makersuite.google.com/app/apikey
echo 2. Sign in with Google
echo 3. Click "Get API Key" or "Create API Key"
echo 4. Copy the key (starts with AIza...)
echo.
echo ============================================
echo.

set /p API_KEY="Paste your Gemini API key here: "

if "%API_KEY%"=="" (
    echo No API key provided. Exiting...
    pause
    exit /b 1
)

REM Check if key looks valid
echo %API_KEY% | findstr /R "^AIza" >nul
if errorlevel 1 (
    echo.
    echo WARNING: This doesn't look like a valid Gemini API key.
    echo Gemini keys usually start with "AIza"
    echo.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" (
        echo Cancelled.
        pause
        exit /b 1
    )
)

REM Backup existing .env
copy "backend\.env" "backend\.env.backup" >nul 2>&1

REM Update the API key in .env file
powershell -Command "(Get-Content 'backend\.env') -replace 'GEMINI_API_KEY=.*', 'GEMINI_API_KEY=%API_KEY%' | Set-Content 'backend\.env'"

echo.
echo ============================================
echo    API Key Updated Successfully!
echo ============================================
echo.
echo Backup saved to: backend\.env.backup
echo.
echo Next steps:
echo 1. Restart your backend server:
echo    - If using PM2: pm2 restart ai-backend
echo    - If running locally: Ctrl+C and restart
echo.
echo 2. Test PDF upload in the application
echo.

pause
