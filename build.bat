@echo off
setlocal
cd /d "%~dp0"
if "%ANDROID_HOME%"=="" if not "%ANDROID_SDK_ROOT%"=="" set "ANDROID_HOME=%ANDROID_SDK_ROOT%"
if "%ANDROID_HOME%"=="" (
  echo ERROR: Set ANDROID_HOME to your Android SDK directory.
  exit /b 2
)
where node >nul 2>nul || (echo ERROR: Node.js 18+ required.& exit /b 2)
where npm >nul 2>nul || (echo ERROR: npm required.& exit /b 2)
where java >nul 2>nul || (echo ERROR: JDK 17+ required.& exit /b 2)
for /f "tokens=1 delims=v." %%v in ('node --version') do set NODEMAJOR=%%v
if %NODEMAJOR% LSS 18 (echo ERROR: Node.js 18+ required.& exit /b 2)
echo [0/6] Verifying project files...
call npm run verify || exit /b 1
echo [1/6] Installing dependencies...
call npm install || exit /b 1
if not exist android (
  echo [2/6] Adding Capacitor Android...
  call npx cap add android || exit /b 1
) else (
  echo [2/6] Android platform already exists.
)
echo [3/6] Generating Android icons and splash screen...
call npx capacitor-assets generate --android || exit /b 1
echo [4/6] Syncing...
call npx cap sync android || exit /b 1
echo [5/6] Setting landscape orientation...
node scripts\set-landscape.mjs || exit /b 1
(
  cd android
  call gradlew.bat --no-daemon assembleDebug
  if errorlevel 1 exit /b 1
)
if not exist "app\build\outputs\apk\debug\app-debug.apk" (echo ERROR: APK output not found.& exit /b 3)
copy /Y "app\build\outputs\apk\debug\app-debug.apk" "..\GTA6_3D.apk" >nul
echo SUCCESS: GTA6_3D.apk
endlocal
