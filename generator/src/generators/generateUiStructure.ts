import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

/**
 * Generates pages + components using templates
 */
export function generateUiStructure(
  projectRoot: string,
  projectName: string,
  // tablesInput: any[],
  apiName: string,
  projectTitle: string,
  azureClientId: "154d252a-9bcd-489c-b061-500ead6fd122",
  muiColumns: string
) {
  /* ----------------------------------------------------
   * 1. Resolve paths
   * --------------------------------------------------*/
  const generatorRoot = path.resolve(__dirname, "..", "..");
  const templatesRoot = path.join(generatorRoot, "dist", "templates");

  console.log("Generator root:", generatorRoot);
  console.log("Templates root:", templatesRoot);
  console.log("Project root:", projectRoot);
  // const templatesRoot = path.join(__dirname, "src", "templates");
  const configTarget = path.join(projectRoot, "src", "config");
  const pagesTarget = path.join(projectRoot, "src", "pages");
  const apiTarget = path.join(projectRoot, "src", "api");
  const componentsTarget = path.join(projectRoot, "src", "components", projectName);
  const landingDataTarget = path.join(projectRoot, "src", "components", "landingData");
  const iconsTarget = path.join(projectRoot, "src", "components", "icons");

  const componentsMasterTarget = path.join(
    projectRoot, "src",
    "components",
    projectName,
    `${projectName}Master`
  );
  fs.mkdirSync(apiTarget, { recursive: true });
  fs.mkdirSync(pagesTarget, { recursive: true });
  fs.mkdirSync(componentsTarget, { recursive: true });
  fs.mkdirSync(componentsMasterTarget, { recursive: true });
  fs.mkdirSync(configTarget, { recursive: true });
  fs.mkdirSync(landingDataTarget, { recursive: true });
  const wrapperTarget = path.join(projectRoot, "src", "components", "wrapper");
  fs.mkdirSync(wrapperTarget, { recursive: true });
  fs.mkdirSync(iconsTarget, { recursive: true });

  /* ----------------------------------------------------
   * 2. Generate MasterDashboard.jsx (page)
   * --------------------------------------------------*/


  const masterDashboardHbs = fs.readFileSync(
    path.join(templatesRoot, "pages", "dashboard.hbs"),
    "utf8"
  );

  const masterDashboardCompiled = Handlebars.compile(masterDashboardHbs);

  const masterDashboardContent = masterDashboardCompiled({
    projectName,
    PROJECT_TITLE: projectTitle,
    SIDEBAR_PATH: `../components/${projectName}/sidebar`,
    AUTH_LAYOUT_PATH: `../components/wrapper/ContentWrapper`,
    MASTER_TABLES_PATH: `../components/${projectName}/MasterTable`,
    apiName
  });

  fs.writeFileSync(
    path.join(
      pagesTarget,
      `dashboard.jsx`
    ),
    masterDashboardContent
  );

// Delete existing default files to avoid conflicts (Next.js might create .js files)
const defaultIndexJs = path.join(pagesTarget, "index.js");
if (fs.existsSync(defaultIndexJs)) fs.unlinkSync(defaultIndexJs);

const defaultAppJs = path.join(pagesTarget, "_app.js");
if (fs.existsSync(defaultAppJs)) fs.unlinkSync(defaultAppJs);

// copy _app.jsx
fs.copyFileSync(
  path.join(templatesRoot, "pages", "_app.jsx"),
  path.join(pagesTarget, "_app.jsx")
);
//copy index.jsx
fs.copyFileSync(
  path.join(templatesRoot, "pages", "index.jsx"),
  path.join(pagesTarget, "index.jsx")
);
/* ----------------------------------------------------
 * Generate Sidebar
 * ----------------------------------------------------*/
fs.copyFileSync(
  path.join(templatesRoot, "components", "sidebar.jsx"),
  path.join(componentsTarget, "sidebar.jsx")
);


// Generate AuthLayout (ContentWrapper)
const authLayoutHbs = fs.readFileSync(path.join(templatesRoot, "components", "AuthLayout.hbs"), "utf8");
const authLayoutContent = Handlebars.compile(authLayoutHbs)({});
fs.writeFileSync(path.join(wrapperTarget, "ContentWrapper.js"), authLayoutContent);

  /* ----------------------------------------------------
   * 3. Copy static common component templates
   * --------------------------------------------------*/
  fs.copyFileSync(
    path.join(templatesRoot, "common", "MasterUtility.js"),
    path.join(componentsMasterTarget, "Utility.js")
  );

  fs.copyFileSync(
    path.join(templatesRoot, "common", "SelectOptionComponent.js"),
    path.join(componentsMasterTarget, "SelectOptionComponent.js")
  );
  // write muiColumns to masterTables.js
  fs.writeFileSync(
    path.join(componentsMasterTarget, "masterTables.js"),
    muiColumns
  );

  // fs.copyFileSync(
  //   path.join(templatesRoot, "components", "masterTables.js"),
  //   path.join(componentsMasterTarget, "masterTables.js")
  // );

  /* ----------------------------------------------------
   * 4. Generate masterTable.js from template
   * --------------------------------------------------*/
  const masterTableTemplate = fs.readFileSync(
    path.join(templatesRoot, "common", "masterTables.template.hbs"),
    "utf8"
  );

  const compiled = Handlebars.compile(masterTableTemplate);

  // const masterTableContent = compiled({
  //   tables: tablesInput
  // });

  // fs.writeFileSync(
  //   path.join(componentsMasterTarget, "masterTables.js"),
  //   masterTableContent
  // );
  console.log(`✅ Generated till utility components ****: ${projectName}`);
  /* ----------------------------------------------------
   * 5. Generate {{projectName}}MasterTable.jsx from MasterTables.hbs
   * --------------------------------------------------*/
  
const masterTablesHbs = fs.readFileSync(
    path.join(templatesRoot, "components", "MasterTables.hbs"),
    "utf8"
  );

  const masterTablesCompiled = Handlebars.compile(masterTablesHbs);

  const masterTablesContent = masterTablesCompiled({
    projectName,
    projectTitle,
    apiName
  });

  fs.writeFileSync(
    path.join(
      componentsTarget,
      `MasterTable.jsx`
    ),
    masterTablesContent
  );
/* ----------------------------------------------------
 * 6. .env file
 * --------------------------------------------------*/
const api_base_url = `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/${apiName}`;
const envHbs = fs.readFileSync(
  path.join(templatesRoot, "env", ".env.hbs"),
  "utf8"
);
const envCompiled = Handlebars.compile(envHbs);
const envContent = envCompiled({
  api_base_url: "http://localhost:8000/api/",
  azureClientId: azureClientId,
  azureTenantId: "e0b26355-1889-40d8-8ef1-e559616befda",
  azureRedirectUri: "https://localhost:3000",
});

fs.writeFileSync(path.join(projectRoot, ".env"), envContent);
/* ----------------------------------------------------
 * 7. authConfig.js
  * --------------------------------------------------*/
 fs.copyFileSync(
  path.join(templatesRoot, "config", "authConfig.js"),
  path.join(configTarget, "authConfig.js")
);
/* ----------------------------------------------------
 * 8. masterAPI.js
 * --------------------------------------------------*/
fs.copyFileSync(
  path.join(templatesRoot, "api", "masterAPI.js"),
  path.join(apiTarget, "masterAPI.js")
);

/* ----------------------------------------------------
 * 9. icons (copy all the files recursively from templates/icons to components/icons)
 * --------------------------------------------------*/
fs.cpSync(
  path.join(templatesRoot, "icons"),
  iconsTarget,
  { recursive: true }
);


/* ----------------------------------------------------
 * 10. copy landing page and landingData Components
  * --------------------------------------------------*/

fs.copyFileSync(
  path.join(templatesRoot, "pages", "landing.jsx"),
  path.join(pagesTarget, "landing.jsx")
);

fs.copyFileSync(
  path.join(templatesRoot, "components", "landingData", "AppBar.jsx"),
  path.join(landingDataTarget,  "AppBar.jsx")
);
fs.copyFileSync(
  path.join(templatesRoot, "components", "landingData", "CustomCard.jsx"),
  path.join(landingDataTarget,  "CustomCard.jsx")
);
fs.copyFileSync(
  path.join(templatesRoot, "components", "landingData", "footer.jsx"),
  path.join(landingDataTarget, "footer.jsx")
);
fs.copyFileSync(
  path.join(templatesRoot, "components", "landingData", "UserMenu.jsx"),
  path.join(landingDataTarget,  "UserMenu.jsx")
);
fs.copyFileSync(
  path.join(templatesRoot, "components", "landingData", "SimpleBottomNavigation.jsx"),
  path.join(landingDataTarget,  "SimpleBottomNavigation.jsx")
);
const landingDetailshbs = fs.readFileSync(
  path.join(templatesRoot, "components", "landingData", "landingDetails.hbs"),
  "utf8"
);

const landingDetailsCompiled = Handlebars.compile(landingDetailshbs);

fs.writeFileSync(
  path.join(landingDataTarget, "landingDetails.js"),
  landingDetailsCompiled({ projectName })
);


  console.log(`✅ UI structure generated for project: ${projectName}`);
  return projectRoot;
}

