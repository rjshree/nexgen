// // src/schema-generator/runSchemaGenerator.ts

// import fs from "fs";
// import path from "path";
// import { generateDjangoModel } from "./djangoModelGenerator";
// import { generateDataGridConfig } from "./datagridGenerator";

// export type NormalizedColumn = {
//   name: string;
//   dbType: string;
//   required: boolean;
//   maxLength?: number;
//   minLength?: number;
//   pattern?: string;
// };

// export type RunSchemaGeneratorInput = {
//   table: string;
//   columns: NormalizedColumn[];
// };

// export function runSchemaGenerator(
//   input: RunSchemaGeneratorInput,
//   workspaceRoot: string
// ) {
//   if (!input.table) {
//     throw new Error("table is required");
//   }
//   if (!input.columns?.length) {
//     throw new Error("columns are required");
//   }

//   // Where generated files go
//   const backendOutDir = path.join(
//     workspaceRoot,
//     "backend",
//     "generated"
//   );
//   const frontendOutDir = path.join(
//     workspaceRoot,
//     "frontend",
//     "generated"
//   );

//   fs.mkdirSync(backendOutDir, { recursive: true });
//   fs.mkdirSync(frontendOutDir, { recursive: true });

//   // Generate code
//   const djangoModelCode = generateDjangoModel(
//     input.table,
//     input.columns
//   );

//   const datagridCode = generateDataGridConfig(
//     input.table,
//     input.columns
//   );

//   // Write files
//   const djangoModelPath = path.join(
//     backendOutDir,
//     `${input.table}.models.py`
//   );

//   const datagridPath = path.join(
//     frontendOutDir,
//     `${input.table}.columns.ts`
//   );

//   fs.writeFileSync(djangoModelPath, djangoModelCode, "utf-8");
//   fs.writeFileSync(datagridPath, datagridCode, "utf-8");

//   return {
//     status: "success",
//     artifacts: {
//       djangoModel: djangoModelPath,
//       datagridConfig: datagridPath,
//     },
//   };
// }