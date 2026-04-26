@echo off
echo ╔══════════════════════════════════════════╗
echo ║   Building Bubble Generator (Protected)  ║
echo ╚══════════════════════════════════════════╝

echo.
echo Building Schema Generator...
cd schema-generator
call npm install
call npm run build
cd ..

echo.
echo [1/5] Building TypeScript generator...
cd generator
call npm install
call npm run build
cd ..

echo.
echo [2/5] Building Chat UI for production...
cd mcp-chat-ui
call npm install
call npm run build
cd ..

echo.
echo [3/5] Installing dependencies...
cd generator-server
call npm install --production
cd ..

cd api-generator
call npm install --production
cd ..

cd launcher
call npm install
cd ..

echo.
echo [4/5] Compiling NexJen.exe (launcher)...
cd launcher
call npx pkg . --targets node18-win-x64 --output dist\NexJen.exe
cd ..

echo.
echo [5/5] Creating distributable package...
if exist "dist" rmdir /S /Q dist
mkdir dist
mkdir dist\workspace

:: Copy NexJen.exe
copy launcher\dist\NexJen.exe dist\NexJen.exe

:: Copy node.exe
where node > nul 2>&1
if %errorlevel% equ 0 (
    for /f "delims=" %%i in ('where node') do copy "%%i" dist\node.exe
)

:: Copy generator-server (JS + deps)
mkdir dist\generator-server\src
copy generator-server\src\generatorServer.js dist\generator-server\src\generatorServer.js
xcopy generator-server\node_modules dist\generator-server\node_modules /E /I /Y /Q
copy generator-server\package.json dist\generator-server\package.json

:: Copy generator (compiled JS only - no .ts source)
xcopy generator\dist dist\generator\dist /E /I /Y /Q
xcopy generator\node_modules dist\generator\node_modules /E /I /Y /Q
copy generator\package.json dist\generator\package.json

:: Copy api-generator (JS source + deps)
xcopy api-generator\src dist\api-generator\src /E /I /Y /Q
xcopy api-generator\node_modules dist\api-generator\node_modules /E /I /Y /Q
copy api-generator\package.json dist\api-generator\package.json

:: Copy schema-generator (compiled JS + deps)
xcopy schema-generator\dist dist\schema-generator\dist /E /I /Y /Q
xcopy schema-generator\node_modules dist\schema-generator\node_modules /E /I /Y /Q
copy schema-generator\package.json dist\schema-generator\package.json

:: Verify schema-generator contents
echo.
echo Verifying schema-generator dist contents...
dir /B dist\schema-generator\dist
echo.
echo Verifying schema-generator node_modules (top-level)...
dir /B dist\schema-generator\node_modules
echo.

:: Copy chat UI (static build only)
xcopy mcp-chat-ui\build dist\mcp-chat-ui\build /E /I /Y /Q

:: Verify
echo.
echo Verifying build...
if not exist "dist\NexJen.exe" echo   ❌ MISSING: NexJen.exe
if not exist "dist\node.exe" echo   ❌ MISSING: node.exe
if not exist "dist\generator-server\src\generatorServer.js" echo   ❌ MISSING: generatorServer.js
if not exist "dist\generator\dist\service.js" echo   ❌ MISSING: generator service
if not exist "dist\api-generator\src\service.js" echo   ❌ MISSING: api-generator service
if not exist "dist\schema-generator\dist\index.js" echo   ❌ MISSING: schema-generator
if not exist "dist\mcp-chat-ui\build\index.html" echo   ❌ MISSING: chat UI build



echo.
echo ╔══════════════════════════════════════════╗
echo ║   ✅ Build Complete!                     ║
echo ╠══════════════════════════════════════════╣
echo ║   Output: dist\NexJen.exe                ║
echo ║   Double-click to launch!                ║
echo ╚══════════════════════════════════════════╝
pause