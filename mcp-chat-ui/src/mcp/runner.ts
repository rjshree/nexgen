import { MCPConversationState } from "./types";
import { runGeneratorTool, runApiGeneratorTool, runSchemaGeneratorTool, runUISkeletonGeneratorTool, runApiSkeletonGeneratorTool } from "./generator";
// import path from "path";

export async function runExecution(
  state: MCPConversationState
): Promise<MCPConversationState> {
  const ctx = state.context;
  const steps = [...state.execution.steps];

  if (!ctx.generationMode || ctx.generationMode === "none") {
    return state;
  }

  if (!ctx.projectName && ctx.generationMode !== "schema-only") {
    throw new Error("projectName missing in MCP context");
  }

  let output: any = null;
  let apiOutput: any = null;
  let schemaOutput: any = null;
  let devUrl: any = null;

  switch (ctx.generationMode) {
    // ─── Mode 1: UI + API with SSO ─────────────────────────
    case "fs-sso": {
      // Step 1: Generate UI
      const uiStep = steps.find((s) => s.id === "run_generator");
      if (uiStep) uiStep.status = "running";
      console.log("Generating UI skeleton with Azure SSO integration for project:", ctx.projectName, "installNodeModules:", ctx.installNodeModules, "setupVenv:", ctx.setupVenv);
      output = await runUISkeletonGeneratorTool(ctx.projectName!, ctx.azureClientId!, ctx.installNodeModules ?? true,
        ctx.setupVenv ?? true,);

      if (uiStep) uiStep.status = "done";

      // Step 2: Generate API
      const apiStep = steps.find((s) => s.id === "run_api_generator");
      if (apiStep) apiStep.status = "running";

      apiOutput = await runApiSkeletonGeneratorTool(ctx.projectName!, ctx.installNodeModules ?? true, ctx.setupVenv ?? true,);
       

      if (apiStep) apiStep.status = "done";
      const uiRoot = output?.result?.outputFolder || `workspace/${ctx.projectName}/${ctx.projectName}-ui`;
      const apiRoot = apiOutput.result.apiRoot || `workspace/${ctx.projectName}/${ctx.projectName}-api`;

      // Step 4: Start dev servers
      if (ctx.installNodeModules !== false && ctx.setupVenv !== false) {
      const devStep = steps.find((s) => s.id === "start_dev_server");
      if (devStep) devStep.status = "running";

      const devResult = await startDevServer(ctx.projectName!, uiRoot, apiRoot);
      console.log(`🚀 UI running on port ${devResult.uiPort}, API on port ${devResult.apiPort}`);

      if (devResult.uiPort && devResult.apiPort) {
        console.log(`🚀 UI running on port ${devResult.uiPort}, API on port ${devResult.apiPort}`);
        devUrl =  `Try https://localhost:3000 \n\n`+
        `In case of any issues,\n` +
        `Please close the applications that are using the ports 3000/8000 and try running the servers manually:\n\n` +
        `API Server:\n  cd ${apiRoot}\n  python manage.py runserver\n\n` +
        `UI Server:\n  cd ${uiRoot}\n  npm run dev`;

        if (devStep) devStep.status = "done";
      } else {
        console.warn(`⚠️ ${devResult.message}`);
        // if (devStep) devStep.status = "error";
        devUrl = devResult.message;
      }
    }
      break;
    }

    // ─── Mode 2: Full CRUD from DB table ────────────────────
    case "fs-sso-crud": {
      // Step 1: Introspect DB schema
      console.log("Starting schema generation with DB details:", {
        host: ctx.db!.host,
        schema: ctx.db!.schema,
        user: ctx.db!.user,
        type: ctx.db!.type,
        table: ctx.db!.tableName,
        port: ctx.db!.port,
      });
      const schemaStep = steps.find((s) => s.id === "run_schema_generator");
      if (schemaStep) schemaStep.status = "running";

      schemaOutput = await runSchemaGeneratorTool({
        host: ctx.db!.host!,
        schema: ctx.db!.schema!,
        serviceName: ctx.db!.serviceName,
        user: ctx.db!.user!,
        password: ctx.db!.password!,
        type: ctx.db!.type || "oracle",
        table: ctx.db!.tableName!,
        port: ctx.db!.port,
      });

      if (schemaStep) schemaStep.status = "done";

      // Step 2: Generate UI
      const uiStep = steps.find((s) => s.id === "run_generator");
      if (uiStep) uiStep.status = "running";
      console.log("Running Generator with inputs:", schemaOutput);
      output = await runGeneratorTool(ctx.projectName!, {
        muiColumns: schemaOutput?.result?.muiColumns,
      },  ctx.installNodeModules ?? true,
      ctx.setupVenv ?? true,);
      console.log("UI generator output:", output);
      if (uiStep) uiStep.status = "done";

      // Step 3: Generate API with models from schema
      const apiStep = steps.find((s) => s.id === "run_api_generator");
      if (apiStep) apiStep.status = "running";

      const models = schemaOutput?.result?.columns
        ? [
            {
              app: "core",
              name: toPascalCase(ctx.db!.tableName!),
              tableName: ctx.db!.tableName!,
              endpoint: ctx.db!.tableName!.toLowerCase(),
              fields: schemaOutput.result.columns.map((col: any) => ({
                name: col.name,
                type: col.djangoField,
                options: col.djangoOptions,
              })),
            },
          ]
        : [];

      apiOutput = await runApiGeneratorTool({
        projectName: ctx.projectName!,
        apps: ["core"],
        models,
        djangoModel: schemaOutput?.result?.djangoModel,
        db: {host: ctx.db!.host!,
          schema: ctx.db!.schema!,
          serviceName: ctx.db!.serviceName,
          user: ctx.db!.user!,
          password: ctx.db!.password!,
          type: ctx.db!.type || "oracle",
          table: ctx.db!.tableName!,
          port: ctx.db!.port,},
        installNodeModules: ctx.installNodeModules ?? true,
        setupVenv: ctx.setupVenv ?? true,
      });
      console.log("API generator output:", apiOutput);
      if (apiStep) apiStep.status = "done";

      const uiRoot = output?.result?.outputFolder || `workspace/${ctx.projectName}/${ctx.projectName}-ui`;
      const apiRoot = apiOutput.result.apiRoot || `workspace/${ctx.projectName}/${ctx.projectName}-api`;
      
      // Step 4: Start dev servers
      if (ctx.installNodeModules !== false && ctx.setupVenv !== false) {
      const devStep = steps.find((s) => s.id === "start_dev_server");
      if (devStep) devStep.status = "running";

      const devResult = await startDevServer(ctx.projectName!, uiRoot, apiRoot);
      console.log(`🚀 UI running on port ${devResult.uiPort}, API on port ${devResult.apiPort}`);

      if (devResult.uiPort && devResult.apiPort) {
        console.log(`🚀 UI running on port ${devResult.uiPort}, API on port ${devResult.apiPort}`);
        devUrl = `Try https://localhost:3000 \n\n`+
        `In case of any issues,\n` +
        `Please close the applications that are using the ports 3000/8000 and try running the servers manually:\n\n` +
        `API Server:\n  cd ${apiRoot}\n  python manage.py runserver\n\n` +
        `UI Server:\n  cd ${uiRoot}\n  npm run dev`;

        if (devStep) devStep.status = "done";
      } else {
        console.warn(`⚠️ ${devResult.message}`);
        // if (devStep) devStep.status = "error";
        devUrl = devResult.message;
      }
    }
      break;
    }

    // ─── Mode 3: Schema introspection only ──────────────────
    case "schema-only": {
      const schemaStep = steps.find((s) => s.id === "run_schema_generator");
      if (schemaStep) schemaStep.status = "running";

      schemaOutput = await runSchemaGeneratorTool({
        host: ctx.db!.host!,
        schema: ctx.db!.schema!,
        serviceName: ctx.db!.serviceName,
        user: ctx.db!.user!,
        password: ctx.db!.password!,
        type: ctx.db!.type || "oracle",
        table: ctx.db!.tableName!,
        port: ctx.db!.port,
      });
      console.log("Schema generator output:", schemaOutput);

      if (schemaStep) schemaStep.status = "done";

      output = schemaOutput;
      
      
      break;
    }
  }

  return {
    ...state,
    execution: {
      ...state.execution,
      steps,
      output: output || apiOutput || schemaOutput,
      schemaOutput: schemaOutput || undefined,
      uiOutput: output || undefined,
      apiOutput: apiOutput || undefined,
      devUrl: devUrl || undefined,
    },
  };
}

