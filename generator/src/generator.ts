// import path from "path";
// import { ensureDir } from "./fs-utils";

// export function createNextJsBase(projectPath: string) {
//   const folders = [
//     "app",
//     "components",
//     "services",
//     "types",
//     "utils",
//     "public"
//   ];

//   folders.forEach(folder => {
//     ensureDir(path.join(projectPath, folder));
//   });

//   console.log("✅ Base Next.js folder structure created");
// }

import path from "path";
import { renderTemplate } from "./template-engine";

export function injectGeneratedFiles(projectRoot: string, ir: any) {
  const templatesDir = path.join(__dirname, "templates");

  // Example: generate a simple page
  renderTemplate(
    path.join(templatesDir, "pages", "list.hbs"),
    path.join(projectRoot, "app", ir.tableName, "page.tsx"),
    ir
  );
}

