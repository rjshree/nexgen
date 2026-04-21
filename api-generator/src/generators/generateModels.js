const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");
const { writeFile } = require("../utils/fs-utils");

const templatesRoot = path.join(__dirname, "..", "templates");

/**
 * Generate models.py for a Django app
 * @param {string} outputFolder - Project root
 * @param {string} projectName - Django project name
 * @param {string} appName - App name
 * @param {Object[]} models - Model definitions
 * @returns {string} Path to generated file
 */
function generateModels(outputFolder, projectName, appName, djangoModel) {
  // const templatePath = path.join(templatesRoot, "models.hbs");
  // const templateSrc = fs.readFileSync(templatePath, "utf8");
  // const compiled = Handlebars.compile(templateSrc);

  // const content = compiled({ appName, models });
  const filePath = path.join(outputFolder, appName, "models.py");

  // call /generate-schema to get the models, then generate the file
  console.log(`📊 Generating models for app "${appName}" using schema generator...`);
  
  const ssoUserModel = [
    "",
    "from django.conf import settings",
    "from django.contrib.auth.models import AbstractUser",
    "",
    "",
    "class SSOUser(AbstractUser):",
    "    groups = models.ManyToManyField(",
    "        'auth.Group',",
    "        related_name='ssouser_set',",
    "        blank=True,",
    "        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',",
    "        verbose_name='groups',",
    "    )",
    "    user_permissions = models.ManyToManyField(",
    "        'auth.Permission',",
    "        related_name='ssouser_permissions_set',",
    "        blank=True,",
    "        help_text='Specific permissions for this user.',",
    "        verbose_name='user permissions',",
    "    )",
    "",
  ].join("\n");

  const content = djangoModel + "\n" + ssoUserModel;
  return writeFile(filePath, content);
}

/**
 * 
 * @param {
  host: string;
  schema: string;
  serviceName?: string;
  user: string;
  password: string;
  type: "oracle" | "mariadb";
  table: string;
  port?: number;
 }
 * @returns 
 */
async function runSchemaGeneratorTool(input) {
  const res = await fetch("http://localhost:4000/generate-schema", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Schema generation failed");
  }

  return res.json();
}
module.exports = { generateModels };