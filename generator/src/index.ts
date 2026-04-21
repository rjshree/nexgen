import { main } from "./cli";

/**
 * ✅ CLI entry ONLY
 * This file is never imported by Express
 */
main().catch((err) => {
  console.error("❌ Generator failed:", err);
  process.exit(1);
});
