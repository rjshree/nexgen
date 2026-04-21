import path from "path";
import fs from "fs";

/**
 * Resolves the workspace root for all generated projects.
 * Priority:
 * 1. BUBBLE_WORKSPACE env variable
 * 2. baseDir parameter
 * 3. Default: <project-root>/../../workspace
 */
export function resolveWorkspace(baseDir?: string): string {
  const workspace =
    process.env.BUBBLE_WORKSPACE ||
    baseDir ||
    path.resolve(__dirname, "..", "..", "workspace");

  if (!fs.existsSync(workspace)) {
    fs.mkdirSync(workspace, { recursive: true });
  }

  console.log(`📂 Workspace root: ${workspace}`);
  return workspace;
}

/**
 * Returns folder names for UI and API projects
 */
export function getProjectPaths(workspace: string, projectName: string) {
  return {
    uiRoot: path.join(workspace, `${projectName}-ui`),
    apiRoot: path.join(workspace, `${projectName}-api`),
  };
}