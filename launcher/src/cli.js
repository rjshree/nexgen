const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const express = require('express');
const e = require('express');

// Determine base path (works both in dev and inside pkg)
const basePath = process.pkg
    ? path.dirname(process.execPath)
    : path.resolve(__dirname, '../..');

const UI_PORT = 5070;
const SERVER_PORT = 4000;

// --- 1. Start Generator Server ---
function startGeneratorServer() {

    console.log(`  Starting generator-server on port ${SERVER_PORT}...`);
    console.log(`  Base path: ${basePath}`);

    const serverJs = path.join(basePath, 'generator-server', 'src', 'generatorServer.js');

    serverExe = path.join(basePath, 'generator-server', 'dist', 'generator-server.exe');
    let child;

    if (require('fs').existsSync(serverExe)) {
        console.log(`  Using packaged generator-server executable: ${serverExe}`);

         child = spawn(serverExe, [], {
            cwd: path.join(basePath, 'generator-server'),
            env: {
                ...process.env,
                PORT: SERVER_PORT,
                SCHEMA_GENERATOR_PATH: path.join(basePath, "schema-generator", "dist"),
                GENERATOR_PATH: path.join(basePath, 'generator', 'dist'),
                API_GENERATOR_PATH: path.join(basePath, 'api-generator', 'src'),
                WORKSPACE_PATH: path.join(basePath, 'dist',  'workspace'),
                BUBBLE_WORKSPACE: path.join(basePath, 'dist', 'workspace'),
            },
            stdio: 'pipe',
        });
    } else if (require('fs').existsSync(serverJs)) {
        console.log(`  Using dev mode (node): ${serverJs}`);
         child = spawn(process.execPath, [serverJs], {
            cwd: path.join(basePath, 'generator-server'),
            env: {
                ...process.env,
                PORT: SERVER_PORT,
                SCHEMA_GENERATOR_PATH: path.join(basePath, "schema-generator", "dist"),
                GENERATOR_PATH: path.join(basePath, 'generator', 'dist'),
                API_GENERATOR_PATH: path.join(basePath, 'api-generator', 'src'),
                WORKSPACE_PATH: path.join(basePath, 'workspace'),
            },
            stdio: 'pipe',
        });
    }

    child.stdout.on('data', (d) => process.stdout.write(`  [server] ${d}`));
    child.stderr.on('data', (d) => process.stderr.write(`  [server] ${d}`));
    child.on('error', (err) => console.error('  Failed to start generator-server:', err.message));

    return child;
}

// --- 2. Serve Chat UI static files ---
function startUIServer() {
    return new Promise((resolve, reject) => {
        const app = express();
        const uiBuildPath = path.join(basePath, 'mcp-chat-ui', 'build');

        console.log(`  UI build path: ${uiBuildPath}`);

        if (!fs.existsSync(uiBuildPath)) {
            return reject(new Error(`UI build folder not found at: ${uiBuildPath}`));
        }

        if (!fs.existsSync(path.join(uiBuildPath, 'index.html'))) {
            return reject(new Error(`index.html not found in: ${uiBuildPath}`));
        }

        // Serve static React build files (JS, CSS, images, etc.)
        app.use(express.static(uiBuildPath, {
            maxAge: '1h',
            setHeaders: (res, filePath) => {
                if (filePath.endsWith('.html')) {
                    res.setHeader('Cache-Control', 'no-cache');
                }
            }
        }));

        // SPA fallback - any route that doesn't match a file serves index.html
        app.get('*', (req, res) => {
            res.sendFile(path.join(uiBuildPath, 'index.html'));
        });

        const server = app.listen(UI_PORT, '0.0.0.0', () => {
            console.log(`  ✅ Chat UI serving build from: ${uiBuildPath}`);
            console.log(`  ✅ Chat UI running at http://localhost:${UI_PORT}`);
            resolve(server);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`  ❌ Port ${UI_PORT} is already in use.`);
                console.error(`  Run: netstat -ano | findstr :${UI_PORT}`);
            }
            reject(err);
        });
    });
}

// --- 3. Open browser ---
function openBrowser(url) {
    const { exec } = require('child_process');
    exec(`start "" "${url}"`);
}

// --- Main ---
async function main() {
    console.log();
    console.log('  ╔══════════════════════════════════════════╗');
    console.log('  ║       Bubble - Project Generator         ║');
    console.log('  ╚══════════════════════════════════════════╝');
    console.log();

    // Create workspace dir if missing
    const fs = require('fs');
    const workspacePath = path.join(basePath, 'workspace');
    if (!fs.existsSync(workspacePath)) {
        fs.mkdirSync(workspacePath, { recursive: true });
    }

    // Start backend
    const serverChild = startGeneratorServer();

    // Start UI
    try {
        await startUIServer();
        console.log();
        console.log('  ✅ Bubble is running!');
        console.log(`  UI:     http://localhost:${UI_PORT}`);
        console.log(`  Server: http://localhost:${SERVER_PORT}`);
        console.log();
        console.log('  Press Ctrl+C to stop.');
        console.log();

        // Open browser after short delay to let server warm up
        setTimeout(() => openBrowser(`http://localhost:${UI_PORT}`), 1500);
    } catch (err) {
        console.error('  Failed to start UI server:', err.message);
        serverChild.kill();
        process.exit(1);
    }

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n  Shutting down...');
        serverChild.kill();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        serverChild.kill();
        process.exit(0);
    });
}

main();