// ─── Helpers ────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str
    .split(/[_\-\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}




async function startDevServer(projectName: string, uiRoot?: string, apiRoot?: string):Promise<{ uiPort: number; apiPort: number; message?: string }> {
  const WORKSPACE = process.env.BUBBLE_WORKSPACE;
  console.log("🚀🚀🚀 Starting dev server with workspace:", WORKSPACE);
  uiRoot = uiRoot || `workspace/${projectName}/${projectName}-ui`;
  apiRoot = apiRoot || `workspace/${projectName}/${projectName}-api`;
  try {
    const response = await fetch("http://localhost:4000/start-dev-server", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectName, uiRoot, apiRoot, workspace: WORKSPACE }),
    });
    console.log("Dev server response:", response);
    if (response.ok) {
      return response.json();
    }

    throw new Error(
      `Start the UI Server on port 3000 and Backend Server on port 8000.\n` +
      `Please close the applications that are using the ports and try running the servers manually:\n\n` +
      `API Server:\n  cd ${apiRoot}\n  python manage.py runserver\n\n` +
      `UI Server:\n  cd ${uiRoot}\n  npm run dev\n\n` +
      `Open the UI at https://localhost:3000`
    );
  } catch (err: any) {
    const uiRoot = `workspace/${projectName}/${projectName}-ui`;
    const apiRoot = `workspace/${projectName}/${projectName}-api`;

    return {
      uiPort: 0,
      apiPort: 0,
      message:
        err.message ||
        `Try https://localhost:3000`+
        `In case of any issues,\n` +
        `Please close the applications that are using the ports and try running the servers manually:\n\n` +
        `API Server:\n  cd ${apiRoot}\n  python manage.py runserver\n\n` +
        `UI Server:\n  cd ${uiRoot}\n  npm run dev`,
    };
  }
}