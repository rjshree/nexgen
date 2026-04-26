import { runGenerator } from "./runGenerator";

/**
 * ✅ SERVICE MODE
 * Used by Express / MCP / Agents
 */
 async function runGeneratorService(projectName: string, installNodeModules: boolean, baseDir?: string, muiColumns?: string, ) {
  console.log("Service received:", { projectName, baseDir, muiColumns,  installNodeModules});
  return await runGenerator({ projectName, baseDir, muiColumns,  installNodeModules, type: "crud"});
}

async function runUISkeletonGeneratorService(projectName: string, baseDir?: string, azureClientId?: string, installNodeModules: boolean = true) {
  console.log("Service received request to generate UI skeleton for project:", projectName);
  return await runGenerator({ projectName, baseDir, azureClientId, installNodeModules, type: "ui-skeleton" });
}
export { runGeneratorService, runUISkeletonGeneratorService };