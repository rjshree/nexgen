// index.js
const path = require("path");
const fs = require("fs");
const { ensureDir, writeFileSafe } = require("./src/fs-utils");
const { createNextJsBase } = require("./src/generator");

// ✅ Your generator's main execution function
export async function main() {
  console.log("🚀 Index.js Next.js Project Generator Starting...");

  // 1. Ask user for output folder (for now we hardcode)
  const outputFolder = path.join(process.cwd(), "output-project");

  // 2. Create base project folder
  ensureDir(outputFolder);

  // 3. Create Next.js base structure
  createNextJsBase(outputFolder);

  console.log("✅ Project created successfully at:", outputFolder);
}

main().catch((err) => {
  console.error("❌ Generator failed:", err);
});