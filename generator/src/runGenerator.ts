import path from "path";
import fs from "fs";
import { ensureDir } from "./fs-utils";
import { generateUiStructure } from "./generators/generateUiStructure";
import { generateDashboardOnly } from "./generators/generateUISkeleton";
import { bootstrapNextJsProject } from "./bootstrap";
import {  getProjectPaths } from "./workspace";
import { spawn } from "child_process";

export type GeneratorInput = {
  projectName: string;
  baseDir?: string;
  muiColumns?: any;
  type?: any;
  azureClientId?: string;
};

export type GeneratorResult = {
  outputFolder: string;
  folders: string[];
  devServerPort?: number;
};

/**
 * Resolves workspace root
 */
function resolveWorkspace(baseDir?: string): string {
  const workspace =
    process.env.BUBBLE_WORKSPACE ||
    baseDir ||
    path.resolve(__dirname, "..", "..", "workspace");

  if (!fs.existsSync(workspace)) {
    fs.mkdirSync(workspace, { recursive: true });
  }
  return workspace;
}


/**
 * ✅ Pure generator logic
 * No prompts, no CLI, no server assumptions
 */
export async function runGenerator(
  input: GeneratorInput
): Promise<GeneratorResult> {
  const { projectName, baseDir,muiColumns, type, azureClientId } = input;
  console.log("Running generator with input:", input);
  if (!projectName) {
    throw new Error("projectName is required");
  }

  // workspace/<projectName>/
  const workspace = resolveWorkspace(baseDir);
  const projectDir = path.join(workspace, projectName);

  // workspace/<projectName>/<projectName>-ui/
  const uiRoot = path.join(projectDir, `${projectName}-ui`);

  console.log(`📂 Workspace: ${workspace}`);
  console.log(`📁 Project dir: ${projectDir}`);
  console.log(`📁 UI root: ${uiRoot}`);


  // 1. Bootstrap Next.js project (generates package.json, installs deps, etc.)
  try {
    await bootstrapNextJsProject(`${projectName}-ui`, projectDir);
    console.log("✅ Bootstrap complete");
  } catch (error) {
    console.error("❌ Bootstrap failed:", error);
    throw error;
  }

  const capitalizedStartingLetterProjectName = projectName.charAt(0).toUpperCase() + projectName.slice(1);
  const capitalizedProjectName = projectName.toUpperCase();
  if(type === "crud") {
  generateUiStructure(uiRoot, projectName, projectName, `${capitalizedStartingLetterProjectName} MASTER DATA`, "154d252a-9bcd-489c-b061-500ead6fd122", muiColumns);
  }
  generateDashboardOnly(uiRoot, projectName, capitalizedProjectName, azureClientId);


  return {
    outputFolder: uiRoot,
    folders: [
      uiRoot,
      path.join(uiRoot, "src"),
      path.join(uiRoot, "public"),
    ],
    // devServerPort,
  };
}