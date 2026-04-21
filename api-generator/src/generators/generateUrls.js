const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");
const { writeFile } = require("../utils/fs-utils");

const templatesRoot = path.join(__dirname, "..", "templates");

function generateUrls(outputFolder, projectName, appName, tableName) {

  const defaultRootUrls = path.join(outputFolder, projectName, "urls.py");
    if (fs.existsSync(defaultRootUrls)) fs.unlinkSync(defaultRootUrls);
  
  const appUrltemplatePath = path.join(templatesRoot, "urls.hbs");
  const rootUrltemplatePath = path.join(templatesRoot, "rootUrl.hbs");
  const appUrltemplateSrc = fs.readFileSync(appUrltemplatePath, "utf8");
  const rootUrltemplateSrc = fs.readFileSync(rootUrltemplatePath, "utf8");
  const compiledAppUrl = Handlebars.compile(appUrltemplateSrc);
  const compiledRootUrl = Handlebars.compile(rootUrltemplateSrc);

  const appContent = compiledAppUrl({ appName, tableName});
  const rootContent = compiledRootUrl({ projectName, appName });
  const filePath = path.join(outputFolder, appName, "urls.py");
  const rootFilePath = path.join(outputFolder, projectName, "urls.py");
  writeFile(filePath, appContent);
  return writeFile(rootFilePath, rootContent);
}

module.exports = { generateUrls };