const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");
const { writeFile } = require("../utils/fs-utils");

const templatesRoot = path.join(__dirname, "..", "templates");

function generateViews(outputFolder, projectName, appName, tableName, type) {
  if (type === "crud") {
    const templatePath = path.join(templatesRoot, "views.hbs");
    const templateSrc = fs.readFileSync(templatePath, "utf8");
    const compiled = Handlebars.compile(templateSrc);

    const content = compiled({ appName, tableName });
    const filePath = path.join(outputFolder, appName, "views.py");
    return writeFile(filePath, content);
  } else {
    const srcPath = path.join(templatesRoot, "skeletonView.py");
    const destPath = path.join(outputFolder, appName, "views.py");
    const content = fs.readFileSync(srcPath, "utf8");
    return writeFile(destPath, content);
  }
}


module.exports = { generateViews };