import { execSync } from "child_process";
import fs from "fs";
import path from "path";
export function bootstrapNextJsProject(projectName: string, cwd: string) {
  console.log("🚀 Bootstrapping Next.js project...", projectName);
  console.log(`📂 Working directory: ${cwd}`);
  
  // Ensure the working directory exists
  if (!fs.existsSync(cwd)) {
    fs.mkdirSync(cwd, { recursive: true });
  }

  // Ensure ComSpec and PATH are available — fixes ENOENT on cmd.exe
  const env = {
    ...process.env,
    ComSpec: process.env.ComSpec || "C:\\WINDOWS\\system32\\cmd.exe",
    PATH: process.env.PATH || "",
    SystemRoot: process.env.SystemRoot || "C:\\WINDOWS",
  };
  execSync(
    `npx create-next-app@16.0.10 ${projectName} --js --no-tailwind --no-eslint --src-dir --pages --no-app --no-experimental-react-compiler --import-alias "@/*" --yes`,
    {
      cwd,
      stdio: "inherit",
    }
  );

  const projectPath = path.join(cwd, projectName);
  const packageJsonPath = path.join(projectPath, "package.json");
  console.log(`📄 Modifying package.json at: ${packageJsonPath}`);
  // 2. Define custom dependencies
  const customPackageJson = {
    name: projectName,
    version: "1.0",
    private: true,
    scripts: {
      dev: "next dev --experimental-https",
      build: "next build",
      start: "next start",
      lint: "next lint",
      test: "jest"
    },
    dependencies: {
      "@azure/msal-browser": "^4.5.1",
      "@azure/msal-react": "^3.0.23",
      "@emotion/react": "^11.11.1",
      "@emotion/styled": "^11.11.0",
      "@mui/icons-material": "^6.4.7",
      "@mui/material": "^6.4.7",
      "@mui/system": "^5.14.20",
      "@mui/x-data-grid": "^7.27.3",
      "@mui/x-date-pickers": "^7.7.1",
      "axios": "^1.6.2",
      "node-fetch": "^3.3.2",
      "date-fns": "^3.6.0",
      "dayjs": "^1.11.11",
      "jest": "^29.7.0",
      "next": "16.0.10",
      "react": "^19.2.1",
      "react-dom": "^19.2.1",
      "react-icons": "^4.12.0",
      "react-loader-spinner": "^6.1.6",
      "react-tag-input-component": "^2.0.2",
      "recharts": "^3.8.1"
    },
    overrides: {
      "react-loader-spinner": {
        "react": "$react",
        "react-dom": "$react-dom"
      },
      "react-tag-input-component": {
        "react": "$react",
        "react-dom": "$react-dom"
      },
      "browserslist": {
        "caniuse-lite": "1.0.30001585"
      }
    },
    devDependencies: {
      "@testing-library/jest-dom": "^6.4.2",
      "@testing-library/react": "^16.3.0",
      "@testing-library/user-event": "^14.5.2",
      "axios-mock-adapter": "^1.22.0",
      "eslint": "^9.0.0",
      "eslint-config-next": "^16.2.2",
      "eslint-plugin-jest-dom": "^5.4.0",
      "eslint-plugin-testing-library": "^6.2.2",
      "jest-environment-jsdom": "^30.2.0",
      "jest-fetch-mock": "^3.0.3"
    }
  };

  // 3. Overwrite package.json
  console.log("📦 Applying custom library versions...");
  fs.writeFileSync(packageJsonPath, JSON.stringify(customPackageJson, null, 2));

  // 4. Install specific versions
  console.log("📥 Installing dependencies...");
  execSync(`cd ${projectPath} && npm install`, { stdio: "inherit" });

  console.log(`✅ Next.js project created with custom dependencies: ${projectPath}`);
}
