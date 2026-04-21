const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");
const { writeFile } = require("../utils/fs-utils");

const templatesRoot = path.join(__dirname, "..", "templates");

function generateSettings(outputFolder, projectName, app, db, type) {

  const defaultSettings = path.join(outputFolder, projectName, "settings.py");
  if (fs.existsSync(defaultSettings)) fs.unlinkSync(defaultSettings);
  let templatePath = "";
  if (type === "crud") {
   templatePath = path.join(templatesRoot, "settings.hbs");
  } else {
     templatePath = path.join(templatesRoot, "skeletonSettings.hbs");
  }
  const templateSrc = fs.readFileSync(templatePath, "utf8");
  const compiled = Handlebars.compile(templateSrc);

  const content = compiled({ projectName, app, db: db || {} });
  const filePath = path.join(outputFolder, projectName, "settings.py");
  return writeFile(filePath, content);
}

module.exports = { generateSettings };