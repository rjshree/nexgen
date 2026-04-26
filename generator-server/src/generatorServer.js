const express = require("express");
const cors = require("cors");
const path = require("path");
const { spawn, execSync, exec } = require("child_process");

const app = express();
const PORT = parseInt(process.env.GENERATOR_SERVER_PORT || "4000", 10);
const CHAT_UI_PORT = parseInt(process.env.CHAT_UI_PORT || "5070", 10);

// Resolve base path — works in both dev and pkg mode
const BASE_PATH = process.pkg
    ? path.resolve(path.dirname(process.execPath), '..')
    : path.resolve(__dirname, "../..");

const WORKSPACE = process.env.BUBBLE_WORKSPACE || path.join(BASE_PATH, "workspace");
console.log("Process environment:", {
    GENERATOR_SERVER_PORT: process.env.GENERATOR_PATH,
    CHAT_UI_PORT: process.env.SCHEMA_GENERATOR_PATH});

const GENERATOR_ROOT = process.env.GENERATOR_PATH
    ? path.resolve(process.env.GENERATOR_PATH, '..')
    : path.join(BASE_PATH, "generator");
const GENERATOR_DIST = process.env.GENERATOR_PATH || path.join(GENERATOR_ROOT, "dist");
const API_GENERATOR_SRC = process.env.API_GENERATOR_PATH || path.join(BASE_PATH, "api-generator", "src");

console.log(`  Base path: ${BASE_PATH}`);
console.log(`  Generator root: ${GENERATOR_ROOT}`);
console.log(`  Generator dist: ${GENERATOR_DIST}`);
console.log(`  Workspace: ${WORKSPACE}`);

const { runGeneratorService, runUISkeletonGeneratorService } = require(path.join(GENERATOR_DIST, "service"));
const { runApiGeneratorService, runAPISkeletonGeneratorService } = require(path.join(API_GENERATOR_SRC, "service"));

const SCHEMA_GENERATOR_ROOT = process.env.SCHEMA_GENERATOR_PATH    
    ? path.resolve(process.env.SCHEMA_GENERATOR_PATH, '..')
    : path.join(BASE_PATH, "schema-generator");
const SCHEMA_GENERATOR_DIST = process.env.SCHEMA_GENERATOR_PATH || path.join(SCHEMA_GENERATOR_ROOT, "dist");
console.log(`  Schema generator root: ${SCHEMA_GENERATOR_ROOT}`);
console.log(`  Schema generator dist: ${SCHEMA_GENERATOR_DIST}`);
const schemaIndexPath = path.join(SCHEMA_GENERATOR_DIST, "index.js");
console.log(`  Schema index exists: ${require("fs").existsSync(schemaIndexPath)}`);

let generateFromDatabase = null;
try {
  generateFromDatabase = require(path.join(SCHEMA_GENERATOR_DIST, "index")).generateFromDatabase;
  console.log("  ✅ Schema generator loaded");
} catch (err) {
  console.warn("  ⚠️ Schema generator not available:", err.message);
}



function detectPython() {
  const commands = ["python", "python3", "py"];
  for (const cmd of commands) {
    try {
      execSync(`${cmd} --version`, { stdio: "pipe" });
      console.log(`✅ Found Python: ${cmd}`);
      return cmd;
    } catch {
      // try next
    }
  }
  throw new Error("❌ Python not found. Please install Python and add it to PATH.");
}


app.use(cors({
    origin: [
        `http://localhost:${CHAT_UI_PORT}`,
        "http://localhost:3000",
    ],
}));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", port: PORT, workspace: WORKSPACE });
});

// UI Generator
app.post("/generate-ui", async (req, res) => {
    const { projectName, muiColumns, installNodeModules, setupVenv } = req.body;
    console.log("Received API request to generate UI project:", projectName, muiColumns);
    if (!projectName) {
        return res.status(400).json({ error: "projectName required" });
    }

    const originalCwd = process.cwd();
    process.chdir(GENERATOR_ROOT);
    try {
        const result = await runGeneratorService(projectName, installNodeModules, WORKSPACE, muiColumns );
        console.log("Generator result:", result);
        return res.json({ message: "Generator finished", result });
    } catch (error) {
        console.error("Error running generator:", error);
        return res.status(500).json({ error: error.message });
    } finally {
        process.chdir(originalCwd);
    }
});

// API Generator
app.post("/generate-api", async (req, res) => {
  const { projectName, apps, models, djangoModel, db, installNodeModules, setupVenv}= req.body;
    console.log("Received request to generate API:", projectName);
    if (!projectName) {
        return res.status(400).json({ error: "projectName required" });
    }

    try {
        const result = await runApiGeneratorService(projectName, WORKSPACE, djangoModel, db, setupVenv);
        console.log("API Generator result:", result);
        return res.json({ message: "API Generator finished", result });
    } catch (error) {
        console.error("Error running API generator:", error);
        return res.status(500).json({ error: error.message });
    }
});


app.post("/generate-schema", async (req, res) => {
    const { host, schema, serviceName, user, password, type, table, port } = req.body;
    console.log("Received API Request to generate schema for table:", table);

    if (!host || !schema || !user || !password || !type || !table) {
        return res.status(400).json({
            error: "Required: host, schema, user, password, type, table"
        });
    }

    try {
        const result = await generateFromDatabase({
            host,
            schema,
            serviceName,
            user,
            password,
            type,
            table,
            port,
            workspaceAPIRoot: path.join(WORKSPACE, "api"),
            workspaceUIRoot: path.join(WORKSPACE, "ui"),
        });
        return res.json({ message: "Schema generated", result });
    } catch (error) {
        console.error("Error generating schema:", error);
        return res.status(500).json({ error: error.message });
    }
});

