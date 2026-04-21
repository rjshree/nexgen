const path = require("path");
const { bootstrapDjangoProject } = require("./bootstrap");
const { generateModels } = require("./generators/generateModels");
const { generateViews } = require("./generators/generateViews");
const { generateUrls } = require("./generators/generateUrls");
const { generateSerializers } = require("./generators/generateSerializers");
const { generateSettings } = require("./generators/generateSettings");
// const { generateAdmin } = require("./generators/generateAdmin");
const { ensureDir } = require("./utils/fs-utils");
const fs = require("fs");
const { generateBackend } = require("./generators/generateBackends");
/**
 * Resolves the workspace root
 */
function resolveWorkspace(baseDir) {
  const workspace =
    process.env.BUBBLE_WORKSPACE ||
    baseDir ||
    path.resolve(__dirname, "..", "..", "workspace");

  ensureDir(workspace);
  console.log(`📂 API Workspace root: ${workspace}`);
  return workspace;
}
/**
 * @typedef {Object} DjangoGeneratorInput
 * @property {string} projectName - Name of the Django project
 * @property {string[]} apps - List of Django app names to create
 * @property {Object[]} [models] - Model definitions per app
 * @property {string} [baseDir] - Optional base output directory
 */



/**
 * ✅ Pure generator logic
 * No server, no CLI, no prompts
 * @param {DjangoGeneratorInput} input
 * @returns {Promise<DjangoGeneratorResult>}
 */
async function runApiGenerator(input) {
  const { projectName, baseDir, djangoModel, db, type } = input;

  if (!projectName) {
    throw new Error("projectName is required");
  }

  // workspace/<projectName>/
  const workspace = resolveWorkspace(baseDir);
  const projectDir = path.join(workspace, projectName);

  // workspace/<projectName>/<projectName>-ui/
  const apiRoot = path.join(projectDir, `${projectName}-api`);
  ensureDir(apiRoot);

  console.log(`📂 Workspace: ${workspace}`);
  console.log(`📁 Project dir: ${projectDir}`);
  console.log(`📁 API root: ${apiRoot}`);

  console.log(`🚀 Generating Django project: ${projectName}`);
  console.log(`📁 Output folder: ${apiRoot}`);
  // console.log("Django Model details:", djangoModel);
  console.log("Db details:", db);

  const generatedFiles = [];
  const generatedFolders = [];

  // 1. Bootstrap Django project and apps
  console.log("📦 Bootstrapping Django project...");
  const djangoProjectName = toDjangoProjectName(projectName);
  const bootstrapResult = bootstrapDjangoProject(apiRoot, projectName, djangoProjectName);
  generatedFolders.push(...bootstrapResult.folders);
  console.log("✅ Bootstrap complete");
  const tableName = db && db.table ? toPascalCase(db.table) : "YourTableName";
  // 2. Generate code for each app
  const app = "core";

 if (type === "crud") {
  if (djangoModel && djangoModel.length > 0) {
    console.log(`🔧 Generating models for app: ${app}`);
    const modelFile = generateModels(apiRoot, projectName, app, djangoModel);
    generatedFiles.push(modelFile);
  }
  

  // // 3. Generate serializers
  console.log(`🔧 Generating serializers for app: ${app}`);
  const serializerFile = generateSerializers(apiRoot, projectName, app, tableName);
  generatedFiles.push(serializerFile);

  // 4. Generate views
  console.log(`🔧 Generating views for app: ${app}`);
  const viewFile = generateViews(apiRoot, projectName, app, tableName);
  generatedFiles.push(viewFile);

  // 5. Generate URLs
  console.log(`🔧 Generating urls for app: ${app}`);
  const urlFile = generateUrls(apiRoot, djangoProjectName, app, tableName);
  generatedFiles.push(urlFile);
 }
  // 6. Settings with CORS and installed apps
  console.log("⚙️ Updating project settings...");
  const settingsFile = generateSettings(apiRoot, djangoProjectName, app, db, type);
  generatedFiles.push(settingsFile);
  
  console.log(`🔧 Copying backends.py to app: ${app}`)
  const backendFile = generateBackend(apiRoot, projectName, app, djangoModel);
  generatedFiles.push(backendFile);

  console.log(`🔧 Copying constants.py to app: ${app}`)
  const constantsSrc = path.join(__dirname, "templates", "constants.py");
  const constantsDest = path.join(apiRoot, app, "constants.py");
  fs.copyFileSync(constantsSrc, constantsDest);
  generatedFiles.push(constantsDest);

  console.log(`🔧 Copying utils.py to app: ${app}`)
  const utilsSrc = path.join(__dirname, "templates", "utils.py");
  const utilsDest = path.join(apiRoot, app, "utils.py");
  fs.copyFileSync(utilsSrc, utilsDest);
  generatedFiles.push(utilsDest);


   console.log(`✅ Django project "${projectName}" generated successfully for type ${type}!`);

  return {
    apiRoot,
    folders: generatedFolders,
    files: generatedFiles,
  };
}

function toPascalCase(str) {
  return str
    .split(/[_\-\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
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
module.exports = { runApiGenerator };