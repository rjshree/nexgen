import { runGenerator } from "./runGenerator";

/**
 * ✅ SERVICE MODE
 * Used by Express / MCP / Agents
 */
 async function runGeneratorService(projectName: string, baseDir?: string, muiColumns?: string) {
  console.log("Service received:", { projectName, baseDir, muiColumns });
  return await runGenerator({ projectName, baseDir, muiColumns, type: "crud"});
}

 async function runUISkeletonGeneratorService(projectName: string, baseDir?: string, azureClientId?: string) {
  console.log("Service received request to generate UI skeleton for project:", projectName);
  return await runGenerator({ projectName, baseDir, azureClientId, type: "ui-skeleton" });
}
export { runGeneratorService, runUISkeletonGeneratorService };