app.post("/generate-ui-skeleton", async (req, res) => {
    const { projectName, azureClientId, installNodeModules, setupVenv } = req.body;
    console.log("Received API request to generate UI skeleton for project:", projectName);
    if (!projectName) {
        return res.status(400).json({ error: "projectName required" });
    }
    try {
        const result = await runUISkeletonGeneratorService(projectName, WORKSPACE, azureClientId, installNodeModules);
        console.log("UI Skeleton Generator result:", result);
        return res.json({ message: "UI Skeleton Generator finished", result });
    } catch (error) {
        console.error("Error running UI Skeleton generator:", error);
        return res.status(500).json({ error: error.message });
    } 
    // finally {
    //     process.chdir(GENERATOR_ROOT);
    // }
});

app.post("/generate-api-skeleton", async (req, res) => {
    const { projectName, installNodeModules, setupVenv } = req.body;
    console.log("Received API request to generate API skeleton for project:", projectName);
    if (!projectName) {
        return res.status(400).json({ error: "projectName required" });
    }
    try {
       const result = await runAPISkeletonGeneratorService(projectName, WORKSPACE, setupVenv);
        console.log("API Skeleton Generator result:", result);
        return res.json({ message: "API Skeleton Generator finished", result });
    } catch (error) {
        console.error("Error running API Skeleton generator:", error);
        return res.status(500).json({ error: error.message });
    } 
    // finally {
    //     process.chdir(GENERATOR_ROOT);
    // }
});

// start dev server for the generated UI and API projects
app.post("/start-dev-server",async (req, res) => {
    const { projectName, apiRoot, uiRoot, workspace } = req.body;
    
    // const workspace = process.env.BUBBLE_WORKSPACE || path.resolve(__dirname, "..", "..", "workspace");
    // const uiRoot = path.join(workspace, projectName, `${projectName}-ui`);
    // const apiRoot = path.join(workspace, projectName, `${projectName}-api`);
    try {
      const pythonCmd = detectPython();
      console.log(`🚀 Starting UI dev server at: ${uiRoot}`);
      console.log(`🚀 Starting API dev server at: ${apiRoot}`);

      const isWindows = process.platform === "win32";
      const fs = require("fs");
      const cmdExe = process.env.ComSpec || path.join(process.env.SystemRoot || "C:\\Windows", "System32", "cmd.exe");

      // Start UI in new cmd window
      if (isWindows) {
        exec(`start cmd /k "cd /d ${uiRoot} && npm run dev -- -p 3000"`);
      } else {
        exec(`cd ${uiRoot} && npm run dev &`);
      }

      // Start API dev server (Django)
      const venvPython = isWindows
        ? path.join(apiRoot, "venv", "Scripts", "python.exe")
        : path.join(apiRoot, "venv", "bin", "python");
        const pythonExe = fs.existsSync(venvPython) ? venvPython : pythonCmd;
        console.log(`🐍 Using Python: ${pythonExe}`);
  
        if (isWindows) {
          exec(`start cmd /k "cd /d ${apiRoot} && ${pythonExe} manage.py runserver 0.0.0.0:8000"`);
        } else {
          exec(`cd ${apiRoot} && ${pythonExe} manage.py runserver 0.0.0.0:8000 &`);
        }
  
        // const [uiPort, apiPort] = await Promise.all([
        //   waitForServer(uiChild, "ui"),
        //   waitForServer(apiChild, "api"),
        // ]);
        
        console.log(`✅ Dev servers started`);
        return res.json({ message: "Dev servers launched in separate windows", uiPort: 3000, apiPort: 8000 });
   ;
    } catch (err) {
        console.error("Error starting dev servers:", err);
        return res.status(200).json({ message: "Dev servers started" });
        // return res.status(500).json({ error: err.message });
    }
  });

  function waitForServer(child, label) {
    return new Promise((resolve, reject) => {
      let resolved = false;

      const checkOutput = (data) => {
        const text = data.toString();
        // Strip ANSI escape codes
        const clean = text.replace(/\x1B\[[0-9;]*m/g, "");
        console.log(`[${label}] ${clean.trim()}`);
        // Match https://localhost:3001, http://0.0.0.0:8000, etc.
        const portMatch = clean.match(/https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/);
        if (portMatch && !resolved) {
          console.log(`[${label}] ✅ Detected port ${portMatch[1]}`);
          resolved = true;
          child.unref();
          resolve(parseInt(portMatch[1], 10));
        }
      };
      child.stdout.on("data", checkOutput);
      child.stderr.on("data", checkOutput);

      child.on("error", (err) => {
        console.error(`[${label}] ❌ Process error: ${err.message}`);
        if (!resolved) {
          resolved = true;
          reject(new Error(`${label} failed: ${err.message}`));
        }
      });

      child.on("exit", (code) => {
        console.log(`[${label}] Process exited with code ${code}`);
        if (!resolved) {
          resolved = true;
          reject(new Error(`${label} exited with code ${code} before starting`));
        }
      });

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error(`${label} did not start within 60s`));
        }
      }, 30000);
    });
  }

app.listen(PORT, () => {
    console.log(`⚙️  Generator server running on http://localhost:${PORT}`);
    console.log(`🌐 Chat UI expected on http://localhost:${CHAT_UI_PORT}`);
    console.log(`📂 Workspace: ${WORKSPACE}`);
});