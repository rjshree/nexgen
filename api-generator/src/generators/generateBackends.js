const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");
const { writeFile } = require("../utils/fs-utils");

const templatesRoot = path.join(__dirname, "..", "templates");
   

function generateBackend(outputFolder, projectName, appName, djangoModel) {
  // const templatePath = path.join(templatesRoot, "models.hbs");
  // const templateSrc = fs.readFileSync(templatePath, "utf8");
  // const compiled = Handlebars.compile(templateSrc);

  // const content = compiled({ appName, models });
  // const filePath = path.join(outputFolder, appName, "models.py");
  console.log(`🔧 ****Checking for backends.py template in ${templatesRoot}`);

  const templatePath = path.join(templatesRoot, "backends.py");
  const backendsFile = path.join(outputFolder, appName, "backends.py");

  // call /generate-schema to get the models, then generate the file
  console.log(`📊 copying backends for app "${appName}" using schema generator...`);
 
  fs.copyFileSync(templatePath, backendsFile);
  return backendsFile;
}


module.exports = { generateBackend };