import path from "path";
import fs from "fs";
import { ensureDir } from "../fs-utils";

export function generateMasterTablesConfig(projectRoot: string, tables: any[]) {
  const configDir = path.join(projectRoot, "config");
  ensureDir(configDir);

  const payload = tables.map(t => ({
    name: t.tableLabel,
    tableKey: t.tableName
  }));

  const outputPath = path.join(configDir, "masterTables.json");
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

  console.log("✅ masterTables.json generated");
}
``