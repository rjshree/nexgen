const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * Detect the correct Python command
 * @returns {string} python command name
 */
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
  throw new Error(
    "❌ Python not found. Please install Python and add it to PATH.\n" +
    "Download: https://www.python.org/downloads/"
  );
}

/**
 * Sanitize project name to be a valid Python identifier
 * - Replace hyphens and spaces with underscores
 * - Remove any non-alphanumeric/underscore characters
 * - Ensure it doesn't start with a number
 * @param {string} name
 * @returns {string}
 */
function toDjangoProjectName(name) {
  let sanitized = name
    .replace(/[-\s]+/g, "_")           // hyphens/spaces → underscores
    .replace(/[^a-zA-Z0-9_]/g, "")     // remove invalid chars
    .replace(/^(\d)/, "_$1");           // prefix underscore if starts with digit

  if (!sanitized) {
    throw new Error(`Cannot convert "${name}" to a valid Django project name`);
  }

  console.log(`🔤 Django project name: "${name}" → "${sanitized}"`);
  return sanitized;
}



/**
 * Bootstrap a Django project using django-admin commands
 * @param {string} outputFolder - Base output directory
 * @param {string} projectName - Django project name
 * @returns {{ folders: string[] }}
 */
function bootstrapDjangoProject(outputFolder, projectName, djangoProjectName,  setupVenv) {
  const folders = [];
  const pythonCmd = detectPython();
  
   // 1. Create virtual environment (clean up if corrupted)
   const venvPath = path.join(outputFolder, "venv");
   if (fs.existsSync(venvPath)) {
     console.log("🧹 Removing existing (possibly corrupted) venv...");
     fs.rmSync(venvPath, { recursive: true, force: true });
   }
  // 1. Create virtual environment
  console.log("🐍 Creating virtual environment...");
  // const venvPath = path.join(outputFolder, "venv");
  execSync(`${pythonCmd} -m venv "${venvPath}"`, { stdio: "inherit" });
  folders.push(venvPath);
  // 2. Determine pip and python paths inside venv
  const isWindows = process.platform === "win32";
  const venvPip = isWindows
    ? path.join(venvPath, "Scripts", "pip.exe")
    : path.join(venvPath, "bin", "pip");
  const venvPython = isWindows
    ? path.join(venvPath, "Scripts", "python.exe")
    : path.join(venvPath, "bin", "python");
  const djangoAdmin = isWindows
    ? path.join(venvPath, "Scripts", "django-admin.exe")
    : path.join(venvPath, "bin", "django-admin");
    if (setupVenv !== false) {
      // Full venv setup
      if (fs.existsSync(venvPath)) {
        console.log("🧹 Removing existing (possibly corrupted) venv...");
        fs.rmSync(venvPath, { recursive: true, force: true });
      }
      console.log("🐍 Creating virtual environment...");
      execSync(`${pythonCmd} -m venv "${venvPath}"`, { stdio: "inherit" });
      folders.push(venvPath);
  
      console.log("📦 Upgrading pip...");
      execSync(`"${venvPython}" -m pip install --upgrade pip`, { stdio: "inherit" });
  
      console.log("📦 Installing Django and dependencies...");
      execSync(`"${venvPip}" install django djangorestframework django-cors-headers oracledb requests cryptography PyJWT sqlparse tzdata`, {
        stdio: "inherit",
      });
  
      // Create Django project
      console.log(`📁 Creating Django project: ${djangoProjectName}`);
      execSync(`"${djangoAdmin}" startproject ${djangoProjectName} .`, {
        cwd: outputFolder,
        stdio: "inherit",
      });
      folders.push(path.join(outputFolder, djangoProjectName));
  
      // Create app
      const appName = "core";
      console.log(`📁 Creating Django app: ${appName}`);
      execSync(`"${venvPython}" manage.py startapp ${appName}`, {
        cwd: outputFolder,
        stdio: "inherit",
      });
  
      // Generate requirements.txt from installed packages
      console.log("📝 Generating requirements.txt...");
      execSync(`"${venvPip}" freeze > requirements.txt`, {
        cwd: outputFolder,
        stdio: "inherit",
        shell: true,
      });
    } else {
      // Skip venv — just write requirements.txt and scaffold with system python
      console.log("⏭️ Skipping venv setup (user opted out)");
  
      const requirements = [
        "django",
        "djangorestframework",
        "django-cors-headers",
        "oracledb",
        "requests",
        "cryptography",
        "PyJWT",
        "sqlparse",
        "tzdata",
      ].join("\n");
      fs.writeFileSync(path.join(outputFolder, "requirements.txt"), requirements + "\n");
      console.log("📝 Written requirements.txt");
      
       // Install only django via system pip (needed for startproject/startapp)
       console.log("📦 Installing Django (required for scaffolding)...");
       execSync(`${pythonCmd} -m pip install django`, { stdio: "inherit" });
 
  
      // Use system python/django-admin to scaffold
      console.log(`📁 Creating Django project: ${djangoProjectName}`);
      execSync(`${pythonCmd} -m django startproject ${djangoProjectName} .`, {
        cwd: outputFolder,
        stdio: "inherit",
      });
      folders.push(path.join(outputFolder, djangoProjectName));
  
      const appName = "core";
      console.log(`📁 Creating Django app: ${appName}`);
      execSync(`${pythonCmd} manage.py startapp ${appName}`, {
        cwd: outputFolder,
        stdio: "inherit",
      });
    }

  return { folders };
}

module.exports = { bootstrapDjangoProject };