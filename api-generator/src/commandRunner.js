// src/commandRunner.js

// spawn process to run django bootstrap command from windows command line
const { spawnSync } = require("child_process");
const path = require("path");

export function runCommand(command, args, cwd = {}) 
{
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32", // Windows safe
  });

  if (result.status !== 0) {
    throw new Error(
      `Command failed: ${command} ${args.join(" ")}`
    );
  }
}
