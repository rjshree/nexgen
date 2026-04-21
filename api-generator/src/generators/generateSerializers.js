const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");
const { writeFile } = require("../utils/fs-utils");

const templatesRoot = path.join(__dirname, "..", "templates");

function generateSerializers(outputFolder, projectName, appName, tableName) {
  const templatePath = path.join(templatesRoot, "serializer.hbs");
  const templateSrc = fs.readFileSync(templatePath, "utf8");
  const compiled = Handlebars.compile(templateSrc);

  const content = compiled({ appName, tableName });
  const filePath = path.join(outputFolder, appName, "serializers.py");
  return writeFile(filePath, content);
}

module.exports = { generateSerializers };