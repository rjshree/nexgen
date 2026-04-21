import { DbConnection } from "./db/types";
import { introspectTable } from "./db";
import { normalizeSchema } from "./schemaMapper";
import { generateDjangoModel } from "./db/djangoModelGen";
import { generateMuiColumns } from "./db/dataGridColumnsGen";
import * as fs from "fs";
import * as path from "path";

export async function generateFromDatabase(input: {
  host: string;
  schema: string;
  serviceName?: string;
  user: string;
  password: string;
  type: "oracle" | "mariadb";
  table: string;
  port?: number;
  workspaceAPIRoot?: string;
  workspaceUIRoot?: string;
}) {
  const db: DbConnection = {
    host: input.host,
    port: input.port,
    schema: input.schema,
    serviceName: input.serviceName,
    user: input.user,
    password: input.password,
    type: input.type,
  };

  console.log(`🔍 Introspecting table: ${input.table} on ${input.type}://${input.host}/${input.serviceName}`);

  // 1. Read columns from DB
  console.log("  ⏳ Fetching column metadata...", {
    user: db.user,
    password: db.password,
    schema: db.schema,
    connectString: `${db.host}:${db.port}/${db.serviceName}`,
  });
  const rawColumns = await introspectTable(db, input.table);
  console.log(`  Found ${rawColumns.length} columns`);

  // 2. Normalize to Django + MUI types
  const normalized = normalizeSchema(rawColumns);
  console.log(`  Normalized ${normalized.length} columns`);

  // 3. Generate Django model
  const djangoModel = generateDjangoModel(input.table, normalized);
  console.log("\n📄 Django Model:\n");
  console.log(djangoModel);

  // 4. Generate MUI DataGrid columns
  const muiColumns = generateMuiColumns(normalized);
  console.log("\n📄 MUI DataGrid Columns:\n");
  console.log(muiColumns);

  // // 5. Write to files if workspaceRoot provided
  // if (input.workspaceAPIRoot) {
  //   // const outDir = path.join(input.workspaceRoot, "generated", input.table.toLowerCase());
  //   // fs.mkdirSync(outDir, { recursive: true });

  //   const modelFile = path.join(input.workspaceAPIRoot, "models.py");
  //   fs.writeFileSync(modelFile, djangoModel);
  //   console.log(`  ✅ Django model written to: ${modelFile}`);
  // }
  // if (input.workspaceUIRoot) {
  //   const columnsFile = path.join(input.workspaceUIRoot, "masterTables.js");
  //   fs.writeFileSync(columnsFile, muiColumns);
  //   console.log(`  ✅ MUI columns written to: ${columnsFile}`);
  // }

  return {
    table: input.table,
    columns: normalized,
    djangoModel,
    muiColumns,
  };
}