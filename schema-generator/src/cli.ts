import * as readline from "readline";
import { generateFromDatabase } from "./index";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string, defaultValue?: string): Promise<string> {
  const suffix = defaultValue ? ` (${defaultValue})` : "";
  return new Promise((resolve) => {
    rl.question(`  ${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || defaultValue || "");
    });
  });
}

async function main() {
  console.log();
  console.log("  ╔══════════════════════════════════════════╗");
  console.log("  ║   Bubble - Schema Generator (CLI)        ║");
  console.log("  ╚══════════════════════════════════════════╝");
  console.log();

  const type = (await ask("Database type (oracle / mariadb)", "oracle")) as "oracle" | "mariadb";
  const host = await ask("Host", "localhost");
  const port = parseInt(await ask("Port", type === "oracle" ? "1521" : "3306"), 10);
  const schema = await ask("Schema / Database name");
  const user = await ask("Username");
  const password = await ask("Password");
  const table = await ask("Table name");
  const workspaceRoot = await ask("Output directory (leave blank to skip)", "");

  console.log();
  console.log("  ⏳ Connecting and introspecting...");
  console.log();

  try {
    const result = await generateFromDatabase({
      host,
      schema,
      user,
      password,
      type,
      table,
      port,
      workspaceAPIRoot: workspaceRoot || undefined,
      workspaceUIRoot: workspaceRoot || undefined,
    });

    console.log();
    console.log(`  ✅ Done! Found ${result.columns.length} columns in '${result.table}'`);

    if (workspaceRoot) {
      console.log(`  📁 Output: ${workspaceRoot}/generated/${table.toLowerCase()}/`);
    }
  } catch (err: any) {
    console.error(`  ❌ Error: ${err.message}`);
  }

  rl.close();
}

main();