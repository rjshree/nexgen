
// src/mcp/generator.ts

import { MCPContext, MCPIntent } from "./types";

export type GeneratorOutput = {
  message: string;
  result: {
    outputFolder: string;
    folders: string[];
  };
};


export type ApiGeneratorInput = {
  projectName: string;
  apps?: string[];
  models?: {
    app: string;
    name: string;
    tableName: string;
    endpoint: string;
    fields: { name: string; type: string; options?: string }[];
  }[];
  djangoModel?: string | undefined;
  db: {  host: string;
    schema: string;
    serviceName?: string;
    user: string;
    password: string;
    type: "oracle" | "mariadb";
    table: string;
    port?: number;
  } | undefined;
  installNodeModules?: boolean;
  setupVenv?: boolean;
};


export async function runGeneratorTool(
  projectName: string,
  schemaOutput?: { muiColumns?: string },
  installNodeModules: boolean = true,
  setupVenv: boolean = true,
): Promise<GeneratorOutput> {
  console.log("Invoking generator tool with projectName:", projectName, installNodeModules, setupVenv);
  const res = await fetch("http://localhost:4000/generate-ui", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectName,muiColumns: schemaOutput?.muiColumns, installNodeModules, setupVenv }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Generator backend error:", res.status, errorBody);
    throw new Error(`Generator backend failed: ${res.status}`);
 
  }
  const data = await res.json();
  console.log("Generator tool response data:", data);
  return data;
}

export async function runUISkeletonGeneratorTool(
  projectName: string,
  azureClientId: string,
  installNodeModules: boolean = true,
  setupVenv: boolean = true,
): Promise<GeneratorOutput> {
  console.log("Invoking UI skeleton generator tool with projectName:", projectName);
  const res = await fetch("http://localhost:4000/generate-ui-skeleton", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectName, azureClientId, installNodeModules, setupVenv }),
  });
  if (!res.ok) {
    const errorBody = await res.text();
    console.error("UI Skeleton Generator backend error:", res.status, errorBody);
    throw new Error(`UI Skeleton Generator backend failed: ${res.status}`);
  }
  const data = await res.json();
  console.log("UI Skeleton Generator response data:", data);
  return data;
}

export async function runApiSkeletonGeneratorTool(
  projectName: string,
  installNodeModules: boolean = true,
  setupVenv: boolean = true,
): Promise<GeneratorOutput> {
  console.log("Invoking API skeleton generator tool with projectName:", projectName);
  const res = await fetch("http://localhost:4000/generate-api-skeleton", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectName, installNodeModules, setupVenv }),
  });   
  if (!res.ok) {
    const errorBody = await res.text();
    console.error("API Skeleton Generator backend error:", res.status, errorBody);
    throw new Error(`API Skeleton Generator backend failed: ${res.status}`);
  }
  const data = await res.json();
  console.log("API Skeleton Generator response data:", data);
  return data;
}

/**
 * Call the Django API generator (POST /generate-api)
 */
export async function runApiGeneratorTool(
  input: ApiGeneratorInput,
  installNodeModules: boolean = true,
  setupVenv: boolean = true,
): Promise<GeneratorOutput> {
  const { projectName, apps = [], models = [], djangoModel, db} = input;
  console.log("Invoking API generator with:", { projectName, apps, models, djangoModel, db, installNodeModules, setupVenv});

  const res = await fetch("http://localhost:4000/generate-api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectName, apps, models, djangoModel, db, installNodeModules, setupVenv }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("API Generator backend error:", res.status, errorBody);
    throw new Error(`API Generator backend failed: ${res.status}`);
  }

  const data: GeneratorOutput = await res.json();
  console.log("API Generator response data:", data);
  return data;
}

/**
 * Call both UI and API generators and combine results
 */
export async function runFullStackGenerator(
  projectName: string,
  apps: string[] = [],
  models: ApiGeneratorInput["models"] = [],
  db: ApiGeneratorInput["db"]
): Promise<{ ui: GeneratorOutput; api: GeneratorOutput }> {
  console.log("Invoking full-stack generator for:", projectName);

  const [ui, api] = await Promise.all([
    runGeneratorTool(projectName),
    runApiGeneratorTool({ projectName, apps, models, db }),
  ]);

  console.log("Full-stack generation complete");
  console.log("UI folders:", ui.result.folders);
  console.log("API folders:", api.result.folders);

  return { ui, api };
}

export async function runSchemaGeneratorTool(input: {
  host: string;
  schema: string;
  serviceName?: string;
  user: string;
  password: string;
  type: "oracle" | "mariadb";
  table: string;
  port?: number;
}): Promise<any> {
  const res = await fetch("http://localhost:4000/generate-schema", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Schema generation failed");
  }

  return res.json();
}