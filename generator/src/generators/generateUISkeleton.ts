import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

/**
 * Generates only Landing Page + Dashboard (no CRUD/tables)
 */
export function generateDashboardOnly(
  projectRoot: string,
  projectName: string,
  capitalizedProjectName: string,
  azureClientId: string
) {
  const generatorRoot = path.resolve(__dirname, "..", "..");
  const templatesRoot = path.join(generatorRoot, "dist", "templates");

  const pagesTarget = path.join(projectRoot, "src", "pages");
  const configTarget = path.join(projectRoot, "src", "config");
  const apiTarget = path.join(projectRoot, "src", "api");
  const landingDataTarget = path.join(projectRoot, "src", "components", "landingData");
  const iconsTarget = path.join(projectRoot, "src", "components", "icons");
  const wrapperTarget = path.join(projectRoot, "src", "components", "wrapper");
  const dashboardComponentTarget = path.join(projectRoot, "src", "components", "dashboard");

  // Create directories
  [pagesTarget, configTarget, apiTarget, landingDataTarget, iconsTarget, wrapperTarget, dashboardComponentTarget].forEach(
    (d) => fs.mkdirSync(d, { recursive: true })
  );

  // Delete existing default files
  const defaultIndexJs = path.join(pagesTarget, "index.js");
  if (fs.existsSync(defaultIndexJs)) fs.unlinkSync(defaultIndexJs);
  const defaultAppJs = path.join(pagesTarget, "_app.js");
  if (fs.existsSync(defaultAppJs)) fs.unlinkSync(defaultAppJs);

  // _app.jsx
  fs.copyFileSync(
    path.join(templatesRoot, "pages", "_app.jsx"),
    path.join(pagesTarget, "_app.jsx")
  );

  // index.jsx (landing)
  fs.copyFileSync(
    path.join(templatesRoot, "pages", "index.jsx"),
    path.join(pagesTarget, "index.jsx")
  );

  // landing.jsx
  fs.copyFileSync(
    path.join(templatesRoot, "pages", "landing.jsx"),
    path.join(pagesTarget, "landing.jsx")
  );

  // Dashboard page with mock data
//   const dashboardContent = generateMockDashboard(projectTitle);
//   fs.writeFileSync(path.join(pagesTarget, "dashboard.jsx"), dashboardContent);

//  Copy mockDashboard.jsx to pages/dashboard.jsx
  fs.copyFileSync(
    path.join(templatesRoot, "pages", "mockDashboard.jsx"),
    path.join(pagesTarget, "dashboard.jsx")
  );

  // AuthLayout (ContentWrapper)
  const authLayoutHbs = fs.readFileSync(
    path.join(templatesRoot, "components", "AuthLayout.hbs"),
    "utf8"
  );
  fs.writeFileSync(
    path.join(wrapperTarget, "ContentWrapper.js"),
    Handlebars.compile(authLayoutHbs)({})
  );

  // Landing data components
  fs.copyFileSync(
    path.join(templatesRoot, "components", "landingData", "AppBar.jsx"),
    path.join(landingDataTarget, "AppBar.jsx")
  );
  fs.copyFileSync(
    path.join(templatesRoot, "components", "landingData", "CustomCard.jsx"),
    path.join(landingDataTarget, "CustomCard.jsx")
  );
  fs.copyFileSync(
    path.join(templatesRoot, "components", "landingData", "footer.jsx"),
    path.join(landingDataTarget, "footer.jsx")
  );
  fs.copyFileSync(
    path.join(templatesRoot, "components", "landingData", "UserMenu.jsx"),
    path.join(landingDataTarget, "UserMenu.jsx")
  );
  fs.copyFileSync(
    path.join(templatesRoot, "components", "landingData", "SimpleBottomNavigation.jsx"),
    path.join(landingDataTarget, "SimpleBottomNavigation.jsx")
  );
  fs.copyFileSync(
    path.join(templatesRoot, "components",  "DashboardComponent.jsx"),
    path.join(dashboardComponentTarget, "DashboardComponent.jsx")
  );

  const landingDetailsHbs = fs.readFileSync(
    path.join(templatesRoot, "components", "landingData", "landingDetails.hbs"),
    "utf8"
  );
  fs.writeFileSync(
    path.join(landingDataTarget, "landingDetails.js"),
    Handlebars.compile(landingDetailsHbs)({ projectName: capitalizedProjectName })
  );

  const dashboardPageHbs = fs.readFileSync(
    path.join(templatesRoot, "pages", "skeletonDashboard.hbs"),
    "utf8"
  );
  fs.writeFileSync(
    path.join(pagesTarget, "dashboard.jsx"),
    Handlebars.compile(dashboardPageHbs)({ PROJECT_TITLE: capitalizedProjectName })
  );

  // copy sidebar.jsx to components/sidebar.jsx
  fs.copyFileSync(
    path.join(templatesRoot, "components", "sidebar.jsx"),
    path.join(projectRoot, "src", "components", "sidebar.jsx")
  );

  // Icons
  fs.cpSync(path.join(templatesRoot, "icons"), iconsTarget, { recursive: true });

  // .env
  const envHbs = fs.readFileSync(path.join(templatesRoot, "env", ".env.hbs"), "utf8");
  fs.writeFileSync(
    path.join(projectRoot, ".env"),
    Handlebars.compile(envHbs)({
      api_base_url: "http://localhost:8000/api/",
      azureClientId,
      azureTenantId: "e0b26355-1889-40d8-8ef1-e559616befda",
      azureRedirectUri: "https://localhost:3000",
    })
  );

  // authConfig
  fs.copyFileSync(
    path.join(templatesRoot, "config", "authConfig.js"),
    path.join(configTarget, "authConfig.js")
  );

  // dashboardAPI
  fs.copyFileSync(
    path.join(templatesRoot, "api", "dashboardAPI.js"),
    path.join(apiTarget, "dashboardAPI.js")
  );

  console.log(`✅ Dashboard-only UI generated for: ${projectName}`);
  return projectRoot;
}