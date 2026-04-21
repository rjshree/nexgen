import "./hbs-helpers";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { ensureDir } from "./fs-utils";

export function renderTemplate(
  templatePath: string,
  outputPath: string,
  data: any
) {
  // 1. Read template file
  const templateContent = fs.readFileSync(templatePath, "utf8");

  // 2. Compile Handlebars template
  const template = Handlebars.compile(templateContent);

  // 3. Render the template with provided data (IR)
  const result = template(data);

  // 4. Ensure output folder exists
  ensureDir(path.dirname(outputPath));

  // 5. Write rendered file
  fs.writeFileSync(outputPath, result, "utf8");

  console.log(`✅ Generated: ${outputPath}`);
}