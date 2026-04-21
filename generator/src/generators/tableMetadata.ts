import fs from "fs";
import path from "path";
import { ensureDir } from "../fs-utils";

export function generateTableMetadata(projectRoot: string, tableIR: any) {
  const configDir = path.join(projectRoot,"src", "config", "tables");
  ensureDir(configDir);

  const {
    tableName,
    tableLabel,
    primaryKey,
    api,
    columns
  } = tableIR;

  const payload = {
    tableName,
    tableLabel,
    primaryKey,
    api,
    columns: columns.map((col: any) => ({
      field: col.name,
      label: col.label,
      type: col.type,
      searchable: col.searchable ?? false,
      filterable: col.filterable ?? false,
      validations: col.validations ?? {},
      form: col.form ?? { show: true, component: "text" }
    }))
  };

  const outputPath = path.join(configDir, `${tableName}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

  console.log(`✅ table metadata generated → ${outputPath}`);
}