// index.js
const path = require("path");


import { askProjectName } from "./prompt";
import { bootstrapNextJsProject } from "./bootstrap";
import { injectGeneratedFiles } from "./generator";
import { generateMasterTablesConfig } from "./generators/masterTables";
import { generateTableMetadata } from "./generators/tableMetadata";
import { generateUiStructure } from "./generators/generateUiStructure";

// Workspace root — all generated projects go here
const WORKSPACE = process.env.BUBBLE_WORKSPACE || path.resolve(__dirname, "..", "..", "workspace");

export async function main() {
  console.log("✨ Next.js Code Generator Starting...");

  const projectName = await askProjectName();

  bootstrapNextJsProject(projectName, WORKSPACE);

  const projectRoot = path.join(WORKSPACE, projectName);

// ✅ Example tables IR
const tables = [
  {
    tableName: "airport_city",
    tableLabel: "Airport City",
    primaryKey: "id",
    api: {
      list: "/api/airport_city",
      create: "/api/airport_city",
      update: "/api/airport_city/{id}",
      delete: "/api/airport_city/{id}"
    },
    columns: [
      {
        name: "airportCode",
        label: "Airport Code",
        type: "string",
        searchable: true,
        filterable: true,
        validations: { required: true },
        form: { show: true, component: "text" }
      },
      {
        name: "airportName",
        label: "Airport Name",
        type: "string",
        searchable: true,
        filterable: true,
        validations: { required: true },
        form: { show: true, component: "text" }
      }
    ]
  }
];

// ✅ Generate the top-level dropdown config
generateMasterTablesConfig(projectRoot, tables);
const muiColumns = "tables";
// ✅ Generate metadata per table
tables.forEach(table => generateTableMetadata(projectRoot, table));
const capitalizedStartingLetterProjectName = projectName.charAt(0).toUpperCase() + projectName.slice(1);
const capitalizedProjectName = projectName.toUpperCase();
generateUiStructure(  path.join(WORKSPACE, projectName),  projectName,   projectName, `${capitalizedStartingLetterProjectName} MASTER DATA`, "154d252a-9bcd-489c-b061-500ead6fd122", muiColumns );

  console.log("✅ Project ready at:", path.join(WORKSPACE, projectName));
}


// main();